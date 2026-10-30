import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hatkhola Bazar | 100% Authentic Natural Goods",
    short_name: "Hatkhola Bazar",
    description: "Pure Cow Danadar Ghee and Traditional Date Palm Jaggery (Khejur Gur).",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFBF7",
    theme_color: "#F37820",
    icons: [
      {
        src: "/hatkhola-logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/hatkhola-logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

