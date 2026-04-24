import { useEffect, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, RefreshControl, ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";
import { useAuth } from "@/context/AuthContext";

const API = process.env.EXPO_PUBLIC_API_URL ?? "https://neopolis.news";

type FeedFilter = "All" | "Deals" | "Buzz" | "News" | "Health";

interface FeedItem {
  id:      string;
  kind:    "deal" | "buzz" | "news" | "wellness";
  title:   string;
  sub:     string;
  badge:   string;
  badgeColor: string;
  image?:  string;
  biz?:    string;
  bizLogo?:string;
  meta?:   string;
}

const FILTER_PILLS: FeedFilter[] = ["All", "Deals", "Buzz", "News", "Health"];

const KIND_META = {
  deal:     { label: "DEAL",     bg: colors.orange[600]   },
  buzz:     { label: "BUZZ",     bg: colors.brand[600]    },
  news:     { label: "NEWS",     bg: colors.gray[700]     },
  wellness: { label: "WELLNESS", bg: "#7c3aed"            },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [filter, setFilter]       = useState<FeedFilter>("All");
  const [search, setSearch]       = useState("");
  const [feed, setFeed]           = useState<FeedItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather]     = useState("32°C · Partly Cloudy");

  const firstName = user?.user_metadata?.name?.split(" ")[0] ?? "there";

  const loadFeed = useCallback(async () => {
    try {
      const [dealsRes, buzzRes, newsRes] = await Promise.all([
        fetch(`${API}/api/deals`).then((r) => r.json()),
        fetch(`${API}/api/announcements`).then((r) => r.json()),
        fetch(`${API}/api/news?limit=10`).then((r) => r.json()),
      ]);

      const items: FeedItem[] = [];

      // Deals
      (Array.isArray(dealsRes) ? dealsRes : []).slice(0, 6).forEach((d: any) => {
        items.push({
          id:        `deal-${d.id}`,
          kind:      "deal",
          title:     d.name,
          sub:       d.description ?? "",
          badge:     d.discount_percent ? `${d.discount_percent}% OFF` : d.discount_label ?? "Offer",
          badgeColor: colors.orange[600],
          image:     d.image_url ?? undefined,
          biz:       d.businesses?.name,
          bizLogo:   d.businesses?.logo ?? undefined,
          meta:      `Until ${new Date(d.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        });
      });

      // Buzz / announcements
      const TYPE_COLORS: Record<string, string> = {
        opening: colors.green[600], hiring: colors.purple[600],
        new_arrival: "#2563eb",     notice: colors.amber[600],
        community: "#db2777",
      };
      const TYPE_LABELS: Record<string, string> = {
        opening: "OPENING", hiring: "HIRING", new_arrival: "NEW",
        notice: "NOTICE",  community: "COMMUNITY",
      };
      (Array.isArray(buzzRes) ? buzzRes : []).slice(0, 6).forEach((b: any) => {
        items.push({
          id:        `buzz-${b.id}`,
          kind:      "buzz",
          title:     b.title,
          sub:       b.body,
          badge:     TYPE_LABELS[b.type] ?? "BUZZ",
          badgeColor: TYPE_COLORS[b.type] ?? colors.brand[600],
          image:     b.image_url ?? undefined,
          biz:       b.businesses?.name,
          bizLogo:   b.businesses?.logo ?? undefined,
          meta:      timeAgo(b.created_at),
        });
      });

      // News articles
      const articles = Array.isArray(newsRes) ? newsRes : (newsRes?.articles ?? []);
      articles.slice(0, 6).forEach((a: any) => {
        items.push({
          id:        `news-${a.id}`,
          kind:      "news",
          title:     a.title,
          sub:       a.excerpt ?? "",
          badge:     a.tag ?? "NEWS",
          badgeColor: colors.gray[700],
          image:     a.image ?? undefined,
          meta:      a.date ? new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "",
        });
      });

      // Sort: interleave by type for variety
      const sorted = items.sort((a, b) => {
        const order = { deal: 0, buzz: 1, wellness: 2, news: 3 };
        return (order[a.kind] ?? 3) - (order[b.kind] ?? 3);
      });

      // Interleave more naturally
      const deals   = sorted.filter((i) => i.kind === "deal");
      const buzzes  = sorted.filter((i) => i.kind === "buzz");
      const news    = sorted.filter((i) => i.kind === "news");
      const mixed: FeedItem[] = [];
      const maxLen = Math.max(deals.length, buzzes.length, news.length);
      for (let i = 0; i < maxLen; i++) {
        if (deals[i])  mixed.push(deals[i]);
        if (buzzes[i]) mixed.push(buzzes[i]);
        if (news[i])   mixed.push(news[i]);
      }
      setFeed(mixed);
    } catch {
      // network unavailable in this env — show placeholder feed
      setFeed([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  function onRefresh() {
    setRefreshing(true);
    loadFeed();
  }

  const filtered = feed.filter((item) => {
    if (filter === "Deals")  return item.kind === "deal";
    if (filter === "Buzz")   return item.kind === "buzz";
    if (filter === "News")   return item.kind === "news";
    if (filter === "Health") return item.kind === "wellness";
    return true;
  }).filter((item) =>
    !search || item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={s.root}>
      {/* Top bar */}
      <View style={s.topBar}>
        <View>
          <Text style={s.greeting}>Hi {firstName} 👋</Text>
          <Text style={s.location}>📍 Neopolis</Text>
        </View>
        <View style={s.weatherBadge}>
          <Text style={s.weatherText}>⛅ {weather}</Text>
        </View>
      </View>

      {/* Search */}
      <View style={s.searchWrap}>
        <Text style={s.searchIcon}>🔍</Text>
        <TextInput
          style={s.searchInput}
          placeholder="Search deals, news, businesses…"
          placeholderTextColor={colors.gray[500]}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.pillsScroll}
        contentContainerStyle={s.pillsContent}
      >
        {FILTER_PILLS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[s.pill, filter === f && s.pillActive]}
            activeOpacity={0.7}
          >
            <Text style={[s.pillText, filter === f && s.pillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Feed */}
      <ScrollView
        style={s.feed}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand[300]}
          />
        }
      >
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator color={colors.brand[300]} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={s.emptyEmoji}>🏙️</Text>
            <Text style={s.emptyText}>
              {search ? "No results found" : "Nothing here yet — check back soon"}
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <TouchableOpacity style={s.card} activeOpacity={0.75}>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={s.cardImage}
          resizeMode="cover"
        />
      )}
      <View style={s.cardBody}>
        {/* Badge row */}
        <View style={s.cardBadgeRow}>
          <View style={[s.cardBadge, { backgroundColor: item.badgeColor }]}>
            <Text style={s.cardBadgeText}>{item.badge}</Text>
          </View>
          {item.meta ? (
            <Text style={s.cardMeta}>{item.meta}</Text>
          ) : null}
        </View>

        <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>
        {item.sub ? (
          <Text style={s.cardSub} numberOfLines={2}>{item.sub}</Text>
        ) : null}

        {/* Business row */}
        {item.biz && (
          <View style={s.bizRow}>
            {item.bizLogo ? (
              <Image source={{ uri: item.bizLogo }} style={s.bizLogo} />
            ) : (
              <View style={s.bizLogoPlaceholder}>
                <Text style={{ fontSize: 10 }}>🏪</Text>
              </View>
            )}
            <Text style={s.bizName}>{item.biz}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  topBar: {
    flexDirection:   "row",
    justifyContent:  "space-between",
    alignItems:      "center",
    paddingHorizontal: 16,
    paddingVertical:  12,
    backgroundColor: colors.brand[950],
  },
  greeting: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  location: {
    color: colors.brand[400],
    fontSize: 12,
    marginTop: 2,
  },
  weatherBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius:    100,
    paddingHorizontal: 12,
    paddingVertical:  6,
  },
  weatherText: {
    color:    colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  searchWrap: {
    flexDirection:   "row",
    alignItems:      "center",
    backgroundColor: colors.brand[900],
    marginHorizontal: 12,
    marginTop:       10,
    marginBottom:     4,
    borderRadius:    14,
    paddingHorizontal: 14,
    paddingVertical:  10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex:     1,
    color:    colors.white,
    fontSize: 14,
  },
  pillsScroll: {
    backgroundColor: colors.brand[950],
    paddingBottom:    8,
  },
  pillsContent: {
    paddingHorizontal: 12,
    paddingVertical:    8,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical:    7,
    borderRadius:      100,
    backgroundColor:  "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  pillActive: {
    backgroundColor: colors.brand[500],
    borderColor:     colors.brand[400],
  },
  pillText: {
    color:      colors.brand[400],
    fontSize:   13,
    fontWeight: "600",
  },
  pillTextActive: {
    color: colors.white,
  },
  feed: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  loadingWrap: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyWrap: {
    paddingTop: 80,
    alignItems: "center",
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    color:     colors.gray[400],
    fontSize:  14,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius:    16,
    marginBottom:    12,
    overflow:        "hidden",
    shadowColor:     colors.black,
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.06,
    shadowRadius:    4,
    elevation:       2,
  },
  cardImage: {
    width:  "100%",
    height: 160,
  },
  cardBody: {
    padding: 14,
  },
  cardBadgeRow: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            8,
    marginBottom:   8,
  },
  cardBadge: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      6,
  },
  cardBadgeText: {
    color:      colors.white,
    fontSize:   10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardMeta: {
    color:    colors.gray[400],
    fontSize: 11,
  },
  cardTitle: {
    color:      colors.gray[900],
    fontSize:   15,
    fontWeight: "700",
    lineHeight: 21,
    marginBottom: 4,
  },
  cardSub: {
    color:    colors.gray[500],
    fontSize: 13,
    lineHeight: 18,
  },
  bizRow: {
    flexDirection: "row",
    alignItems:    "center",
    gap:            8,
    marginTop:      10,
    paddingTop:     10,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  bizLogo: {
    width:        24,
    height:       24,
    borderRadius: 6,
  },
  bizLogoPlaceholder: {
    width:           24,
    height:          24,
    borderRadius:     6,
    backgroundColor: colors.gray[100],
    alignItems:      "center",
    justifyContent:  "center",
  },
  bizName: {
    color:      colors.gray[600],
    fontSize:   12,
    fontWeight: "600",
  },
});
