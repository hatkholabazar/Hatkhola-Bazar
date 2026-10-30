import type { MetadataRoute } from "next";
import { client } from "@/lib/mongodb";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://hatkhola-bazar.zabedmahmud.com";

  // Core static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/#products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const db = client.db();
    const products = await db
      .collection("products")
      .find({ isActive: { $ne: false } }, { projection: { slug: 1, updatedAt: 1 } })
      .toArray();

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    // If DB unavailable during static generation, return static pages + known core products
    const fallbackProducts: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/products/danadar-ghee`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/products/khejur-gur`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
    ];

    return [...staticRoutes, ...fallbackProducts];
  }
}

