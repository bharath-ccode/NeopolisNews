import { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator, Image,
  Modal, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";
import { useAuth } from "@/context/AuthContext";

const API = process.env.EXPO_PUBLIC_API_URL ?? "https://neopolis.news";

// ─── Weather helpers ──────────────────────────────────────────────────────────
function wEmoji(code: number, hour: number) {
  const night = hour < 6 || hour >= 19;
  if (code === 0) return night ? "🌙" : "☀️";
  if (code === 1) return night ? "🌙" : "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 65) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code === 95) return "⛈️";
  return "🌡️";
}
function wLabel(code: number) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code === 95) return "Thunderstorm";
  return "—";
}
function aqiBg(aqi: number) {
  if (aqi <= 50)  return "#16a34a";
  if (aqi <= 100) return "#d97706";
  if (aqi <= 150) return "#ea580c";
  if (aqi <= 200) return "#dc2626";
  if (aqi <= 300) return "#991b1b";
  return "#450a0a";
}
function fmt12(iso: string) {
  const h = parseInt(iso.split("T")[1], 10);
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}

interface WxState {
  temp: number | null;
  feelsLike: number | null;
  emoji: string;
  label: string;
  humidity: number | null;
  wind: number | null;
  aqi: number | null;
}
interface HourItem { time: string; temp: number; emoji: string; rain: number; isNow: boolean; }
// ─────────────────────────────────────────────────────────────────────────────

type FeedFilter = "All" | "Deals" | "Buzz" | "News" | "Health";

interface FeedItem {
  id:      string;
  kind:    "deal" | "buzz" | "news" | "wellness";
  title:   string;
  sub:     string;
  badge:   string;
  badgeColor: string;
  image?:  string;
  biz?:    string;
  bizLogo?:string;
  meta?:   string;
}

const FILTER_PILLS: FeedFilter[] = ["All", "Deals", "Buzz", "News", "Health"];

const KIND_META = {
  deal:     { label: "DEAL",     bg: colors.orange[600]   },
  buzz:     { label: "BUZZ",     bg: colors.brand[600]    },
  news:     { label: "NEWS",     bg: colors.gray[700]     },
  wellness: { label: "WELLNESS", bg: "#7c3aed"            },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [filter, setFilter]       = useState<FeedFilter>("All");
  const [search, setSearch]       = useState("");
  const [feed, setFeed]           = useState<FeedItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wx, setWx]               = useState<WxState>({ temp: null, feelsLike: null, emoji: "🌤️", label: "Kokapet", humidity: null, wind: null, aqi: null });
  const [hourly, setHourly]       = useState<HourItem[]>([]);
  const [wxOpen, setWxOpen]       = useState(false);
  const hourListRef               = useRef<FlatList<HourItem>>(null);

  const firstName = user?.user_metadata?.name?.split(" ")[0] ?? "there";

  const loadFeed = useCallback(async () => {
    try {
      const [dealsRes, buzzRes, newsRes] = await Promise.all([
        fetch(`${API}/api/deals`).then((r) => r.json()),
        fetch(`${API}/api/announcements`).then((r) => r.json()),
        fetch(`${API}/api/news?limit=10`).then((r) => r.json()),
      ]);

      const items: FeedItem[] = [];

      // Deals
      (Array.isArray(dealsRes) ? dealsRes : []).slice(0, 6).forEach((d: any) => {
        items.push({
          id:        `deal-${d.id}`,
          kind:      "deal",
          title:     d.name,
          sub:       d.description ?? "",
          badge:     d.discount_percent ? `${d.discount_percent}% OFF` : d.discount_label ?? "Offer",
          badgeColor: colors.orange[600],
          image:     d.image_url ?? undefined,
          biz:       d.businesses?.name,
          bizLogo:   d.businesses?.logo ?? undefined,
          meta:      `Until ${new Date(d.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        });
      });

      // Buzz / announcements
      const TYPE_COLORS: Record<string, string> = {
        opening: colors.green[600], hiring: colors.purple[600],
        new_arrival: "#2563eb",     notice: colors.amber[600],
        community: "#db2777",
      };
      const TYPE_LABELS: Record<string, string> = {
        opening: "OPENING", hiring: "HIRING", new_arrival: "NEW",
        notice: "NOTICE",  community: "COMMUNITY",
      };
      (Array.isArray(buzzRes) ? buzzRes : []).slice(0, 6).forEach((b: any) => {
        items.push({
          id:        `buzz-${b.id}`,
          kind:      "buzz",
          title:     b.title,
          sub:       b.body,
          badge:     TYPE_LABELS[b.type] ?? "BUZZ",
          badgeColor: TYPE_COLORS[b.type] ?? colors.brand[600],
          image:     b.image_url ?? undefined,
          biz:       b.businesses?.name,
          bizLogo:   b.businesses?.logo ?? undefined,
          meta:      timeAgo(b.created_at),
        });
      });

      // News articles
      const articles = Array.isArray(newsRes) ? newsRes : (newsRes?.articles ?? []);
      articles.slice(0, 6).forEach((a: any) => {
        items.push({
          id:        `news-${a.id}`,
          kind:      "news",
          title:     a.title,
          sub:       a.excerpt ?? "",
          badge:     a.tag ?? "NEWS",
          badgeColor: colors.gray[700],
          image:     a.image ?? undefined,
          meta:      a.date ? new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "",
        });
      });

      // Sort: interleave by type for variety
      const sorted = items.sort((a, b) => {
        const order = { deal: 0, buzz: 1, wellness: 2, news: 3 };
        return (order[a.kind] ?? 3) - (order[b.kind] ?? 3);
      });

      // Interleave more naturally
      const deals   = sorted.filter((i) => i.kind === "deal");
      const buzzes  = sorted.filter((i) => i.kind === "buzz");
      const news    = sorted.filter((i) => i.kind === "news");
      const mixed: FeedItem[] = [];
      const maxLen = Math.max(deals.length, buzzes.length, news.length);
      for (let i = 0; i < maxLen; i++) {
        if (deals[i])  mixed.push(deals[i]);
        if (buzzes[i]) mixed.push(buzzes[i]);
        if (news[i])   mixed.push(news[i]);
      }
      setFeed(mixed);
    } catch {
      // network unavailable in this env — show placeholder feed
      setFeed([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  useEffect(() => {
    const wxUrl =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=17.4126&longitude=78.3338" +
      "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m" +
      "&hourly=temperature_2m,weather_code,precipitation_probability" +
      "&timezone=Asia%2FKolkata&forecast_days=2";

    fetch(wxUrl).then(r => r.json()).then(j => {
      if (!j?.current) return;
      const nowH = new Date().getHours();
      const code  = j.current.weather_code as number;
      setWx({
        temp:      Math.round(j.current.temperature_2m),
        feelsLike: Math.round(j.current.apparent_temperature),
        emoji:     wEmoji(code, nowH),
        label:     wLabel(code),
        humidity:  j.current.relative_humidity_2m,
        wind:      Math.round(j.current.wind_speed_10m),
        aqi:       null,
      });
      if (j?.hourly) {
        const today = new Date().toISOString().split("T")[0];
        const items: HourItem[] = (j.hourly.time as string[])
          .filter((t: string) => t.startsWith(today))
          .map((t: string, i: number) => {
            const h = parseInt(t.split("T")[1], 10);
            return {
              time:  t,
              temp:  Math.round(j.hourly.temperature_2m[i]),
              emoji: wEmoji(j.hourly.weather_code[i] as number, h),
              rain:  j.hourly.precipitation_probability[i] as number,
              isNow: h === nowH,
            };
          });
        setHourly(items);
      }
    }).catch(() => {});

    fetch("https://api.waqi.info/feed/geo:17.4126;78.3338/?token=demo")
      .then(r => r.json())
      .then(j => {
        if (j?.status === "ok" && j?.data?.aqi != null)
          setWx(prev => ({ ...prev, aqi: Number(j.data.aqi) }));
      }).catch(() => {});
  }, []);

  function onRefresh() {
    setRefreshing(true);
    loadFeed();
  }

  const filtered = feed.filter((item) => {
    if (filter === "Deals")  return item.kind === "deal";
    if (filter === "Buzz")   return item.kind === "buzz";
    if (filter === "News")   return item.kind === "news";
    if (filter === "Health") return item.kind === "wellness";
    return true;
  }).filter((item) =>
    !search || item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.root}>
      {/* Top bar */}
      <View style={s.topBar}>
        <View>
          <Text style={s.greeting}>Hi {firstName} 👋</Text>
          <Text style={s.location}>📍 Neopolis</Text>
        </View>
        <TouchableOpacity style={s.weatherBadge} onPress={() => setWxOpen(true)} activeOpacity={0.75}>
          <Text style={s.weatherEmoji}>{wx.emoji}</Text>
          <Text style={s.weatherTemp}>{wx.temp !== null ? `${wx.temp}°` : "—"}</Text>
          {wx.aqi !== null && (
            <View style={[s.aqiBadge, { backgroundColor: aqiBg(wx.aqi) }]}>
              <Text style={s.aqiText}>AQI {wx.aqi}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search deals, news, businesses…"
          placeholderTextColor={colors.gray[500]}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.pillsScroll}
        contentContainerStyle={s.pillsContent}
      >
        {FILTER_PILLS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[s.pill, filter === f && s.pillActive]}
            activeOpacity={0.7}
          >
            <Text style={[s.pillText, filter === f && s.pillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed */}
      <ScrollView
        style={s.feed}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[300]}
          />
        }
      >
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={colors.brand[300]} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🏙️</Text>
            <Text style={s.emptyText}>
              {search ? "No results found" : "Nothing here yet — check back soon"}
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Weather detail modal */}
      <Modal visible={wxOpen} animationType="slide" transparent onRequestClose={() => setWxOpen(false)}>
        <View style={s.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFillObject as object} onPress={() => setWxOpen(false)} />
          <View style={s.modalPanel}>
            {/* Header */}
            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalLocation}>Today · Kokapet, Hyderabad</Text>
                <View style={s.modalTempRow}>
                  <Text style={s.modalTemp}>{wx.temp !== null ? `${wx.temp}°` : "—"}</Text>
                  <Text style={s.modalEmojiLg}>{wx.emoji}</Text>
                </View>
                <Text style={s.modalLabel}>{wx.label}</Text>
              </View>
              <TouchableOpacity onPress={() => setWxOpen(false)} style={s.modalClose}>
                <Text style={s.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={s.modalStats}>
              {wx.feelsLike !== null && (
                <View style={s.statItem}>
                  <Text style={s.statIcon}>🌡️</Text>
                  <Text style={s.statVal}>Feels {wx.feelsLike}°</Text>
                </View>
              )}
              {wx.humidity !== null && (
                <View style={s.statItem}>
                  <Text style={s.statIcon}>💧</Text>
                  <Text style={s.statVal}>{wx.humidity}% humidity</Text>
                </View>
              )}
              {wx.wind !== null && (
                <View style={s.statItem}>
                  <Text style={s.statIcon}>💨</Text>
                  <Text style={s.statVal}>{wx.wind} km/h</Text>
                </View>
              )}
            </View>

            {/* AQI */}
            {wx.aqi !== null && (
              <View style={[s.aqiRow, { backgroundColor: aqiBg(wx.aqi) + "22" }]}>
                <View style={[s.aqiTile, { backgroundColor: aqiBg(wx.aqi) }]}>
                  <Text style={s.aqiTileNum}>{wx.aqi}</Text>
                </View>
                <View>
                  <Text style={s.aqiRowLabel}>Air Quality Index · Kokapet</Text>
                  <Text style={[s.aqiRowVal, { color: aqiBg(wx.aqi) }]}>
                    {wx.aqi <= 50 ? "Good" : wx.aqi <= 100 ? "Moderate" : wx.aqi <= 150 ? "Sensitive Groups" : wx.aqi <= 200 ? "Unhealthy" : wx.aqi <= 300 ? "Very Unhealthy" : "Hazardous"}
                  </Text>
                </View>
              </View>
            )}

            {/* Hourly */}
            {hourly.length > 0 && (
              <View style={s.hourlyWrap}>
                <Text style={s.hourlyTitle}>Hourly forecast</Text>
                <FlatList
                  ref={hourListRef}
                  data={hourly}
                  keyExtractor={i => i.time}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  onLayout={() => {
                    const idx = hourly.findIndex(h => h.isNow);
                    if (idx > 0) hourListRef.current?.scrollToIndex({ index: idx, viewPosition: 0.5, animated: false });
                  }}
                  getItemLayout={(_, index) => ({ length: 60, offset: 60 * index, index })}
                  renderItem={({ item }) => (
                    <View style={[s.hourCell, item.isNow && s.hourCellNow]}>
                      <Text style={[s.hourTime, item.isNow && s.hourTimeNow]}>{fmt12(item.time)}</Text>
                      <Text style={s.hourEmoji}>{item.emoji}</Text>
                      <Text style={[s.hourTemp, item.isNow && s.hourTempNow]}>{item.temp}°</Text>
                      {item.rain > 0 && <Text style={[s.hourRain, item.isNow && { color: "#93c5fd" }]}>{item.rain}%</Text>}
                    </View>
                  )}
                />
              </View>
            )}

            <Text style={s.modalFooter}>Kokapet · Open-Meteo · WAQI</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.75}>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={s.cardImage}
          resizeMode="cover"
        />
      )}
      <View style={s.cardBody}>
        {/* Badge row */}
        <View style={s.cardBadgeRow}>
          <View style={[s.cardBadge, { backgroundColor: item.badgeColor }]}>
            <Text style={s.cardBadgeText}>{item.badge}</Text>
          </View>
          {item.meta ? (
            <Text style={s.cardMeta}>{item.meta}</Text>
          ) : null}
        </View>

        <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
        {item.sub ? (
          <Text style={s.cardSub} numberOfLines={2}>{item.sub}</Text>
        ) : null}

        {/* Business row */}
        {item.biz && (
          <View style={s.bizRow}>
            {item.bizLogo ? (
              <Image source={{ uri: item.bizLogo }} style={s.bizLogo} />
            ) : (
              <View style={s.bizLogoPlaceholder}>
                <Text style={{ fontSize: 10 }}>🏪</Text>
              </View>
            )}
            <Text style={s.bizName}>{item.biz}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  topBar: {
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    paddingHorizontal: 16,
    paddingVertical:  12,
    backgroundColor: colors.brand[950],
  },
  greeting: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  location: {
    color: colors.brand[400],
    fontSize: 12,
    marginTop: 2,
  },
  weatherBadge: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius:    100,
    paddingHorizontal: 10,
    paddingVertical:   5,
  },
  weatherEmoji: { fontSize: 14 },
  weatherTemp:  { color: colors.white, fontSize: 13, fontWeight: "700" },
  aqiBadge: {
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  aqiText: { color: colors.white, fontSize: 10, fontWeight: "800" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "flex-start",
    padding: 20,
    backgroundColor: colors.brand[950],
  },
  modalLocation: { color: colors.brand[300], fontSize: 11, fontWeight: "600", marginBottom: 4, letterSpacing: 0.5 },
  modalTempRow:  { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  modalTemp:     { color: colors.white, fontSize: 52, fontWeight: "900", lineHeight: 56 },
  modalEmojiLg:  { fontSize: 36, marginBottom: 4 },
  modalLabel:    { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 2 },
  modalClose:    { padding: 8, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 100 },
  modalCloseText:{ color: colors.white, fontSize: 14 },
  modalStats: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.brand[900],
  },
  statItem:  { flexDirection: "row", alignItems: "center", gap: 4 },
  statIcon:  { fontSize: 12 },
  statVal:   { color: "rgba(255,255,255,0.7)", fontSize: 12 },
  aqiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    margin: 12,
    padding: 12,
    borderRadius: 14,
  },
  aqiTile: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  aqiTileNum:  { color: colors.white, fontSize: 16, fontWeight: "900" },
  aqiRowLabel: { fontSize: 11, color: colors.gray[500] },
  aqiRowVal:   { fontSize: 13, fontWeight: "700" },
  hourlyWrap:  { paddingHorizontal: 12, paddingBottom: 4 },
  hourlyTitle: { fontSize: 11, fontWeight: "700", color: colors.gray[400], letterSpacing: 0.5, marginBottom: 8, textTransform: "uppercase" },
  hourCell: {
    width: 56,
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  hourCellNow: { backgroundColor: colors.brand[600] },
  hourTime:    { fontSize: 10, color: colors.gray[400], fontWeight: "600" },
  hourTimeNow: { color: colors.brand[200] },
  hourEmoji:   { fontSize: 18 },
  hourTemp:    { fontSize: 13, fontWeight: "700", color: colors.gray[800] },
  hourTempNow: { color: colors.white },
  hourRain:    { fontSize: 10, color: "#60a5fa" },
  modalFooter: { textAlign: "center", fontSize: 10, color: colors.gray[300], paddingVertical: 10 },
  searchWrap: {
    flexDirection:   "row",
    alignItems:      "center",
    backgroundColor: colors.brand[900],
    marginHorizontal: 12,
    marginTop:       10,
    marginBottom:     4,
    borderRadius:    14,
    paddingHorizontal: 14,
    paddingVertical:  10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex:     1,
    color:    colors.white,
    fontSize: 14,
  },
  pillsScroll: {
    backgroundColor: colors.brand[950],
    paddingBottom:    8,
  },
  pillsContent: {
    paddingHorizontal: 12,
    paddingVertical:    8,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical:    7,
    borderRadius:      100,
    backgroundColor:  "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pillActive: {
    backgroundColor: colors.brand[500],
    borderColor:     colors.brand[400],
  },
  pillText: {
    color:      colors.brand[400],
    fontSize:   13,
    fontWeight: "600",
  },
  pillTextActive: {
    color: colors.white,
  },
  feed: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  loadingWrap: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyWrap: {
    paddingTop: 80,
    alignItems: "center",
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    color:     colors.gray[400],
    fontSize:  14,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius:    16,
    marginBottom:    12,
    overflow:        "hidden",
    shadowColor:     colors.black,
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.06,
    shadowRadius:    4,
    elevation:       2,
  },
  cardImage: {
    width:  "100%",
    height: 160,
  },
  cardBody: {
    padding: 14,
  },
  cardBadgeRow: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            8,
    marginBottom:   8,
  },
  cardBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      6,
  },
  cardBadgeText: {
    color:      colors.white,
    fontSize:   10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardMeta: {
    color:    colors.gray[400],
    fontSize: 11,
  },
  cardTitle: {
    color:      colors.gray[900],
    fontSize:   15,
    fontWeight: "700",
    lineHeight: 21,
    marginBottom: 4,
  },
  cardSub: {
    color:    colors.gray[500],
    fontSize: 13,
    lineHeight: 18,
  },
  bizRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:            8,
    marginTop:      10,
    paddingTop:     10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  bizLogo: {
    width:        24,
    height:       24,
    borderRadius: 6,
  },
  bizLogoPlaceholder: {
    width:           24,
    height:          24,
    borderRadius:     6,
    backgroundColor: colors.gray[100],
    alignItems:      "center",
    justifyContent:  "center",
  },
  bizName: {
    color:      colors.gray[600],
    fontSize:   12,
    fontWeight: "600",
  },
});
