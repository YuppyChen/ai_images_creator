"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ImageIcon, PlusCircle, Download, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// 提示词输入表单组件
function PromptInputForm({ credits }: { credits: number }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      console.log("生成图像:", prompt);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("生成图像失败:", error);
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

// 图片画廊组件
function ImageGallery({ images }: { images: string[] }) {
  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">您的作品</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {images.length > 0 ? (
          images.map((imageUrl, index) => (
            <Card key={index} className="overflow-hidden group relative aspect-square">
              <Image 
                src={imageUrl} 
                alt={`用户生成的图像 ${index + 1}`} 
                fill 
                className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          Array.from({ length: 4 }).map((_, index) => (
            <Card 
              key={index} 
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
  // 用户图片数据（实际应用中应从数据库获取）
  const userImages: string[] = [];

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-8">
      {/* 顶部提示词输入区域 */}
      <PromptInputForm credits={5} />
      
      {/* 图片展示区域 */}
      <ImageGallery images={userImages} />
    </div>
  );
} 