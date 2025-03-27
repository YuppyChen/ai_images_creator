"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ImageIcon, PlusCircle, X, ChevronLeft, ChevronRight, AlertCircle, Check, Copy } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ImageGenerationLoading } from "@/components/ui/loading";
import useTextToImage, { ImageGenerationHistory } from "@/components/hooks/use-text-to-image";
import React from "react";

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
function PromptInputForm({ credits, onGenerate, setInputPrompt, inputPrompt, isCreditsLoading }: { 
  credits: number, 
  onGenerate: (prompt: string) => Promise<void>,
  setInputPrompt: (prompt: string) => void,
  inputPrompt: string,
  isCreditsLoading: boolean
}) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!inputPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGenerate(inputPrompt);
      // 生成成功后清空输入框
      setInputPrompt("");
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
    <div className="rounded-lg border bg-background shadow-sm p-4 w-full">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">创建图像</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">剩余点数:</span>
              {isCreditsLoading ? (
                <span className="w-6 h-5 bg-muted/30 rounded-md animate-pulse"></span>
              ) : (
                <span className="font-medium">{credits}</span>
              )}
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
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="描述您想要的图像，例如：中国风水墨画，山水与红色塔楼..." 
              className="h-10 w-full"
              disabled={isGenerating}
            />
          </div>
          <Button 
            className="h-10 px-5 whitespace-nowrap" 
            onClick={handleGenerate}
            disabled={isGenerating || !inputPrompt.trim() || credits < 1}
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
    <div className="flex items-center justify-center p-3 bg-destructive/10 rounded-lg text-destructive gap-2 mb-3">
      <AlertCircle className="h-4 w-4" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

// 提示词显示组件
function PromptDisplay({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);
  
  // 复制提示词到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      // 2秒后重置复制状态
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  if (!prompt) return null;
  
  return (
    <div className="bg-muted/30 rounded-md p-3 mt-4 text-sm flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">提示词</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs flex items-center gap-1"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <span className="text-green-500">已复制</span>
              <Check className="h-3 w-3 text-green-500" />
            </>
          ) : (
            <>
              <span>复制</span>
              <Copy className="h-3 w-3" />
            </>
          )}
        </Button>
      </div>
      <p className="text-muted-foreground break-words whitespace-pre-wrap">
        {prompt}
      </p>
    </div>
  );
}

// 骨架屏单个图片
function SkeletonImage() {
  return (
    <div className="aspect-square bg-muted/30 rounded-md animate-pulse flex items-center justify-center">
      <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
    </div>
  );
}

// 骨架屏提示词
function SkeletonPrompt() {
  return (
    <div className="h-6 mt-4 bg-muted/30 rounded-md animate-pulse"></div>
  );
}

// 图片预览组件
function ImagePreview({ 
  images, 
  currentIndex, 
  onClose, 
  prompt 
}: { 
  images: string[], 
  currentIndex: number, 
  onClose: () => void,
  prompt: string
}) {
  const [index, setIndex] = useState(currentIndex);
  
  const goToPrev = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 处理点击背景关闭
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // 确保点击的是背景层而不是内容
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center" 
      onClick={handleBackgroundClick}
    >
      {/* 关闭按钮 */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
      >
        <X className="h-6 w-6" />
      </button>
      
      {/* 图片内容 - 确保点击图片内容不会触发关闭 */}
      <div className="relative w-[90%] max-w-4xl aspect-square" onClick={(e) => e.stopPropagation()}>
        <Image 
          src={images[index]} 
          alt={`预览图 ${index + 1}`}
          fill
          className="object-contain"
          priority
        />
      </div>
      
      {/* 提示词 - 确保点击提示词不会触发关闭 */}
      <div className="bg-black/50 text-white py-3 px-4 rounded-md max-w-xl mt-4 text-center" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm">{prompt}</p>
      </div>
      
      {/* 导航按钮 - 确保点击导航按钮不会触发关闭 */}
      <div className="absolute inset-y-0 left-4 flex items-center" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={goToPrev}
          className="bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      </div>
      
      <div className="absolute inset-y-0 right-4 flex items-center" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={goToNext}
          className="bg-black/30 hover:bg-black/50 text-white rounded-full p-2"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

// 图片画廊组件
function ImageGallery({ images, isLoading, error, currentPrompt, isAllLoading, history }: { 
  images: string[], 
  isLoading: boolean, 
  error: string | null,
  currentPrompt: string,
  isAllLoading: boolean,
  history: ImageGenerationHistory[]
}) {
  // 显示预览状态
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewPrompt, setPreviewPrompt] = useState("");
  
  // 图片加载状态
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
  
  // 创建组合后的视图数据，将图片与其来源的提示词关联起来
  const viewItems = React.useMemo(() => {
    // 整理历史记录数据，按记录分组而不是单独的图片
    let items: {
      imageUrls: string[], 
      prompt: string, 
      createdAt: string
    }[] = [];
    
    // 添加历史记录中的图片，每个历史记录作为一组
    history.forEach(item => {
      items.push({
        imageUrls: item.image_urls,
        prompt: item.prompt,
        createdAt: item.created_at
      });
    });
    
    // 按创建时间排序，最新的在最前面
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return items;
  }, [history]);
  
  // 初始化图片加载状态
  useEffect(() => {
    // 计算所有历史记录中的总图片数
    const totalImages = viewItems.reduce((total, item) => total + item.imageUrls.length, 0);
    if (totalImages > 0) {
      setLoadedImages(new Array(totalImages).fill(false));
    }
  }, [viewItems]);
  
  // 处理图片加载完成
  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };
  
  // 打开预览，itemIndex是记录索引，imageIndex是该记录内的图片索引
  const openPreview = (itemIndex: number, imageIndex: number = 0) => {
    // 计算全局图片索引
    let globalIndex = 0;
    for (let i = 0; i < itemIndex; i++) {
      globalIndex += viewItems[i].imageUrls.length;
    }
    globalIndex += imageIndex;
    
    setPreviewIndex(globalIndex);
    setPreviewPrompt(viewItems[itemIndex].prompt);
    setIsPreviewOpen(true);
  };
  
  // 关闭预览
  const closePreview = () => {
    setIsPreviewOpen(false);
  };
  
  // 复制提示词
  const copyPrompt = (prompt: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt)
      .then(() => {
        showToast({
          title: "已复制",
          description: "提示词已复制到剪贴板",
          variant: "default"
        });
      })
      .catch(error => {
        console.error("复制失败:", error);
      });
  };
  
  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\//g, '-');
  };

  // 如果仍在加载并且是首次加载整个组件，显示整体骨架屏
  if (isAllLoading) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">历史作品</h2>
        <div className="space-y-10">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="overflow-hidden">
              <div className="mb-2 text-sm font-semibold text-muted-foreground">
                <div className="h-5 w-32 bg-muted/20 animate-pulse"></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-[65%] flex space-x-1">
                  {Array.from({ length: 4 }).map((_, imgIdx) => (
                    <div key={imgIdx} className="aspect-square w-1/4 bg-muted/20 animate-pulse">
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground/20" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="w-[25%] h-full bg-muted/10 p-3 animate-pulse min-h-[80px]">
                  <div className="h-4 bg-muted/30 animate-pulse mb-2 rounded-sm w-[80%]"></div>
                  <div className="h-4 bg-muted/30 animate-pulse w-[60%] rounded-sm"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // 获取所有图片，用于预览
  const allImages = viewItems.flatMap(item => item.imageUrls);
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">历史作品</h2>
      
      {error && <ErrorDisplay message={error} />}
      
      <div className="space-y-10">
        {/* 正在生成的图片占位符 */}
        {isLoading && (
          <div className="overflow-hidden">
            <div className="mb-2 text-sm font-semibold text-muted-foreground">
              正在生成...
            </div>
            <div className="flex items-start gap-4">
              <div className="w-[65%] aspect-video bg-muted/10 relative">
                <ImageGenerationLoading />
              </div>
              <div className="w-[25%] bg-muted/10 p-3 border border-muted/20 min-h-[80px]">
                <p className="text-sm text-muted-foreground">
                  {currentPrompt || "正在处理您的提示词..."}
                </p>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="opacity-50 h-7 w-7 mt-2"
                  disabled
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      
        {/* 已生成的图片列表 */}
        {viewItems.length > 0 ? (
          viewItems.map((item, itemIndex) => (
            <div key={itemIndex} className="overflow-hidden">
              <div className="mb-2 text-sm font-semibold text-muted-foreground">
                {formatDateTime(item.createdAt)}
              </div>
              <div className="flex items-start gap-4">
                <div className="w-[65%] flex space-x-1">
                  {item.imageUrls.slice(0, 4).map((url, imgIndex) => (
                    <div 
                      key={imgIndex} 
                      className="aspect-square w-1/4 relative cursor-pointer bg-muted/10"
                      onClick={() => openPreview(itemIndex, imgIndex)}
                    >
                      <Image 
                        src={url} 
                        alt={`生成的图像 ${imgIndex + 1}`}
                        fill
                        className="object-cover"
                        onLoad={() => {
                          // 计算全局索引
                          let globalIndex = 0;
                          for (let i = 0; i < itemIndex; i++) {
                            globalIndex += viewItems[i].imageUrls.length;
                          }
                          globalIndex += imgIndex;
                          handleImageLoad(globalIndex);
                        }}
                        priority={itemIndex === 0} // 优先加载最新记录的图片
                      />
                    </div>
                  ))}
                </div>
                <div className="w-[25%] bg-muted/10 p-3 border border-muted/20 min-h-[80px]">
                  <p className="text-sm text-muted-foreground">
                    {item.prompt}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="mt-2 h-7 w-7"
                    onClick={(e) => copyPrompt(item.prompt, e)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          // 无图片提示
          !isLoading && (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium">暂无生成记录</h3>
              <p className="text-sm mt-1">输入提示词开始创作您的第一张AI图像</p>
            </div>
          )
        )}
      </div>
      
      {isPreviewOpen && (
        <ImagePreview 
          images={allImages}
          currentIndex={previewIndex}
          onClose={closePreview}
          prompt={previewPrompt}
        />
      )}
    </div>
  );
}

// 主页面组件
export default function ClientPage() {
  const [inputPrompt, setInputPrompt] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isAllLoading, setIsAllLoading] = useState(true);
  
  const { 
    imageUrls, 
    isLoading, 
    error,
    credits,
    isCreditsLoading,
    history,
    isHistoryLoading,
    generateImages,
    fetchUserHistory
  } = useTextToImage();

  // 处理页面加载状态
  useEffect(() => {
    if (!isHistoryLoading && !isCreditsLoading) {
      // 当历史和点数数据都加载完成时，移除整体加载状态
      setIsAllLoading(false);
    }
  }, [isHistoryLoading, isCreditsLoading]);
  
  // 处理图像生成
  const handleGenerate = async (prompt: string) => {
    try {
      setCurrentPrompt(prompt);
      await generateImages(prompt);
    } catch (error) {
      console.error("生成图像失败:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* 提示词输入表单 */}
      <PromptInputForm 
        credits={credits}
        onGenerate={handleGenerate}
        setInputPrompt={setInputPrompt}
        inputPrompt={inputPrompt}
        isCreditsLoading={isCreditsLoading}
      />
      
      {/* 图片展示区域 */}
      <ImageGallery 
        images={imageUrls} 
        isLoading={isLoading}
        error={error}
        currentPrompt={currentPrompt}
        isAllLoading={isAllLoading}
        history={history}
      />
    </div>
  );
} 