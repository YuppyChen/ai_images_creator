-- 创建用户点数表
CREATE TABLE public.ai_images_creator_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- 添加RLS策略以确保安全性
ALTER TABLE public.ai_images_creator_credits ENABLE ROW LEVEL SECURITY;

-- 只允许用户读取自己的点数记录
CREATE POLICY "用户可以查看自己的点数" 
    ON public.ai_images_creator_credits 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 只允许系统更新点数
CREATE POLICY "只有系统可以更新点数" 
    ON public.ai_images_creator_credits 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- 创建图片生成历史记录表
CREATE TABLE public.ai_images_creator_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    image_urls TEXT[] NOT NULL, -- 使用数组存储4张图片的URL
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 添加RLS策略
ALTER TABLE public.ai_images_creator_history ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的历史记录
CREATE POLICY "用户可以查看自己的生成历史" 
    ON public.ai_images_creator_history 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- 用户只能插入自己的记录
CREATE POLICY "用户可以创建自己的历史记录" 
    ON public.ai_images_creator_history 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- 创建触发器函数，在用户注册时自动添加初始点数
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.ai_images_creator_credits (user_id, credits)
    VALUES (NEW.id, 5);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器，在新用户创建时调用上面的函数
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();