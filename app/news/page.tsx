import Link from "next/link";
import {
  Newspaper,
  Camera,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  Eye,
} from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import LeadForm from "@/components/LeadForm";
import InfrastructureSection from "@/components/InfrastructureSection";
import { getPublishedArticles, Article, ArticleCategory } from "@/lib/newsStore";

export const metadata = {
  title: "Local News & Updates – NeopolisNews",
  description:
    "Construction milestones, new launches, infrastructure updates, and community stories from the Neopolis urban district.",
};

const CATEGORY_CONFIG: {
  id: ArticleCategory;
  icon: React.ElementType;
  label: string;
  color: string;
  anchor: string;
}[] = [
  { id: "construction",   icon: Camera,      label: "Construction Updates", color: "bg-orange-50 text-orange-600", anchor: "construction"   },
  { id: "launches",       icon: Zap,         label: "New Launches",         color: "bg-green-50 text-green-600",  anchor: "launches"       },
  { id: "infrastructure", icon: TrendingUp,  label: "Infrastructure",       color: "bg-blue-50 text-blue-600",   anchor: "infrastructure" },
  { id: "community",      icon: Users,       label: "Community",            color: "bg-purple-50 text-purple-600",anchor: "community"      },
];

const NON_INFRA_CATEGORIES: ArticleCategory[] = ["construction", "launches", "community"];

const CONTENT_PACKAGES = [
  {
    name: "Press Release",
    price: "₹25,000",
    desc: "750-word developer/brand announcement published and indexed.",
    features: ["Journalist-written", "SEO optimised", "Homepage feature 48hrs"],
    highlight: false,
  },
  {
    name: "Sponsored Feature",
    price: "₹75,000",
    desc: "1,500-word in-depth feature story with photography.",
    features: [
      "Long-form editorial",
      "Professional photography",
      "Homepage banner",
      "Social media push",
    ],
    highlight: true,
  },
  {
    name: "PR Package",
    price: "₹2,00,000",
    desc: "Full-month developer PR — 4 articles, weekly construction updates, banner ads.",
    features: [
      "4 articles/month",
      "Weekly photo updates",
      "Banner ads across site",
      "Newsletter inclusion",
      "Analytics report",
    ],
    highlight: false,
  },
];

function ArticleCard({ article }: { article: Article }) {
  return (
    <div className="card p-5 relative">
      {article.sponsored && (
        <span className="absolute top-3 right-3 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
          Sponsored
        </span>
      )}
      {article.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.imageUrl}
          alt={article.title}
          className="h-36 w-full object-cover rounded-lg mb-4"
        />
      ) : (
        <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
          <Newspaper className="w-8 h-8 text-gray-300" />
        </div>
      )}
      <span className={`${article.tagColor} mb-2`}>{article.tag}</span>
      <h3 className="font-bold text-gray-900 text-sm mt-2 mb-2 leading-snug">
        {article.title}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
        {article.excerpt}
      </p>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span>{article.date}</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> {article.readTime}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" /> {article.views.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}

export default async function NewsPage() {
  const allArticles = await getPublishedArticles();

  // Group by category
  const byCategory = (cat: ArticleCategory) =>
    allArticles.filter((a) => a.category === cat);

  const infraArticles = byCategory("infrastructure");

  // Featured = most recent published article overall
  const featured = allArticles[0] ?? null;

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-14 md:py-20">
        <SectionWrapper tight>
          <div className="max-w-3xl">
            <span className="tag-blue mb-4">Local News & Media</span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 mb-4">
              Neopolis, Week by{" "}
              <span className="text-brand-400">Week</span>
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              Construction milestones, new launches, infrastructure news, policy
              updates, and community stories — all hyper-local, all verified.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#articles" className="btn-primary">
                Read Latest
              </a>
              <Link
                href="/advertise#content"
                className="btn-secondary border-gray-500 text-gray-300 hover:bg-gray-700"
              >
                Sponsored Content <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </SectionWrapper>
      </section>

      {/* ── Category tabs ── */}
      <section className="bg-white border-b border-gray-100">
        <SectionWrapper tight>
          <div className="flex flex-wrap gap-3">
            {CATEGORY_CONFIG.map((c) => {
              const count = byCategory(c.id).length;
              return (
                <a
                  key={c.id}
                  href={`#${c.anchor}`}
                  className="flex items-center gap-2 border border-gray-200 hover:border-brand-400 hover:text-brand-700 text-gray-600 rounded-full px-4 py-2 text-sm font-medium transition-colors"
                >
                  <c.icon className="w-4 h-4" />
                  {c.label}
                  <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                </a>
              );
            })}
          </div>
        </SectionWrapper>
      </section>

      {/* ── Featured Article ── */}
      {featured && (
        <SectionWrapper>
          <div className="card overflow-hidden">
            {featured.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.imageUrl}
                alt={featured.title}
                className="h-56 md:h-72 w-full object-cover"
              />
            ) : (
              <div className="h-56 md:h-72 bg-gradient-to-br from-blue-100 to-brand-200 flex items-center justify-center">
                <Newspaper className="w-16 h-16 text-brand-300" />
              </div>
            )}
            <div className="p-6 md:p-8">
              <span className={`${featured.tagColor} mb-3`}>{featured.tag}</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mt-2 mb-3 leading-snug">
                {featured.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">
                {featured.excerpt}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                <span>{featured.author}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {featured.readTime} read
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />{" "}
                  {featured.views.toLocaleString("en-IN")} views
                </span>
                <span>{featured.date}</span>
              </div>
            </div>
          </div>
        </SectionWrapper>
      )}

      {/* ── Sections per category ── */}
      <section className="bg-gray-50" id="articles">
        <SectionWrapper>
          {/* Non-infrastructure categories — standard card grid */}
          {NON_INFRA_CATEGORIES.map((catId) => {
            const cat = CATEGORY_CONFIG.find((c) => c.id === catId)!;
            const articles = byCategory(catId);
            if (articles.length === 0) return null;
            return (
              <div key={catId} id={cat.anchor} className="mb-12 last:mb-0">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}
                  >
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <h2 className="section-heading !mb-0">{cat.label}</h2>
                  <span className="text-xs text-gray-400 font-medium">
                    {articles.length} article{articles.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {articles.map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Infrastructure — tile grid with click-to-detail + pagination */}
          <InfrastructureSection articles={infraArticles} />

          {allArticles.length === 0 && (
            <div className="text-center py-20">
              <Newspaper className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">No articles published yet</p>
              <p className="text-sm text-gray-300 mt-1">
                Check back soon for updates from Neopolis.
              </p>
            </div>
          )}
        </SectionWrapper>
      </section>

      {/* ── Content Packages ── */}
      <SectionWrapper id="content-packages">
        <div className="text-center mb-10">
          <h2 className="section-heading">Sponsored Content Packages</h2>
          <p className="text-gray-500 mt-2">
            Native articles, press releases, and PR packages for developers and brands.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {CONTENT_PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`card p-6 ${pkg.highlight ? "ring-2 ring-brand-500 relative" : ""}`}
            >
              {pkg.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Best Value
                </span>
              )}
              <h3 className="font-bold text-lg text-gray-900 mb-1">{pkg.name}</h3>
              <p className="text-3xl font-extrabold text-brand-700 mb-2">{pkg.price}</p>
              <p className="text-xs text-gray-500 mb-4">{pkg.desc}</p>
              <ul className="space-y-2 mb-6">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/advertise#content"
                className={`block text-center font-semibold py-2.5 rounded-lg text-sm transition-colors ${
                  pkg.highlight
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "border border-brand-300 text-brand-600 hover:bg-brand-50"
                }`}
              >
                Book This Package
              </Link>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Newsletter / Lead ── */}
      <section className="bg-brand-950 text-white">
        <SectionWrapper tight>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Get the Weekly Neopolis Digest
              </h2>
              <p className="text-brand-300 text-sm mb-4">
                Every Friday: construction updates, new listings, upcoming events, and
                district news — delivered to your inbox.
              </p>
              <ul className="space-y-2 text-sm text-brand-200">
                {[
                  "Construction milestone photos",
                  "Price movement alerts",
                  "New launches & pre-bookings",
                  "Curated resident events",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-brand-900 rounded-2xl border border-brand-700 p-6">
              <LeadForm
                title="Subscribe to Updates"
                subtitle="Get the weekly Neopolis digest every Friday."
                purpose="newsletter"
                dark
              />
            </div>
          </div>
        </SectionWrapper>
      </section>
    </>
  );
}
