import { AlertForm } from "@/components/admin/alert-form";

export default function NewAlertPage() {
  return (
    <section className="mt-8">
      <h1 className="font-display text-2xl tracking-tight text-ink">New alert</h1>
      <AlertForm />
    </section>
  );
}
