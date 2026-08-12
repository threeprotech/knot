"use client";

import { useState } from "react";

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-10 w-10 text-sm",
  md: "h-12 w-12 text-base",
  lg: "h-20 w-20 text-2xl",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Avatar({ name, src, size = "md", className = "" }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const classes = `${sizeClasses[size]} ${className} shrink-0 overflow-hidden rounded-full bg-ink text-white`;

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name} avatar`}
        className={`${classes} object-cover`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${classes} inline-flex items-center justify-center font-semibold tracking-wide`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
