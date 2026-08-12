import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DirectoryClient } from "@/components/directory-client";
import type { Industry, Skill } from "@/lib/types";

export default async function DirectoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in?next=/directory");

  const { data: ownProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!ownProfile) redirect("/onboarding");

  const [{ data: profiles }, { data: industries }, { data: skills }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        `
        *,
        industries ( id, name ),
        profile_skills ( skill_id, skills ( id, name, category ) )
      `,
      )
      .order("full_name"),
    supabase.from("industries").select("id, name").order("name"),
    supabase.from("skills").select("id, name, category").order("name"),
  ]);

  return (
    <Suspense fallback={<div className="px-4 py-16 text-center text-muted">Loading directory…</div>}>
      <DirectoryClient
        profiles={(profiles as never) || []}
        industries={(industries as Industry[]) || []}
        skills={(skills as Skill[]) || []}
      />
    </Suspense>
  );
}
