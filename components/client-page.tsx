"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ImageIcon, PlusCircle, X, ChevronLeft, ChevronRight, AlertCircle, Check, Copy } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ImageGenerationLoading } from "@/components/ui/loading";
import useTextToImage, { ImageGenerationHistory } from "@/components/hooks/use-text-to-image";

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
      
      {/* 计数器 - 确保点击计数器不会触发关闭 */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white" onClick={(e) => e.stopPropagation()}>
        <span className="bg-black/50 px-3 py-1 rounded-full text-sm">
          {index + 1} / {images.length}
        </span>
      </div>
    </div>
  );
}

// 图片画廊组件
function ImageGallery({ images, isLoading, error, currentPrompt }: { 
  images: string[], 
  isLoading: boolean, 
  error: string | null,
  currentPrompt: string
}) {
  const [loadedImages, setLoadedImages] = useState<boolean[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  
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
  
  // 打开预览
  const openPreview = (index: number) => {
    setPreviewIndex(index);
  };
  
  // 关闭预览
  const closePreview = () => {
    setPreviewIndex(null);
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold mb-3">历史作品</h2>
      
      {error && <ErrorDisplay message={error} />}
      
      {isLoading ? (
        <div>
          {/* 骨架屏图片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-image-${index}`} className="w-full">
                <SkeletonImage />
              </div>
            ))}
          </div>
          
          {/* 骨架屏提示词 - 只显示一行 */}
          <SkeletonPrompt />
        </div>
      ) : (
        <div>
          {/* 图片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.length > 0 ? (
              // 显示生成的图像
              images.map((imageUrl, index) => (
                <div key={`image-container-${index}`} className="w-full">
                  <Card 
                    key={`image-${index}`} 
                    className="overflow-hidden group relative aspect-square w-full cursor-pointer"
                    onClick={() => openPreview(index)}
                  >
                    <div className={`absolute inset-0 flex items-center justify-center bg-muted/20 transition-opacity ${loadedImages[index] ? 'opacity-0' : 'opacity-100'}`}>
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Image 
                      src={imageUrl} 
                      alt={`用户生成的图像 ${index + 1}`} 
                      fill 
                      className={`object-cover transition-transform duration-300 group-hover:scale-105 ${loadedImages[index] ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => handleImageLoad(index)}
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      priority={index === 0}
                    />
                  </Card>
                </div>
              ))
            ) : (
              // 显示空状态 - 只显示一个占位卡片
              <Card 
                className="overflow-hidden aspect-square flex items-center justify-center bg-muted/30 w-full"
              >
                <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                  <ImageIcon className="h-8 w-8" />
                  <p className="text-sm">创建您的第一张AI图像</p>
                </div>
              </Card>
            )}
          </div>
          
          {/* 提示词 - 只在有图片且有提示词的情况下显示一行 */}
          {images.length > 0 && currentPrompt && (
            <PromptDisplay prompt={currentPrompt} />
          )}
        </div>
      )}
      
      {/* 图片预览弹窗 */}
      {previewIndex !== null && images.length > 0 && (
        <ImagePreview 
          images={images} 
          currentIndex={previewIndex} 
          onClose={closePreview}
          prompt={currentPrompt}
        />
      )}
    </div>
  );
}

// 历史记录项组件
function HistoryItem({ 
  history, 
  onSelect, 
  isSelected 
}: { 
  history: ImageGenerationHistory, 
  onSelect: () => void,
  isSelected: boolean
}) {
  // 确保至少有一张图片
  const thumbnailUrl = history.image_urls[0] || '';
  const date = new Date(history.created_at).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
        isSelected ? 'bg-primary/10' : 'hover:bg-accent'
      }`}
      onClick={onSelect}
    >
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt="缩略图"
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <p className="text-sm font-medium truncate">{history.prompt}</p>
        <p className="text-xs text-muted-foreground">{date} · {history.image_urls.length}张图片</p>
      </div>
    </div>
  );
}

// 历史记录列表组件
function HistoryList({ 
  history, 
  isLoading, 
  error,
  onSelectHistory,
  selectedIndex
}: { 
  history: ImageGenerationHistory[],
  isLoading: boolean,
  error: string | null,
  onSelectHistory: (index: number) => void,
  selectedIndex: number | null
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-2">
            <div className="h-12 w-12 flex-shrink-0 rounded-md bg-muted/30 animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted/30 rounded animate-pulse"></div>
              <div className="h-3 w-24 bg-muted/30 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>暂无历史记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-[350px] overflow-y-auto pr-1">
      {history.map((item, index) => (
        <HistoryItem 
          key={item.id} 
          history={item} 
          onSelect={() => onSelectHistory(index)}
          isSelected={selectedIndex === index}
        />
      ))}
    </div>
  );
}

// 保存生成记录
interface GenerationRecord {
  prompt: string;
  imageUrls: string[];
  timestamp: number;
}

// 导出客户端页面组件
export default function ClientPage() {
  // 使用文生图hook
  const { 
    generateImages, 
    isGenerating, 
    isLoading, 
    imageUrls, 
    error,
    credits,
    isCreditsLoading,
    creditsError,
    history,
    isHistoryLoading,
    historyError,
    fetchUserHistory
  } = useTextToImage();
  
  // 输入提示词状态
  const [inputPrompt, setInputPrompt] = useState("");
  
  // 当前生成的提示词
  const [currentPrompt, setCurrentPrompt] = useState("");
  
  // 选中的历史记录索引
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  
  // 当前显示的图片
  const [displayedImages, setDisplayedImages] = useState<string[]>([]);

  // 当图片数组变化时打印日志
  useEffect(() => {
    if (imageUrls.length > 0) {
      console.log('收到新的图片数组:', imageUrls);
      setDisplayedImages(imageUrls);
      setSelectedHistoryIndex(null); // 重置历史记录选择
    }
  }, [imageUrls]);
  
  // 处理生成图像
  const handleGenerate = async (prompt: string) => {
    console.log('开始生成图像，提示词:', prompt);
    // 保存当前提示词
    setCurrentPrompt(prompt);
    await generateImages(prompt);
  };

  // 处理选择历史记录
  const handleSelectHistory = (index: number) => {
    if (index >= 0 && index < history.length) {
      const selectedHistory = history[index];
      setDisplayedImages(selectedHistory.image_urls);
      setCurrentPrompt(selectedHistory.prompt);
      setSelectedHistoryIndex(index);
    }
  };

  // 使用full-width-container强制覆盖父容器宽度限制
  return (
    <div className="full-width-container">
      <div className="content-container py-4">
        {/* 顶部提示词输入区域 */}
        <PromptInputForm 
          credits={credits} 
          onGenerate={handleGenerate} 
          setInputPrompt={setInputPrompt}
          inputPrompt={inputPrompt}
          isCreditsLoading={isCreditsLoading}
        />
        
        {/* 主体内容区 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 左侧历史记录列表 */}
          <div className="md:col-span-1">
            <div className="rounded-lg border bg-background p-4">
              <h2 className="text-lg font-bold mb-3">历史记录</h2>
              <HistoryList 
                history={history}
                isLoading={isHistoryLoading}
                error={historyError}
                onSelectHistory={handleSelectHistory}
                selectedIndex={selectedHistoryIndex}
              />
            </div>
          </div>
          
          {/* 右侧图片展示区域 */}
          <div className="md:col-span-3">
            <ImageGallery 
              images={displayedImages} 
              isLoading={isLoading || isGenerating}
              error={error}
              currentPrompt={currentPrompt}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 