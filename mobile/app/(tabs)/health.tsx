import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";

const MEDICAL = [
  { emoji: "🏥", label: "Hospitals"          },
  { emoji: "🚑", label: "Ambulance Services" },
  { emoji: "🩺", label: "Clinics"            },
  { emoji: "🧪", label: "Diagnostics"        },
  { emoji: "💊", label: "Pharmacies"         },
];

const WELLNESS = [
  { emoji: "🧖", label: "Massage Spa"              },
  { emoji: "💪", label: "Gym"                      },
  { emoji: "🧘", label: "Yoga Studio"              },
  { emoji: "💃", label: "Dance Studio"             },
  { emoji: "🏋️", label: "Personal Trainers"        },
  { emoji: "🕯️", label: "Meditation & Mindfulness" },
  { emoji: "🥗", label: "Nutrition & Diet"         },
];

export default function HealthScreen() {
  return (
    <SafeAreaView style={s.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.headerTitle}>Health & Wellness</Text>
          <Text style={s.headerSub}>Find care and wellness in Neopolis</Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>MEDICAL</Text>
          <View style={s.grid}>
            {MEDICAL.map((item) => (
              <TouchableOpacity key={item.label} style={s.tile} activeOpacity={0.7}>
                <Text style={s.tileEmoji}>{item.emoji}</Text>
                <Text style={s.tileLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>WELLNESS</Text>
          <View style={s.grid}>
            {WELLNESS.map((item) => (
              <TouchableOpacity key={item.label} style={[s.tile, s.tileWellness]} activeOpacity={0.7}>
                <Text style={s.tileEmoji}>{item.emoji}</Text>
                <Text style={s.tileLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: colors.gray[50] },
  header:       { backgroundColor: colors.brand[950], padding: 20, paddingTop: 12 },
  headerTitle:  { color: colors.white, fontSize: 22, fontWeight: "800" },
  headerSub:    { color: colors.brand[400], fontSize: 13, marginTop: 4 },
  section:      { paddingHorizontal: 16, paddingTop: 20 },
  sectionLabel: { fontSize: 11, fontWeight: "800", color: colors.gray[400], letterSpacing: 1, marginBottom: 12 },
  grid:         { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "30%", backgroundColor: colors.white, borderRadius: 14,
    alignItems: "center", paddingVertical: 16, gap: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  tileWellness: { backgroundColor: "#faf5ff" },
  tileEmoji:    { fontSize: 26 },
  tileLabel:    { fontSize: 11, fontWeight: "700", color: colors.gray[700], textAlign: "center" },
});
