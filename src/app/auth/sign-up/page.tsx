import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center text-muted">Loading…</div>}>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
