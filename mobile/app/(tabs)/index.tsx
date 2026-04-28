import { useEffect, useState, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Image,
  Modal, FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
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
function aqiInfo(aqi: number) {
  if (aqi <= 50)  return { color: "#16a34a", label: "Good",                           advice: "Great day for a walk!" };
  if (aqi <= 100) return { color: "#d97706", label: "Moderate",                       advice: "Fine for most people outdoors." };
  if (aqi <= 150) return { color: "#ea580c", label: "Unhealthy for Sensitive Groups", advice: "Sensitive groups should limit outdoor walks." };
  if (aqi <= 200) return { color: "#dc2626", label: "Unhealthy",                      advice: "Limit prolonged outdoor activity." };
  if (aqi <= 300) return { color: "#991b1b", label: "Very Unhealthy",                 advice: "Avoid outdoor walks today." };
  return           { color: "#450a0a", label: "Hazardous",                            advice: "Stay indoors — air is hazardous." };
}
function aqiBg(aqi: number) { return aqiInfo(aqi).color; }
function fmt12(iso: string) {
  const h = parseInt(iso.split("T")[1], 10);
  if (h === 0) return "12 AM";
  if (h < 12) return `${h} AM`;
  if (h === 12) return "12 PM";
  return `${h - 12} PM`;
}
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface WxState {
  temp: number | null; feelsLike: number | null;
  emoji: string; label: string;
  humidity: number | null; wind: number | null; aqi: number | null;
}
interface HourItem { time: string; temp: number; emoji: string; rain: number; isNow: boolean; }
interface DayItem  { date: string; maxTemp: number; minTemp: number; emoji: string; label: string; }

interface Deal {
  id: string; name: string; description: string | null;
  discount_percent: number | null; discount_label: string | null;
  end_date: string; image_url: string | null;
  businesses: { name: string; logo: string | null; verified: boolean } | null;
}
interface Announcement {
  id: string; title: string; body: string; type: string;
  image_url: string | null; created_at: string;
  businesses: { name: string; logo: string | null } | null;
}
interface NewsItem {
  id: string; title: string; excerpt: string | null;
  date: string | null; tag: string | null; tag_color: string | null; image: string | null;
}

const ANNOUNCE_COLOR: Record<string, string> = {
  opening: colors.green[600], hiring: colors.purple[600],
  new_arrival: "#2563eb", notice: colors.amber[600], community: "#db2777",
};
const ANNOUNCE_LABEL: Record<string, string> = {
  opening: "OPENING", hiring: "HIRING", new_arrival: "NEW", notice: "NOTICE", community: "COMMUNITY",
};

// ─────────────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const router    = useRouter();

  const [deals, setDeals]                 = useState<Deal[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [news, setNews]                   = useState<NewsItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const [wx, setWx]       = useState<WxState>({ temp: null, feelsLike: null, emoji: "🌤️", label: "Kokapet", humidity: null, wind: null, aqi: null });
  const [hourly, setHourly] = useState<HourItem[]>([]);
  const [daily, setDaily]   = useState<DayItem[]>([]);
  const [wxOpen, setWxOpen] = useState(false);
  const hourListRef         = useRef<FlatList<HourItem>>(null);

  // Prefer @screen_name, fall back to first name from profile/metadata
  const displayHandle = profile?.screen_name
    ? `@${profile.screen_name}`
    : (profile?.name ?? user?.user_metadata?.name ?? "").split(" ")[0] || "there";

  const loadData = useCallback(async () => {
    const [dealsRes, buzzRes, newsRes] = await Promise.allSettled([
      fetch(`${API}/api/deals`).then(r => r.json()),
      fetch(`${API}/api/announcements`).then(r => r.json()),
      fetch(`${API}/api/news?limit=5`).then(r => r.json()),
    ]);
    console.log("[deals] status:", dealsRes.status, "value:", JSON.stringify(dealsRes.status === "fulfilled" ? dealsRes.value : (dealsRes as PromiseRejectedResult).reason));
    const dealsData  = dealsRes.status  === "fulfilled" ? dealsRes.value  : [];
    const buzzData   = buzzRes.status   === "fulfilled" ? buzzRes.value   : [];
    const newsData   = newsRes.status   === "fulfilled" ? newsRes.value   : [];
    setDeals(Array.isArray(dealsData) ? dealsData.slice(0, 2) : []);
    setAnnouncements(Array.isArray(buzzData) ? buzzData.slice(0, 2) : []);
    const articles = Array.isArray(newsData) ? newsData : (newsData?.articles ?? []);
    setNews(articles.slice(0, 2));
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const wxUrl =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=17.4126&longitude=78.3338" +
      "&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m" +
      "&hourly=temperature_2m,weather_code,precipitation_probability" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
      "&timezone=Asia%2FKolkata&forecast_days=4";

    fetch(wxUrl).then(r => r.json()).then(j => {
      if (!j?.current) return;
      const nowH = new Date().getHours();
      const code = j.current.weather_code as number;
      setWx({
        temp: Math.round(j.current.temperature_2m),
        feelsLike: Math.round(j.current.apparent_temperature),
        emoji: wEmoji(code, nowH), label: wLabel(code),
        humidity: j.current.relative_humidity_2m,
        wind: Math.round(j.current.wind_speed_10m), aqi: null,
      });
      if (j?.hourly) {
        const today = new Date().toISOString().split("T")[0];
        setHourly((j.hourly.time as string[])
          .filter((t: string) => t.startsWith(today))
          .map((t: string, i: number) => {
            const h = parseInt(t.split("T")[1], 10);
            return { time: t, temp: Math.round(j.hourly.temperature_2m[i]),
              emoji: wEmoji(j.hourly.weather_code[i] as number, h),
              rain: j.hourly.precipitation_probability[i] as number, isNow: h === nowH };
          }));
      }
      if (j?.daily?.time) {
        const today = new Date().toISOString().split("T")[0];
        setDaily((j.daily.time as string[])
          .map((date: string, i: number) => ({
            date, maxTemp: Math.round(j.daily.temperature_2m_max[i]),
            minTemp: Math.round(j.daily.temperature_2m_min[i]),
            emoji: wEmoji(j.daily.weather_code[i] as number, 12),
            label: wLabel(j.daily.weather_code[i] as number),
          }))
          .filter(d => d.date > today).slice(0, 3));
      }
    }).catch(() => {});

    fetch(
      "https://air-quality-api.open-meteo.com/v1/air-quality" +
      "?latitude=17.4126&longitude=78.3338&current=us_aqi&timezone=Asia%2FKolkata"
    )
      .then(r => r.json())
      .then(j => { if (j?.current?.us_aqi != null) setWx(prev => ({ ...prev, aqi: Number(j.current.us_aqi) })); })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={s.root}>
      {/* Top bar */}
      <View style={s.topBar}>
        <View>
          <Text style={s.greeting}>Hi {displayHandle} 👋</Text>
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

      {/* Sections */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={colors.brand[300]} />}
      >
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={colors.brand[400]} size="large" />
          </View>
        ) : (
          <>
            {/* ── Deals ───────────────────────────────────────────────── */}
            <SectionHeader title="🛍️ Local Deals" onSeeAll={() => router.push("/(tabs)/deals")} />
            {deals.length === 0 ? (
              <EmptyRow text="No active deals right now" />
            ) : deals.map(d => <DealCard key={d.id} deal={d} />)}

            {/* ── Announcements ───────────────────────────────────────── */}
            <SectionHeader title="📢 Announcements" />
            {announcements.length === 0 ? (
              <EmptyRow text="No announcements yet" />
            ) : announcements.map(a => <AnnouncementCard key={a.id} item={a} />)}

            {/* ── News ────────────────────────────────────────────────── */}
            <SectionHeader title="📰 News" />
            {news.length === 0 ? (
              <EmptyRow text="No news articles yet" />
            ) : news.map(n => <NewsCard key={n.id} item={n} />)}
          </>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ── Weather modal — full screen, matches web layout ──────────────── */}
      <Modal visible={wxOpen} animationType="slide" transparent={false} onRequestClose={() => setWxOpen(false)}>
        <SafeAreaView style={s.wxScreen}>
          {/* Dark header */}
          <View style={s.wxHeader}>
            <View style={s.wxHeaderTop}>
              <Text style={s.wxLocation}>Today · Kokapet, Hyderabad</Text>
              <TouchableOpacity onPress={() => setWxOpen(false)} style={s.wxClose}>
                <Text style={s.wxCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={s.wxTempRow}>
              <Text style={s.wxTemp}>{wx.temp !== null ? `${wx.temp}°` : "—"}</Text>
              <Text style={s.wxEmojiLg}>{wx.emoji}</Text>
            </View>
            <Text style={s.wxLabel}>{wx.label}</Text>
            <View style={s.wxStats}>
              {wx.feelsLike !== null && <StatItem icon="🌡️" label={`Feels ${wx.feelsLike}°`} />}
              {wx.humidity  !== null && <StatItem icon="💧" label={`${wx.humidity}% humidity`} />}
              {wx.wind      !== null && <StatItem icon="💨" label={`${wx.wind} km/h`} />}
            </View>
          </View>

          {/* Scrollable white body */}
          <ScrollView style={s.wxBody} showsVerticalScrollIndicator={false}>

            {/* Hourly */}
            {hourly.length > 0 && (
              <View style={s.hourlyWrap}>
                <Text style={s.sectionLabel}>Hourly Forecast</Text>
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

            {/* 3-day */}
            {daily.length > 0 && (
              <View style={s.dailyWrap}>
                <Text style={s.sectionLabel}>Next 3 Days</Text>
                <View style={s.dailyGrid}>
                  {daily.map(d => (
                    <View key={d.date} style={s.dayCard}>
                      <Text style={s.dayName}>{new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" })}</Text>
                      <Text style={s.dayEmoji}>{d.emoji}</Text>
                      <Text style={s.dayLabel} numberOfLines={1}>{d.label}</Text>
                      <Text style={s.dayMax}>{d.maxTemp}°</Text>
                      <Text style={s.dayMin}>{d.minTemp}°</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* AQI + Walking advice */}
            {wx.aqi !== null && (() => {
              const info = aqiInfo(wx.aqi!);
              return (
                <View style={s.dailyWrap}>
                  <Text style={s.sectionLabel}>Air Quality</Text>
                  <View style={[s.aqiRow, { backgroundColor: info.color + "18" }]}>
                    <View style={[s.aqiTile, { backgroundColor: info.color }]}>
                      <Text style={s.aqiTileNum}>{wx.aqi}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.aqiRowLabel}>AQI · Kokapet</Text>
                      <Text style={[s.aqiRowVal, { color: info.color }]}>{info.label}</Text>
                    </View>
                  </View>
                  <View style={s.walkRow}>
                    <Text style={s.walkIcon}>🚶</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.walkTitle}>Walking Advice</Text>
                      <Text style={s.walkAdvice}>{info.advice}</Text>
                    </View>
                  </View>
                </View>
              );
            })()}

            <Text style={s.modalFooter}>Kokapet · Open-Meteo · WAQI</Text>
            <View style={{ height: 24 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={s.seeAll}>See all →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <View style={s.emptyRow}>
      <Text style={s.emptyRowText}>{text}</Text>
    </View>
  );
}

function StatItem({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={s.statItem}>
      <Text style={s.statIcon}>{icon}</Text>
      <Text style={s.statVal}>{label}</Text>
    </View>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const badge = deal.discount_percent ? `${deal.discount_percent}% OFF` : (deal.discount_label ?? "Offer");
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.8}>
      {deal.image_url && <Image source={{ uri: deal.image_url }} style={s.cardImg} resizeMode="cover" />}
      <View style={s.cardBody}>
        <View style={s.cardTopRow}>
          <View style={[s.badge, { backgroundColor: colors.orange[600] }]}>
            <Text style={s.badgeText}>{badge}</Text>
          </View>
          <Text style={s.cardMeta}>Until {new Date(deal.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</Text>
        </View>
        <Text style={s.cardTitle} numberOfLines={2}>{deal.name}</Text>
        {deal.description ? <Text style={s.cardSub} numberOfLines={2}>{deal.description}</Text> : null}
        {deal.businesses && (
          <View style={s.bizRow}>
            <BizLogo logo={deal.businesses.logo} />
            <Text style={s.bizName}>{deal.businesses.name}</Text>
            {deal.businesses.verified && <Text style={s.verified}>✓</Text>}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function AnnouncementCard({ item }: { item: Announcement }) {
  const bg    = ANNOUNCE_COLOR[item.type] ?? colors.brand[600];
  const label = ANNOUNCE_LABEL[item.type] ?? "BUZZ";
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.8}>
      {item.image_url && <Image source={{ uri: item.image_url }} style={s.cardImg} resizeMode="cover" />}
      <View style={s.cardBody}>
        <View style={s.cardTopRow}>
          <View style={[s.badge, { backgroundColor: bg }]}>
            <Text style={s.badgeText}>{label}</Text>
          </View>
          <Text style={s.cardMeta}>{timeAgo(item.created_at)}</Text>
        </View>
        <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={s.cardSub} numberOfLines={2}>{item.body}</Text>
        {item.businesses && (
          <View style={s.bizRow}>
            <BizLogo logo={item.businesses.logo} />
            <Text style={s.bizName}>{item.businesses.name}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.8}>
      {item.image && <Image source={{ uri: item.image }} style={s.cardImg} resizeMode="cover" />}
      <View style={s.cardBody}>
        <View style={s.cardTopRow}>
          {item.tag && (
            <View style={[s.badge, { backgroundColor: item.tag_color ?? colors.gray[700] }]}>
              <Text style={s.badgeText}>{item.tag}</Text>
            </View>
          )}
          {item.date && <Text style={s.cardMeta}>{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</Text>}
        </View>
        <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
        {item.excerpt ? <Text style={s.cardSub} numberOfLines={2}>{item.excerpt}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function BizLogo({ logo }: { logo: string | null }) {
  return logo ? (
    <Image source={{ uri: logo }} style={s.bizLogo} resizeMode="cover" />
  ) : (
    <View style={s.bizLogoPlaceholder}><Text style={{ fontSize: 10 }}>🏪</Text></View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: colors.gray[50] },
  scrollContent: { paddingBottom: 16 },

  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.brand[950],
  },
  greeting: { color: colors.white, fontSize: 16, fontWeight: "700" },
  location: { color: colors.brand[400], fontSize: 12, marginTop: 2 },

  weatherBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 100,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  weatherEmoji: { fontSize: 14 },
  weatherTemp:  { color: colors.white, fontSize: 13, fontWeight: "700" },
  aqiBadge:     { borderRadius: 100, paddingHorizontal: 6, paddingVertical: 2 },
  aqiText:      { color: colors.white, fontSize: 10, fontWeight: "800" },

  loadingWrap: { paddingTop: 80, alignItems: "center" },

  // Sections
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.gray[900] },
  seeAll:       { fontSize: 13, fontWeight: "600", color: colors.brand[500] },

  emptyRow: { marginHorizontal: 16, marginBottom: 4, padding: 14, backgroundColor: colors.white, borderRadius: 12 },
  emptyRowText: { fontSize: 13, color: colors.gray[400], textAlign: "center" },

  // Cards
  card: {
    backgroundColor: colors.white, borderRadius: 16,
    marginHorizontal: 16, marginBottom: 10, overflow: "hidden",
    shadowColor: colors.black, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardImg:    { width: "100%", height: 160 },
  cardBody:   { padding: 12 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
  badge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText:  { color: colors.white, fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  cardMeta:   { fontSize: 11, color: colors.gray[400] },
  cardTitle:  { fontSize: 15, fontWeight: "700", color: colors.gray[900], lineHeight: 21, marginBottom: 3 },
  cardSub:    { fontSize: 13, color: colors.gray[500], lineHeight: 18 },

  bizRow:           { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  bizLogo:          { width: 22, height: 22, borderRadius: 6 },
  bizLogoPlaceholder:{ width: 22, height: 22, borderRadius: 6, backgroundColor: colors.gray[100], alignItems: "center", justifyContent: "center" },
  bizName:          { fontSize: 12, fontWeight: "600", color: colors.gray[600] },
  verified:         { fontSize: 11, color: colors.brand[500], fontWeight: "700" },

  // Full-screen weather modal
  wxScreen:     { flex: 1, backgroundColor: colors.brand[950] },
  wxHeader:     { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
  wxHeaderTop:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  wxLocation:   { color: colors.brand[300], fontSize: 11, fontWeight: "600", letterSpacing: 0.5 },
  wxClose:      { padding: 8, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 100 },
  wxCloseText:  { color: colors.white, fontSize: 14 },
  wxTempRow:    { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  wxTemp:       { color: colors.white, fontSize: 56, fontWeight: "900", lineHeight: 60 },
  wxEmojiLg:    { fontSize: 40, marginBottom: 4 },
  wxLabel:      { color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 12 },
  wxStats:      { flexDirection: "row", gap: 16 },
  wxBody:       { flex: 1, backgroundColor: colors.white },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  dailyGrid:    { flexDirection: "row", gap: 8 },
  dayCard:      { flex: 1, backgroundColor: colors.gray[50], borderRadius: 12, padding: 10, alignItems: "center", gap: 4 },

  // Legacy modal styles (kept for statItem/statIcon/statVal usage)
  modalOverlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalPanel:    { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", maxHeight: "85%" },
  modalHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 20, backgroundColor: colors.brand[950] },
  modalLocation: { color: colors.brand[300], fontSize: 11, fontWeight: "600", marginBottom: 4, letterSpacing: 0.5 },
  modalTempRow:  { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  modalTemp:     { color: colors.white, fontSize: 52, fontWeight: "900", lineHeight: 56 },
  modalEmojiLg:  { fontSize: 36, marginBottom: 4 },
  modalLabel:    { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 2 },
  modalClose:    { padding: 8, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 100 },
  modalCloseText:{ color: colors.white, fontSize: 14 },
  modalStats:    { flexDirection: "row", gap: 16, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.brand[900] },
  statItem:      { flexDirection: "row", alignItems: "center", gap: 4 },
  statIcon:      { fontSize: 12 },
  statVal:       { color: "rgba(255,255,255,0.7)", fontSize: 12 },

  aqiRow:     { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, marginBottom: 8 },
  aqiTile:    { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  aqiTileNum: { color: colors.white, fontSize: 16, fontWeight: "900" },
  aqiRowLabel:{ fontSize: 11, color: colors.gray[500] },
  aqiRowVal:  { fontSize: 13, fontWeight: "700" },
  walkRow:    { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: colors.gray[50], borderRadius: 12, padding: 12 },
  walkIcon:   { fontSize: 18, marginTop: 1 },
  walkTitle:  { fontSize: 12, fontWeight: "700", color: colors.gray[700], marginBottom: 2 },
  walkAdvice: { fontSize: 12, color: colors.gray[500], lineHeight: 17 },

  hourlyWrap:  { paddingHorizontal: 12, paddingBottom: 4 },
  hourlyTitle: { fontSize: 11, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  hourCell:    { width: 56, alignItems: "center", gap: 4, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 12 },
  hourCellNow: { backgroundColor: colors.brand[600] },
  hourTime:    { fontSize: 10, color: colors.gray[400], fontWeight: "600" },
  hourTimeNow: { color: colors.brand[200] },
  hourEmoji:   { fontSize: 18 },
  hourTemp:    { fontSize: 13, fontWeight: "700", color: colors.gray[800] },
  hourTempNow: { color: colors.white },
  hourRain:    { fontSize: 10, color: "#60a5fa" },

  dailyWrap:  { paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  dailyTitle: { fontSize: 11, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  dayRow:     { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.gray[50] },
  dayName:    { width: 36, fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  dayEmoji:   { fontSize: 20, marginHorizontal: 8 },
  dayLabel:   { flex: 1, fontSize: 13, color: colors.gray[500] },
  dayTemps:   { flexDirection: "row", gap: 6, alignItems: "center" },
  dayMax:     { fontSize: 14, fontWeight: "700", color: colors.gray[800] },
  dayMin:     { fontSize: 13, color: colors.gray[400] },

  modalFooter: { textAlign: "center", fontSize: 10, color: colors.gray[300], paddingVertical: 10 },
});
