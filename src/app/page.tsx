import Hero from "@/components/sections/Hero";
import TrustStats from "@/components/sections/TrustStats";
import LandingLoyaltyBar from "@/components/sections/LandingLoyaltyBar";
import Products from "@/components/sections/Products";
import WhyUs from "@/components/sections/WhyUs";
import Reviews from "@/components/sections/Reviews";
import HowToOrder from "@/components/sections/HowToOrder";
import { RewardsSection } from "@/components/sections/RewardsSection";
import About from "@/components/sections/About";
import Faq from "@/components/sections/Faq";
import TrackOrder from "@/components/sections/TrackOrder";
import Footer from "@/components/sections/Footer";
import BackToTop from "@/components/ui/BackToTop";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import { siteConfig } from "@/data/siteConfig";

export default function Home() {
  const { business } = siteConfig;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    alternateName: business.nameBangla,
    description:
      "3 years serving 1000+ happy customers with 100% authentic, natural and pure local goods. Order directly online with Cash on Delivery nationwide.",
    url: "https://hatkholabazar.com",
    logo: "https://hatkholabazar.com/hatkhola-logo.png",
    image: "https://hatkholabazar.com/hatkhola-logo.png",
    telephone: business.phoneRaw,
    priceRange: "৳৳",
    currenciesAccepted: "BDT",
    paymentAccepted: "Cash on Delivery, bKash, Nagad",
    areaServed: {
      "@type": "Country",
      name: "Bangladesh",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: "Chattogram",
      addressCountry: "BD",
    },
    sameAs: [business.facebookUrl],
  };

  return (
    <>
      {/* JSON-LD LocalBusiness Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 flex flex-col">
        {/* 1. Hero (#home) */}
        <Hero />

        {/* 2. Trust Stats (#trust) */}
        <TrustStats />

        {/* Hatkhola Rewards Bar */}
        <LandingLoyaltyBar />

        {/* 3. Products (#products) */}
        <Products />

        {/* 4. Why Us (#why) */}
        <WhyUs />

        {/* 5. Reviews (#reviews) */}
        <Reviews />

        {/* 6. How to Order (#how) */}
        <HowToOrder />

        {/* 7. Hatkhola Rewards Program (#rewards) */}
        <RewardsSection />

        {/* 8. About (#about) */}
        <About />

        {/* 8. FAQ and Delivery (#faq) */}
        <Faq />

        {/* 9. Live Order Tracking (#track-order) */}
        <TrackOrder />

        {/* 10. Footer */}
        <Footer />
      </main>

      {/* Floating Buttons & Mobile Sticky Bar */}
      <BackToTop />
      <MobileStickyBar />
    </>
  );
}
