"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/directory";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === "sign-up") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (signUpError) throw signUpError;
        if (!data.user) throw new Error("Could not create account.");
        router.push("/onboarding");
        router.refresh();
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();

          router.push(profile ? next : "/onboarding");
        } else {
          router.push(next);
        }
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const isSignUp = mode === "sign-up";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <div className="animate-fade-up">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-coral">Knot Alumni</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight text-ink sm:text-4xl">
          {isSignUp ? "Join the network" : "Welcome back"}
        </h1>
        <p className="mt-2 text-muted">
          {isSignUp
            ? "Create an account and build your alumni profile."
            : "Sign in to search and connect with alumni."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 animate-fade-up space-y-4" style={{ animationDelay: "80ms" }}>
        {isSignUp && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">Full name</span>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-ink outline-none ring-coral/30 transition focus:border-coral focus:ring-2"
              placeholder="Alex Rivera"
              autoComplete="name"
            />
          </label>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-ink outline-none ring-coral/30 transition focus:border-coral focus:ring-2"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">Password</span>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-ink outline-none ring-coral/30 transition focus:border-coral focus:ring-2"
            placeholder="••••••••"
            autoComplete={isSignUp ? "new-password" : "current-password"}
          />
        </label>

        {error && (
          <p className="rounded-lg bg-coral-soft px-3 py-2 text-sm text-coral-deep" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-coral py-2.5 text-sm font-semibold text-white transition hover:bg-coral-deep disabled:opacity-60"
        >
          {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isSignUp ? (
          <>
            Already a member?{" "}
            <Link href="/auth/sign-in" className="font-medium text-coral hover:text-coral-deep">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/auth/sign-up" className="font-medium text-coral hover:text-coral-deep">
              Join Knot
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
