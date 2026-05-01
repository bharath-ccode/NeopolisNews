import { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Linking, RefreshControl, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";
import { useAuth } from "@/context/AuthContext";

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
  businesses: {
    id: string; name: string; logo: string | null;
    address: string | null; verified: boolean;
  } | null;
}

function fmt12(time: string) {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  if (h === 0)  return `12:${m} AM`;
  if (h < 12)  return `${h}:${m} AM`;
  if (h === 12) return `12:${m} PM`;
  return `${h - 12}:${m} PM`;
}

export default function SessionsScreen() {
  const { session } = useAuth();

  const [sessions, setSessions]         = useState<Session[]>([]);
  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [activeType, setActiveType]     = useState("All");
  const [activeMode, setActiveMode]     = useState<"all" | "online" | "on_location">("all");
  // Set of session IDs the current user has claimed
  const [claimed, setClaimed]           = useState<Set<string>>(new Set());
  // Per-card remaining count (overrides sessions[].seats_taken after a claim action)
  const [remaining, setRemaining]       = useState<Record<string, number>>({});
  const [claiming, setClaiming]         = useState<string | null>(null);

  const authHeader = session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeType !== "All") params.set("type", activeType);
      if (activeMode !== "all") params.set("mode", activeMode);

      const [sessRes, claimsRes] = await Promise.allSettled([
        fetch(`${API}/api/wellness-sessions?${params}`).then(r => r.json()),
        session
          ? fetch(`${API}/api/wellness-sessions/my-claims`, { headers: authHeader }).then(r => r.json())
          : Promise.resolve([]),
      ]);

      const sessData   = sessRes.status   === "fulfilled" ? sessRes.value   : [];
      const claimsData = claimsRes.status === "fulfilled" ? claimsRes.value : [];

      setSessions(Array.isArray(sessData) ? sessData : []);
      setClaimed(new Set(Array.isArray(claimsData) ? claimsData : []));
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType, activeMode, session?.access_token]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function handleClaim(sessionId: string) {
    if (!session) {
      Alert.alert("Sign in required", "Please sign in to claim a slot.");
      return;
    }
    setClaiming(sessionId);
    try {
      const res  = await fetch(`${API}/api/wellness-sessions/${sessionId}/claim`, {
        method: "POST", headers: authHeader,
      });
      const data = await res.json();
      if (res.ok) {
        setClaimed(prev => new Set([...prev, sessionId]));
        setRemaining(prev => ({ ...prev, [sessionId]: data.remaining }));
      } else {
        Alert.alert("Could not claim", data.error ?? "Try again.");
        if (data.remaining !== undefined) {
          setRemaining(prev => ({ ...prev, [sessionId]: data.remaining }));
        }
      }
    } catch {
      Alert.alert("Error", "Could not reach server.");
    } finally {
      setClaiming(null);
    }
  }

  async function handleUnclaim(sessionId: string) {
    setClaiming(sessionId);
    try {
      const res = await fetch(`${API}/api/wellness-sessions/${sessionId}/claim`, {
        method: "DELETE", headers: authHeader,
      });
      if (res.ok) {
        setClaimed(prev => { const n = new Set(prev); n.delete(sessionId); return n; });
        setRemaining(prev => {
          const cur = prev[sessionId] ?? 0;
          return { ...prev, [sessionId]: cur + 1 };
        });
      }
    } catch { /* ignore */ }
    finally { setClaiming(null); }
  }

  return (
    <SafeAreaView style={s.root}>
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
          sessions.map((sess) => (
            <SessionCard
              key={sess.id}
              session={sess}
              isClaimed={claimed.has(sess.id)}
              remainingOverride={remaining[sess.id]}
              isClaiming={claiming === sess.id}
              onClaim={() => handleClaim(sess.id)}
              onUnclaim={() => handleUnclaim(sess.id)}
            />
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionCard({
  session: sess, isClaimed, remainingOverride, isClaiming, onClaim, onUnclaim,
}: {
  session: Session;
  isClaimed: boolean;
  remainingOverride?: number;
  isClaiming: boolean;
  onClaim: () => void;
  onUnclaim: () => void;
}) {
  const isOnline   = sess.delivery_mode === "online";
  const totalSlots = isOnline ? 25 : 10;
  const slotsLeft  = remainingOverride ?? (sess.max_seats - sess.seats_taken);
  const full       = slotsLeft <= 0 && !isClaimed;
  const urgent     = !full && slotsLeft <= 3;

  function handleJoin() {
    if (sess.meeting_link) Linking.openURL(sess.meeting_link);
  }

  function handleMaps() {
    const addr = sess.address ?? sess.businesses?.address;
    if (addr) Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(addr)}`);
  }

  return (
    <View style={[card.wrap, isOnline ? card.wrapOnline : card.wrapStudio]}>
      <View style={[card.accent, isOnline ? card.accentOnline : card.accentStudio]} />

      <View style={card.body}>
        {/* Type + time row */}
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

        {/* Slots bar */}
        <View style={card.slotsRow}>
          <View style={card.slotsBar}>
            <View style={[
              card.slotsFill,
              { width: `${Math.round((slotsLeft / totalSlots) * 100)}%` as `${number}%` },
              full ? card.slotsFillFull : urgent ? card.slotsFillUrgent : card.slotsFillOk,
            ]} />
          </View>
          <Text style={[card.slotsText, full && card.slotsTextFull, urgent && !full && card.slotsTextUrgent]}>
            {full ? "Full" : `${slotsLeft} slot${slotsLeft !== 1 ? "s" : ""} left`}
          </Text>
        </View>

        {/* Location info */}
        {isOnline ? (
          <Text style={card.infoLabel}>🎥 {sess.platform_label} · {sess.language}</Text>
        ) : (
          <Text style={card.infoLabel} numberOfLines={1}>
            📍 {sess.address ?? sess.businesses?.address ?? "See business for address"}
          </Text>
        )}

        {/* Biz + actions */}
        <View style={card.bizRow}>
          {sess.businesses?.logo ? (
            <Image source={{ uri: sess.businesses.logo }} style={card.bizLogo} resizeMode="cover" />
          ) : (
            <View style={card.bizLogoPlaceholder}><Text style={{ fontSize: 14 }}>🏢</Text></View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={card.bizName} numberOfLines={1}>{sess.businesses?.name ?? "—"}</Text>
            <Text style={card.priceText}>₹{sess.price_inr.toLocaleString("en-IN")}/mo</Text>
          </View>

          <View style={card.actionCol}>
            {/* Claim / claimed button */}
            {isClaimed ? (
              <TouchableOpacity
                style={card.btnClaimed}
                onPress={onUnclaim}
                disabled={isClaiming}
                activeOpacity={0.8}
              >
                {isClaiming
                  ? <ActivityIndicator color={colors.emerald[700]} size="small" />
                  : <Text style={card.btnClaimedText}>✓ Claimed</Text>}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[card.btnClaim, full && card.btnClaimDisabled]}
                onPress={full ? undefined : onClaim}
                disabled={isClaiming || full}
                activeOpacity={full ? 1 : 0.8}
              >
                {isClaiming
                  ? <ActivityIndicator color={colors.white} size="small" />
                  : <Text style={card.btnClaimText}>{full ? "Full" : "Claim Slot"}</Text>}
              </TouchableOpacity>
            )}

            {/* Secondary action: Join or Map */}
            {isClaimed && isOnline && sess.meeting_link && (
              <TouchableOpacity style={card.btnSecondary} onPress={handleJoin} activeOpacity={0.8}>
                <Text style={card.btnSecondaryText}>Join Zoom</Text>
              </TouchableOpacity>
            )}
            {isClaimed && !isOnline && (
              <TouchableOpacity style={card.btnSecondary} onPress={handleMaps} activeOpacity={0.8}>
                <Text style={card.btnSecondaryText}>Get Directions</Text>
              </TouchableOpacity>
            )}
          </View>
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
  modeChip:         { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: "center", backgroundColor: colors.gray[100] },
  modeChipActive:   { backgroundColor: colors.brand[950] },
  modeChipText:     { fontSize: 12, fontWeight: "700", color: colors.gray[600] },
  modeChipTextActive: { color: colors.white },

  typeBar: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  typeChip: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray[200],
  },
  typeChipActive:     { backgroundColor: colors.emerald[700], borderColor: colors.emerald[700] },
  typeEmoji:          { fontSize: 14 },
  typeChipText:       { fontSize: 12, fontWeight: "700", color: colors.gray[600] },
  typeChipTextActive: { color: colors.white },

  list:      { paddingHorizontal: 14, paddingTop: 8 },
  empty:     { paddingTop: 64, alignItems: "center", gap: 8, paddingHorizontal: 32 },
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
  desc:    { fontSize: 12, color: colors.gray[500], lineHeight: 17, marginBottom: 8 },

  // Slots progress bar
  slotsRow:       { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  slotsBar:       { flex: 1, height: 4, backgroundColor: colors.gray[100], borderRadius: 2, overflow: "hidden" },
  slotsFill:      { height: 4, borderRadius: 2 },
  slotsFillOk:    { backgroundColor: colors.emerald[500] },
  slotsFillUrgent:{ backgroundColor: colors.amber[500] },
  slotsFillFull:  { backgroundColor: colors.gray[300] },
  slotsText:      { fontSize: 11, fontWeight: "700", color: colors.emerald[700], minWidth: 64 },
  slotsTextUrgent:{ color: colors.amber[600] },
  slotsTextFull:  { color: colors.gray[400] },

  infoLabel: { fontSize: 12, color: colors.gray[500], marginBottom: 8 },

  bizRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gray[100] },
  bizLogo: { width: 32, height: 32, borderRadius: 8 },
  bizLogoPlaceholder: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: colors.gray[100], alignItems: "center", justifyContent: "center",
  },
  bizName:   { fontSize: 12, fontWeight: "700", color: colors.gray[800] },
  priceText: { fontSize: 11, color: colors.gray[400], marginTop: 1 },

  actionCol: { alignItems: "flex-end", gap: 5 },

  btnClaim: {
    backgroundColor: colors.brand[600], paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, minWidth: 88, alignItems: "center",
  },
  btnClaimDisabled: { backgroundColor: colors.gray[200] },
  btnClaimText:     { color: colors.white, fontSize: 12, fontWeight: "800" },

  btnClaimed: {
    backgroundColor: colors.emerald[50], borderWidth: 1.5, borderColor: colors.emerald[400],
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, minWidth: 88, alignItems: "center",
  },
  btnClaimedText: { color: colors.emerald[700], fontSize: 12, fontWeight: "800" },

  btnSecondary: {
    backgroundColor: colors.gray[100], paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, minWidth: 88, alignItems: "center",
  },
  btnSecondaryText: { color: colors.gray[600], fontSize: 11, fontWeight: "700" },
});
