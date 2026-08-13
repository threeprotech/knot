import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-start justify-center px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-coral">404</p>
      <h1 className="mt-2 font-display text-3xl text-ink">Page not found</h1>
      <p className="mt-2 text-muted">That page doesn’t exist or isn’t available.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-coral px-4 py-2.5 text-sm font-semibold text-white hover:bg-coral-deep"
      >
        Back home
      </Link>
    </div>
  );
}
