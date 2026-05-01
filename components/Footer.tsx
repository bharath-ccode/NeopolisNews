import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import FooterSubscribe from "./FooterSubscribe";

const FOOTER_LINKS = {
  "Real Estate": [
    { label: "Project Pages",         href: "/real-estate#projects" },
    { label: "Price Trends",          href: "/real-estate#prices" },
    { label: "Construction Updates",  href: "/real-estate#construction" },
    { label: "Floor Plans",           href: "/real-estate#floorplans" },
  ],
  Rentals: [
    { label: "Residential Rentals", href: "/rentals#residential" },
    { label: "Office Leasing",      href: "/rentals#office" },
    { label: "Retail Spaces",       href: "/rentals#retail" },
    { label: "Resale Listings",     href: "/rentals#resale" },
  ],
  Directory: [
    { label: "Mall & Retail",       href: "/directory#mall" },
    { label: "Restaurants",         href: "/directory#food" },
    { label: "Entertainment",       href: "/directory#entertainment" },
    { label: "Fitness & Wellness",  href: "/directory#fitness" },
  ],
  Platform: [
    { label: "Local News",      href: "/news" },
    { label: "Services",        href: "/services" },
    { label: "Advertise",       href: "/advertise" },
    { label: "Partner With Us", href: "/advertise#partners" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-brand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Main grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 mb-10">

          {/* Logo pane — own visual panel */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center
                          bg-white/5 rounded-2xl border border-white/10 p-6 gap-4">
            <Link href="/" className="flex flex-col items-center gap-3">
              <Image
                src="/logo.png"
                alt="Neopolis News"
                width={160}
                height={160}
                className="rounded-2xl object-contain"
              />
              <span className="text-center">
                <span className="block text-2xl font-extrabold text-white tracking-tight">
                  Neopolis
                </span>
                <span className="block text-2xl font-extrabold text-brand-400 tracking-tight -mt-1">
                  News
                </span>
              </span>
            </Link>
            <p className="text-xs text-brand-300 text-center leading-relaxed">
              Your digital gateway to the Neopolis urban district.
            </p>
          </div>

          {/* Right side — contact + subscribe + links */}
          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">

            {/* Contact */}
            <div className="col-span-2 lg:col-span-2">
              <h3 className="text-white text-sm font-semibold mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                <a
                  href="mailto:support@neopolis.news"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  support@neopolis.news
                </a>
                <a
                  href="tel:+919900000000"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  +91 99000 00000
                </a>
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 shrink-0" />
                  Neopolis District, India
                </span>
              </div>

              <div className="mt-6">
                <FooterSubscribe />
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <div key={heading}>
                <h3 className="text-white text-sm font-semibold mb-3">{heading}</h3>
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-sm hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────────── */}
        <div className="border-t border-brand-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-400">
          <p>© 2026 Neopolis News. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy"   className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms"     className="hover:text-white">Terms of Use</Link>
            <Link href="/cookies"   className="hover:text-white">Cookies</Link>
            <Link href="/advertise" className="hover:text-white">Advertise</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
