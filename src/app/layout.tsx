import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import Navbar from "@/components/layout/Navbar";
import ToasterProvider from "@/components/providers/ToasterProvider";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const viewport: Viewport = {
  themeColor: "#F37820",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Hatkhola Bazar | 100% Authentic & Natural Local Goods",
  description:
    "3 years serving 1000+ happy families. 100% pure Danadar Cow Ghee, Winter Special Date Palm Jaggery (Khejur Gur), and traditional village goods directly to your home. Cash on Delivery available across Bangladesh.",
  keywords: [
    "Hatkhola Bazar",
    "Danadar Ghee",
    "দানাদার ঘি",
    "Pure Cow Ghee",
    "Khejur Gur",
    "Date Palm Jaggery",
    "Winter Special Gur",
    "Natural Food Bangladesh",
    "Traditional Bazar",
    "Organic Ghee Chittagong",
  ],
  authors: [{ name: "Hatkhola Bazar" }],
  creator: "Hatkhola Bazar",
  publisher: "Hatkhola Bazar",
  metadataBase: new URL("https://hatkholabazar.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hatkhola Bazar | 100% Authentic & Natural Local Goods",
    description:
      "3 years serving 1000+ happy families. Handpicked pure Danadar Ghee and Date Jaggery directly from trusted rural artisans to your home.",
    url: "https://hatkholabazar.com",
    siteName: "Hatkhola Bazar",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/hatkhola-logo.png",
        width: 800,
        height: 800,
        alt: "Hatkhola Bazar Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hatkhola Bazar | Pure Local Goods Direct to Your Doorstep",
    description:
      "3 years serving 1000+ happy families. Order directly through our website with Cash on Delivery nationwide.",
    images: ["/hatkhola-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/hatkhola-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${bricolage.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-amber-50/20 text-slate-800 antialiased selection:bg-orange-100 selection:text-orange-900 pb-16 sm:pb-0">
        <CartProvider>
          <ToasterProvider />
          <Navbar />
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
