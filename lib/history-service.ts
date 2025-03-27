import { adminClient } from './supabase';

export interface ImageGenerationHistory {
  id: string;
  user_id: string;
  prompt: string;
  image_urls: string[];
  created_at: string;
}

// 保存图片生成历史记录
export async function saveImageGenerationHistory(
  userId: string, 
  prompt: string, 
  imageUrls: string[]
): Promise<string> {
  try {
    const { data, error } = await adminClient
      .from('ai_images_creator_history')
      .insert({
        user_id: userId,
        prompt: prompt,
        image_urls: imageUrls
      })
      .select('id')
      .single();

    if (error) {
      console.error('保存历史记录错误:', error);
      throw error;
    }

    return data.id;
  } catch (error) {
    console.error('保存历史记录服务错误:', error);
    throw error;
  }
}

// 获取用户历史记录
export async function getUserImageHistory(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<ImageGenerationHistory[]> {
  try {
    const { data, error } = await adminClient
      .from('ai_images_creator_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('获取历史记录错误:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取历史记录服务错误:', error);
    throw error;
  }
} 