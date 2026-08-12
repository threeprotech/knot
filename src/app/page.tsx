import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    redirect(profile ? "/directory" : "/onboarding");
  }

  return (
    <section className="hero-atmosphere relative flex flex-1 flex-col overflow-hidden">
      {/* Atmospheric visual plane — knot / network motif */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 18% 42%, rgba(12, 27, 42, 0.08) 0 1.5px, transparent 2px),
            radial-gradient(circle at 42% 28%, rgba(12, 27, 42, 0.07) 0 1.5px, transparent 2px),
            radial-gradient(circle at 68% 48%, rgba(12, 27, 42, 0.08) 0 1.5px, transparent 2px),
            radial-gradient(circle at 82% 32%, rgba(232, 93, 76, 0.2) 0 2px, transparent 2.5px),
            radial-gradient(circle at 55% 70%, rgba(12, 27, 42, 0.06) 0 1.5px, transparent 2px),
            radial-gradient(circle at 30% 75%, rgba(232, 93, 76, 0.12) 0 1.5px, transparent 2px)
          `,
          backgroundSize: "100% 100%",
        }}
      />
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]"
        viewBox="0 0 800 900"
        fill="none"
      >
        <path
          d="M140 380 C220 300, 320 320, 400 420 C480 520, 560 500, 660 380"
          stroke="#0c1b2a"
          strokeWidth="1.2"
        />
        <path
          d="M180 620 C280 540, 360 560, 420 640 C490 730, 600 700, 700 560"
          stroke="#0c1b2a"
          strokeWidth="1.2"
        />
        <path
          d="M220 220 C300 280, 340 360, 360 480 C380 600, 420 680, 520 760"
          stroke="#e85d4c"
          strokeWidth="1.2"
        />
        <circle cx="400" cy="420" r="5" fill="#e85d4c" />
        <circle cx="220" cy="300" r="3.5" fill="#0c1b2a" />
        <circle cx="660" cy="380" r="3.5" fill="#0c1b2a" />
        <circle cx="420" cy="640" r="3.5" fill="#0c1b2a" />
      </svg>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 pb-20 pt-10 sm:px-8 sm:pb-28 sm:pt-16">
        <div className="max-w-xl">
          <p className="animate-fade-up font-display text-5xl leading-none tracking-tight text-ink sm:text-7xl">
            Knot
          </p>
          <p
            className="animate-fade-up mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-coral sm:text-base"
            style={{ animationDelay: "80ms" }}
          >
            Alumni
          </p>
          <h1
            className="animate-fade-up mt-6 font-display text-2xl leading-snug tracking-tight text-ink-soft sm:text-3xl"
            style={{ animationDelay: "140ms" }}
          >
            Stay tied to the people who share your craft.
          </h1>
          <p
            className="animate-fade-up mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg"
            style={{ animationDelay: "200ms" }}
          >
            Register your profile, map your skills and industry, and find alumni ready to connect.
          </p>
          <div
            className="animate-fade-up mt-8 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "280ms" }}
          >
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center justify-center rounded-lg bg-coral px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-deep"
            >
              Join the network
            </Link>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center justify-center rounded-lg border border-ink/15 bg-white/70 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
