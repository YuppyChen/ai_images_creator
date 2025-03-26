import { MoveRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

function Hero() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 items-center md:grid-cols-2">
          <div className="flex gap-4 flex-col">
            <div>
              <Badge variant="outline">全新上线！</Badge>
            </div>
            <div className="flex gap-4 flex-col">
              <h1 className="text-5xl md:text-7xl max-w-lg tracking-tighter text-left font-regular">
                想象力变成现实的地方
              </h1>
              <p className="text-xl leading-relaxed tracking-tight text-muted-foreground max-w-md text-left">
                简单描述您的想法，我们的AI立即为您创造出惊艳的图像。
                告别复杂的设计工具，无需专业技能，人人都能成为艺术家。
                让AI图像生成技术为您的创意插上翅膀。
              </p>
            </div>
            <div className="flex flex-row gap-4">
              <Button size="lg" className="gap-4" variant="outline">
                查看示例 <ImageIcon className="w-4 h-4" />
              </Button>
              <Button size="lg" className="gap-4">
                立即开始 <MoveRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-muted rounded-md aspect-square relative overflow-hidden">
              <Image 
                src="/images/0_0.jpeg" 
                alt="AI生成的图像示例" 
                fill 
                style={{objectFit: "cover"}} 
              />
            </div>
            <div className="bg-muted rounded-md row-span-2 relative overflow-hidden">
              <Image 
                src="/images/0_2.jpeg" 
                alt="AI生成的图像示例" 
                fill 
                style={{objectFit: "cover"}} 
              />
            </div>
            <div className="bg-muted rounded-md aspect-square relative overflow-hidden">
              <Image 
                src="/images/0_3.png" 
                alt="AI生成的图像示例" 
                fill 
                style={{objectFit: "cover"}} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero }; 