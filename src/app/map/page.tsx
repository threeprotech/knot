import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AlumniMapLoader } from "@/components/alumni-map-loader";

export const metadata: Metadata = {
  title: "Map — Knot Alumni",
  description: "A world map of Knot alumni. Pins show names only.",
};

export default async function MapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="mx-auto w-full max-w-5xl px-4 pt-8 pb-4 sm:px-6 sm:pt-12">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-coral">Alumni</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">Map</h1>
      </div>
      <div className="w-full px-4 pb-8 sm:px-6 sm:pb-12">
        <AlumniMapLoader isSignedIn={Boolean(user)} />
      </div>
    </div>
  );
}
