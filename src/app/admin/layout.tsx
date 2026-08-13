import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getIsAdmin, isAdminEmail } from "@/lib/admin";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/onboarding");

  if (!getIsAdmin(user, profile)) {
    redirect("/directory");
  }

  if (isAdminEmail(user.email) && profile.role !== "admin") {
    await supabase.from("profiles").update({ role: "admin" }).eq("id", user.id);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <p className="text-sm font-medium uppercase tracking-[0.14em] text-coral">Admin</p>
      <div className="mt-3">
        <AdminNav />
      </div>
      {children}
    </div>
  );
}
