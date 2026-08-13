"use client";

import dynamic from "next/dynamic";
import { MAP_HEIGHT_PAGE, MapPlaceholder } from "@/components/map-shell";

const AlumniMap = dynamic(() => import("@/components/alumni-map"), {
  ssr: false,
  loading: () => <MapPlaceholder>Loading map…</MapPlaceholder>,
});

export function AlumniMapLoader({
  isSignedIn,
  className = MAP_HEIGHT_PAGE,
}: {
  isSignedIn: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <AlumniMap isSignedIn={isSignedIn} />
    </div>
  );
}
