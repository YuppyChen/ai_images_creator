import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="flex flex-col items-center text-center mb-16">
        <Badge variant="outline" className="mb-4">关于我们</Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">想象的边界，由您定义</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          我们致力于将AI与创意完美结合，让每个人都能轻松创作出精美图像。
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <CardTitle>我们的使命</CardTitle>
            <CardDescription>让创意表达变得简单</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              我们相信，创意不应该被技术门槛所限制。通过先进的AI图像生成技术，
              我们让每个人都能轻松将想法转化为视觉作品，无需专业设计技能。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>技术优势</CardTitle>
            <CardDescription>最前沿的AI模型</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              我们采用业界最先进的人工智能模型，结合自研的优化算法，
              确保生成图像的质量、精度和创意性始终保持在最高水平。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>我们的团队</CardTitle>
            <CardDescription>热爱创意与技术的结合</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              我们的团队由AI研究者、设计师和产品专家组成，
              他们共同的目标是打造最直观、最强大的AI图像创作平台。
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="border-t pt-16">
        <h2 className="text-3xl font-semibold mb-8 text-center">我们的理念</h2>
        <div className="flex flex-col md:flex-row gap-12 justify-center">
          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            </div>
            <h3 className="text-xl font-medium mb-2">简单易用</h3>
            <p className="text-muted-foreground">我们相信最强大的工具应该也是最易用的。无需复杂设置，只需描述您的想法。</p>
          </div>

          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <h3 className="text-xl font-medium mb-2">全球视野</h3>
            <p className="text-muted-foreground">我们的AI模型融合了全球文化元素，能够理解和创造多元文化背景下的视觉艺术。</p>
          </div>

          <div className="flex flex-col items-center text-center max-w-xs">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>
            </div>
            <h3 className="text-xl font-medium mb-2">无限创意</h3>
            <p className="text-muted-foreground">我们致力于不断扩展AI的创意边界，让用户能够探索更多前所未有的艺术可能性。</p>
          </div>
        </div>
      </div>
    </div>
  );
} 