import {
  ProductDetailsContent,
  ProductAwarenessContent,
  siteConfig as configSite,
} from "@/config/site";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  isWinterSpecial?: boolean;
  badge?: string;
  description: string;
  fullStory?: string;
  price: string;
  options: string[];
  defaultOption: string;
  image: string;
  origin?: string;
  storage?: string;
  features?: string[];
  healthBenefits?: string[];
  youtubeVideoId?: string; // e.g. "YOUR_UNLISTED_YOUTUBE_ID" (works with unlisted YouTube videos & Shorts)
  videoTitle?: string;
  details?: ProductDetailsContent;
  awareness?: ProductAwarenessContent;
}

export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  avatarColor: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const siteConfig = {
  winterActive: configSite.winterActive,
  business: {
    name: "Hatkhola Bazar",
    nameBangla: "হাটখোলা বাজার",
    tagline: "Authentic Village Flavors & Trusted Natural Heritage",
    subTagline:
      "100% chemical-free and unadulterated artisanal foods delivered straight to your doorstep. 3 years of trust and genuine goodwill.",
    trustLine: "3 years serving 1000+ happy customers across Bangladesh",
    trustLineEn: "3 years serving 1000+ happy customers",
    phone: "+880 1979-333880",
    phoneRaw: "+8801979333880",
    whatsappNumber: "8801979333880",
    facebookUrl: "https://facebook.com/hatkholabazar",
    address: "Chattogram, Bangladesh",
    email: "hatkholabazar.bd@gmail.com",
    deliverySummary: "Home delivery all across Bangladesh | Cash on Delivery available",
  },
  stats: [
    {
      value: 3,
      suffix: "+",
      label: "Years of Trust",
      subLabel: "Proven Track Record",
      description: "Dedicated to purity, uncompromising quality, and honest sourcing since 2023.",
    },
    {
      value: 1000,
      suffix: "+",
      label: "Happy Families",
      subLabel: "Served Nationwide",
      description: "Delivering pure culinary heritage to hundreds of households in Chittagong and beyond.",
    },
    {
      value: 150,
      suffix: "+",
      label: "Repeat Buyers",
      subLabel: "Loyal Customers",
      description: "Over 30% of our buyers return every month for authentic seasonal batches.",
    },
    {
      value: 0,
      suffix: "",
      label: "Bad Reviews",
      subLabel: "Uncompromised Quality",
      description: "0 negative reviews across all batches of our 2 artisanal products in 3 years.",
    },
  ],
  products: [
    {
      id: "danadar-ghee",
      name: "Danadar Ghee (দানাদার ঘি)",
      tagline: "100% pure grass-fed cow milk ghee with authentic granular texture",
      isWinterSpecial: false,
      badge: "Best Seller",
      description:
        "Slow-simmered in small batches using traditional methods from fresh grass-fed cow milk butter. Naturally rich in aroma, boasting the coveted coarse granular (danadar) texture that melts smoothly on warm rice or khichuri.",
      fullStory:
        "Our Danadar Ghee is prepared following age-old country traditions. Sourced from grass-fed cows in rural dairy pastures, fresh curd is hand-churned into makhan (butter) and clarified over gentle firewood flame until it achieves its distinctive golden color and nutty, granular texture. Free from vegetable oils, palm olein, synthetic dyes, or artificial essences.",
      price: "৳ 1400 / kg",
      options: [
        "500g Glass Jar - ৳750",
        "1 kg Glass Jar - ৳1400",
        "2 kg Family Saver Pack - ৳2700",
      ],
      defaultOption: "1 kg Glass Jar - ৳1400",
      image: "/ghee-pic.webp",
      origin: "Pabna & Sirajganj Dairy Farms, Bangladesh",
      storage: "Store at normal room temperature in an airtight jar. Keep away from direct moisture and wet spoons.",
      details: configSite.products.ghee.details,
      features: [
        "Authentic granular (দানাদার) melt-in-mouth texture",
        "100% pure cow milk with zero synthetic additives or color",
        "Slow-clarified over low flame to preserve essential nutrients",
        "Rich nutty fragrance that elevates everyday cooking and festive dishes",
      ],
      healthBenefits: [
        "Loaded with healthy fatty acids (Butyric acid) and fat-soluble Vitamins A, D, E & K",
        "Aids smooth digestion, gut wellness, and natural metabolism",
        "Enhances natural immunity and supports joint and bone health",
      ],
      youtubeVideoId: "", // Paste your unlisted YouTube Video ID here (e.g. "dQw4w9WgXcQ")
      videoTitle: "Danadar Ghee Texture & Purity Demonstration",
    },
    {
      id: "khejur-gur",
      name: "Khejur Patali Gur (খেজুরের পাটালি গুড়)",
      tagline: "Handcrafted by hereditary sap-tappers (Gachi) of Jashore & Faridpur",
      isWinterSpecial: true,
      badge: "Winter Special",
      description:
        "Boiled naturally over wooden hearths without sugar, chemical clarifiers (hydrose), or artificial coloring. Unrivaled caramel aroma and delicate natural sweetness for winter pitha, payesh, and gourmet teas.",
      fullStory:
        "Collected in early dawn from centuries-old date palm plantations in Jashore and Faridpur. The raw sap is slowly boiled down by experienced tappers (Gachis) without any sugar or chemical additives. The result is pure, unadulterated Patali and liquid Jhola Gur carrying authentic rural warmth and nostalgia.",
      price: "৳ 450 / kg",
      options: [
        "1 kg Premium Patali Jaggery - ৳450",
        "2 kg Family Pack (Patali) - ৳880",
        "1 kg Special Jhola Molasses - ৳450",
        "5 kg Saver Pack - ৳2150",
      ],
      defaultOption: "1 kg Premium Patali Jaggery - ৳450",
      image: "/gur-pic.webp",
      origin: "Jashore & Faridpur, Bangladesh",
      storage: "Keep in a cool, dry place at room temperature. Keep away from direct sunlight.",
      details: configSite.products["patali-gur"].details,
      awareness: configSite.products["patali-gur"].awareness,
      features: [
        "100% free of sugar, chemical hydrose, and preservatives",
        "Harvested and boiled under strict rural tapper supervision",
        "Incomparable fragrance for winter pitha, payesh, and desserts",
        "Lab-tested and guaranteed genuine date palm sap",
      ],
      healthBenefits: [
        "Excellent natural source of dietary iron, magnesium, and essential minerals",
        "Soothes respiratory tract and aids digestion after hearty meals",
        "Natural wholesome alternative to refined table sugar",
      ],
    },
  ] as Product[],
  whyUs: [
    {
      id: "pure",
      title: "100% Pure & Chemical Free",
      description:
        "Zero artificial coloring, chemical preservatives, or adulteration. Lab-verified purity in every single batch.",
      badge: "100% Organic",
    },
    {
      id: "source",
      title: "Direct From Origin Artisans",
      description:
        "Sourced straight from trusted village producers and hereditary sap tappers, eliminating deceptive middlemen.",
      badge: "Direct Farm",
    },
    {
      id: "delivery",
      title: "Swift Nationwide Delivery",
      description:
        "24-48 hours within Chittagong city, and 2-3 working days across all districts with secure packaging.",
      badge: "Fast Delivery",
    },
    {
      id: "guarantee",
      title: "Hassle-Free Inspection & Returns",
      description:
        "Open and verify the package in front of the delivery partner. Instant free return or replacement if not satisfied.",
      badge: "100% Satisfaction",
    },
  ],
  reviews: [
    {
      id: "rev-1",
      name: "Nazmul Huda",
      location: "Dhanmondi, Dhaka",
      rating: 5,
      date: "Last week",
      comment:
        "Ordered the Danadar Ghee and Khejur Gur together. The ghee's granular texture and nutty fragrance remind me of my grandmother's home. Truly genuine quality with zero sugar or adulteration.",
      avatarColor: "bg-orange-500",
    },
    {
      id: "rev-2",
      name: "Rabeya Khatun",
      location: "Uttara, Dhaka",
      rating: 5,
      date: "2 weeks ago",
      comment:
        "The Danadar Ghee is the real deal. When melted over hot rice with a pinch of salt, the aroma fills the whole room. Great packaging and super fast delivery. Hatkhola-Bazar has won our loyalty!",
      avatarColor: "bg-amber-600",
    },
    {
      id: "rev-3",
      name: "Mahmudur Rahman",
      location: "Chandgaon, Chattogram",
      rating: 5,
      date: "1 month ago",
      comment:
        "Delivered safely to Chattogram via courier. The Patali Gur was solid, fragrant, and intact without any damage. Excellent winter treat for my family. Highly recommended!",
      avatarColor: "bg-emerald-600",
    },
    {
      id: "rev-4",
      name: "Sharmin Sultana",
      location: "Gulshan-2, Dhaka",
      rating: 5,
      date: "3 days ago",
      comment:
        "Placed my order through WhatsApp and received it within 24 hours. The convenience of Cash on Delivery and checking the items before paying gives immense peace of mind.",
      avatarColor: "bg-rose-500",
    },
  ] as Review[],
  howToOrder: [
    {
      step: "01",
      title: "Choose Your Items",
      description:
        "Browse our pure products and tap 'Order Now' or 'Add to Cart' to add items directly to your bag.",
      badge: "Easy Online Selection",
    },
    {
      step: "02",
      title: "Enter Delivery Address",
      description:
        "Fill in your name, contact phone number, and delivery location directly in the website checkout drawer.",
      badge: "Fast Checkout",
    },
    {
      step: "03",
      title: "Receive & Inspect at Doorstep",
      description:
        "Receive your order at your doorstep, verify the package, and pay conveniently via Cash on Delivery, bKash, or Nagad.",
      badge: "Cash on Delivery",
    },
  ],
  about: {
    title: "Our Story: 3 Years of Purity, Trust & Village Heritage",
    subtitle: "From a quest for authentic food to a trusted family brand",
    content: [
      "In 2023, Hatkhola-Bazar was born out of a simple but pressing need: the nostalgic taste of authentic, unadulterated village food was disappearing from urban dinner tables. Navigating markets crowded with synthetic dyes, hidden preservatives, and artificial fragrances had made finding wholesome food an uphill battle.",
      "We took the initiative to build direct partnerships with grass-fed dairy farmers and traditional date palm tappers across Bangladesh. By cutting out middlemen, we ensure that every batch is prepared ethically, handled hygienically, and packaged fresh for urban homes.",
      "Over the past 3 years, without flashy ad campaigns, we have earned the lasting trust of over 1000 families purely through word-of-mouth and uncompromising taste. To us, every order is not just a sale—it is a promise to protect your family's health.",
    ],
    highlights: [
      "100% natural, unadulterated & preservative-free",
      "Directly sourced from trusted rural artisans",
      "Inspect before payment with Cash on Delivery",
      "Monthly trusted pantry choice for 150+ repeat families",
    ],
  },
  faqs: [
    {
      id: "faq-1",
      question: "Which areas do you deliver to?",
      answer:
        "We deliver all across Bangladesh! Inside Chittagong City, orders are delivered directly via our express delivery team. Outside Chittagong, orders are safely dispatched to district and upazila levels through trusted courier services (Steadfast / Sundarban / RedX).",
    },
    {
      id: "faq-2",
      question: "What are the delivery charges and delivery times?",
      answer:
        "Inside Chittagong: ৳60 delivery charge, arriving within 24 to 48 hours. Outside Chittagong: ৳120 delivery charge, arriving within 2 to 3 business days with robust protective packaging.",
    },
    {
      id: "faq-3",
      question: "How do I pay? Is Cash on Delivery available?",
      answer:
        "Yes! Cash on Delivery (COD) is available nationwide. You can inspect the package and pay the delivery partner directly. We also gladly accept bKash and Nagad mobile payments.",
    },
    {
      id: "faq-4",
      question: "What if I receive a damaged product or am unsatisfied?",
      answer:
        "We provide a 100% customer satisfaction and return guarantee. You are encouraged to inspect your parcel upon arrival. If there is any defect or damage, you can return it instantly with no delivery cost, or we will dispatch a free replacement immediately. See our Refund Policy page for full details.",
    },
    {
      id: "faq-5",
      question: "How do I place an order?",
      answer:
        "Ordering is instant and effortless right here on our website or via WhatsApp! Simply select your product, click 'Order on WhatsApp' or 'Add to Cart' to checkout directly. You can also call or message our helpline (+880 1979-333880) anytime.",
    },
  ] as FaqItem[],
};
