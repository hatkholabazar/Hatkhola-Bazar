import { FaWhatsapp, FaPhoneAlt, FaFacebookF, FaMapMarkerAlt } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export default function Contact() {
  const { business } = siteConfig;
  const whatsappUrl = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
    `Hi ${business.name}, I want to contact you regarding an order.`
  )}`;

  return (
    <section id="contact" className="py-16 sm:py-24 bg-amber-50/30 border-b border-orange-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-100 px-3.5 py-1 rounded-full border border-orange-200">
            Direct Contact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Get In Touch <br />
            With Us
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Connect with us for order inquiries, custom quantities, or friendly customer assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-white border border-orange-200 shadow-xs hover:shadow-lg hover:border-emerald-500 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaWhatsapp className="w-6 h-6" />
              </div>
              <span className="text-3xs uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-1">
                Fastest Response
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">WhatsApp</h3>
              <p className="text-xs text-slate-500 mt-1">{business.phone}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-emerald-600 flex items-center gap-1">
              Send Message →
            </div>
          </a>

          {/* Phone Call */}
          <a
            href={`tel:${business.phoneRaw}`}
            className="p-6 rounded-3xl bg-white border border-orange-200 shadow-xs hover:shadow-lg hover:border-primary transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaPhoneAlt className="w-5 h-5" />
              </div>
              <span className="text-3xs uppercase font-extrabold tracking-wider text-orange-800 bg-orange-50 px-2 py-0.5 rounded-full inline-block mb-1">
                Direct Helpline
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Phone Call</h3>
              <p className="text-xs text-slate-500 mt-1">{business.phone}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-primary flex items-center gap-1">
              Call Now →
            </div>
          </a>

          {/* Facebook */}
          <a
            href={business.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-white border border-orange-200 shadow-xs hover:shadow-lg hover:border-blue-600 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FaFacebookF className="w-5 h-5" />
              </div>
              <span className="text-3xs uppercase font-extrabold tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-1">
                Official Page
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Facebook</h3>
              <p className="text-xs text-slate-500 mt-1">facebook.com/hatkholabazar</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 flex items-center gap-1">
              Visit Page →
            </div>
          </a>

          {/* Address */}
          <div className="p-6 rounded-3xl bg-white border border-orange-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="w-5 h-5" />
              </div>
              <span className="text-3xs uppercase font-extrabold tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full inline-block mb-1">
                Distribution Hub
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">Location</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {business.address}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
              Direct Dispatch Center
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
