import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// 创建服务端Supabase客户端，用于API路由获取会话
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // 在Server component中调用时，set方法可能会抛出错误
            // 如果有middleware刷新会话，可以忽略此错误
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (error) {
            // 在Server component中调用时，remove方法可能会抛出错误
          }
        },
      },
    }
  );
} 