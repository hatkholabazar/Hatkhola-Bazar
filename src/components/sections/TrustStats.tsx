"use client";

import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/data/siteConfig";

export default function TrustStats() {
  const { stats } = siteConfig;
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setCounts(stats.map((s) => s.value));
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          const duration = 1600; // ms
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);

            setCounts(
              stats.map((s) => Math.floor(easeOut * s.value))
            );

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCounts(stats.map((s) => s.value));
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, stats]);

  return (
    <section
      id="trust"
      ref={sectionRef}
      className="pt-8 pb-8 sm:pt-10 sm:pb-8 bg-white border-b border-orange-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
            Trust & Milestones
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Our 3-Year <br className="sm:hidden" />
            Journey of Purity
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Real customer trust earned through uncompromising quality, not promotional exaggerations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-orange-50/60 to-white border border-orange-200/80 shadow-xs text-center hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="text-4xl sm:text-5xl font-black text-primary tracking-tight font-sans">
                  {counts[idx]}
                  {stat.suffix && <span className="text-amber-600">{stat.suffix}</span>}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-2">
                  {stat.label}
                </h3>
                <p className="text-3xs sm:text-xs font-semibold text-orange-800/70 uppercase tracking-wide">
                  {stat.subLabel}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
