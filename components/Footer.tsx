import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import FooterSubscribe from "./FooterSubscribe";

const FOOTER_LINKS = {
  "Real Estate": [
    { label: "Project Pages", href: "/real-estate#projects" },
    { label: "Price Trends", href: "/real-estate#prices" },
    { label: "Construction Updates", href: "/real-estate#construction" },
    { label: "Floor Plans", href: "/real-estate#floorplans" },
  ],
  Rentals: [
    { label: "Residential Rentals", href: "/rentals#residential" },
    { label: "Office Leasing", href: "/rentals#office" },
    { label: "Retail Spaces", href: "/rentals#retail" },
    { label: "Resale Listings", href: "/rentals#resale" },
  ],
  Directory: [
    { label: "Mall & Retail", href: "/directory#mall" },
    { label: "Restaurants", href: "/directory#food" },
    { label: "Entertainment", href: "/directory#entertainment" },
    { label: "Fitness & Wellness", href: "/directory#fitness" },
  ],
  Platform: [
    { label: "Local News", href: "/news" },
    { label: "Services", href: "/services" },
    { label: "Advertise", href: "/advertise" },
    { label: "Partner With Us", href: "/advertise#partners" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-brand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="Neopolis News"
                width={72}
                height={72}
                className="rounded-xl object-contain bg-white p-1"
              />
              <span className="text-xl font-extrabold text-white leading-tight">
                Neopolis<br />
                <span className="text-brand-400">News</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Your single source of truth for the Neopolis urban district.
              Real estate, rentals, retail, news, and services — all in one
              place.
            </p>
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
          </div>

          {/* Subscribe */}
          <div className="col-span-2 lg:col-span-1">
            <FooterSubscribe />
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-white text-sm font-semibold mb-3">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-brand-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-400">
          <p>© 2026 Neopolis News. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Use</Link>
            <Link href="/cookies" className="hover:text-white">Cookies</Link>
            <Link href="/advertise" className="hover:text-white">Advertise</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
