"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaCheckCircle,
  FaSnowflake,
  FaFire,
  FaArrowRight,
  FaShoppingBag,
  FaBolt,
  FaWhatsapp,
  FaClock,
  FaBan,
  FaCalendarAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { siteConfig, Product } from "@/data/siteConfig";
import { useCart, extractPriceFromOption } from "@/context/CartContext";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface PublicProductApiItem {
  id: string;
  code: string;
  slug: string;
  name: string;
  availabilityMode: "in_stock" | "pre_order" | "out_of_stock";
  preOrder?: {
    expectedDate?: string;
    expectedNote?: string;
    depositRequired?: boolean;
    depositAmount?: number;
    depositPercent?: number;
    cancellationPolicyText?: string;
  };
  sellingOptions: {
    label: string;
    qtyG: number;
    sellingPrice: number;
  }[];
}

function ProductCard({
  product,
  liveApiData,
}: {
  product: Product;
  liveApiData?: PublicProductApiItem;
}) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(product.defaultOption);
  const { business } = siteConfig;
  const { addItem, openDrawer } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const unitPrice = extractPriceFromOption(selectedOption);

  // Determine effective availability mode:
  // Live API takes precedence if available; otherwise defaults to siteConfig logic
  let effectiveMode: "in_stock" | "pre_order" | "out_of_stock" =
    liveApiData?.availabilityMode || "in_stock";

  // Pre-order Expected Note & Policy
  const expectedNote =
    liveApiData?.preOrder?.expectedNote ||
    (product.isWinterSpecial ? "Winter Harvest (Mid-December)" : "Expected Soon");

  const cancellationPolicy =
    liveApiData?.preOrder?.cancellationPolicyText ||
    "Full refund if cancelled before shipment.";

  // Seasonal Gur Override:
  // If winterActive is false but gur is in pre_order mode, pre_order wins over "Back in winter"
  const isWinterSuppressed =
    product.isWinterSpecial && !siteConfig.winterActive && effectiveMode !== "pre_order";

  if (isWinterSuppressed && effectiveMode !== "pre_order") {
    effectiveMode = "out_of_stock";
  }

  // Construct WhatsApp Messages based on mode
  let whatsappMessage = "";
  if (effectiveMode === "pre_order") {
    whatsappMessage = `Hi ${business.name}, I want to PRE-ORDER ${product.name} (${selectedOption}). Expected: ${expectedNote}`;
  } else if (effectiveMode === "out_of_stock") {
    whatsappMessage = `Hi ${business.name}, please notify me when ${product.name} (${selectedOption}) is back in stock. Thank you!`;
  } else {
    whatsappMessage = `Hi ${business.name},
I want to order:
- Product: ${product.name}
- Package: ${selectedOption}
- Quantity: 1
- Price: ৳${unitPrice > 0 ? unitPrice : product.price}

Please let me know confirmation and delivery details. Thank you!`;
  }

  const whatsappUrl = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const handleAddToCart = () => {
    addItem(product, selectedOption, 1);
    setJustAdded(true);
    openDrawer();
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleOrderNow = () => {
    addItem(product, selectedOption, 1);
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col bg-white rounded-3xl border border-orange-200/90 shadow-md shadow-orange-500/5 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Product Image Container (Clickable to Details) */}
      <Link
        href={`/products/${product.id}`}
        className="relative w-full aspect-4/3 bg-orange-50/50 overflow-hidden block"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {effectiveMode === "pre_order" ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-500 text-white shadow-md">
              <FaClock className="w-3.5 h-3.5" />
              Pre-Order Open
            </span>
          ) : product.isWinterSpecial ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-md">
              <FaSnowflake className="w-3.5 h-3.5" />
              Winter Special
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold bg-primary text-white shadow-md">
              <FaFire className="w-3.5 h-3.5" />
              {product.badge || "Best Seller"}
            </span>
          )}
        </div>

        {/* View Details hover banner */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-4 py-2 rounded-full bg-white text-slate-900 font-extrabold text-xs shadow-lg flex items-center gap-1.5 whitespace-nowrap transform translate-y-2 group-hover:translate-y-0 transition-transform">
            View Details <FaArrowRight className="w-3 h-3 text-primary shrink-0" />
          </span>
        </div>

        {/* Mode Tag in bottom right corner */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
          {effectiveMode === "pre_order" ? (
            <>
              <FaCalendarAlt className="w-3 h-3 text-amber-600" />
              <span className="text-amber-800 font-bold">Pre-Order</span>
            </>
          ) : effectiveMode === "out_of_stock" ? (
            <>
              <FaBan className="w-3 h-3 text-slate-400" />
              <span className="text-slate-600">Currently unavailable</span>
            </>
          ) : (
            <>
              <FaCheckCircle className="w-3 h-3 text-emerald-600" />
              <span className="text-emerald-700">In Stock</span>
            </>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${product.id}`} className="block group/title">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug group-hover/title:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm font-semibold text-primary mt-1 mb-2">
            {product.tagline}
          </p>

          {/* Pre-Order Expected Date & Deposit Banner */}
          {effectiveMode === "pre_order" && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <FaClock className="text-amber-600 shrink-0" />
                <span>Expected: {expectedNote}</span>
              </div>
              {liveApiData?.preOrder?.depositRequired && (
                <p className="text-[11px] text-amber-800">
                  Advance deposit: ৳
                  {liveApiData.preOrder.depositAmount ||
                    `${liveApiData.preOrder.depositPercent}%`}{" "}
                  on WhatsApp
                </p>
              )}
            </div>
          )}

          <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-3">
            {product.description}
          </p>

          {/* Size / Weight Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Select Size & Quantity:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {product.options.map((option) => {
                const isSelected = selectedOption === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedOption(option)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-orange-50/80 text-orange-950 shadow-xs ring-1 ring-primary"
                        : "border-slate-200 bg-slate-50/60 text-slate-700 hover:border-orange-300"
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    <span
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons & Policy Line */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
          {effectiveMode === "pre_order" ? (
            /* PRE-ORDER MODE CONTROLS */
            <div className="flex flex-col gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm whitespace-nowrap transition cursor-pointer shadow-md shadow-amber-500/25 active:scale-98"
              >
                <FaWhatsapp className="w-4 h-4 shrink-0 text-base" />
                <span>Pre-order on WhatsApp</span>
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center pt-0.5">
                <FaShieldAlt className="text-emerald-600 text-xs shrink-0" />
                <span>{cancellationPolicy}</span>
              </div>
            </div>
          ) : effectiveMode === "out_of_stock" ? (
            /* OUT OF STOCK CONTROLS */
            <div className="flex flex-col gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer shadow-xs active:scale-98"
              >
                <FaWhatsapp className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Message us to get notified</span>
              </a>
              <p className="text-[11px] text-slate-400 text-center">
                Currently harvesting the next pure batch
              </p>
            </div>
          ) : (
            /* IN STOCK DEFAULT CONTROLS */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 border border-orange-200 font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer active:scale-98"
                >
                  <FaShoppingBag className="w-4 h-4 text-primary shrink-0" />
                  <span>{justAdded ? "Added ✓" : "Add to Cart"}</span>
                </button>

                {/* Direct Website Order Now Button */}
                <button
                  type="button"
                  onClick={handleOrderNow}
                  className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-md shadow-orange-500/25 transition cursor-pointer active:scale-98"
                >
                  <FaBolt className="w-3.5 h-3.5 shrink-0" />
                  <span>Order Online</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* WhatsApp Order Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs whitespace-nowrap transition cursor-pointer shadow-xs"
                >
                  <FaWhatsapp className="w-4 h-4 shrink-0" />
                  <span>Order on WhatsApp</span>
                </a>

                {/* View Full Details */}
                <Link
                  href={`/products/${product.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs whitespace-nowrap transition cursor-pointer"
                >
                  <span>Full Details</span>
                  <FaArrowRight className="w-3 h-3 text-primary shrink-0" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const { products } = siteConfig;
  const [liveProductsMap, setLiveProductsMap] = useState<Record<string, PublicProductApiItem>>({});

  useEffect(() => {
    async function fetchLiveProducts() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/products`, {
          next: { revalidate: 60 },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            const map: Record<string, PublicProductApiItem> = {};
            data.products.forEach((p: PublicProductApiItem) => {
              // Map by slug or code
              if (p.slug) map[p.slug] = p;
              if (p.code) map[p.code.toLowerCase()] = p;
            });
            setLiveProductsMap(map);
          }
        }
      } catch (err) {
        // Graceful fallback to static siteConfig without throwing
        console.warn("Live products API unavailable, using fallback siteConfig:", err);
      }
    }

    fetchLiveProducts();
  }, []);

  return (
    <section id="products" className="py-16 sm:py-24 bg-amber-50/30 border-b border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-100 px-3.5 py-1 rounded-full border border-orange-200">
            Our Handpicked Selection
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            100% Pure & Authentic Village Goods
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Select your preferred size, pre-order for upcoming winter harvest, or order directly on WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {products.map((product) => {
            const liveData =
              liveProductsMap[product.id] ||
              liveProductsMap[product.id.replace(/-/g, "")] ||
              undefined;

            return (
              <ProductCard
                key={product.id}
                product={product}
                liveApiData={liveData}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
