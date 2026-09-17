import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Potusana's Item Manager",
    short_name: "Potusana's",
    description: "Manage your inventory from any device.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f7f8f6",
    theme_color: "#0f766e",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
