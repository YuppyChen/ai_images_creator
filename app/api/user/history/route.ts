import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserImageHistory } from '@/lib/history-service';

// 获取用户历史记录
export async function GET(request: Request) {
  try {
    // 获取分页参数
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    
    // 获取当前用户 - 使用服务端supabase客户端
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    
    // 获取用户历史记录
    const history = await getUserImageHistory(userId, limit, offset);
    
    return NextResponse.json({ history });
  } catch (error) {
    console.error('获取用户历史记录出错:', error);
    return NextResponse.json(
      { error: '获取用户历史记录失败' },
      { status: 500 }
    );
  }
} 