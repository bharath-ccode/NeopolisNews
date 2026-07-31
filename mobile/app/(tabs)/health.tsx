import { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";
import { getTypes } from "@/lib/businessDirectory";

const API = process.env.EXPO_PUBLIC_API_URL ?? "https://neopolis.news";
const INDUSTRY = "Health & Wellness";

// Types that fall under the Medical section; everything else → Wellness
const MEDICAL_TYPES = new Set(["Hospital", "Ambulance Services", "Clinics", "Diagnostics", "Pharmacies"]);

const TYPE_EMOJI: Record<string, string> = {
  "Hospital":           "🏥",
  "Ambulance Services": "🚑",
  "Clinics":            "🩺",
  "Diagnostics":        "🧪",
  "Pharmacies":         "💊",
  "Saloon":             "💇",
  "Gym & Fitness":      "💪",
  "Wellness":           "🧘",
  "Spa & Relaxation":   "🧖",
};

interface Business {
  id: string;
  name: string;
  industry: string;
  address: string | null;
  logo: string | null;
  verified: boolean;
}

export default function HealthScreen() {
  const allTypes    = getTypes(INDUSTRY);
  const medicalTypes  = allTypes.filter(t => MEDICAL_TYPES.has(t));
  const wellnessTypes = allTypes.filter(t => !MEDICAL_TYPES.has(t));

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [businesses, setBusinesses]     = useState<Business[]>([]);
  const [loading, setLoading]           = useState(false);

  const selectType = useCallback(async (type: string) => {
    if (selectedType === type) {
      setSelectedType(null);
      setBusinesses([]);
      return;
    }
    setSelectedType(type);
    setLoading(true);
    try {
      const res  = await fetch(`${API}/api/businesses?industry=${encodeURIComponent(INDUSTRY)}&type=${encodeURIComponent(type)}`);
      const data = await res.json();
      setBusinesses(Array.isArray(data) ? data : []);
    } catch {
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Health &amp; Wellness</Text>
          <Text style={s.headerSub}>Find care and wellness in Neopolis</Text>
        </View>

        <TypeSection
          label="MEDICAL"
          types={medicalTypes}
          selected={selectedType}
          onSelect={selectType}
          tileStyle={s.tileMedical}
        />

        <TypeSection
          label="WELLNESS"
          types={wellnessTypes}
          selected={selectedType}
          onSelect={selectType}
          tileStyle={s.tileWellness}
        />

        {/* Results */}
        {selectedType && (
          <View style={s.resultsSection}>
            <Text style={s.resultsLabel}>{selectedType} in Neopolis</Text>
            {loading ? (
              <ActivityIndicator color={colors.emerald[500]} style={{ marginTop: 20 }} />
            ) : businesses.length === 0 ? (
              <View style={s.emptyWrap}>
                <Text style={s.emptyText}>No listings found yet</Text>
              </View>
            ) : (
              businesses.map(b => <BizCard key={b.id} biz={b} />)
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TypeSection({
  label, types, selected, onSelect, tileStyle,
}: {
  label: string;
  types: string[];
  selected: string | null;
  onSelect: (t: string) => void;
  tileStyle: object;
}) {
  if (types.length === 0) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionLabel}>{label}</Text>
      <View style={s.grid}>
        {types.map((type) => (
          <TouchableOpacity
            key={type}
            style={[s.tile, tileStyle, selected === type && s.tileActive]}
            onPress={() => onSelect(type)}
            activeOpacity={0.7}
          >
            <Text style={s.tileEmoji}>{TYPE_EMOJI[type] ?? "🏥"}</Text>
            <Text style={[s.tileLabel, selected === type && s.tileLabelActive]} numberOfLines={2}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function BizCard({ biz }: { biz: Business }) {
  return (
    <View style={s.bizCard}>
      <View style={s.bizLogoWrap}>
        {biz.logo ? (
          <Image source={{ uri: biz.logo }} style={s.bizLogo} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 22 }}>🏥</Text>
        )}
      </View>
      <View style={s.bizInfo}>
        <View style={s.bizNameRow}>
          <Text style={s.bizName} numberOfLines={1}>{biz.name}</Text>
          {biz.verified && (
            <View style={s.verifiedBadge}>
              <Text style={s.verifiedText}>✓</Text>
            </View>
          )}
        </View>
        {biz.address ? <Text style={s.bizAddress} numberOfLines={1}>📍 {biz.address}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.gray[50] },
  header:       { backgroundColor: colors.brand[950], padding: 20, paddingTop: 12 },
  headerTitle:  { color: colors.white, fontSize: 22, fontWeight: "800" },
  headerSub:    { color: colors.emerald[400], fontSize: 13, marginTop: 4 },

  section:      { paddingHorizontal: 16, paddingTop: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: colors.gray[400], letterSpacing: 1, marginBottom: 12 },
  grid:         { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  tile: {
    width: "30%", backgroundColor: colors.white, borderRadius: 14,
    alignItems: "center", paddingVertical: 16, paddingHorizontal: 4, gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
    borderWidth: 2, borderColor: "transparent",
  },
  tileMedical:  { backgroundColor: colors.white },
  tileWellness: { backgroundColor: "#faf5ff" },
  tileActive:   { borderColor: colors.emerald[600] },
  tileEmoji:    { fontSize: 26 },
  tileLabel: {
    fontSize: 11, fontWeight: "700", color: colors.gray[700],
    textAlign: "center",
  },
  tileLabelActive: { color: colors.emerald[700] },

  resultsSection: { paddingHorizontal: 16, paddingTop: 20 },
  resultsLabel:   { fontSize: 13, fontWeight: "800", color: colors.gray[700], marginBottom: 12 },

  emptyWrap: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 13, color: colors.gray[400] },

  bizCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.white,
    marginBottom: 8, padding: 12, borderRadius: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  bizLogoWrap: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: colors.gray[100],
    alignItems: "center", justifyContent: "center", overflow: "hidden",
  },
  bizLogo:     { width: 48, height: 48 },
  bizInfo:     { flex: 1 },
  bizNameRow:  { flexDirection: "row", alignItems: "center", gap: 6 },
  bizName:     { fontSize: 15, fontWeight: "700", color: colors.gray[900], flex: 1 },
  verifiedBadge: { backgroundColor: colors.brand[600], borderRadius: 100, paddingHorizontal: 6, paddingVertical: 2 },
  verifiedText:  { color: colors.white, fontSize: 10, fontWeight: "800" },
  bizAddress:    { fontSize: 12, color: colors.gray[400], marginTop: 2 },
});
