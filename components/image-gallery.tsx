"use client";

import { Card } from "@/components/ui/card";
import { ImageIcon, Download, Share2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: string[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const downloadImage = (imageUrl: string) => {
    // 实现下载逻辑
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
              
              {/* 悬浮操作按钮 */}
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