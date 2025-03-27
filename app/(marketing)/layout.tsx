export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col max-w-screen-xl mx-auto">
        {children}
      </div>
    </div>
  );
}
