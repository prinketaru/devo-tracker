import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Devo Tracker | Your Daily Devotion Companion",
    short_name: "Devo Tracker",
    description:
      "Track your daily devotions, build spiritual habits, and grow closer to your faith.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7ef",
    theme_color: "#fbf7ef",
    orientation: "portrait-primary",
    scope: "/",
    categories: ["lifestyle", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "192x192",
        type: "image/x-icon",
        purpose: "maskable",
      },
      {
        src: "/favicon.ico",
        sizes: "512x512",
        type: "image/x-icon",
        purpose: "maskable",
      },
    ],
  };
}
