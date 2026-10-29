import { FaStar, FaQuoteLeft, FaCheckCircle } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export default function Reviews() {
  const { reviews } = siteConfig;

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-amber-50/20 border-b border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-100 px-3.5 py-1 rounded-full border border-orange-200">
            Real Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            What Our Valued Customers Say
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            The ongoing trust and word-of-mouth recommendations of 1000+ households are our proudest achievements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 sm:p-7 md:p-8 rounded-2xl sm:rounded-3xl bg-white border border-orange-200/80 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
            >
              <FaQuoteLeft className="text-orange-200 w-8 h-8 absolute top-6 right-6 -z-0 opacity-60" />

              <div className="relative z-10">
                {/* Star rating */}
                <div className="flex items-center gap-1 text-amber-500 mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <FaStar key={i} className="w-4 h-4 fill-current" />
                  ))}
                  <span className="text-xs font-bold text-slate-600 ml-1.5 font-sans">
                    5.0 / 5.0
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed mb-6">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Reviewer info */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${rev.avatarColor} text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs`}
                  >
                    {rev.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">
                      {rev.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate leading-snug">
                      {rev.location}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 whitespace-nowrap pl-1">
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 mb-0.5">
                    <FaCheckCircle className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                    <span>Verified</span>
                  </div>
                  <span className="block text-[11px] font-medium text-slate-400">
                    {rev.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
