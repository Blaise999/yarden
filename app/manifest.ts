import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Yarden — Official Site",
    short_name: "Yarden",
    description:
      "The official home of Yarden — music, visuals, and live experiences.",
    start_url: "/",
    display: "standalone",
    background_color: "#05060A",
    theme_color: "#05060A",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
