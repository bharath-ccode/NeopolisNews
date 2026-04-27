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
  const [deals, setDeals]         = useState<Deal[]>([]);
  const [loading, setLoading]     = useState(true);
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
  const badge = deal.discount_percent ? `${deal.discount_percent}% OFF` : (deal.discount_label ?? "Offer");
  const { text: dlText, urgent } = daysLeft(deal.end_date);
  const biz = deal.businesses;

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.8}>
      {deal.image_url && (
        <Image source={{ uri: deal.image_url }} style={s.cardImg} resizeMode="cover" />
      )}

      <View style={s.cardBody}>
        {/* Badge + urgency */}
        <View style={s.badgeRow}>
          <View style={s.discountBadge}>
            <Text style={s.discountText}>{badge}</Text>
          </View>
          <Text style={[s.daysLeft, urgent && s.daysLeftUrgent]}>{dlText}</Text>
        </View>

        <Text style={s.dealName} numberOfLines={2}>{deal.name}</Text>
        {deal.description ? (
          <Text style={s.dealDesc} numberOfLines={2}>{deal.description}</Text>
        ) : null}

        {/* Business info */}
        {biz && (
          <View style={s.bizRow}>
            <View style={s.bizLogoWrap}>
              {biz.logo ? (
                <Image source={{ uri: biz.logo }} style={s.bizLogo} resizeMode="cover" />
              ) : (
                <Text style={{ fontSize: 16 }}>🏪</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text style={s.bizName} numberOfLines={1}>{biz.name}</Text>
                {biz.verified && <Text style={s.verified}>✓</Text>}
              </View>
              {biz.address ? (
                <Text style={s.bizAddr} numberOfLines={1}>📍 {biz.address}</Text>
              ) : null}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.gray[50] },

  header: { backgroundColor: colors.brand[950], paddingHorizontal: 16, paddingVertical: 16 },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: "800" },
  headerSub:   { color: colors.brand[400], fontSize: 13, marginTop: 2 },

  list: { paddingHorizontal: 12, paddingTop: 14 },

  centerWrap: { paddingTop: 80, alignItems: "center", gap: 12, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.gray[800], textAlign: "center" },
  emptySub:   { fontSize: 13, color: colors.gray[400], textAlign: "center" },

  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImg:  { width: "100%", height: 190 },
  cardBody: { padding: 14 },

  badgeRow:      { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  discountBadge: { backgroundColor: colors.orange[600], paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  discountText:  { color: colors.white, fontSize: 13, fontWeight: "900", letterSpacing: 0.3 },
  daysLeft:      { fontSize: 12, color: colors.gray[400], fontWeight: "600" },
  daysLeftUrgent:{ color: colors.orange[600] },

  dealName: { fontSize: 17, fontWeight: "800", color: colors.gray[900], lineHeight: 23, marginBottom: 4 },
  dealDesc: { fontSize: 13, color: colors.gray[500], lineHeight: 18, marginBottom: 10 },

  bizRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.gray[100],
  },
  bizLogoWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.gray[100],
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  bizLogo:   { width: 36, height: 36 },
  bizName:   { fontSize: 13, fontWeight: "700", color: colors.gray[700] },
  verified:  { fontSize: 11, color: colors.brand[500], fontWeight: "800" },
  bizAddr:   { fontSize: 11, color: colors.gray[400], marginTop: 1 },
});
