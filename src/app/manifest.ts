import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f7f9fc",
    description:
      "Accesorios tecnológicos con pagos flexibles y envíos a toda Colombia.",
    display: "standalone",
    icons: [
      {
        sizes: "400x400",
        src: "/icon.png",
        type: "image/png",
      },
    ],
    lang: "es-CO",
    name: "Odissey Technology",
    short_name: "Odissey",
    start_url: "/",
    theme_color: "#071a33",
  };
}
