import type { MetadataRoute } from "next";

// Web App Manifest (Next 16 Metadata API). Next inyecta el <link rel="manifest">
// automáticamente. Los íconos usan public/icon-brisa.png (1254x1254, cuadrado).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brisa — Serenidad financiera",
    short_name: "Brisa",
    description:
      "Gestiona el presupuesto, metas y deudas de tu red de asociados.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon-brisa.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-brisa.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-brisa.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
