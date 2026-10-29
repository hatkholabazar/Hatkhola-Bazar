import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export default function About() {
  const { about } = siteConfig;

  return (
    <section id="about" className="py-16 sm:py-24 bg-amber-50/20 border-b border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Visual Side */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-sm bg-gradient-to-tr from-orange-100 via-amber-50 to-white rounded-3xl border-2 border-orange-200/90 p-6 sm:p-8 shadow-lg flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white shadow-md border border-orange-200 p-2.5 mb-4 sm:mb-5 flex items-center justify-center shrink-0">
                <Image
                  src="/hatkhola-logo.png"
                  alt="Hatkhola Bazar Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>

              <span className="text-3xs sm:text-2xs uppercase font-extrabold text-primary tracking-widest bg-orange-100/90 border border-orange-200/80 px-3 py-1 rounded-full mb-2">
                ESTABLISHED 2023
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                3 Years of Pure Heritage
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xs leading-relaxed">
                A trusted homegrown brand built on natural sourcing and authentic village flavors.
              </p>

              <div className="mt-6 pt-4 border-t border-orange-200/70 w-full grid grid-cols-3 gap-1 text-center">
                <div className="py-1">
                  <span className="block text-base sm:text-lg font-black text-primary font-sans whitespace-nowrap">
                    1000+
                  </span>
                  <span className="text-3xs font-bold text-slate-600 whitespace-nowrap block mt-0.5">
                    Families
                  </span>
                </div>
                <div className="py-1 border-x border-orange-200/80">
                  <span className="block text-base sm:text-lg font-black text-primary font-sans whitespace-nowrap">
                    100%
                  </span>
                  <span className="text-3xs font-bold text-slate-600 whitespace-nowrap block mt-0.5">
                    Authentic
                  </span>
                </div>
                <div className="py-1">
                  <span className="block text-base sm:text-lg font-black text-primary font-sans whitespace-nowrap">
                    3+ Yrs
                  </span>
                  <span className="text-3xs font-bold text-slate-600 whitespace-nowrap block mt-0.5">
                    Trust
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content Side */}
          <div className="lg:col-span-7">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-100 px-3.5 py-1 rounded-full border border-orange-200">
              Our Story & Heritage
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 mb-6 leading-tight">
              {about.title}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
              {about.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Highlights List */}
            <div className="flex flex-col gap-2.5 sm:gap-3 mt-8 pt-6 border-t border-orange-200/60">
              {about.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-800">
                  <FaCheckCircle className="text-emerald-600 w-4 h-4 shrink-0" />
                  <span className="sm:whitespace-nowrap">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
