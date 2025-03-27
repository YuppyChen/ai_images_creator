import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ClientPage from "@/components/client-page";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // 使用全宽度容器，强制突破layout宽度限制
  return (
    <div className="full-width-container">
      <ClientPage />
    </div>
  );
}
