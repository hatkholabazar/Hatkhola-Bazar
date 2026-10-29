import { FaPhoneAlt, FaComments, FaClipboardCheck, FaBoxOpen, FaArrowRight } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export default function HowToOrder() {
  const { howToOrder, business } = siteConfig;

  const icons = [
    <FaComments key="1" className="w-6 h-6 text-emerald-600" />,
    <FaClipboardCheck key="2" className="w-6 h-6 text-primary" />,
    <FaBoxOpen key="3" className="w-6 h-6 text-blue-600" />,
  ];

  return (
    <section id="how" className="py-16 sm:py-24 bg-white border-b border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
            Simple & Hassle-Free
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Order Directly in 3 Easy Steps
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Place your order directly through our website with no complicated account registrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          {howToOrder.map((step, idx) => (
            <div
              key={step.step}
              className="relative p-6 sm:p-8 rounded-3xl bg-orange-50/40 border border-orange-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-orange-100 flex items-center justify-center">
                    {icons[idx]}
                  </div>
                  <span className="text-2xl font-black text-orange-300 font-sans">
                    {step.step}
                  </span>
                </div>

                <span className="text-3xs font-extrabold uppercase tracking-wider text-orange-800 bg-orange-100/80 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  {step.badge}
                </span>

                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Callouts */}
        <div className="mt-12 p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-500 via-primary to-amber-600 text-white text-center shadow-lg shadow-orange-500/20 max-w-3xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-black mb-2">
            Ready to Taste Pure Artisanal Quality?
          </h3>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl mx-auto mb-6">
            Pick your package and order directly online. We pack and dispatch fresh batches daily.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/#products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-white text-slate-900 font-extrabold text-xs sm:text-sm whitespace-nowrap hover:bg-orange-50 transition shadow-sm cursor-pointer"
            >
              <span>Browse Products & Order Now</span>
              <FaArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
            </a>
            <a
              href={`tel:${business.phoneRaw}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-orange-900/40 hover:bg-orange-900/60 border border-white/20 text-white font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer"
            >
              <FaPhoneAlt className="w-3.5 h-3.5 shrink-0" />
              <span>Call Helpline ({business.phone})</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
