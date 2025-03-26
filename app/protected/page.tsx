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

  return <ClientPage />;
}
