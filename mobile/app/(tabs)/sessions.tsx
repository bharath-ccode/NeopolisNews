import { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Linking, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";

const API = process.env.EXPO_PUBLIC_API_URL ?? "https://neopolis.news";

const SESSION_TYPES = [
  "All", "Yoga", "Pilates", "Meditation", "Breathwork & Pranayama",
  "CrossFit", "Functional Training", "Zumba & Dance", "Martial Arts",
  "Stretching & Flexibility", "Cycling", "Sound Healing", "General Fitness",
];

const TYPE_EMOJI: Record<string, string> = {
  "Yoga":                    "🧘",
  "Pilates":                 "🤸",
  "Meditation":              "🌿",
  "Breathwork & Pranayama":  "🌬️",
  "CrossFit":                "🏋️",
  "Functional Training":     "💪",
  "Zumba & Dance":           "💃",
  "Martial Arts":            "🥋",
  "Stretching & Flexibility":"🙆",
  "Cycling":                 "🚴",
  "Sound Healing":           "🎵",
  "General Fitness":         "⚡",
  "All":                     "✨",
};

interface Session {
  id: string;
  session_type: string;
  trainer_name: string;
  language: string;
  description: string | null;
  price_inr: number;
  max_seats: number;
  seats_taken: number;
  meeting_link: string | null;
  platform_label: string;
  delivery_mode: "online" | "on_location";
  session_time: string | null;
  address: string | null;
  start_date: string;
  end_date: string;
  businesses: {
    id: string;
    name: string;
    logo: string | null;
    address: string | null;
    verified: boolean;
  } | null;
}

function fmt12(time: string) {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  if (h === 0) return `12:${m} AM`;
  if (h < 12) return `${h}:${m} AM`;
  if (h === 12) return `12:${m} PM`;
  return `${h - 12}:${m} PM`;
}

export default function SessionsScreen() {
  const [sessions, setSessions]     = useState<Session[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeType, setActiveType] = useState("All");
  const [activeMode, setActiveMode] = useState<"all" | "online" | "on_location">("all");

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeType !== "All") params.set("type", activeType);
      if (activeMode !== "all") params.set("mode", activeMode);
      const res  = await fetch(`${API}/api/wellness-sessions?${params}`);
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeType, activeMode]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Live Sessions</Text>
        <Text style={s.headerSub}>Classes running today in Neopolis</Text>
      </View>

      {/* Mode toggle */}
      <View style={s.modeRow}>
        {(["all", "online", "on_location"] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[s.modeChip, activeMode === m && s.modeChipActive]}
            onPress={() => setActiveMode(m)}
            activeOpacity={0.7}
          >
            <Text style={[s.modeChipText, activeMode === m && s.modeChipTextActive]}>
              {m === "all" ? "All" : m === "online" ? "🎥 Online" : "🏢 In-Studio"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.typeBar}
      >
        {SESSION_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.typeChip, activeType === t && s.typeChipActive]}
            onPress={() => setActiveType(t)}
            activeOpacity={0.7}
          >
            <Text style={s.typeEmoji}>{TYPE_EMOJI[t] ?? "🧘"}</Text>
            <Text style={[s.typeChipText, activeType === t && s.typeChipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Session list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.emerald[500]}
          />
        }
      >
        {loading ? (
          <ActivityIndicator color={colors.emerald[500]} style={{ marginTop: 40 }} size="large" />
        ) : sessions.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyEmoji}>🧘</Text>
            <Text style={s.emptyTitle}>No sessions today</Text>
            <Text style={s.emptySub}>Check back — studios post new classes regularly</Text>
          </View>
        ) : (
          sessions.map((s) => <SessionCard key={s.id} session={s} />)
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionCard({ session: sess }: { session: Session }) {
  const isOnline = sess.delivery_mode === "online";
  const spotsLeft = sess.max_seats - sess.seats_taken;

  function handleJoin() {
    if (sess.meeting_link) Linking.openURL(sess.meeting_link);
  }

  function handleMaps() {
    const addr = sess.address ?? sess.businesses?.address;
    if (addr) Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(addr)}`);
  }

  return (
    <View style={[card.wrap, isOnline ? card.wrapOnline : card.wrapStudio]}>
      {/* Left accent */}
      <View style={[card.accent, isOnline ? card.accentOnline : card.accentStudio]} />

      <View style={card.body}>
        {/* Top row: type badge + time */}
        <View style={card.topRow}>
          <View style={[card.typeBadge, isOnline ? card.typeBadgeOnline : card.typeBadgeStudio]}>
            <Text style={card.typeBadgeText}>
              {TYPE_EMOJI[sess.session_type] ?? "🧘"} {sess.session_type}
            </Text>
          </View>
          {sess.session_time && (
            <Text style={card.time}>🕐 {fmt12(sess.session_time)}</Text>
          )}
        </View>

        {/* Trainer */}
        <Text style={card.trainer}>{sess.trainer_name}</Text>
        {sess.description ? (
          <Text style={card.desc} numberOfLines={2}>{sess.description}</Text>
        ) : null}

        {/* Mode info */}
        {isOnline ? (
          <View style={card.infoRow}>
            <Text style={card.infoLabel}>🎥 {sess.platform_label} · {sess.language}</Text>
          </View>
        ) : (
          <View style={card.infoRow}>
            <Text style={card.infoLabel} numberOfLines={1}>
              📍 {sess.address ?? sess.businesses?.address ?? "See business for address"}
            </Text>
          </View>
        )}

        {/* Biz + price row */}
        <View style={card.bizRow}>
          {sess.businesses?.logo ? (
            <Image source={{ uri: sess.businesses.logo }} style={card.bizLogo} resizeMode="cover" />
          ) : (
            <View style={card.bizLogoPlaceholder}><Text style={{ fontSize: 14 }}>🏢</Text></View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={card.bizName} numberOfLines={1}>{sess.businesses?.name ?? "—"}</Text>
            <Text style={card.spotsText}>
              {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"} · ₹{sess.price_inr.toLocaleString("en-IN")}/mo
            </Text>
          </View>
          {isOnline ? (
            sess.meeting_link ? (
              <TouchableOpacity style={card.btnOnline} onPress={handleJoin} activeOpacity={0.8}>
                <Text style={card.btnText}>Join</Text>
              </TouchableOpacity>
            ) : null
          ) : (
            <TouchableOpacity style={card.btnStudio} onPress={handleMaps} activeOpacity={0.8}>
              <Text style={card.btnText}>Map</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.gray[50] },
  header: { backgroundColor: colors.brand[950], paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: "800" },
  headerSub:   { color: colors.emerald[400], fontSize: 13, marginTop: 4 },

  modeRow: {
    flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  modeChip: {
    flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: "center",
    backgroundColor: colors.gray[100], borderWidth: 1, borderColor: "transparent",
  },
  modeChipActive: { backgroundColor: colors.brand[950], borderColor: colors.brand[800] },
  modeChipText:   { fontSize: 12, fontWeight: "700", color: colors.gray[600] },
  modeChipTextActive: { color: colors.white },

  typeBar: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  typeChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray[200],
  },
  typeChipActive: { backgroundColor: colors.emerald[700], borderColor: colors.emerald[700] },
  typeEmoji:     { fontSize: 14 },
  typeChipText:  { fontSize: 12, fontWeight: "700", color: colors.gray[600] },
  typeChipTextActive: { color: colors.white },

  list:  { paddingHorizontal: 14, paddingTop: 8 },
  empty: { paddingTop: 64, alignItems: "center", gap: 8, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.gray[700], textAlign: "center" },
  emptySub:   { fontSize: 13, color: colors.gray[400], textAlign: "center" },
});

const card = StyleSheet.create({
  wrap: {
    flexDirection: "row", marginBottom: 14, borderRadius: 16, overflow: "hidden",
    backgroundColor: colors.white,
    shadowColor: colors.black, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  wrapOnline: { shadowColor: colors.brand[700] },
  wrapStudio: { shadowColor: colors.emerald[700] },

  accent:       { width: 5 },
  accentOnline: { backgroundColor: colors.brand[500] },
  accentStudio: { backgroundColor: colors.emerald[600] },

  body:   { flex: 1, padding: 12 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },

  typeBadge:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  typeBadgeOnline: { backgroundColor: colors.brand[50] },
  typeBadgeStudio: { backgroundColor: colors.emerald[50] },
  typeBadgeText:   { fontSize: 11, fontWeight: "800", color: colors.gray[700] },

  time: { fontSize: 12, fontWeight: "700", color: colors.amber[600] },

  trainer: { fontSize: 16, fontWeight: "800", color: colors.gray[900], marginBottom: 2 },
  desc:    { fontSize: 12, color: colors.gray[500], lineHeight: 17, marginBottom: 6 },

  infoRow:   { marginBottom: 8 },
  infoLabel: { fontSize: 12, color: colors.gray[500] },

  bizRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  bizLogo: { width: 32, height: 32, borderRadius: 8 },
  bizLogoPlaceholder: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.gray[100], alignItems: "center", justifyContent: "center",
  },
  bizName:   { fontSize: 12, fontWeight: "700", color: colors.gray[800] },
  spotsText: { fontSize: 11, color: colors.gray[400], marginTop: 1 },

  btnOnline: {
    backgroundColor: colors.brand[600], paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10,
  },
  btnStudio: {
    backgroundColor: colors.emerald[600], paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 10,
  },
  btnText: { color: colors.white, fontSize: 13, fontWeight: "800" },
});
