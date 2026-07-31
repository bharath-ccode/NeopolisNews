import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image, ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/lib/colors";

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  async function handleSignup() {
    if (!name.trim() || !email.trim() || password.length < 6) return;
    setLoading(true);
    setError("");
    const err = await signUp(email.trim().toLowerCase(), password, name.trim());
    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
    }
  }

  if (done) {
    return (
      <ImageBackground
        source={require("../../assets/banner.png")}
        style={s.bg}
        resizeMode="cover"
      >
        <View style={s.overlay} />
        <SafeAreaView style={s.root}>
          <View style={s.doneWrap}>
            <Text style={s.doneEmoji}>✉️</Text>
            <Text style={s.doneTitle}>Check your email</Text>
            <Text style={s.doneSub}>
              We&apos;ve sent a confirmation link to{"\n"}
              <Text style={s.doneEmail}>{email}</Text>
            </Text>
            <TouchableOpacity
              style={s.btnPrimary}
              onPress={() => router.replace("/(auth)/login")}
              activeOpacity={0.85}
            >
              <Text style={s.btnText}>Go to Sign In</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  const valid = name.trim().length > 0 && email.trim().length > 0 && password.length >= 6;

  return (
    <ImageBackground
      source={require("../../assets/banner.png")}
      style={s.bg}
      resizeMode="cover"
    >
      <View style={s.overlay} />
      <SafeAreaView style={s.root}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.inner}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
              <Text style={s.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={s.header}>
              <Image source={require("../../assets/logo_transbg.png")} style={s.logo} resizeMode="contain" />
              <Text style={s.title}>Join Neopolis</Text>
              <Text style={s.subtitle}>Create your free neighbourhood account</Text>
            </View>

            <View style={s.card}>
              <View style={s.form}>
                <View style={s.field}>
                  <Text style={s.label}>Full Name</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Priya Sharma"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    autoCapitalize="words"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <View style={s.field}>
                  <Text style={s.label}>Email</Text>
                  <TextInput
                    style={s.input}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={s.field}>
                  <Text style={s.label}>Password</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={handleSignup}
                    returnKeyType="done"
                  />
                </View>

                {error ? (
                  <View style={s.errorBox}>
                    <Text style={s.errorText}>{error}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[s.btnPrimary, (!valid || loading) && s.btnDisabled]}
                  onPress={handleSignup}
                  disabled={!valid || loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} />
                  ) : (
                    <Text style={s.btnText}>Create Account</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={s.footer}>
                <Text style={s.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace("/(auth)/login")} activeOpacity={0.7}>
                  <Text style={s.footerLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    backgroundColor: "rgba(5,10,30,0.72)",
  },
  root: {
    flex: 1,
    backgroundColor: "transparent",
  },
  inner: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginBottom: 8,
  },
  backText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontWeight: "600",
  },
  header: {
    alignItems: "flex-start",
    marginBottom: 28,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 24,
    padding: 24,
  },
  form: {
    gap: 18,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.white,
  },
  errorBox: {
    backgroundColor: "rgba(239,68,68,0.15)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.3)",
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 13,
    fontWeight: "500",
  },
  btnPrimary: {
    backgroundColor: colors.amber[600],
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
    shadowColor: colors.amber[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 14,
  },
  footerLink: {
    color: colors.amber[400],
    fontSize: 14,
    fontWeight: "700",
  },
  doneWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  doneEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  doneTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.white,
    textAlign: "center",
  },
  doneSub: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 22,
  },
  doneEmail: {
    color: colors.amber[400],
    fontWeight: "700",
  },
});
