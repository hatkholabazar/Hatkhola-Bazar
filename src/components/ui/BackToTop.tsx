"use client";

import { useEffect, useState } from "react";
import { FiArrowUp } from "react-icons/fi";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 350);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to Top"
      className="fixed bottom-20 left-4 sm:bottom-6 sm:left-6 z-40 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-primary shadow-lg border border-orange-200/80 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-xs"
    >
      <FiArrowUp className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
}

