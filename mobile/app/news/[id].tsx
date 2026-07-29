import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { colors } from "@/lib/colors";

const API = process.env.EXPO_PUBLIC_API_URL ?? "https://neopolis.news";

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  tag: string | null;
  tag_color: string | null;
  author: string;
  date: string | null;
  read_time: string | null;
  image_url: string | null;
  source: string | null;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function ArticleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/articles/${id}`)
      .then(r => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(data => { setArticle(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [id]);

  return (
    <SafeAreaView style={s.root}>
      <View style={s.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Text style={s.backArrow}>←</Text>
          <Text style={s.backLabel}>News</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={colors.brand[400]} size="large" />
        </View>
      ) : error || !article ? (
        <View style={s.center}>
          <Text style={s.errorText}>Article not found.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          {article.image_url && (
            <Image source={{ uri: article.image_url }} style={s.hero} resizeMode="cover" />
          )}
          <View style={s.body}>
            <View style={s.metaRow}>
              {article.tag && (
                <View style={[s.badge, { backgroundColor: article.tag_color ?? colors.gray[700] }]}>
                  <Text style={s.badgeText}>{article.tag}</Text>
                </View>
              )}
              {article.read_time && (
                <Text style={s.metaText}>{article.read_time} read</Text>
              )}
            </View>
            <Text style={s.title}>{article.title}</Text>
            <View style={s.bylineRow}>
              <Text style={s.byline}>{article.author}</Text>
              {article.date && <Text style={s.bylineDate}> · {article.date}</Text>}
            </View>
            {article.excerpt && (
              <Text style={s.excerpt}>{article.excerpt}</Text>
            )}
            <View style={s.divider} />
            <Text style={s.content}>{stripHtml(article.content)}</Text>
            {article.source && (
              <Text style={s.source}>Source: {article.source}</Text>
            )}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: colors.white },
  navBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: colors.brand[950],
  },
  backBtn:   { flexDirection: "row", alignItems: "center", gap: 6 },
  backArrow: { color: colors.white, fontSize: 20, lineHeight: 22 },
  backLabel: { color: colors.brand[200], fontSize: 14, fontWeight: "600" },
  center:    { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 15, color: colors.gray[400] },
  scrollContent: { paddingBottom: 24 },
  hero:      { width: "100%", height: 220 },
  body:      { padding: 20 },
  metaRow:   { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  badge:     { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  metaText:  { fontSize: 12, color: colors.gray[400] },
  title: {
    fontSize: 22, fontWeight: "900", color: colors.gray[900],
    lineHeight: 30, marginBottom: 10,
  },
  bylineRow:   { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  byline:      { fontSize: 13, fontWeight: "600", color: colors.brand[600] },
  bylineDate:  { fontSize: 13, color: colors.gray[400] },
  excerpt: {
    fontSize: 15, color: colors.gray[600], lineHeight: 22,
    fontStyle: "italic", marginBottom: 14,
  },
  divider:   { height: 1, backgroundColor: colors.gray[100], marginBottom: 16 },
  content:   { fontSize: 15, color: colors.gray[800], lineHeight: 24 },
  source:    { fontSize: 12, color: colors.gray[400], marginTop: 20, fontStyle: "italic" },
});
