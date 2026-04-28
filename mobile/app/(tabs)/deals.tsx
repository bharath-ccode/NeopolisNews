import { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";

const API = process.env.EXPO_PUBLIC_API_URL ?? "https://neopolis.news";

interface Deal {
  id: string;
  name: string;
  description: string | null;
  discount_percent: number | null;
  discount_label: string | null;
  start_date: string;
  end_date: string;
  image_url: string | null;
  businesses: {
    id: string;
    name: string;
    logo: string | null;
    industry: string;
    verified: boolean;
    address: string | null;
  } | null;
}

function daysLeft(endDate: string): { text: string; urgent: boolean } {
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
  if (days <= 0) return { text: "Ends today", urgent: true };
  if (days === 1) return { text: "Last day!", urgent: true };
  if (days <= 3) return { text: `${days} days left`, urgent: true };
  return { text: `Until ${new Date(endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`, urgent: false };
}

export default function DealsScreen() {
  const [deals, setDeals]           = useState<Deal[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDeals = useCallback(async () => {
    try {
      const res  = await fetch(`${API}/api/deals`);
      const data = await res.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch { setDeals([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadDeals(); }, [loadDeals]);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Local Deals</Text>
        <Text style={s.headerSub}>Today's offers from Neopolis businesses</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDeals(); }} tintColor={colors.brand[300]} />
        }
      >
        {loading ? (
          <View style={s.centerWrap}>
            <ActivityIndicator color={colors.brand[400]} size="large" />
          </View>
        ) : deals.length === 0 ? (
          <View style={s.centerWrap}>
            <Text style={s.emptyEmoji}>🛍️</Text>
            <Text style={s.emptyTitle}>No active deals right now</Text>
            <Text style={s.emptySub}>Check back soon — businesses post fresh offers regularly</Text>
          </View>
        ) : (
          deals.map(deal => <DealCard key={deal.id} deal={deal} />)
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DealCard({ deal }: { deal: Deal }) {
  const badge = deal.discount_percent ? `${deal.discount_percent}% OFF` : (deal.discount_label ?? "Special Offer");
  const { text: dlText, urgent } = daysLeft(deal.end_date);
  const biz = deal.businesses;

  return (
    <View style={s.cardWrap}>
      {/* Orange left accent bar */}
      <View style={s.accentBar} />

      <TouchableOpacity style={s.card} activeOpacity={0.85}>

        {/* Image or no-image gradient header */}
        {deal.image_url ? (
          <Image source={{ uri: deal.image_url }} style={s.cardImg} resizeMode="cover" />
        ) : (
          <View style={s.noImageHeader}>
            <Text style={s.noImageBadge}>{badge}</Text>
            <Text style={s.noImageName} numberOfLines={2}>{deal.name}</Text>
          </View>
        )}

        <View style={s.cardBody}>
          {/* Badge row */}
          <View style={s.badgeRow}>
            {deal.image_url && (
              <View style={s.discountBadge}>
                <Text style={s.discountText}>{badge}</Text>
              </View>
            )}
            <View style={[s.timerBadge, urgent && s.timerBadgeUrgent]}>
              <Text style={[s.timerText, urgent && s.timerTextUrgent]}>⏱ {dlText}</Text>
            </View>
          </View>

          {deal.image_url && (
            <Text style={s.dealName} numberOfLines={2}>{deal.name}</Text>
          )}
          {deal.description ? (
            <Text style={s.dealDesc} numberOfLines={2}>{deal.description}</Text>
          ) : null}

          {/* Coupon-style scissor separator */}
          {biz && (
            <>
              <View style={s.separator}>
                <View style={s.notchLeft} />
                <View style={s.dashedLine} />
                <Text style={s.scissors}>✂</Text>
                <View style={s.dashedLine} />
                <View style={s.notchRight} />
              </View>

              {/* Business info */}
              <View style={s.bizRow}>
                <View style={s.bizLogoWrap}>
                  {biz.logo ? (
                    <Image source={{ uri: biz.logo }} style={s.bizLogo} resizeMode="cover" />
                  ) : (
                    <Text style={{ fontSize: 18 }}>🏪</Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Text style={s.bizName} numberOfLines={1}>{biz.name}</Text>
                    {biz.verified && (
                      <View style={s.verifiedBadge}>
                        <Text style={s.verifiedText}>✓ Verified</Text>
                      </View>
                    )}
                  </View>
                  {biz.address ? (
                    <Text style={s.bizAddr} numberOfLines={1}>📍 {biz.address}</Text>
                  ) : null}
                </View>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const ORANGE = colors.orange[600];
const ORANGE_LIGHT = colors.orange[50];

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: "#f1f5f9" },

  header: { backgroundColor: colors.brand[950], paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: "800" },
  headerSub:   { color: colors.brand[400], fontSize: 13, marginTop: 2 },

  list: { paddingHorizontal: 14, paddingTop: 16 },

  centerWrap: { paddingTop: 80, alignItems: "center", gap: 12, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.gray[800], textAlign: "center" },
  emptySub:   { fontSize: 13, color: colors.gray[400], textAlign: "center" },

  // Card wrapper with left accent bar
  cardWrap: {
    flexDirection: "row",
    marginBottom: 18,
    borderRadius: 18,
    overflow: "hidden",
    // Orange shadow
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  accentBar: {
    width: 5,
    backgroundColor: ORANGE,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
  },

  // Image / no-image header
  cardImg: { width: "100%", height: 190 },
  noImageHeader: {
    backgroundColor: ORANGE,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 6,
  },
  noImageBadge: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  noImageName: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 26,
  },

  cardBody: { padding: 14 },

  // Badge row
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  discountBadge: {
    backgroundColor: ORANGE,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  discountText:  { color: colors.white, fontSize: 12, fontWeight: "900", letterSpacing: 0.5 },
  timerBadge: {
    backgroundColor: ORANGE_LIGHT,
    paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8,
    borderWidth: 1, borderColor: "#fed7aa",
  },
  timerBadgeUrgent: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  timerText:       { color: colors.orange[600], fontSize: 11, fontWeight: "700" },
  timerTextUrgent: { color: "#dc2626" },

  dealName: { fontSize: 17, fontWeight: "800", color: colors.gray[900], lineHeight: 23, marginBottom: 4 },
  dealDesc: { fontSize: 13, color: colors.gray[500], lineHeight: 18, marginBottom: 6 },

  // Coupon separator
  separator: {
    flexDirection: "row", alignItems: "center",
    marginVertical: 12, marginHorizontal: -14,
  },
  notchLeft:  { width: 12, height: 12, borderRadius: 6, backgroundColor: "#f1f5f9", marginLeft: -6 },
  notchRight: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#f1f5f9", marginRight: -6 },
  dashedLine: { flex: 1, height: 1, borderWidth: 1, borderColor: colors.gray[200], borderStyle: "dashed" },
  scissors:   { fontSize: 14, color: colors.gray[300], marginHorizontal: 6, transform: [{ rotate: "-90deg" }] },

  // Business info
  bizRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  bizLogoWrap: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.gray[100],
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  bizLogo:       { width: 38, height: 38 },
  bizName:       { fontSize: 13, fontWeight: "700", color: colors.gray[800] },
  verifiedBadge: { backgroundColor: "#dcfce7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  verifiedText:  { fontSize: 10, fontWeight: "700", color: "#16a34a" },
  bizAddr:       { fontSize: 11, color: colors.gray[400], marginTop: 2 },
});
