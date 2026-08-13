import { EventForm } from "@/components/admin/event-form";

export default function NewEventPage() {
  return (
    <section className="mt-8">
      <h1 className="font-display text-2xl tracking-tight text-ink">New event</h1>
      <EventForm />
    </section>
  );
}
