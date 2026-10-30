import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailView from "@/components/product/ProductDetailView";
import { siteConfig } from "@/data/siteConfig";
import { client } from "@/lib/mongodb";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  try {
    const db = client.db();
    const raw = await db.collection("products").findOne({
      $or: [{ slug: id }, { code: id.toUpperCase() }],
      isActive: { $ne: false },
    });

    if (raw) {
      const siteConfigProduct = siteConfig.products.find(
        (p) => p.id === id || p.id === raw.slug
      );

      const formattedOptions = (raw.sellingOptions || []).map(
        (o: any) => `${o.label} - ৳${o.sellingPrice}`
      );

      return {
        id: raw.slug || raw._id.toString(),
        name: raw.name,
        tagline: raw.tagline || siteConfigProduct?.tagline || "",
        isWinterSpecial: Boolean(raw.isSeasonal || raw.slug === "khejur-gur"),
        badge: raw.badge || (raw.isSeasonal ? "Winter Special" : "Best Seller"),
        description: raw.description || siteConfigProduct?.description || "",
        fullStory: siteConfigProduct?.fullStory || raw.description || "",
        price: `৳ ${raw.sellingOptions?.[0]?.sellingPrice || 0}`,
        options: formattedOptions.length > 0 ? formattedOptions : siteConfigProduct?.options || [],
        defaultOption: formattedOptions[0] || siteConfigProduct?.defaultOption || "",
        image: raw.image || siteConfigProduct?.image || "/ghee-pic.webp",
        origin: raw.origin || siteConfigProduct?.origin || "Bangladesh",
        storage: siteConfigProduct?.storage || "Store at room temperature in a dry place.",
        details: siteConfigProduct?.details || [],
        features: siteConfigProduct?.features || [],
        healthBenefits: raw.benefits || siteConfigProduct?.healthBenefits || [],
      };
    }
  } catch {
    // Fall back to siteConfig
  }

  return siteConfig.products.find((p) => p.id === id);
}

export async function generateStaticParams() {
  try {
    const db = client.db();
    const raw = await db.collection("products").find({ isActive: { $ne: false } }).toArray();
    if (raw && raw.length > 0) {
      return raw.map((p) => ({ id: p.slug || p._id.toString() }));
    }
  } catch {
    // Fallback
  }

  return siteConfig.products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | Hatkhola Bazar",
    };
  }

  return {
    title: `${product.name} | Hatkhola Bazar`,
    description: product.description,
    openGraph: {
      title: `${product.name} - ${product.price} | Hatkhola Bazar`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product as any} />;
}
