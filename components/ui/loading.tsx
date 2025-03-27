import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingProps {
  text?: string;
  className?: string;
}

export function Loading({ text = "正在加载...", className = "" }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function ImageGenerationLoading() {
  const steps = [
    "正在创建任务...",
    "正在处理您的提示词...",
    "模型正在绘制中...",
    "即将完成，请稍候..."
  ];

  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-base font-medium mb-2">AI正在创作您的图像</p>
      <p className="text-sm text-muted-foreground">{steps[currentStep]}</p>
    </div>
  );
} 