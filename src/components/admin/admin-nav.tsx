"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/industries", label: "Industries" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/alerts", label: "Alerts" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active ? "bg-ink text-white" : "text-ink-soft hover:bg-mist-deep/60"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
