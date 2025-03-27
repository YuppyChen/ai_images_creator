"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ImageIcon, PlusCircle, Download, Share2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ImageGenerationLoading } from "@/components/ui/loading";
import useTextToImage from "@/components/hooks/use-text-to-image";

// 提示消息接口
interface ToastMessage {
  title: string;
  description: string;
  variant: 'default' | 'destructive';
}

// 简易的toast通知函数，直接在客户端页面内部定义避免导入问题
const showToast = ({ title, description, variant }: ToastMessage) => {
  console.log(`[${variant.toUpperCase()}] ${title}: ${description}`);
  if (typeof window !== 'undefined') {
    alert(`${title}\n${description}`);
  }
};

// 提示词输入表单组件
function PromptInputForm({ credits, onGenerate }: { credits: number, onGenerate: (prompt: string) => Promise<void> }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGenerate(prompt);
    } catch (error) {
      console.error("生成图像失败:", error);
      showToast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "图像生成出错，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-xl border bg-background shadow-sm p-4">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">创建图像</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">剩余点数:</span>
              <span className="font-medium">{credits}</span>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              <span>充值</span>
            </Button>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <Input 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述您想要的图像，例如：中国风水墨画，山水与红色塔楼..." 
              className="h-12 w-full"
              disabled={isGenerating}
            />
          </div>
          <Button 
            className="h-12 px-6" 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            {isGenerating ? "生成中..." : "生成图像"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// 错误提示组件
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center p-6 bg-destructive/10 rounded-lg text-destructive gap-2 mb-4">
      <AlertCircle className="h-5 w-5" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

// 图片画廊组件
function ImageGallery({ images, isLoading, error }: { images: string[], isLoading: boolean, error: string | null }) {
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
  
  // 图片数组变化时重置加载状态
  useEffect(() => {
    if (images.length > 0) {
      console.log('重置图片加载状态，图片数量:', images.length);
      setLoadedImages(new Array(images.length).fill(false));
    }
  }, [images]);
  
  // 处理图片加载完成
  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
    console.log(`图片${index}加载完成`);
  };

  // 下载图片
  const downloadImage = (imageUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `ai-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('图片下载成功');
    } catch (error) {
      console.error('图片下载失败:', error);
      showToast({
        title: '下载失败',
        description: '图片下载失败，请稍后重试',
        variant: 'destructive'
      });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">您的作品</h2>
      
      {error && <ErrorDisplay message={error} />}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // 显示加载中的占位图
          Array.from({ length: 4 }).map((_, index) => (
            <Card 
              key={`loading-${index}`} 
              className="overflow-hidden aspect-square flex items-center justify-center bg-muted/20"
            >
              {index === 0 && <ImageGenerationLoading />}
            </Card>
          ))
        ) : images.length > 0 ? (
          // 显示生成的图像
          images.map((imageUrl, index) => (
            <Card key={`image-${index}`} className="overflow-hidden group relative aspect-square">
              <div className={`absolute inset-0 flex items-center justify-center bg-muted/20 transition-opacity ${loadedImages[index] ? 'opacity-0' : 'opacity-100'}`}>
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <Image 
                src={imageUrl} 
                alt={`用户生成的图像 ${index + 1}`} 
                fill 
                className={`object-cover transition-transform duration-300 group-hover:scale-105 ${loadedImages[index] ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImageLoad(index)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                priority={index === 0}
              />
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center items-center gap-2">
                <Button 
                  size="icon" 
                  variant="secondary"
                  onClick={() => downloadImage(imageUrl)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="secondary"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          // 显示空状态
          Array.from({ length: 4 }).map((_, index) => (
            <Card 
              key={`empty-${index}`} 
              className="overflow-hidden aspect-square flex items-center justify-center bg-muted/50"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                <ImageIcon className="h-10 w-10" />
                <p>创建您的第一张AI图像</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// 导出客户端页面组件
export default function ClientPage() {
  // 使用文生图hook
  const { generateImages, isGenerating, isLoading, imageUrls, error } = useTextToImage();
  
  // 当图片数组变化时打印日志
  useEffect(() => {
    if (imageUrls.length > 0) {
      console.log('收到新的图片数组:', imageUrls);
    }
  }, [imageUrls]);
  
  // 处理生成图像
  const handleGenerate = async (prompt: string) => {
    console.log('开始生成图像，提示词:', prompt);
    await generateImages(prompt);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-8">
      {/* 顶部提示词输入区域 */}
      <PromptInputForm credits={5} onGenerate={handleGenerate} />
      
      {/* 图片展示区域 */}
      <ImageGallery 
        images={imageUrls} 
        isLoading={isLoading || isGenerating}
        error={error}
      />
    </div>
  );
} 