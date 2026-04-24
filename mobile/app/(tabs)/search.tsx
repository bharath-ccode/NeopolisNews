import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";

export default function SearchScreen() {
  return (
    <SafeAreaView style={s.root}>
      <View style={s.center}>
        <Text style={s.emoji}>🔍</Text>
        <Text style={s.title}>Search</Text>
        <Text style={s.sub}>Find businesses, news, projects and more</Text>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.gray[50] },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emoji:  { fontSize: 48 },
  title:  { fontSize: 22, fontWeight: "800", color: colors.gray[900] },
  sub:    { fontSize: 14, color: colors.gray[400], textAlign: "center", paddingHorizontal: 32 },
});
