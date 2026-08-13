"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function PublicMenu() {
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();
  const panelId = useId();
  const titleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const button = buttonRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      button?.focus();
    };
  }, [open]);

  const overlay =
    open && isClient
      ? createPortal(
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-ink/25 sm:bg-ink/30"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <div
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="absolute inset-0 flex flex-col bg-mist animate-fade-in sm:inset-3 sm:rounded-2xl sm:border sm:border-line sm:shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-line/70 px-5 py-4 sm:px-8">
                <p className="font-display text-xl tracking-tight text-ink">
                  Knot
                  <span className="ml-1.5 font-sans text-sm font-medium text-muted">Alumni</span>
                </p>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink transition hover:bg-white"
                  aria-label="Close menu"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-center px-5 py-10 sm:px-12 sm:py-14">
                <div className="mx-auto w-full max-w-lg">
                  <h2
                    id={titleId}
                    className="font-display text-3xl leading-tight tracking-tight text-ink sm:text-5xl"
                  >
                    Looking for a classmate?
                  </h2>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg">
                    Browse the public alumni map, or sign in to search the directory. New here?
                    Register to join the network.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Link
                      href="/auth/sign-up"
                      className="inline-flex w-full items-center justify-center rounded-lg bg-coral px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-coral-deep sm:w-auto"
                    >
                      Register
                    </Link>
                    <Link
                      href="/auth/sign-in"
                      className="inline-flex w-full items-center justify-center rounded-lg border border-ink/15 bg-white px-6 py-3.5 text-base font-semibold text-ink transition hover:bg-mist-deep/50 sm:w-auto"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/map"
                      className="inline-flex w-full items-center justify-center rounded-lg px-6 py-3.5 text-base font-semibold text-coral transition hover:bg-coral-soft sm:w-auto"
                    >
                      Alumni map
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink hover:bg-mist-deep/60"
      >
        <MenuIcon />
      </button>
      {overlay}
    </>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
