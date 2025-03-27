import { useState, useEffect, useRef, useCallback } from 'react';

export interface TextToImageResult {
  imageUrls: string[];
  isLoading: boolean;
  error: string | null;
}

export interface UserCredits {
  credits: number;
  isLoading: boolean;
  error: string | null;
}

export interface ImageGenerationHistory {
  id: string;
  user_id: string;
  prompt: string;
  image_urls: string[];
  created_at: string;
}

export interface HistoryResult {
  history: ImageGenerationHistory[];
  isLoading: boolean;
  error: string | null;
}

const useTextToImage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [results, setResults] = useState<TextToImageResult>({
    imageUrls: [],
    isLoading: false,
    error: null
  });

  // 用户点数状态
  const [creditsData, setCreditsData] = useState<UserCredits>({
    credits: 0,
    isLoading: true,
    error: null
  });

  // 历史记录状态
  const [historyData, setHistoryData] = useState<HistoryResult>({
    history: [],
    isLoading: true,
    error: null
  });
  
  // 使用ref来跟踪是否已经处理过成功状态
  const hasProcessedSuccess = useRef<boolean>(false);

  // 清理轮询
  const clearPolling = () => {
    console.log('清理轮询任务');
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
      console.log('轮询已清理');
    }
  };

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      console.log('组件卸载，清理轮询');
      clearPolling();
    };
  }, []);

  // 监听taskId变化，重置处理状态
  useEffect(() => {
    hasProcessedSuccess.current = false;
  }, [taskId]);

  // 获取用户点数
  const fetchUserCredits = useCallback(async () => {
    try {
      setCreditsData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/user/credits');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取点数失败');
      }
      
      setCreditsData({
        credits: data.credits,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('获取用户点数错误:', error);
      setCreditsData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : '获取点数失败' 
      }));
    }
  }, []);

  // 获取用户历史记录
  const fetchUserHistory = useCallback(async (limit = 10, offset = 0) => {
    try {
      setHistoryData(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`/api/user/history?limit=${limit}&offset=${offset}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取历史记录失败');
      }
      
      setHistoryData({
        history: data.history,
        isLoading: false,
        error: null
      });

      // 移除自动显示历史记录的行为
    } catch (error) {
      console.error('获取用户历史记录错误:', error);
      setHistoryData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : '获取历史记录失败' 
      }));
    }
  }, []);

  // 页面加载时获取点数和历史记录
  useEffect(() => {
    fetchUserCredits();
    fetchUserHistory();
  }, [fetchUserCredits, fetchUserHistory]);

  // 检查任务状态
  const checkTaskStatus = async (taskId: string) => {
    // 如果已经处理过成功状态，直接返回
    if (hasProcessedSuccess.current) {
      console.log('已经处理过成功状态，跳过本次轮询');
      return;
    }
    
    try {
      console.log('开始检查任务状态:', taskId);
      const response = await fetch(`/api/text-to-image?taskId=${taskId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取任务结果失败');
      }

      console.log('任务状态:', data.output.task_status);

      // 任务完成
      if (data.output.task_status === 'SUCCEEDED') {
        console.log('任务成功完成，立即停止轮询');
        
        // 标记已处理成功状态
        hasProcessedSuccess.current = true;
        
        // 先清理轮询，避免状态更新后仍然在轮询
        clearPolling();
        
        // 确保results数组存在
        if (data.output.results && Array.isArray(data.output.results)) {
          // 提取所有图片URL
          const imageUrls = data.output.results.map((result: any) => result.url);
          console.log('成功获取图片URLs:', imageUrls);
          
          setResults({
            imageUrls,
            isLoading: false,
            error: null
          });

          // 更新用户点数和历史记录
          fetchUserCredits();
          fetchUserHistory();
        } else {
          console.error('API返回成功但没有图片结果:', data);
          setResults({
            imageUrls: [],
            isLoading: false,
            error: '获取图片失败'
          });
        }
        
        setIsGenerating(false);
      } 
      // 任务失败
      else if (data.output.task_status === 'FAILED') {
        console.log('任务失败，停止轮询');
        // 标记已处理
        hasProcessedSuccess.current = true;
        clearPolling();
        setResults({
          imageUrls: [],
          isLoading: false,
          error: '图像生成失败: ' + (data.output.message || '')
        });
        setIsGenerating(false);
        
        // 任务失败后更新用户点数（可能已恢复）
        fetchUserCredits();
      }
      // 其他状态（等待中、执行中等）继续轮询
      else {
        console.log('任务进行中，继续轮询...');
      }
    } catch (error) {
      console.error('检查任务状态出错:', error);
      // 发生错误时也标记为已处理
      hasProcessedSuccess.current = true;
      clearPolling();
      setResults({
        imageUrls: [],
        isLoading: false,
        error: error instanceof Error ? error.message : '未知错误'
      });
      setIsGenerating(false);
      
      // 发生错误后更新用户点数（可能已恢复）
      fetchUserCredits();
    }
  };

  // 生成图像函数
  const generateImages = async (prompt: string) => {
    // 重置状态
    setResults({
      imageUrls: [],
      isLoading: true,
      error: null
    });
    setIsGenerating(true);
    setTaskId(null);
    hasProcessedSuccess.current = false;
    
    // 确保清理之前的轮询
    clearPolling();

    try {
      console.log('开始创建图像生成任务');
      // 创建任务
      const response = await fetch('/api/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '创建图像生成任务失败');
      }

      console.log('创建任务成功:', data);

      // 保存任务ID
      const newTaskId = data.output.task_id;
      setTaskId(newTaskId);

      // 立即检查一次任务状态
      await checkTaskStatus(newTaskId);
      
      // 如果已经处理过成功状态，不再设置轮询
      if (hasProcessedSuccess.current) {
        console.log('首次检查已完成任务，不再设置轮询');
        return;
      }

      // 开始轮询任务状态（每3秒检查一次）
      console.log('设置轮询任务');
      const interval = setInterval(() => {
        if (hasProcessedSuccess.current) {
          console.log('任务已完成，清理轮询');
          clearPolling();
          return;
        }
        checkTaskStatus(newTaskId);
      }, 3000);
      
      setPollInterval(interval);
    } catch (error) {
      console.error('生成图像出错:', error);
      setResults({
        imageUrls: [],
        isLoading: false,
        error: error instanceof Error ? error.message : '未知错误'
      });
      setIsGenerating(false);
      
      // 错误后更新用户点数（可能已扣除或恢复）
      fetchUserCredits();
    }
  };

  return {
    generateImages,
    isGenerating,
    ...results,
    credits: creditsData.credits,
    isCreditsLoading: creditsData.isLoading,
    creditsError: creditsData.error,
    history: historyData.history,
    isHistoryLoading: historyData.isLoading,
    historyError: historyData.error,
    fetchUserHistory,
  };
};

export default useTextToImage; 