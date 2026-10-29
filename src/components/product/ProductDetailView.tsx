"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaWhatsapp,
  FaPlus,
  FaMinus,
  FaPhoneAlt,
  FaCheckCircle,
  FaSnowflake,
  FaFire,
  FaTruck,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaLeaf,
  FaShoppingBag,
  FaBolt,
  FaPlay,
  FaYoutube,
  FaClock,
} from "react-icons/fa";
import { Product, siteConfig } from "@/data/siteConfig";
import { useCart, extractPriceFromOption } from "@/context/CartContext";
import ProductDetails from "@/components/sections/ProductDetails";
import AwarenessCallout from "@/components/sections/AwarenessCallout";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ProductDetailView({ product }: { product: Product }) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState(product.defaultOption);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [liveMode, setLiveMode] = useState<"in_stock" | "pre_order" | "out_of_stock">("in_stock");
  const [expectedNote, setExpectedNote] = useState<string>("Winter Harvest");
  const { business } = siteConfig;
  const { addItem, totalCount, openDrawer } = useCart();

  useEffect(() => {
    async function checkAvailability() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/products`);
        if (res.ok) {
          const data = await res.json();
          const match = data.products?.find(
            (p: any) =>
              p.slug === product.id ||
              p.code?.toLowerCase() === product.id.toLowerCase()
          );
          if (match) {
            setLiveMode(match.availabilityMode || "in_stock");
            if (match.preOrder?.expectedNote) {
              setExpectedNote(match.preOrder.expectedNote);
            }
          }
        }
      } catch {
        // Fallback gracefully
      }
    }
    checkAvailability();
  }, [product.id]);

  // Price calculations
  const unitPrice = extractPriceFromOption(selectedOption);
  const totalPrice = unitPrice * quantity;

  // WhatsApp order template with product name, quantity, and total price
  const whatsappMessage =
    liveMode === "pre_order"
      ? `Hi ${business.name}, I want to PRE-ORDER ${product.name} (${selectedOption}). Quantity: ${quantity}. Expected: ${expectedNote}`
      : `Hi ${business.name},
I want to order:
- Product: ${product.name}
- Package / Size: ${selectedOption}
- Quantity: ${quantity}
- Total Price: ৳${totalPrice > 0 ? totalPrice : product.price}

Please let me know the confirmation and delivery schedule. Thank you!`;

  const whatsappUrl = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const handleAddToCart = () => {
    addItem(product, selectedOption, quantity);
    setJustAdded(true);
    openDrawer();
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleOrderNow = () => {
    addItem(product, selectedOption, quantity);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-amber-50/20 text-slate-800 pb-20">
      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-500 flex items-center gap-2 whitespace-nowrap overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-primary whitespace-nowrap shrink-0">Home</Link>
          <span className="shrink-0">/</span>
          <Link href="/#products" className="hover:text-primary whitespace-nowrap shrink-0">Products</Link>
          <span className="shrink-0">/</span>
          <span className="text-slate-900 font-semibold truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image & Highlights */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="relative w-full aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden bg-white border border-orange-200/80 shadow-md">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover object-center"
              />

              {/* Badge */}
              <div className="absolute top-4 left-4">
                {liveMode === "pre_order" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-amber-500 text-white shadow-md">
                    <FaClock className="w-3.5 h-3.5" />
                    Pre-Order Open
                  </span>
                ) : product.isWinterSpecial ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-blue-600 text-white shadow-md">
                    <FaSnowflake className="w-3.5 h-3.5" />
                    Winter Special
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-primary text-white shadow-md">
                    <FaFire className="w-3.5 h-3.5" />
                    {product.badge || "Best Seller"}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1.5">
                {liveMode === "pre_order" ? (
                  <>
                    <FaClock className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-amber-800">Pre-Order ({expectedNote})</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">In Stock & Fresh Batch</span>
                  </>
                )}
              </div>
            </div>

            {/* Trust Points Under Image */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-white border border-orange-100 shadow-2xs">
                <FaLeaf className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="block text-2xs font-extrabold text-slate-800">100% Pure</span>
                <span className="text-3xs text-slate-500">Chemical Free</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-orange-100 shadow-2xs">
                <FaTruck className="w-4 h-4 text-primary mx-auto mb-1" />
                <span className="block text-2xs font-extrabold text-slate-800">Home Delivery</span>
                <span className="text-3xs text-slate-500">Cash on Delivery</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-orange-100 shadow-2xs">
                <FaShieldAlt className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <span className="block text-2xs font-extrabold text-slate-800">Quality Verified</span>
                <span className="text-3xs text-slate-500">Free Returns</span>
              </div>
            </div>

            {product.origin && (
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80 text-xs flex items-center gap-2.5 text-slate-700 font-medium">
                <FaMapMarkerAlt className="text-primary w-4 h-4 shrink-0" />
                <span>Origin & Sourcing: <strong>{product.origin}</strong></span>
              </div>
            )}

            {/* Reel Video Section (YouTube Unlisted Ready) */}
            <div className="rounded-3xl bg-white border border-orange-200/90 shadow-md p-2.5 sm:p-3">
              {/* Video Player or Blank Reel Placeholder */}
              {product.youtubeVideoId ? (
                <div className="relative w-full aspect-[9/16] min-h-[580px] sm:min-h-[660px] rounded-2xl overflow-hidden bg-black shadow-inner">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${product.youtubeVideoId}?rel=0&modestbranding=1&playsinline=1`}
                    title={product.videoTitle || `${product.name} Reel Demonstration`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                /* Blank Reel Placeholder */
                <div className="relative w-full aspect-[9/16] min-h-[580px] sm:min-h-[660px] rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-inner border border-slate-800 group">
                  {/* Top Reel Header Bar */}
                  <div className="w-full flex items-center justify-between text-3xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5 font-bold text-white/90">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      Reel Demonstration
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono text-3xs">
                      9:16 Vertical
                    </span>
                  </div>

                  {/* Centered Play Button & Info */}
                  <div className="flex flex-col items-center my-auto">
                    <div className="relative mb-5">
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-xl cursor-pointer">
                        <FaPlay className="w-7 h-7 ml-1 text-white" />
                      </div>
                      <span className="absolute -inset-2.5 rounded-full bg-primary/20 animate-ping pointer-events-none" />
                    </div>

                    <h4 className="text-base font-black text-white tracking-wide">
                      Product Reel Video
                    </h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed">
                      Recorded customer review & texture video will play here in YouTube unlisted reel format.
                    </p>
                  </div>

                  {/* Bottom Guide Bar */}
                  <div className="w-full pt-4 border-t border-white/10 text-3xs text-slate-400 flex items-center justify-center gap-1.5">
                    <FaYoutube className="text-red-500 w-4 h-4" />
                    <span>YouTube Unlisted Reel Ready</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Title, Options & Order Callout */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-primary bg-orange-100/70 px-3.5 py-1 rounded-full inline-block mb-2">
                Premium Artisanal Quality
              </span>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>

              <p className="text-sm sm:text-base font-semibold text-primary mt-1 mb-4">
                {product.tagline}
              </p>

              {/* Price & Quantity Card (Quantity moved to top as requested) */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white border border-orange-200/90 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 font-semibold">Price:</span>
                    <span className="text-3xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Cash on Delivery Available
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight">
                    ৳ {unitPrice > 0 ? unitPrice : product.price}
                  </div>
                </div>

                {/* Quantity Stepper (Prominently placed at top) */}
                <div className="flex items-center gap-2.5 bg-orange-50/80 border border-orange-200 py-1.5 px-3 rounded-2xl shadow-2xs">
                  <span className="text-xs font-extrabold text-slate-800">Quantity:</span>
                  <div className="inline-flex items-center rounded-xl bg-white border border-slate-200 p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
                    >
                      <FaMinus className="w-2.5 h-2.5" />
                    </button>
                    <span className="w-8 text-center font-black text-sm font-sans text-slate-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                      className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
                    >
                      <FaPlus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
                  Select Size or Quantity Option:
                </h3>
                <div className="space-y-2">
                  {product.options.map((opt) => {
                    const isSelected = selectedOption === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedOption(opt)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                          isSelected
                            ? "border-primary bg-orange-50/80 text-orange-950 shadow-xs ring-2 ring-primary"
                            : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
                        }`}
                      >
                        <span className="truncate">{opt}</span>
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ordering CTA Box (WhatsApp + Direct Checkout) */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-primary text-white shadow-lg mb-8">
                {/* Live Total & Selected Package Summary */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/20 mb-3.5 gap-2">
                  <div className="min-w-0 pr-1">
                    <span className="text-3xs text-white/80 uppercase tracking-wider font-semibold whitespace-nowrap block">
                      Selected Package
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold text-white whitespace-nowrap block mt-0.5">
                      {selectedOption} <span className="text-white/85 font-normal">({quantity}x)</span>
                    </span>
                  </div>

                  <div className="text-right shrink-0 whitespace-nowrap pl-1">
                    <span className="text-3xs text-white/80 uppercase tracking-wider font-semibold whitespace-nowrap block">
                      Total Price
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white font-sans whitespace-nowrap block">
                      ৳ {totalPrice > 0 ? totalPrice : product.price}
                    </span>
                  </div>
                </div>

                {/* 2x2 Grid of Actions as Requested */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Top-Left: Add to Cart */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-3.5 px-2 sm:px-3 rounded-2xl bg-white hover:bg-orange-50 text-orange-950 font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-sm transition-all cursor-pointer transform active:scale-98"
                  >
                    <FaShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary shrink-0" />
                    <span>{justAdded ? "Added ✓" : "Add to Cart"}</span>
                  </button>

                  {/* Top-Right: Order Online */}
                  <button
                    type="button"
                    onClick={handleOrderNow}
                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-3.5 px-2 sm:px-3 rounded-2xl bg-orange-950 hover:bg-black text-white font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-md transition-all cursor-pointer transform active:scale-98"
                  >
                    <FaBolt className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Order Online</span>
                  </button>

                  {/* Bottom-Left: Mobile Number */}
                  <a
                    href={`tel:${business.phoneRaw}`}
                    className="flex items-center justify-center gap-1 sm:gap-1.5 py-3.5 px-1.5 sm:px-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-extrabold text-[11px] sm:text-xs whitespace-nowrap shadow-sm transition-all cursor-pointer transform active:scale-98"
                  >
                    <FaPhoneAlt className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                    <span className="whitespace-nowrap">{business.phone}</span>
                  </a>

                  {/* Bottom-Right: WhatsApp */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 sm:gap-2 py-3.5 px-2 sm:px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-md shadow-emerald-950/25 transition-all cursor-pointer transform active:scale-98"
                  >
                    <FaWhatsapp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <p className="text-3xs text-orange-100 text-center mt-3 font-medium">
                  Selected: <strong>{product.name} ({selectedOption}) × {quantity}</strong> • Clicking WhatsApp automatically fills name, quantity & price.
                </p>
              </div>

              {/* Awareness Callout (Placed directly ABOVE "পণ্যের বিবরণ", only shown when winterActive is true) */}
              {product.awareness && siteConfig.winterActive && (
                <div className="mb-6">
                  <AwarenessCallout awareness={product.awareness} />
                </div>
              )}

              {/* Bengali Product Details Card */}
              {product.details && (!product.isWinterSpecial || siteConfig.winterActive) && (
                <div className="mb-4">
                  <ProductDetails details={product.details} />
                </div>
              )}
            </div>

            {/* Delivery Terms */}
            <div className="mt-8 pt-4 border-t border-orange-100 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <FaTruck className="text-primary w-3.5 h-3.5" />
                24-48 hours inside Chittagong, 2-3 days across Bangladesh
              </span>
              <span className="flex items-center gap-1.5">
                <FaShieldAlt className="text-emerald-600 w-3.5 h-3.5" />
                Inspect parcel at doorstep, instant free return if unsatisfied
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
