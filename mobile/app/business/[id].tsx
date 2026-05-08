import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Linking, Alert,
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

function formatPhone(phone: string) {
  return phone.replace(/(\+91)?(\d{5})(\d{5})/, "+91 $2 $3");
}

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [biz, setBiz] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("businesses")
      .select("id, name, industry, types, subtypes, address, phone, email, website, description, logo, photos, verified, status")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setBiz(data as Business | null);
        setLoading(false);
      });
  }, [id]);

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

  if (!biz) {
    return (
      <SafeAreaView style={s.root}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={s.centered}>
          <Text style={s.notFoundText}>Business not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categories = [
    ...(biz.types ?? []),
    ...(biz.subtypes ?? []),
  ];

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{biz.name}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Logo + name hero */}
        <View style={s.hero}>
          <View style={s.logoWrap}>
            {biz.logo ? (
              <Image source={{ uri: biz.logo }} style={s.logoImg} resizeMode="cover" />
            ) : (
              <Text style={s.logoEmoji}>🏢</Text>
            )}
          </View>
          <View style={s.heroText}>
            <View style={s.nameRow}>
              <Text style={s.bizName}>{biz.name}</Text>
              {biz.verified && (
                <View style={s.verifiedBadge}>
                  <Text style={s.verifiedText}>✓</Text>
                </View>
              )}
            </View>
            <Text style={s.industryText}>{biz.industry}</Text>
          </View>
        </View>

        {/* Category breadcrumb */}
        {categories.length > 0 && (
          <View style={s.catRow}>
            {categories.map((c, i) => (
              <View key={c} style={s.catPillRow}>
                {i > 0 && <Text style={s.catSep}>›</Text>}
                <View style={s.catPill}>
                  <Text style={s.catPillText}>{c}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Photos */}
        {biz.photos && biz.photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photosScroll} contentContainerStyle={s.photosContent}>
            {biz.photos.map((url, i) => (
              <Image key={i} source={{ uri: url }} style={s.photo} resizeMode="cover" />
            ))}
          </ScrollView>
        )}

        {/* Info cards */}
        <View style={s.cards}>

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
                <TouchableOpacity
                  style={s.contactRow}
                  onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(biz.address!)}`)}
                  activeOpacity={0.7}
                >
                  <Text style={s.contactIcon}>📍</Text>
                  <Text style={[s.contactText, s.contactLink]}>{biz.address}</Text>
                </TouchableOpacity>
              ) : null}
              {biz.phone ? (
                <TouchableOpacity
                  style={s.contactRow}
                  onPress={() => Linking.openURL(`tel:${biz.phone}`)}
                  activeOpacity={0.7}
                >
                  <Text style={s.contactIcon}>📞</Text>
                  <Text style={[s.contactText, s.contactLink]}>{formatPhone(biz.phone)}</Text>
                </TouchableOpacity>
              ) : null}
              {biz.email ? (
                <TouchableOpacity
                  style={s.contactRow}
                  onPress={() => Linking.openURL(`mailto:${biz.email}`)}
                  activeOpacity={0.7}
                >
                  <Text style={s.contactIcon}>✉️</Text>
                  <Text style={[s.contactText, s.contactLink]}>{biz.email}</Text>
                </TouchableOpacity>
              ) : null}
              {biz.website ? (
                <TouchableOpacity
                  style={s.contactRow}
                  onPress={() => Linking.openURL(biz.website!.startsWith("http") ? biz.website! : `https://${biz.website}`)}
                  activeOpacity={0.7}
                >
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

  hero: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 16, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  logoWrap: {
    width: 64, height: 64, borderRadius: 14,
    backgroundColor: colors.gray[100],
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1, borderColor: colors.gray[200],
  },
  logoImg: { width: 64, height: 64 },
  logoEmoji: { fontSize: 28 },
  heroText: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  bizName: { fontSize: 18, fontWeight: "800", color: colors.gray[900], flexShrink: 1 },
  verifiedBadge: { width: 18, height: 18, borderRadius: 9, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  verifiedText: { color: colors.white, fontSize: 10, fontWeight: "700" },
  industryText: { fontSize: 13, color: colors.gray[500], marginTop: 3 },

  catRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray[100] },
  catPillRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  catSep: { color: colors.gray[400], fontSize: 12 },
  catPill: { backgroundColor: colors.gray[100], borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3 },
  catPillText: { fontSize: 11, fontWeight: "600", color: colors.gray[600] },

  photosScroll: { backgroundColor: colors.white },
  photosContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  photo: { width: 200, height: 130, borderRadius: 12 },

  cards: { padding: 16, gap: 12 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  cardTitle: { fontSize: 12, fontWeight: "700", color: colors.gray[400], textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },
  cardBody: { fontSize: 14, color: colors.gray[700], lineHeight: 22 },

  contactRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 6 },
  contactIcon: { fontSize: 15, width: 20 },
  contactText: { flex: 1, fontSize: 14, color: colors.gray[700], lineHeight: 20 },
  contactLink: { color: "#2563eb" },
});
