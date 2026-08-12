"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Project } from "@/lib/projects";

export function ProjectMap({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (p: Project) => void;
}) {
  const box = useRef<HTMLDivElement>(null),
    map = useRef<maplibregl.Map | null>(null);
  useEffect(() => {
    if (!box.current || map.current) return;
    const m = new maplibregl.Map({
      container: box.current,
      center: [-5.55, 7.55],
      zoom: 5.55,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            paint: { "raster-saturation": -0.7, "raster-opacity": 0.68 },
          },
        ],
      },
    });
    m.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right",
    );
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);
  useEffect(() => {
    if (!map.current) return;
    const markers: maplibregl.Marker[] = [];
    projects.forEach((p) => {
      const el = document.createElement("button");
      el.className = `marker ${p.risk === "Critique" ? "red" : p.risk === "À surveiller" ? "amber" : "green"}`;
      el.title = p.name;
      el.onclick = () => onSelect(p);
      markers.push(
        new maplibregl.Marker({ element: el })
          .setLngLat([p.lng, p.lat])
          .addTo(map.current!),
      );
    });
    return () => markers.forEach((x) => x.remove());
  }, [projects, onSelect]);
  return (
    <div ref={box} className="map" aria-label="Carte des projets publics" />
  );
}
