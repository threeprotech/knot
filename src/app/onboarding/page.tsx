import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import type { Industry, Skill } from "@/lib/types";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) redirect("/profile");

  const [{ data: industries }, { data: skills }] = await Promise.all([
    supabase.from("industries").select("id, name").order("name"),
    supabase.from("skills").select("id, name, category").order("name"),
  ]);

  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "";

  return (
    <ProfileForm
      mode="onboarding"
      industries={(industries as Industry[]) || []}
      skills={(skills as Skill[]) || []}
      initial={{
        full_name: fullName,
        email: user.email || "",
        phone: "",
        linkedin_url: "",
        headline: "",
        bio: "",
        graduation_year: "",
        last_class: "",
        last_division: "",
        location: "",
        latitude: null,
        longitude: null,
        industry_id: "",
        skill_ids: [],
        avatar_url: "",
      }}
    />
  );
}
