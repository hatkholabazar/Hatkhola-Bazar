import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://hatkhola-bazar.zabedmahmud.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/products/*", "/refund-policy", "/checkout"],
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/dashboard/*",
          "/account/*",
          "/profile",
          "/profile/*",
          "/api/*",
          "/_next/*",
          "/not-found",
          "/access-denied",
          "/unauthorized",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

