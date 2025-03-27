import { adminClient } from './supabase';

// 获取用户点数
export async function getUserCredits(userId: string): Promise<number> {
  try {
    const { data, error } = await adminClient
      .from('ai_images_creator_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('获取用户点数错误:', error);
      throw error;
    }

    return data?.credits || 0;
  } catch (error) {
    console.error('获取用户点数服务错误:', error);
    throw error;
  }
}

// 扣除用户点数
export async function deductUserCredits(userId: string, amount: number = 1): Promise<boolean> {
  try {
    // 获取当前点数
    const currentCredits = await getUserCredits(userId);
    
    // 检查点数是否足够
    if (currentCredits < amount) {
      throw new Error('用户点数不足');
    }
    
    // 更新点数
    const { error } = await adminClient
      .from('ai_images_creator_credits')
      .update({ 
        credits: currentCredits - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('扣除用户点数错误:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('扣除用户点数服务错误:', error);
    throw error;
  }
}

// 恢复用户点数
export async function restoreUserCredits(userId: string, amount: number = 1): Promise<boolean> {
  try {
    // 获取当前点数
    const currentCredits = await getUserCredits(userId);
    
    // 更新点数
    const { error } = await adminClient
      .from('ai_images_creator_credits')
      .update({ 
        credits: currentCredits + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('恢复用户点数错误:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('恢复用户点数服务错误:', error);
    throw error;
  }
} 