import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/colors";

export default function WelcomeScreen() {
  return (
    <ImageBackground
      source={require("../../assets/banner.png")}
      style={s.bg}
      resizeMode="cover"
    >
      <View style={s.overlay} />
      <SafeAreaView style={s.root}>
        <View style={s.inner}>

          {/* Brand */}
          <View style={s.brandWrap}>
            <Image source={require("../../assets/logo_transbg.png")} style={s.logoImg} resizeMode="contain" />
          </View>

          {/* Feature pills */}
          <View style={s.pillsWrap}>
            {[
              { emoji: "🛍️", label: "Local Deals" },
              { emoji: "🔔", label: "Announcements" },
              { emoji: "📰", label: "Neighbourhood News" },
              { emoji: "❤️", label: "Health & Wellness" },
              { emoji: "🏠", label: "For Sale & Rent" },
            ].map((f) => (
              <View key={f.label} style={s.pill}>
                <Text style={s.pillEmoji}>{f.emoji}</Text>
                <Text style={s.pillLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* CTAs */}
          <View style={s.actions}>
            <TouchableOpacity
              style={s.btnPrimary}
              onPress={() => router.push("/(auth)/signup")}
              activeOpacity={0.85}
            >
              <Text style={s.btnPrimaryText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.btnSecondary}
              onPress={() => router.push("/(auth)/login")}
              activeOpacity={0.85}
            >
              <Text style={s.btnSecondaryText}>Sign In</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.legal}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,10,30,0.68)",
  },
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  brandWrap: {
    alignItems: "center",
    marginTop: 16,
  },
  logoImg: {
    width: 400,
    height: 400,
  },
  pillsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 16,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  actions: {
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: colors.amber[600],
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: colors.amber[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  btnSecondary: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  legal: {
    textAlign: "center",
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    lineHeight: 16,
  },
});
