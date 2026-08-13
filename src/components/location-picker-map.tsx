"use client";

import { useEffect, useRef, useState } from "react";
import { MapFrame, MAP_HEIGHT_PICKER } from "@/components/map-shell";
import { L, addOsmTiles, alumniPinIcon } from "@/lib/leaflet-shared";

type Coords = {
  latitude: number;
  longitude: number;
};

type Props = {
  latitude: number | null;
  longitude: number | null;
  onChange: (coords: Coords | null) => void;
};

function hasPin(latitude: number | null, longitude: number | null): boolean {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export function LocationPickerMap({ latitude, longitude, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [mapId, setMapId] = useState(0);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      scrollWheelZoom: false,
      worldCopyJump: true,
    }).setView([20, 0], 2);

    addOsmTiles(map);

    map.on("click", (event: L.LeafletMouseEvent) => {
      onChangeRef.current({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    });

    mapRef.current = map;
    setMapId((id) => id + 1);
    const frame = requestAnimationFrame(() => map.invalidateSize());
    const timer = window.setTimeout(() => map.invalidateSize(), 250);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!hasPin(latitude, longitude)) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    const latLng: L.LatLngExpression = [latitude as number, longitude as number];

    if (markerRef.current) {
      const current = markerRef.current.getLatLng();
      if (current.lat !== latitude || current.lng !== longitude) {
        markerRef.current.setLatLng(latLng);
      }
      if (!map.getBounds().pad(0.15).contains(latLng)) {
        map.setView(latLng, Math.max(map.getZoom(), 8));
      }
      return;
    }

    const marker = L.marker(latLng, {
      icon: alumniPinIcon(),
      draggable: true,
      autoPan: true,
      keyboard: true,
      title: "Your location",
    }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onChangeRef.current({ latitude: pos.lat, longitude: pos.lng });
    });

    markerRef.current = marker;
    map.setView(latLng, Math.max(map.getZoom(), 8));
  }, [mapId, latitude, longitude]);

  return (
    <MapFrame picker className={MAP_HEIGHT_PICKER}>
      <div
        ref={containerRef}
        className="h-full w-full"
        role="application"
        aria-label="Mark your location on the map"
      />
    </MapFrame>
  );
}

export default LocationPickerMap;
