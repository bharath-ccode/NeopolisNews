import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/colors";

interface Cartoon {
  id: string;
  title: string;
  image_url: string | null;
  caption: string | null;
  artist_name: string | null;
  publish_date: string;
  is_contest: boolean;
  winner_name: string | null;
  winner_caption: string | null;
}

export default function CartoonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [cartoon, setCartoon] = useState<Cartoon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("daily_cartoons")
      .select("id, title, image_url, caption, artist_name, publish_date, is_contest, winner_name, winner_caption")
      .eq("id", id)
      .eq("status", "published")
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) { setError(true); setLoading(false); return; }
        setCartoon(data as Cartoon);
        setLoading(false);
      });
  }, [id]);

  const today = new Date().toISOString().split("T")[0];
  const isToday = cartoon?.publish_date === today;
  const openContest = cartoon?.is_contest && !cartoon?.winner_name;
  const hasWinner = cartoon?.is_contest && cartoon?.winner_name;

  const formattedDate = cartoon?.publish_date
    ? new Date(cartoon.publish_date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <SafeAreaView style={s.root}>
      <View style={s.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
          <Text style={s.backLabel}>Back</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Daily Cartoon</Text>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.brand[400]} size="large" />
        </View>
      ) : error || !cartoon ? (
        <View style={s.center}>
          <Text style={s.errorText}>Cartoon not found.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {/* Date label */}
          <View style={s.dateBanner}>
            <Text style={s.dateBannerText}>
              {isToday ? "✏️ Today in Neopolis" : `✏️ ${formattedDate}`}
            </Text>
          </View>

          {/* Cartoon image */}
          {cartoon.image_url && (
            <Image source={{ uri: cartoon.image_url }} style={s.cartoonImg} resizeMode="contain" />
          )}

          <View style={s.body}>
            <Text style={s.title}>{cartoon.title}</Text>

            {/* Caption / contest / winner */}
            {cartoon.caption ? (
              <View style={s.captionBox}>
                <Text style={s.captionQuote}>"{cartoon.caption}"</Text>
              </View>
            ) : openContest ? (
              <View style={[s.captionBox, s.contestBox]}>
                <Text style={s.contestTitle}>🏆 Caption Contest</Text>
                <Text style={s.contestBody}>
                  Submit your best caption and win 25 points! Open until voting closes.
                </Text>
              </View>
            ) : hasWinner ? (
              <View style={[s.captionBox, s.winnerBox]}>
                <Text style={s.winnerLabel}>🏆 Winning Caption</Text>
                {cartoon.winner_caption && (
                  <Text style={s.captionQuote}>"{cartoon.winner_caption}"</Text>
                )}
                <Text style={s.winnerName}>— {cartoon.winner_name}</Text>
              </View>
            ) : null}

            {/* Artist credit */}
            {cartoon.artist_name && (
              <View style={s.artistRow}>
                <Text style={s.artistIcon}>✏️</Text>
                <View>
                  <Text style={s.artistLabel}>Illustrated by</Text>
                  <Text style={s.artistName}>{cartoon.artist_name}</Text>
                </View>
              </View>
            )}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.white },
  navBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.brand[950],
  },
  backBtn:   { flexDirection: "row", alignItems: "center", gap: 6 },
  backArrow: { color: colors.white, fontSize: 20, lineHeight: 22 },
  backLabel: { color: colors.brand[200], fontSize: 14, fontWeight: "600" },
  navTitle:  { color: colors.white, fontSize: 15, fontWeight: "700" },
  center:    { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 15, color: colors.gray[400] },
  scrollContent: { paddingBottom: 24 },

  dateBanner: {
    backgroundColor: colors.brand[950], paddingHorizontal: 20, paddingBottom: 14,
  },
  dateBannerText: {
    color: colors.brand[300], fontSize: 12, fontWeight: "700", letterSpacing: 0.4,
  },

  cartoonImg: {
    width: "100%", height: 320, backgroundColor: colors.gray[50],
  },

  body:      { padding: 20 },
  title:     { fontSize: 20, fontWeight: "900", color: colors.gray[900], lineHeight: 27, marginBottom: 14 },

  captionBox: {
    backgroundColor: colors.gray[50], borderRadius: 12, padding: 16, marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: colors.brand[400],
  },
  captionQuote: { fontSize: 15, color: colors.gray[700], lineHeight: 22, fontStyle: "italic" },

  contestBox:  { borderLeftColor: "#d97706", backgroundColor: "#fffbeb" },
  contestTitle:{ fontSize: 14, fontWeight: "800", color: "#92400e", marginBottom: 6 },
  contestBody: { fontSize: 13, color: "#78350f", lineHeight: 19 },

  winnerBox:   { borderLeftColor: "#16a34a", backgroundColor: "#f0fdf4" },
  winnerLabel: { fontSize: 13, fontWeight: "800", color: "#15803d", marginBottom: 6 },
  winnerName:  { fontSize: 13, color: "#166534", marginTop: 6, fontWeight: "600" },

  artistRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.gray[100],
  },
  artistIcon:  { fontSize: 24 },
  artistLabel: { fontSize: 11, color: colors.gray[400], marginBottom: 2 },
  artistName:  { fontSize: 14, fontWeight: "700", color: colors.gray[800] },
});
