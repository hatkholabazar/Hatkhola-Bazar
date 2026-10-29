import { FaLeaf, FaHandsHelping, FaTruck, FaShieldAlt } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export default function WhyUs() {
  const { whyUs } = siteConfig;

  const icons = [
    <FaLeaf key="pure" className="w-6 h-6 text-emerald-600" />,
    <FaHandsHelping key="farm" className="w-6 h-6 text-primary" />,
    <FaTruck key="truck" className="w-6 h-6 text-blue-600" />,
    <FaShieldAlt key="shield" className="w-6 h-6 text-amber-600" />,
  ];

  return (
    <section id="why" className="py-16 sm:py-24 bg-white border-b border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
            Our Foundation of Trust
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Why Hatkhola-Bazar <br />
            Is Your Best <span className="text-primary">Choice</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            We don’t just deliver products—we safeguard authentic culinary heritage and your family’s well-being.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyUs.map((item, idx) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-orange-50/40 border border-orange-100 shadow-2xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-orange-100 flex items-center justify-center mb-4">
                  {icons[idx]}
                </div>
                <span className="text-3xs font-extrabold uppercase tracking-wider text-orange-800 bg-orange-100/70 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  {item.badge}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
