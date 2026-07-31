import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/colors";

interface Business {
  id: string;
  name: string;
  industry: string;
  types: string[] | null;
  subtypes: string[] | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  logo: string | null;
  photos: string[] | null;
  verified: boolean;
  status: string;
}

interface Offer {
  id: string;
  name: string;
  description: string | null;
  discount_percent: number | null;
  discount_label: string | null;
  end_date: string;
  image_url: string | null;
}

interface BusinessEvent {
  id: string;
  name: string;
  event_type: string;
  event_date: string;
  end_date: string | null;
  start_time: string;
  end_time: string;
  image_url: string | null;
  is_free: boolean;
  ticket_price: number | null;
}

const EVENT_CAT: Record<string, { emoji: string; color: string; bg: string }> = {
  music_concert: { emoji: "🎵", color: "#7c3aed", bg: "#f5f3ff" },
  sports_run:    { emoji: "🏆", color: "#c2410c", bg: "#fff7ed" },
  food_festival: { emoji: "🍽️", color: "#a16207", bg: "#fefce8" },
  culture_art:   { emoji: "🎨", color: "#be123c", bg: "#fff1f2" },
  exhibition:    { emoji: "📦", color: "#0f766e", bg: "#f0fdfa" },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
function formatPhone(phone: string) {
  return phone.replace(/(\+91)?(\d{5})(\d{5})/, "+91 $2 $3");
}

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [biz, setBiz]       = useState<Business | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      supabase
        .from("businesses")
        .select("id, name, industry, types, subtypes, address, phone, email, website, description, logo, photos, verified, status")
        .eq("id", id)
        .single(),
      supabase
        .from("business_offers")
        .select("id, name, description, discount_percent, discount_label, end_date, image_url")
        .eq("business_id", id)
        .eq("status", "active")
        .gte("end_date", today)
        .order("end_date", { ascending: true }),
      supabase
        .from("business_events")
        .select("id, name, event_type, event_date, end_date, start_time, end_time, image_url, is_free, ticket_price")
        .eq("business_id", id)
        .gte("event_date", today)
        .order("event_date", { ascending: true })
        .limit(10),
    ]).then(([{ data: bizData }, { data: offerData }, { data: eventData }]) => {
      setBiz(bizData as Business | null);
      setOffers((offerData ?? []) as Offer[]);
      setEvents((eventData ?? []) as BusinessEvent[]);
      setLoading(false);
    });
  }, [id]);

  const warmHeader = (
    <View style={s.header}>
      <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
        <Text style={s.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={s.headerTitle} numberOfLines={1}>{biz?.name ?? ""}</Text>
      <View style={{ width: 60 }} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={s.centered}><ActivityIndicator color="#0d9488" size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!biz) {
    return (
      <SafeAreaView style={s.root}>
        {warmHeader}
        <View style={s.centered}><Text style={s.notFoundText}>Business not found</Text></View>
      </SafeAreaView>
    );
  }

  const categories = [...(biz.types ?? []), ...(biz.subtypes ?? [])];

  return (
    <SafeAreaView style={s.root}>
      {warmHeader}

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Warm hero ── */}
        <View style={s.hero}>
          <View style={s.logoWrap}>
            {biz.logo
              ? <Image source={{ uri: biz.logo }} style={s.logoImg} resizeMode="cover" />
              : <Text style={s.logoEmoji}>🏢</Text>}
          </View>
          <View style={s.heroText}>
            <View style={s.nameRow}>
              <Text style={s.bizName} numberOfLines={2}>{biz.name}</Text>
              {biz.verified && (
                <View style={s.verifiedBadge}><Text style={s.verifiedText}>✓</Text></View>
              )}
            </View>
            <Text style={s.industryText}>{biz.industry}</Text>
            {biz.address
              ? <Text style={s.heroAddress} numberOfLines={2}>📍 {biz.address}</Text>
              : null}
          </View>
        </View>

        {/* Category pills */}
        {categories.length > 0 && (
          <View style={s.catRow}>
            {categories.map((c, i) => (
              <View key={c} style={s.catPillRow}>
                {i > 0 && <Text style={s.catSep}>›</Text>}
                <View style={s.catPill}><Text style={s.catPillText}>{c}</Text></View>
              </View>
            ))}
          </View>
        )}

        {/* Photos */}
        {biz.photos && biz.photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={s.photosScroll} contentContainerStyle={s.photosContent}>
            {biz.photos.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={s.photo} resizeMode="cover" />
            ))}
          </ScrollView>
        )}

        <View style={s.cards}>

          {/* ── Offers carousel ── */}
          {offers.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>🏷️  Current Deals  <Text style={s.cardCount}>{offers.length}</Text></Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.carouselContent} decelerationRate="fast" snapToInterval={196} snapToAlignment="start">
                {offers.map((offer) => {
                  const badge = offer.discount_percent
                    ? `${offer.discount_percent}% OFF`
                    : offer.discount_label ?? "Special Offer";
                  return (
                    <View key={offer.id} style={s.offerCard}>
                      {offer.image_url
                        ? <Image source={{ uri: offer.image_url }} style={s.carouselImg} resizeMode="cover" />
                        : (
                          <View style={s.offerNoImg}>
                            <Text style={s.offerNoImgText}>{badge}</Text>
                          </View>
                        )}
                      <View style={s.carouselBody}>
                        <View style={s.offerBadge}><Text style={s.offerBadgeText}>{badge}</Text></View>
                        <Text style={s.carouselName} numberOfLines={2}>{offer.name}</Text>
                        {offer.description
                          ? <Text style={s.carouselSub} numberOfLines={2}>{offer.description}</Text>
                          : null}
                        <Text style={s.carouselMeta}>Until {fmtDate(offer.end_date)}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* ── Events carousel ── */}
          {events.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardTitle}>📅  Upcoming Events  <Text style={s.cardCount}>{events.length}</Text></Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.carouselContent} decelerationRate="fast" snapToInterval={196} snapToAlignment="start">
                {events.map((ev) => {
                  const cat = EVENT_CAT[ev.event_type] ?? EVENT_CAT["exhibition"];
                  const isMultiDay = ev.end_date && ev.end_date !== ev.event_date;
                  return (
                    <TouchableOpacity key={ev.id} style={s.eventCard}
                      onPress={() => router.push(`/event/${ev.id}`)} activeOpacity={0.85}>
                      {ev.image_url
                        ? <Image source={{ uri: ev.image_url }} style={s.carouselImg} resizeMode="cover" />
                        : (
                          <View style={[s.eventNoImg, { backgroundColor: cat.bg }]}>
                            <Text style={s.eventNoImgEmoji}>{cat.emoji}</Text>
                          </View>
                        )}
                      <View style={s.carouselBody}>
                        <View style={[s.eventTypeBadge, { backgroundColor: cat.bg }]}>
                          <Text style={[s.eventTypeText, { color: cat.color }]}>
                            {cat.emoji} {ev.event_type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                          </Text>
                        </View>
                        <Text style={s.carouselName} numberOfLines={2}>{ev.name}</Text>
                        <Text style={s.carouselMeta}>
                          {isMultiDay
                            ? `${fmtDate(ev.event_date)} – ${fmtDate(ev.end_date!)}`
                            : fmtDate(ev.event_date)}
                          {"  ·  "}{ev.start_time.slice(0, 5)}
                        </Text>
                        <Text style={[s.eventPrice, ev.is_free ? s.eventPriceFree : s.eventPricePaid]}>
                          {ev.is_free ? "Free entry" : `₹${ev.ticket_price?.toLocaleString("en-IN")}`}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Description */}
          {biz.description ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>About</Text>
              <Text style={s.cardBody}>{biz.description}</Text>
            </View>
          ) : null}

          {/* Contact */}
          {(biz.address || biz.phone || biz.email || biz.website) ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>Contact & Location</Text>
              {biz.address ? (
                <TouchableOpacity style={s.contactRow} activeOpacity={0.7}
                  onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(biz.address!)}`)}>
                  <Text style={s.contactIcon}>📍</Text>
                  <Text style={[s.contactText, s.contactLink]}>{biz.address}</Text>
                </TouchableOpacity>
              ) : null}
              {biz.phone ? (
                <TouchableOpacity style={s.contactRow} activeOpacity={0.7}
                  onPress={() => Linking.openURL(`tel:${biz.phone}`)}>
                  <Text style={s.contactIcon}>📞</Text>
                  <Text style={[s.contactText, s.contactLink]}>{formatPhone(biz.phone)}</Text>
                </TouchableOpacity>
              ) : null}
              {biz.email ? (
                <TouchableOpacity style={s.contactRow} activeOpacity={0.7}
                  onPress={() => Linking.openURL(`mailto:${biz.email}`)}>
                  <Text style={s.contactIcon}>✉️</Text>
                  <Text style={[s.contactText, s.contactLink]}>{biz.email}</Text>
                </TouchableOpacity>
              ) : null}
              {biz.website ? (
                <TouchableOpacity style={s.contactRow} activeOpacity={0.7}
                  onPress={() => Linking.openURL(biz.website!.startsWith("http") ? biz.website! : `https://${biz.website}`)}>
                  <Text style={s.contactIcon}>🌐</Text>
                  <Text style={[s.contactText, s.contactLink]}>{biz.website}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const TEAL_DARK  = "#0f766e"; // teal-700
const TEAL_MID   = "#0d9488"; // teal-600
const TEAL_LIGHT = "#99f6e4"; // teal-200

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.gray[50] },
  centered:     { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { color: colors.gray[500], fontSize: 15 },

  // Header — warm orange
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: TEAL_DARK,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn:     { paddingVertical: 4, paddingRight: 12 },
  backText:    { color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: "600" },
  headerTitle: { flex: 1, color: "#fff", fontSize: 16, fontWeight: "700", textAlign: "center" },

  // Hero — warm gradient feel
  hero: {
    flexDirection: "row", alignItems: "flex-start", gap: 14,
    backgroundColor: TEAL_MID,
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 20,
  },
  logoWrap: {
    width: 68, height: 68, borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2, borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden", flexShrink: 0,
  },
  logoImg:   { width: 68, height: 68 },
  logoEmoji: { fontSize: 30 },
  heroText:  { flex: 1 },
  nameRow:   { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  bizName:   { fontSize: 18, fontWeight: "800", color: "#fff", flexShrink: 1, lineHeight: 24 },
  verifiedBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.3)", alignItems: "center", justifyContent: "center" },
  verifiedText:  { color: "#fff", fontSize: 10, fontWeight: "700" },
  industryText:  { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 3, fontWeight: "600" },
  heroAddress:   { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 5, lineHeight: 17 },

  // Category pills
  catRow:    { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#f0fdfa", borderBottomWidth: 1, borderBottomColor: "#99f6e4" },
  catPillRow:{ flexDirection: "row", alignItems: "center", gap: 6 },
  catSep:    { color: "#0d9488", fontSize: 12 },
  catPill:   { backgroundColor: "#ccfbf1", borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: "#99f6e4" },
  catPillText: { fontSize: 11, fontWeight: "600", color: "#0f766e" },

  // Photos
  photosScroll:   { backgroundColor: "#fafaf9" },
  photosContent:  { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  photo:          { width: 200, height: 130, borderRadius: 12 },

  // Cards section
  cards: { padding: 16, gap: 12 },
  card:  { backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  cardTitle: { fontSize: 12, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  cardCount: { fontWeight: "700", color: "#0d9488" },
  cardBody:  { fontSize: 14, color: colors.gray[700], lineHeight: 22 },

  // Carousel shared
  carouselContent: { gap: 10, paddingRight: 4 },
  carouselImg:     { width: "100%", height: 110, borderRadius: 10 },
  carouselBody:    { padding: 10, gap: 4 },
  carouselName:    { fontSize: 13, fontWeight: "700", color: colors.gray[900], lineHeight: 18 },
  carouselSub:     { fontSize: 11, color: colors.gray[500], lineHeight: 16 },
  carouselMeta:    { fontSize: 11, color: colors.gray[400], marginTop: 2 },

  // Offer card
  offerCard:      { width: 180, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: "#fed7aa", backgroundColor: "#fff7ed" },
  offerNoImg:     { height: 70, backgroundColor: "#ea580c", alignItems: "center", justifyContent: "center" },
  offerNoImgText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  offerBadge:     { alignSelf: "flex-start", backgroundColor: "#ea580c", borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  offerBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

  // Event card
  eventCard:      { width: 180, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: colors.gray[100], backgroundColor: "#fff" },
  eventNoImg:     { height: 70, alignItems: "center", justifyContent: "center" },
  eventNoImgEmoji:{ fontSize: 32 },
  eventTypeBadge: { alignSelf: "flex-start", borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  eventTypeText:  { fontSize: 10, fontWeight: "700" },
  eventPrice:     { fontSize: 11, fontWeight: "700", marginTop: 2 },
  eventPriceFree: { color: "#16a34a" },
  eventPricePaid: { color: "#7c3aed" },

  // Contact
  contactRow:  { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 6 },
  contactIcon: { fontSize: 15, width: 20 },
  contactText: { flex: 1, fontSize: 14, color: colors.gray[700], lineHeight: 20 },
  contactLink: { color: "#2563eb" },
});
