import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AlertForm } from "@/components/admin/alert-form";
import type { Alert } from "@/lib/types";

export default async function EditAlertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("alerts").select("*").eq("id", id).maybeSingle();

  if (!data) notFound();

  return (
    <section className="mt-8">
      <h1 className="font-display text-2xl tracking-tight text-ink">Edit alert</h1>
      <AlertForm alert={data as Alert} />
    </section>
  );
}
