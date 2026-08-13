import "server-only";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export function getIsAdmin(
  user: User | { email?: string | null } | null,
  profile: Pick<Profile, "role"> | { role?: string | null } | null,
): boolean {
  if (!user) return false;
  if (profile?.role === "admin") return true;
  return isAdminEmail(user.email);
}
