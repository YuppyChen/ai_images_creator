import { FloatingNavDemo } from "@/components/FloatingNavDemo";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <FloatingNavDemo />
      <div className="flex-1 flex flex-col mt-16">
        {children}
      </div>
    </div>
  );
}
