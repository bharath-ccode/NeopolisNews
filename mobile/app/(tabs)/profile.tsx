import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/lib/colors";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const name = user?.user_metadata?.name ?? user?.email ?? "Resident";

  return (
    <SafeAreaView style={s.root}>
      <View style={s.inner}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{name[0]?.toUpperCase() ?? "R"}</Text>
        </View>
        <Text style={s.name}>{name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.divider} />
        <TouchableOpacity style={s.signOut} onPress={signOut} activeOpacity={0.8}>
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.gray[50] },
  inner:       { flex: 1, alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  avatar:      {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.brand[600], alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  avatarText:  { color: colors.white, fontSize: 32, fontWeight: "800" },
  name:        { fontSize: 20, fontWeight: "800", color: colors.gray[900] },
  email:       { fontSize: 14, color: colors.gray[400], marginTop: 4 },
  divider:     { width: "100%", height: 1, backgroundColor: colors.gray[100], marginVertical: 32 },
  signOut:     {
    backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca",
    paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14,
  },
  signOutText: { color: "#dc2626", fontWeight: "700", fontSize: 15 },
});
