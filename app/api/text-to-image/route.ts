import { NextResponse } from 'next/server';

// 创建文生图任务
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: '缺少必要的提示词参数' },
        { status: 400 }
      );
    }

    const apiKey = process.env.QWEN_API_KEY;
    if (!apiKey) {
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
      return NextResponse.json(
        { error: result.message || '创建任务失败' },
        { status: response.status }
      );
    }

    console.log('创建任务成功，任务ID:', result.output.task_id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('创建文生图任务出错:', error);
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
      return NextResponse.json(
        { error: result.message || '获取任务结果失败' },
        { status: response.status }
      );
    }

    console.log('获取任务状态成功:', result.output.task_status);
    
    if (result.output.task_status === 'SUCCEEDED') {
      console.log('任务成功完成，图片数量:', result.output.results.length);
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