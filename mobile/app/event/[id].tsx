import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/lib/colors";

const EVENT_TYPE_MAP: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  music_concert: { label: "Music Concert",  emoji: "🎵", color: "#7c3aed", bg: "#f5f3ff" },
  sports_run:    { label: "Sports & Run",   emoji: "🏆", color: "#ea580c", bg: "#fff7ed" },
  food_festival: { label: "Food Festival",  emoji: "🍽️", color: "#a16207", bg: "#fefce8" },
  culture_art:   { label: "Culture & Art",  emoji: "🎨", color: "#e11d48", bg: "#fff1f2" },
  exhibition:    { label: "Exhibition",     emoji: "📦", color: "#0d9488", bg: "#f0fdfa" },
};

interface EventRow {
  id: string;
  name: string;
  event_type: string;
  event_date: string;
  end_date: string | null;
  start_time: string;
  end_time: string;
  description: string | null;
  image_url: string | null;
  is_free: boolean;
  ticket_price: number | null;
  total_slots: number | null;
  claimed_slots: number;
  business_id: string;
  businesses: { id: string; name: string; address: string | null; logo: string | null } | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}
function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const API = process.env.EXPO_PUBLIC_API_URL ?? "https://neopolis.news";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [ev, setEv] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState<"idle" | "claimed" | "full">("idle");

  useEffect(() => {
    supabase
      .from("business_events")
      .select("*, businesses(id, name, address, logo)")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setEv(data as EventRow | null);
        setLoading(false);
      });
  }, [id]);

  async function handleClaim() {
    if (!session) {
      Alert.alert("Sign in required", "Please sign in to claim a slot.");
      return;
    }
    setClaiming(true);
    const res = await fetch(`${API}/api/events/${id}/claim`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setClaiming(false);
    if (res.ok) {
      setClaimStatus("claimed");
      setEv(prev => prev ? { ...prev, claimed_slots: prev.claimed_slots + 1 } : prev);
    } else if (res.status === 409) {
      setClaimStatus("full");
    } else {
      Alert.alert("Error", "Could not claim slot. Please try again.");
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={s.centered}>
          <ActivityIndicator color={colors.brand[400]} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!ev) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={s.centered}>
          <Text style={s.notFoundText}>Event not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cat = EVENT_TYPE_MAP[ev.event_type] ?? EVENT_TYPE_MAP["exhibition"];
  const isMultiDay = ev.end_date && ev.end_date !== ev.event_date;
  const availableSlots = ev.total_slots != null ? ev.total_slots - ev.claimed_slots : null;
  const soldOut = claimStatus === "full" || (availableSlots !== null && availableSlots <= 0);
  const fillPct = ev.total_slots ? Math.min(1, ev.claimed_slots / ev.total_slots) : 0;
  const slotColor = fillPct > 0.8 ? "#ef4444" : fillPct > 0.6 ? "#f97316" : "#22c55e";

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{ev.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event image */}
        {ev.image_url ? (
          <Image source={{ uri: ev.image_url }} style={s.eventImage} resizeMode="cover" />
        ) : null}

        {/* Type badge + title */}
        <View style={s.titleSection}>
          <View style={[s.typeBadge, { backgroundColor: cat.bg }]}>
            <Text style={s.typeEmoji}>{cat.emoji}</Text>
            <Text style={[s.typeLabel, { color: cat.color }]}>{cat.label}</Text>
          </View>
          <Text style={s.eventName}>{ev.name}</Text>

          {/* Date & time */}
          <View style={s.metaRow}>
            <Text style={s.metaIcon}>📅</Text>
            <Text style={s.metaText}>
              {isMultiDay
                ? `${formatDateShort(ev.event_date)} – ${formatDateShort(ev.end_date!)}`
                : formatDate(ev.event_date)}
            </Text>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaIcon}>🕐</Text>
            <Text style={s.metaText}>{ev.start_time.slice(0, 5)} – {ev.end_time.slice(0, 5)}</Text>
          </View>

          {/* Organiser */}
          {ev.businesses ? (
            <TouchableOpacity
              style={s.orgRow}
              onPress={() => router.push(`/business/${ev.businesses!.id}`)}
              activeOpacity={0.75}
            >
              <View style={s.orgLogoWrap}>
                {ev.businesses.logo ? (
                  <Image source={{ uri: ev.businesses.logo }} style={s.orgLogo} resizeMode="cover" />
                ) : (
                  <Text style={{ fontSize: 14 }}>🏢</Text>
                )}
              </View>
              <View>
                <Text style={s.orgBy}>Organised by</Text>
                <Text style={s.orgName}>{ev.businesses.name}</Text>
              </View>
              <Text style={s.orgArrow}>›</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={s.cards}>
          {/* Ticket / Entry card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Entry</Text>
            {ev.is_free ? (
              <View style={s.entryRow}>
                <Text style={s.freeText}>✅  Free entry</Text>
              </View>
            ) : (
              <View style={s.entryRow}>
                <Text style={s.priceText}>🎟️  ₹{ev.ticket_price?.toLocaleString("en-IN")} per ticket</Text>
              </View>
            )}
          </View>

          {/* Slots card */}
          {ev.total_slots != null && (
            <View style={s.card}>
              <Text style={s.cardTitle}>Availability</Text>
              <View style={s.slotsRow}>
                <Text style={s.slotsText}>
                  {soldOut ? (
                    <Text style={s.soldOutText}>Sold Out</Text>
                  ) : (
                    <Text>
                      <Text style={s.slotsBold}>{availableSlots}</Text>
                      {" "}of {ev.total_slots} slots left
                    </Text>
                  )}
                </Text>
              </View>
              {/* Progress bar */}
              <View style={s.progressBg}>
                <View style={[s.progressFill, { width: `${fillPct * 100}%` as any, backgroundColor: slotColor }]} />
              </View>
              <Text style={s.claimedText}>{ev.claimed_slots} claimed</Text>

              {/* Claim button */}
              {claimStatus === "claimed" ? (
                <View style={s.claimedBadge}>
                  <Text style={s.claimedBadgeText}>✅  Slot Claimed!</Text>
                </View>
              ) : soldOut ? (
                <View style={[s.claimBtn, s.claimBtnSoldOut]}>
                  <Text style={s.claimBtnSoldOutText}>Sold Out</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[s.claimBtn, claiming && { opacity: 0.6 }]}
                  onPress={handleClaim}
                  disabled={claiming}
                  activeOpacity={0.8}
                >
                  <Text style={s.claimBtnText}>{claiming ? "Claiming…" : "🎟️  Claim Slot"}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Description */}
          {ev.description ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>About this Event</Text>
              <Text style={s.cardBody}>{ev.description}</Text>
            </View>
          ) : null}

          {/* Location */}
          {ev.businesses?.address ? (
            <View style={s.card}>
              <Text style={s.cardTitle}>Location</Text>
              <View style={s.metaRow}>
                <Text style={s.metaIcon}>📍</Text>
                <Text style={s.metaText}>{ev.businesses.address}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray[50] },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { color: colors.gray[500], fontSize: 15 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.brand[950],
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { paddingVertical: 4, paddingRight: 12 },
  backText: { color: colors.brand[300], fontSize: 14, fontWeight: "600" },
  headerTitle: { flex: 1, color: colors.white, fontSize: 16, fontWeight: "700", textAlign: "center" },

  eventImage: { width: "100%", height: 200 },

  titleSection: { backgroundColor: colors.white, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  typeBadge: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, marginBottom: 10 },
  typeEmoji: { fontSize: 13 },
  typeLabel: { fontSize: 11, fontWeight: "700" },
  eventName: { fontSize: 20, fontWeight: "800", color: colors.gray[900], marginBottom: 12 },

  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  metaIcon: { fontSize: 14, width: 20, marginTop: 1 },
  metaText: { flex: 1, fontSize: 14, color: colors.gray[700], lineHeight: 20 },

  orgRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginTop: 12, padding: 12,
    backgroundColor: colors.gray[50], borderRadius: 12,
    borderWidth: 1, borderColor: colors.gray[200],
  },
  orgLogoWrap: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.gray[100], alignItems: "center", justifyContent: "center", overflow: "hidden" },
  orgLogo: { width: 36, height: 36 },
  orgBy: { fontSize: 10, color: colors.gray[400], fontWeight: "600" },
  orgName: { fontSize: 13, fontWeight: "700", color: colors.gray[900] },
  orgArrow: { marginLeft: "auto", fontSize: 18, color: colors.gray[400] },

  cards: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  cardTitle: { fontSize: 12, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  cardBody: { fontSize: 14, color: colors.gray[700], lineHeight: 22 },

  entryRow: { flexDirection: "row", alignItems: "center" },
  freeText: { fontSize: 16, fontWeight: "700", color: "#16a34a" },
  priceText: { fontSize: 16, fontWeight: "700", color: colors.gray[900] },

  slotsRow: { marginBottom: 8 },
  slotsText: { fontSize: 14, color: colors.gray[700] },
  slotsBold: { fontWeight: "700", color: colors.gray[900] },
  soldOutText: { color: "#dc2626", fontWeight: "700" },
  progressBg: { height: 8, backgroundColor: colors.gray[100], borderRadius: 100, overflow: "hidden", marginBottom: 4 },
  progressFill: { height: 8, borderRadius: 100 },
  claimedText: { fontSize: 11, color: colors.gray[400], marginBottom: 14 },

  claimBtn: { backgroundColor: "#7c3aed", borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  claimBtnText: { color: colors.white, fontSize: 14, fontWeight: "700" },
  claimBtnSoldOut: { backgroundColor: colors.gray[100] },
  claimBtnSoldOutText: { color: "#dc2626", fontSize: 14, fontWeight: "700" },
  claimedBadge: { backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#86efac", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  claimedBadgeText: { color: "#16a34a", fontSize: 14, fontWeight: "700" },
});
