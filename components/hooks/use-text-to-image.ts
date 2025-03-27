import { useState, useEffect, useRef } from 'react';

export interface TextToImageResult {
  imageUrls: string[];
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
    }
  };

  return {
    generateImages,
    isGenerating,
    ...results
  };
};

export default useTextToImage; 