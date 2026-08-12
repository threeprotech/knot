import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import type { Industry, Skill } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const [{ data: profile }, { data: industries }, { data: skills }, { data: profileSkills }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("industries").select("id, name").order("name"),
      supabase.from("skills").select("id, name, category").order("name"),
      supabase.from("profile_skills").select("skill_id").eq("profile_id", user.id),
    ]);

  if (!profile) redirect("/onboarding");

  return (
    <ProfileForm
      mode="edit"
      industries={(industries as Industry[]) || []}
      skills={(skills as Skill[]) || []}
      initial={{
        full_name: profile.full_name || "",
        email: profile.email || user.email || "",
        phone: profile.phone || "",
        linkedin_url: profile.linkedin_url || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        graduation_year: profile.graduation_year ? String(profile.graduation_year) : "",
        location: profile.location || "",
        industry_id: profile.industry_id || "",
        skill_ids: (profileSkills || []).map((ps) => ps.skill_id),
        avatar_url: profile.avatar_url || "",
      }}
    />
  );
}
