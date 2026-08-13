import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import type { Industry, Profile, Skill } from "@/lib/types";

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

  const row = profile as Profile;
  const latitude = typeof row.latitude === "number" ? row.latitude : null;
  const longitude = typeof row.longitude === "number" ? row.longitude : null;

  return (
    <ProfileForm
      mode="edit"
      industries={(industries as Industry[]) || []}
      skills={(skills as Skill[]) || []}
      initial={{
        full_name: row.full_name || "",
        email: row.email || user.email || "",
        phone: row.phone || "",
        linkedin_url: row.linkedin_url || "",
        headline: row.headline || "",
        bio: row.bio || "",
        graduation_year: row.graduation_year ? String(row.graduation_year) : "",
        last_class: row.last_class || "",
        last_division: row.last_division || "",
        location: row.location || "",
        latitude,
        longitude,
        industry_id: row.industry_id || "",
        skill_ids: (profileSkills || []).map((ps) => ps.skill_id),
        avatar_url: row.avatar_url || "",
      }}
    />
  );
}
