import { NextResponse } from 'next/server';
import { deductUserCredits, restoreUserCredits } from '@/lib/credits-service';
import { saveImageGenerationHistory } from '@/lib/history-service';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// 创建文生图任务
export async function POST(request: Request) {
  try {
    // 获取当前用户信息 - 使用服务端supabase客户端
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: '缺少必要的提示词参数' },
        { status: 400 }
      );
    }

    // 尝试扣除用户点数
    try {
      await deductUserCredits(userId);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || '用户点数不足' },
        { status: 400 }
      );
    }

    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      // 如果API密钥未配置，恢复用户点数
      await restoreUserCredits(userId);
      return NextResponse.json(
        { error: 'API密钥未配置' },
        { status: 500 }
      );
    }

    console.log('开始调用百炼云API创建文生图任务');
    
    // 调用百炼云文生图API创建任务
    const response = await fetch(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
      {
        method: 'POST',
        headers: {
          'X-DashScope-Async': 'enable',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "wanx2.1-t2i-turbo",
          input: {
            prompt
          },
          parameters: {
            size: "1024*1024",
            n: 4
          }
        })
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error('创建任务失败:', result);
      // 如果创建任务失败，恢复用户点数
      await restoreUserCredits(userId);
      return NextResponse.json(
        { error: result.message || '创建任务失败' },
        { status: response.status }
      );
    }

    // 存储任务ID和提示词，用于后续在查询结果时保存历史记录
    const taskId = result.output.task_id;
    // 使用Redis或其他存储方式保存任务ID和提示词的关联关系更好，这里简化处理
    global.activeTasksMap = global.activeTasksMap || {};
    global.activeTasksMap[taskId] = {
      userId,
      prompt
    };

    console.log('创建任务成功，任务ID:', taskId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('创建文生图任务出错:', error);
    // 发生未知错误时不恢复点数，因为我们无法确定是否已经实际扣除
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 查询任务结果
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    
    if (!taskId) {
      return NextResponse.json(
        { error: '缺少必要的任务ID参数' },
        { status: 400 }
      );
    }

    // 获取任务关联的用户ID和提示词
    const taskInfo = global.activeTasksMap?.[taskId];
    if (!taskInfo) {
      console.warn('未找到任务关联信息:', taskId);
    }

    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API密钥未配置' },
        { status: 500 }
      );
    }

    console.log('查询任务状态，任务ID:', taskId);
    
    // 调用百炼云API查询任务结果
    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      console.error('获取任务结果失败:', result);
      if (taskInfo && result.code === 'TaskNotSuccessError') {
        // 如果任务失败，恢复用户点数
        try {
          await restoreUserCredits(taskInfo.userId);
          console.log('任务失败，已恢复用户点数:', taskInfo.userId);
        } catch (err) {
          console.error('恢复点数失败:', err);
        }
      }
      return NextResponse.json(
        { error: result.message || '获取任务结果失败' },
        { status: response.status }
      );
    }

    console.log('获取任务状态成功:', result.output.task_status);
    
    if (result.output.task_status === 'SUCCEEDED' && taskInfo) {
      console.log('任务成功完成，图片数量:', result.output.results.length);
      
      // 提取图片URL数组
      const imageUrls = result.output.results.map((item: any) => item.url);
      
      // 保存历史记录
      try {
        await saveImageGenerationHistory(
          taskInfo.userId,
          taskInfo.prompt,
          imageUrls
        );
        console.log('已保存历史记录');
        
        // 成功后清理任务信息
        delete global.activeTasksMap[taskId];
      } catch (err) {
        console.error('保存历史记录失败:', err);
      }
    } else if (result.output.task_status === 'FAILED' && taskInfo) {
      // 任务失败，恢复用户点数
      try {
        await restoreUserCredits(taskInfo.userId);
        console.log('任务失败，已恢复用户点数:', taskInfo.userId);
        
        // 失败后清理任务信息
        delete global.activeTasksMap[taskId];
      } catch (err) {
        console.error('恢复点数失败:', err);
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('获取文生图任务结果出错:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 