import { useState, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Image, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";
import { TAXONOMY, INDUSTRY_EMOJI, getTypes, getSubtypes } from "@/lib/businessDirectory";

const API = process.env.EXPO_PUBLIC_API_URL ?? "https://neopolis.news";
const INDUSTRIES = Object.keys(TAXONOMY);

const CINEMAS = [
  { id: "ALUC", name: "Allu Cinemas Kokapet",           slug: "allu-cinemas-kokapet",                              address: "Kokapet, Hyderabad",              formats: ["Multiplex", "Dolby Atmos"], distance: "0.8 km" },
  { id: "AACN", name: "Aparna Cinemas Nallagandla",      slug: "aparna-cinemas-nallagandla",                        address: "Nallagandla, Hyderabad",          formats: ["Multiplex", "Dolby Atmos"], distance: "3.2 km" },
  { id: "MRAD", name: "Miraj Cinemas — Anand Mall",      slug: "miraj-cinemas-anand-mall-and-movies-narsingi",      address: "Anand Mall, Narsingi, Hyderabad", formats: ["Multiplex"],                distance: "4.1 km" },
];

function formatDate(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
function getDays(n = 7) {
  return Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });
}

interface Business {
  id: string;
  name: string;
  industry: string;
  address: string | null;
  logo: string | null;
  verified: boolean;
}
interface Article {
  id: string;
  title: string;
  tag: string | null;
  date: string | null;
  tag_color: string | null;
}

export default function SearchScreen() {
  const [query, setQuery]           = useState("");
  const [industry, setIndustry]     = useState<string | null>(null);
  const [type, setType]             = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [articles, setArticles]     = useState<Article[]>([]);
  const [loading, setLoading]       = useState(false);
  const searchTimer                 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const types    = industry ? getTypes(industry) : [];
  const subtypes = industry && type ? getSubtypes(industry, type) : [];

  const browseByIndustry = useCallback(async (ind: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/businesses?industry=${encodeURIComponent(ind)}`);
      const data = await res.json();
      setBusinesses(Array.isArray(data) ? data : []);
      setArticles([]);
    } catch { setBusinesses([]); }
    finally { setLoading(false); }
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setBusinesses([]); setArticles([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setBusinesses(data?.businesses ?? []);
      setArticles(data?.articles ?? []);
    } catch { setBusinesses([]); setArticles([]); }
    finally { setLoading(false); }
  }, []);

  function onQueryChange(q: string) {
    setQuery(q);
    setIndustry(null);
    setType(null);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(q), 350);
  }

  function toggleIndustry(ind: string) {
    if (industry === ind) {
      setIndustry(null);
      setType(null);
      setBusinesses([]);
    } else {
      setIndustry(ind);
      setType(null);
      browseByIndustry(ind);
    }
  }

  function toggleType(t: string) {
    setType(prev => (prev === t ? null : t));
  }

  const isTextMode = query.length >= 2;

  // When type is selected, filter locally from businesses already fetched
  const displayedBusinesses = type
    ? businesses.filter(b => b.industry === industry)
    : businesses;

  const hasResults = displayedBusinesses.length > 0 || articles.length > 0;

  return (
    <SafeAreaView style={s.root}>
      {/* Header + Search */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Search</Text>
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Businesses, news, deals…"
            placeholderTextColor={colors.gray[500]}
            value={query}
            onChangeText={onQueryChange}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); setBusinesses([]); setArticles([]); }}>
              <Text style={s.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Directory mode ─────────────────────────────────────────────── */}
        {!isTextMode && (
          <>
            {/* Industry pills */}
            <View style={s.sectionRow}>
              <Text style={s.sectionLabel}>Browse by Category</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
              {INDUSTRIES.map((ind) => (
                <TouchableOpacity
                  key={ind}
                  style={[s.industryPill, industry === ind && s.industryPillActive]}
                  onPress={() => toggleIndustry(ind)}
                  activeOpacity={0.75}
                >
                  <Text style={s.industryEmoji}>{INDUSTRY_EMOJI[ind] ?? "🏢"}</Text>
                  <Text style={[s.industryLabel, industry === ind && s.industryLabelActive]} numberOfLines={1}>
                    {ind}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Type pills */}
            {industry && types.length > 0 && (
              <>
                <View style={s.sectionRow}>
                  <Text style={s.sectionLabel}>Type</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillRow}>
                  {types.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[s.typePill, type === t && s.typePillActive]}
                      onPress={() => toggleType(t)}
                      activeOpacity={0.75}
                    >
                      <Text style={[s.typeLabel, type === t && s.typeLabelActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Subtypes */}
            {type && subtypes.length > 0 && (
              <>
                <View style={s.sectionRow}>
                  <Text style={s.sectionLabel}>Specialities in {type}</Text>
                </View>
                <View style={s.subtypeWrap}>
                  {subtypes.map((sub) => (
                    <View key={sub} style={s.subtypeChip}>
                      <Text style={s.subtypeText}>{sub}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* ── Results ────────────────────────────────────────────────────── */}
        {loading ? (
          <ActivityIndicator color={colors.brand[500]} style={{ marginTop: 40 }} />
        ) : (
          <>
            {industry === "Entertainment" && type === "Cinema" ? (
              <>
                <View style={s.sectionRow}>
                  <Text style={s.sectionLabel}>Cinemas near Neopolis</Text>
                </View>
                <CinemaView />
              </>
            ) : displayedBusinesses.length > 0 && (
              <>
                <View style={s.sectionRow}>
                  <Text style={s.sectionLabel}>
                    {isTextMode ? "Businesses" : `${displayedBusinesses.length} in ${type ?? industry}`}
                  </Text>
                </View>
                {displayedBusinesses.map(b => <BizCard key={b.id} biz={b} />)}
              </>
            )}

            {articles.length > 0 && (
              <>
                <View style={s.sectionRow}>
                  <Text style={s.sectionLabel}>News</Text>
                </View>
                {articles.map(a => (
                  <TouchableOpacity key={a.id} style={s.articleCard} activeOpacity={0.75}>
                    {a.tag && (
                      <View style={[s.articleTag, { backgroundColor: a.tag_color ?? colors.brand[600] }]}>
                        <Text style={s.articleTagText}>{a.tag}</Text>
                      </View>
                    )}
                    <Text style={s.articleTitle} numberOfLines={2}>{a.title}</Text>
                    {a.date && (
                      <Text style={s.articleDate}>
                        {new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Empty state */}
            {!loading && query.length >= 2 && !hasResults && (
              <View style={s.emptyWrap}>
                <Text style={s.emptyEmoji}>🔍</Text>
                <Text style={s.emptyText}>No results for "{query}"</Text>
              </View>
            )}

            {!isTextMode && !industry && (
              <View style={s.emptyWrap}>
                <Text style={s.emptyEmoji}>🏙️</Text>
                <Text style={s.emptyText}>Pick a category or type to explore Neopolis businesses</Text>
              </View>
            )}
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function CinemaView() {
  const days = getDays(7);
  const [selectedDay, setSelectedDay] = useState(0);
  const dateStr = formatDate(days[selectedDay]);

  return (
    <View style={{ paddingBottom: 8 }}>
      {/* Date strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8, paddingVertical: 8 }}>
        {days.map((d, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setSelectedDay(i)}
            activeOpacity={0.75}
            style={[cs.dateBtn, selectedDay === i && cs.dateBtnActive]}
          >
            <Text style={[cs.dateDow,  selectedDay === i && cs.dateDowActive]}>{i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short" })}</Text>
            <Text style={[cs.dateNum,  selectedDay === i && cs.dateNumActive]}>{d.getDate()}</Text>
            <Text style={[cs.dateMon,  selectedDay === i && cs.dateMonActive]}>{d.toLocaleDateString("en-IN", { month: "short" })}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Cinema cards */}
      {CINEMAS.map((c) => (
        <View key={c.id} style={cs.card}>
          <View style={cs.cardTop}>
            <View style={cs.iconWrap}><Text style={{ fontSize: 20 }}>🎬</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={cs.cinemaName}>{c.name}</Text>
              <Text style={cs.cinemaAddr}>📍 {c.address}</Text>
              <Text style={cs.cinemaDist}>{c.distance} from Neopolis</Text>
            </View>
          </View>
          <View style={cs.formats}>
            {c.formats.map(f => (
              <View key={f} style={cs.formatChip}><Text style={cs.formatText}>{f}</Text></View>
            ))}
          </View>
          <TouchableOpacity
            style={cs.bmsBtn}
            activeOpacity={0.85}
            onPress={() => Linking.openURL(`https://in.bookmyshow.com/cinemas/hyderabad/${c.slug}/buytickets/${c.id}/${dateStr}`)}
          >
            <Text style={cs.bmsBtnText}>🎟️  View Showtimes &amp; Book</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

function BizCard({ biz }: { biz: Business }) {
  return (
    <TouchableOpacity style={s.bizCard} activeOpacity={0.75}>
      <View style={s.bizLogoWrap}>
        {biz.logo ? (
          <Image source={{ uri: biz.logo }} style={s.bizLogoImg} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 22 }}>🏢</Text>
        )}
      </View>
      <View style={s.bizInfo}>
        <View style={s.bizNameRow}>
          <Text style={s.bizName} numberOfLines={1}>{biz.name}</Text>
          {biz.verified && (
            <View style={s.verifiedBadge}>
              <Text style={s.verifiedText}>✓</Text>
            </View>
          )}
        </View>
        <Text style={s.bizIndustry} numberOfLines={1}>{biz.industry}</Text>
        {biz.address ? <Text style={s.bizAddress} numberOfLines={1}>📍 {biz.address}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray[50] },

  header: { backgroundColor: colors.brand[950], paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: "800", marginBottom: 10 },
  searchWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.brand[900],
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: colors.white, fontSize: 14 },
  clearBtn:    { color: colors.gray[400], fontSize: 14, paddingLeft: 8 },

  sectionRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.5 },

  pillRow: { paddingHorizontal: 12, paddingBottom: 4, gap: 8 },

  industryPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 100, borderWidth: 1,
    backgroundColor: colors.white,
    borderColor: colors.gray[200],
    shadowColor: colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  industryPillActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[500] },
  industryEmoji:      { fontSize: 16 },
  industryLabel:      { fontSize: 13, fontWeight: "600", color: colors.gray[700], maxWidth: 110 },
  industryLabelActive:{ color: colors.white },

  typePill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 100, borderWidth: 1,
    backgroundColor: colors.white, borderColor: colors.gray[200],
  },
  typePillActive: { backgroundColor: colors.orange[500], borderColor: colors.orange[600] },
  typeLabel:      { fontSize: 13, fontWeight: "600", color: colors.gray[700] },
  typeLabelActive:{ color: colors.white },

  subtypeWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: 4 },
  subtypeChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100, backgroundColor: colors.gray[100] },
  subtypeText: { fontSize: 12, color: colors.gray[600], fontWeight: "500" },

  bizCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.white,
    marginHorizontal: 12, marginBottom: 8,
    padding: 12, borderRadius: 14,
    shadowColor: colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  bizLogoWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: colors.gray[100],
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  bizLogoImg:  { width: 48, height: 48 },
  bizInfo:     { flex: 1 },
  bizNameRow:  { flexDirection: "row", alignItems: "center", gap: 6 },
  bizName:     { fontSize: 15, fontWeight: "700", color: colors.gray[900], flex: 1 },
  verifiedBadge: { backgroundColor: colors.brand[600], borderRadius: 100, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedText:  { color: colors.white, fontSize: 10, fontWeight: "800" },
  bizIndustry:   { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  bizAddress:    { fontSize: 12, color: colors.gray[400], marginTop: 2 },

  articleCard: {
    backgroundColor: colors.white,
    marginHorizontal: 12, marginBottom: 8,
    padding: 14, borderRadius: 14,
    shadowColor: colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  articleTag:     { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6 },
  articleTagText: { color: colors.white, fontSize: 10, fontWeight: "800" },
  articleTitle:   { fontSize: 15, fontWeight: "700", color: colors.gray[900], lineHeight: 21 },
  articleDate:    { fontSize: 11, color: colors.gray[400], marginTop: 4 },

  emptyWrap: { paddingTop: 60, alignItems: "center", gap: 10, paddingHorizontal: 32 },
  emptyEmoji:{ fontSize: 40 },
  emptyText: { fontSize: 14, color: colors.gray[400], textAlign: "center", lineHeight: 20 },
});

const cs = StyleSheet.create({
  dateBtn:       { alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.gray[200], backgroundColor: colors.white, minWidth: 58 },
  dateBtnActive: { backgroundColor: colors.gray[900], borderColor: colors.gray[900] },
  dateDow:       { fontSize: 10, fontWeight: "700", color: colors.gray[500], textTransform: "uppercase" },
  dateDowActive: { color: colors.white },
  dateNum:       { fontSize: 18, fontWeight: "900", color: colors.gray[800] },
  dateNumActive: { color: colors.white },
  dateMon:       { fontSize: 10, color: colors.gray[400] },
  dateMonActive: { color: "rgba(255,255,255,0.7)" },

  card:     { backgroundColor: colors.white, marginHorizontal: 12, marginBottom: 10, borderRadius: 16, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  cardTop:  { flexDirection: "row", gap: 12, marginBottom: 10 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.gray[900], alignItems: "center", justifyContent: "center" },
  cinemaName: { fontSize: 14, fontWeight: "800", color: colors.gray[900] },
  cinemaAddr: { fontSize: 12, color: colors.gray[500], marginTop: 2 },
  cinemaDist: { fontSize: 11, color: colors.brand[500], fontWeight: "600", marginTop: 2 },
  formats:    { flexDirection: "row", gap: 6, marginBottom: 12 },
  formatChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, backgroundColor: colors.gray[100] },
  formatText: { fontSize: 11, fontWeight: "600", color: colors.gray[600] },
  bmsBtn:     { backgroundColor: "#dc2626", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  bmsBtnText: { color: colors.white, fontSize: 14, fontWeight: "800" },
});
