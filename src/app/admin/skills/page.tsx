import { createClient } from "@/lib/supabase/server";
import { LookupManager } from "@/components/admin/lookup-manager";
import type { Skill } from "@/lib/types";

export default async function AdminSkillsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("skills").select("id, name, category").order("name");

  return (
    <section className="mt-8">
      <h1 className="font-display text-2xl tracking-tight text-ink">Skills</h1>
      <p className="mt-1 text-sm text-muted">Grouped as Technical, Soft, or Domain.</p>
      <LookupManager kind="skills" items={(data as Skill[]) || []} />
    </section>
  );
}
