import { createClient } from "@/lib/supabase/server";
import { LookupManager } from "@/components/admin/lookup-manager";
import type { Industry } from "@/lib/types";

export default async function AdminIndustriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("industries").select("id, name").order("name");

  return (
    <section className="mt-8">
      <h1 className="font-display text-2xl tracking-tight text-ink">Industries</h1>
      <p className="mt-1 text-sm text-muted">Names shown on profiles and directory filters.</p>
      <LookupManager kind="industries" items={(data as Industry[]) || []} />
    </section>
  );
}
