import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Infosys Mysore Campus Food Courts",
    short_name: "Infosys Food",
    description:
      "Live daily menu cards and operating timings across all 8 campus food courts at Infosys Mysore.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDF1DF",
    theme_color: "#FDF1DF",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Lunch Menus",
        short_name: "Lunch",
        description: "View active lunch menus (12:00 PM – 3:30 PM)",
        url: "/?window=lunch",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Dinner Menus",
        short_name: "Dinner",
        description: "View active dinner menus (7:00 PM – 10:30 PM)",
        url: "/?window=dinner",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Manager Portal",
        short_name: "Admin",
        description: "Upload food court daily menu photos",
        url: "/admin",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
