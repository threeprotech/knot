"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-mist-deep/60 hover:text-ink"
    >
      Sign out
    </button>
  );
}
