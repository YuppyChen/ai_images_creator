import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

export default function SupportPage() {
  return (
    <div className="container mx-auto py-20">
      <div className="flex flex-col items-center text-center mb-16">
        <Badge variant="outline" className="mb-4">客户支持</Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">我们随时为您提供帮助</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          无论您有任何问题或需求，我们的团队都会竭诚为您服务，确保您获得最佳的AI图像创作体验。
        </p>
      </div>

      <Tabs defaultValue="faq" className="max-w-4xl mx-auto mb-16">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="faq">常见问题</TabsTrigger>
          <TabsTrigger value="contact">联系方式</TabsTrigger>
        </TabsList>
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>常见问题解答</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>如何开始创建我的第一张AI图像？</AccordionTrigger>
                  <AccordionContent>
                    非常简单！只需注册账号并登录后，点击"立即开始"按钮，
                    在文本框中输入您想要创建的图像描述，然后点击生成按钮。
                    AI将根据您的描述生成图像，您可以根据需要进行调整和优化。
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>我可以编辑AI生成的图像吗？</AccordionTrigger>
                  <AccordionContent>
                    是的！生成图像后，您可以使用我们提供的编辑工具进行调整，
                    包括修改色彩、风格转换、调整构图等。您也可以下载图像后
                    在您喜欢的图像编辑软件中进行进一步修改。
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>如何获得最佳的图像生成效果？</AccordionTrigger>
                  <AccordionContent>
                    提供详细具体的描述能帮助AI更好地理解您的需求。
                    尝试使用具体的风格、色彩、构图等关键词。
                    您也可以查看我们的"提示词指南"获取更多技巧。
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>我可以将生成的图像用于商业用途吗？</AccordionTrigger>
                  <AccordionContent>
                    标准用户可以将生成的图像用于个人项目。
                    如需商业用途，请升级到我们的专业版或企业版计划，
                    这将提供商业许可权限和更多高级功能。
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>如何升级到高级会员？</AccordionTrigger>
                  <AccordionContent>
                    登录您的账户后，点击右上角的个人头像，选择"会员计划"，
                    您可以在那里查看各个计划的详情并选择最适合您需求的方案。
                    我们提供月度和年度订阅选项，企业客户可以联系我们的销售团队获取定制方案。
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>联系我们</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">客户支持</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    有关账户、付款或产品使用的问题
                  </p>
                  <p className="text-sm font-medium">support@aiimages.com</p>
                  <p className="text-sm font-medium">工作时间: 9:00-18:00 (周一至周五)</p>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">业务合作</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    企业解决方案和战略伙伴关系
                  </p>
                  <p className="text-sm font-medium">business@aiimages.com</p>
                  <p className="text-sm font-medium">工作时间: 9:00-18:00 (周一至周五)</p>
                </div>
              </div>
              
              <div className="bg-muted p-6 rounded-lg text-center">
                <h3 className="font-medium mb-4">加入我们的社区</h3>
                <div className="flex justify-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 