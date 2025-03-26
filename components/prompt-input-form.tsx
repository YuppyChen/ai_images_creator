"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";

interface PromptInputFormProps {
  credits: number;
}

export function PromptInputForm({ credits }: PromptInputFormProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      // 在这里您可以添加生成图像的API调用
      // 例如: await generateImage(prompt);
      console.log("生成图像:", prompt);
      
      // 模拟API调用延迟
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