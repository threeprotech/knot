"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

export { L };

export function addOsmTiles(map: L.Map) {
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(map);
}

export function alumniPinIcon() {
  return L.divIcon({
    className: "alumni-map-pin",
    html: '<span class="alumni-map-pin-dot"></span>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    tooltipAnchor: [0, -12],
  });
}
