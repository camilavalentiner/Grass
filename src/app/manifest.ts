import type { MetadataRoute } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ICONS: MetadataRoute.Manifest["icons"] = [
  { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
  { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
];

/** Lets "Add to Home Screen" install Grass as its own app. Icons are listed once they exist in public/icons. */
export default function manifest(): MetadataRoute.Manifest {
  const icons = (ICONS ?? []).filter((i) => existsSync(join(process.cwd(), "public", i.src)));
  return {
    name: "Grass",
    short_name: "Grass",
    description: "A gentle place to use your time well.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf8ef",
    theme_color: "#fbf8ef",
    icons,
  };
}
