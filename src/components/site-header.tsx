import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-mist/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href={user ? "/directory" : "/"} className="font-display text-xl tracking-tight text-ink">
          Knot
          <span className="ml-1.5 text-sm font-sans font-medium text-muted">Alumni</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/directory"
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist-deep/60"
              >
                Directory
              </Link>
              <Link
                href="/profile"
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist-deep/60"
              >
                Profile
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/sign-in"
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist-deep/60"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-md bg-coral px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-deep"
              >
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
