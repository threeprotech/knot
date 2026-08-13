import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PublicMenu } from "@/components/public-menu";
import { SignOutButton } from "@/components/sign-out-button";
import { getIsAdmin } from "@/lib/admin";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { role?: string | null } | null = null;
  if (user) {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!error) profile = data;
  }

  const admin = getIsAdmin(user, profile);

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-mist/85 backdrop-blur-md">
      <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-2 px-4 py-1.5 sm:px-6">
        <Link href={user ? "/directory" : "/"} className="font-display text-xl tracking-tight text-ink">
          Knot
          <span className="ml-1.5 text-sm font-sans font-medium text-muted">Alumni</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          {user ? (
            <>
              <Link
                href="/directory"
                className="rounded-md px-2 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist-deep/60 sm:px-2.5"
              >
                Directory
              </Link>
              <Link
                href="/map"
                className="rounded-md px-2 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist-deep/60 sm:px-2.5"
              >
                Map
              </Link>
              <Link
                href="/events"
                className="rounded-md px-2 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist-deep/60 sm:px-2.5"
              >
                Events
              </Link>
              <Link
                href="/profile"
                className="rounded-md px-2 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist-deep/60 sm:px-2.5"
              >
                Profile
              </Link>
              {admin && (
                <Link
                  href="/admin"
                  className="rounded-md px-2 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist-deep/60 sm:px-2.5"
                >
                  Admin
                </Link>
              )}
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/map"
                className="rounded-md px-2 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist-deep/60 sm:px-2.5"
              >
                Map
              </Link>
              <PublicMenu />
              <Link
                href="/auth/sign-in"
                className="hidden rounded-md px-2.5 py-1.5 text-sm font-medium text-ink-soft hover:bg-mist-deep/60 sm:inline"
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
