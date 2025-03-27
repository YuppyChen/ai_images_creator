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

// 添加超时控制的fetch函数
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const useTextToImage = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 用户点数状态
  const [credits, setCredits] = useState(0);
  const [isCreditsLoading, setIsCreditsLoading] = useState(true);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  // 历史记录状态
  const [history, setHistory] = useState<ImageGenerationHistory[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  
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
      setIsCreditsLoading(true);
      setCreditsError(null);
      
      const response = await fetchWithTimeout('/api/user/credits', {}, 15000);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取点数失败');
      }
      
      setCredits(data.credits);
      setIsCreditsLoading(false);
    } catch (error) {
      console.error('获取用户点数错误:', error);
      setCreditsError(error instanceof Error ? error.message : '获取点数失败');
      setIsCreditsLoading(false);
    }
  }, []);

  // 获取用户历史记录
  const fetchUserHistory = useCallback(async (limit = 10, offset = 0) => {
    try {
      setIsHistoryLoading(true);
      setHistoryError(null);
      
      const response = await fetchWithTimeout(`/api/user/history?limit=${limit}&offset=${offset}`, {}, 15000);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '获取历史记录失败');
      }
      
      setHistory(data.history);
      setIsHistoryLoading(false);
    } catch (error) {
      console.error('获取用户历史记录错误:', error);
      setHistoryError(error instanceof Error ? error.message : '获取历史记录失败');
      setIsHistoryLoading(false);
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
      const response = await fetchWithTimeout(`/api/text-to-image?taskId=${taskId}`, {}, 30000);
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
          const urls = data.output.results.map((result: any) => result.url);
          console.log('成功获取图片URLs:', urls);
          
          setImageUrls(urls);
          setIsLoading(false);
          setError(null);

          // 更新用户点数和历史记录
          fetchUserCredits();
          fetchUserHistory();
        } else {
          console.error('API返回成功但没有图片结果:', data);
          setImageUrls([]);
          setIsLoading(false);
          setError('获取图片失败');
        }
        
        setIsGenerating(false);
      } 
      // 任务失败
      else if (data.output.task_status === 'FAILED') {
        console.log('任务失败，停止轮询');
        // 标记已处理
        hasProcessedSuccess.current = true;
        clearPolling();
        setImageUrls([]);
        setIsLoading(false);
        setError('图像生成失败: ' + (data.output.message || ''));
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
      setImageUrls([]);
      setIsLoading(false);
      setError(error instanceof Error ? error.message : '未知错误');
      setIsGenerating(false);
      
      // 发生错误后更新用户点数（可能已恢复）
      fetchUserCredits();
    }
  };

  // 开始轮询任务状态
  const startPolling = useCallback((taskId: string) => {
    console.log('开始轮询任务状态:', taskId);
    
    // 清理现有轮询（如果有）
    clearPolling();
    
    // 创建新的轮询
    const interval = setInterval(() => {
      checkTaskStatus(taskId);
    }, 2000);
    
    setPollInterval(interval);
  }, []);

  // 生成图片
  const generateImages = async (prompt: string) => {
    if (!prompt.trim()) {
      throw new Error('提示词不能为空');
    }
    
    try {
      // 重置状态
      setIsGenerating(true);
      setIsLoading(true);
      setError(null);
      setTaskId(null);
      
      // 发送请求
      const response = await fetchWithTimeout('/api/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      }, 30000);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '请求失败');
      }
      
      // 获取任务ID并开始轮询
      const newTaskId = data.output?.task_id;
      
      if (!newTaskId) {
        throw new Error('未获取到任务ID');
      }
      
      console.log('已创建任务:', newTaskId);
      setTaskId(newTaskId);
      
      // 开始轮询任务状态
      startPolling(newTaskId);
      
    } catch (error) {
      console.error('生成图像请求失败:', error);
      
      setIsGenerating(false);
      setIsLoading(false);
      setError(error instanceof Error ? error.message : '未知错误');
      
      throw error;
    }
  };

  return {
    generateImages,
    imageUrls,
    isLoading,
    error,
    isGenerating,
    credits,
    isCreditsLoading,
    creditsError,
    history,
    isHistoryLoading,
    historyError,
    fetchUserHistory,
    taskId
  };
};

export default useTextToImage; 