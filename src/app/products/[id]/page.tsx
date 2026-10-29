import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailView from "@/components/product/ProductDetailView";
import { siteConfig } from "@/data/siteConfig";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return siteConfig.products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = siteConfig.products.find((p) => p.id === id);

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
  const product = siteConfig.products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}

