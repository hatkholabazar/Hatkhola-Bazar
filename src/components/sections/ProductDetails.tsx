import { Hind_Siliguri } from "next/font/google";
import { ProductDetailsContent } from "@/config/site";

const hindSiliguri = Hind_Siliguri({
  weight: ["400", "600", "700"],
  subsets: ["bengali"],
  display: "swap",
});

interface ProductDetailsProps {
  details: ProductDetailsContent;
}

export default function ProductDetails({ details }: ProductDetailsProps) {
  if (!details) return null;

  return (
    <section
      aria-label="পণ্যের বিবরণ"
      className={`${hindSiliguri.className} bg-white rounded-3xl p-5 sm:p-8 md:p-10 shadow-sm border border-orange-100/80 text-slate-800`}
    >
      {/* Heading with Brand Underline */}
      <div className="mb-5 sm:mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          পণ্যের বিবরণ
        </h3>
        <div className="w-12 h-1 bg-[#F37820] rounded-full mt-2" />
      </div>

      {/* Intro Paragraph */}
      <p className="text-sm sm:text-base text-slate-700 leading-[1.8] mb-6 sm:mb-8">
        {details.intro}
      </p>

      {/* প্রধান বৈশিষ্ট্য: */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
          প্রধান বৈশিষ্ট্য:
        </h4>
        <ul className="list-disc list-outside pl-5 space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {details.features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
      </div>

      {/* বয়স অনুযায়ী উপকারিতা: */}
      <div className="mb-6 sm:mb-8">
        <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-4">
          বয়স অনুযায়ী উপকারিতা:
        </h4>

        <div className="space-y-4 pl-1 sm:pl-2">
          {/* নারী */}
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
              নারী:
            </h4>
            <ul className="list-disc list-outside pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {details.benefits.women.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* শিশু */}
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
              শিশু:
            </h4>
            <ul className="list-disc list-outside pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {details.benefits.children.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* তরুণ */}
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
              তরুণ:
            </h4>
            <ul className="list-disc list-outside pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {details.benefits.youth.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* বৃদ্ধ */}
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
              বৃদ্ধ:
            </h4>
            <ul className="list-disc list-outside pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {details.benefits.elderly.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ব্যবহার ও সংরক্ষণ: */}
      <div className="mb-6 sm:mb-7">
        <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-3">
          ব্যবহার ও সংরক্ষণ:
        </h4>
        <ul className="list-disc list-outside pl-5 space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {details.usage.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-xs sm:text-sm text-slate-500 italic mt-6 pt-4 border-t border-slate-100 leading-relaxed">
        {details.disclaimer}
      </p>
    </section>
  );
}
