"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapFrame, MapPlaceholder } from "@/components/map-shell";
import { createClient } from "@/lib/supabase/client";
import { L, addOsmTiles, alumniPinIcon } from "@/lib/leaflet-shared";
import type { MapPin } from "@/lib/types";

type Props = {
  isSignedIn: boolean;
};

export function AlumniMap({ isSignedIn }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pins, setPins] = useState<MapPin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    supabase.rpc("list_map_pins").then(({ data, error: rpcError }) => {
      if (cancelled) return;
      if (rpcError) {
        setError("Could not load the map.");
        setPins([]);
        return;
      }
      setPins((data as MapPin[]) || []);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !pins || pins.length === 0) return;

    const map = L.map(el, {
      scrollWheelZoom: true,
      worldCopyJump: true,
    }).setView([20, 0], 2);

    const pinIcon = alumniPinIcon();
    addOsmTiles(map);

    const latLngs: L.LatLngExpression[] = [];

    for (const pin of pins) {
      const latLng: L.LatLngExpression = [pin.latitude, pin.longitude];
      latLngs.push(latLng);

      const marker = L.marker(latLng, {
        icon: pinIcon,
        title: pin.full_name,
        keyboard: true,
      }).addTo(map);

      marker.bindTooltip(pin.full_name, {
        permanent: true,
        direction: "top",
        offset: [0, -10],
        className: "alumni-map-label",
        opacity: 0.95,
      });

      marker.on("click", () => {
        const profilePath = `/directory/${pin.id}`;
        if (isSignedIn) {
          router.push(profilePath);
        } else {
          router.push(`/auth/sign-in?next=${encodeURIComponent(profilePath)}`);
        }
      });
    }

    if (latLngs.length === 1) {
      map.setView(latLngs[0], 5);
    } else {
      map.fitBounds(L.latLngBounds(latLngs), { padding: [48, 48], maxZoom: 8 });
    }

    requestAnimationFrame(() => map.invalidateSize());

    return () => {
      map.remove();
    };
  }, [pins, isSignedIn, router]);

  if (error) {
    return <MapPlaceholder>{error}</MapPlaceholder>;
  }

  if (pins === null) {
    return <MapPlaceholder>Loading map…</MapPlaceholder>;
  }

  if (pins.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white px-6 text-center">
        <p className="font-display text-xl tracking-tight text-ink">No pins yet</p>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Alumni appear here after they mark a location on their profile.
        </p>
      </div>
    );
  }

  return (
    <MapFrame>
      <div
        ref={containerRef}
        className="h-full w-full"
        role="application"
        aria-label="Alumni map"
      />
    </MapFrame>
  );
}

export default AlumniMap;
