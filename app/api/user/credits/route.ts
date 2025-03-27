import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { getUserCredits } from '@/lib/credits-service';

// 获取用户点数
export async function GET() {
  try {
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
    
    // 获取用户点数
    const credits = await getUserCredits(userId);
    
    return NextResponse.json({ credits });
  } catch (error) {
    console.error('获取用户点数出错:', error);
    return NextResponse.json(
      { error: '获取用户点数失败' },
      { status: 500 }
    );
  }
} 