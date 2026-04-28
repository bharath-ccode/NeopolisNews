import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { colors } from "@/lib/colors";

const GENDER_OPTIONS = [
  { value: "male",              label: "Male" },
  { value: "female",            label: "Female" },
  { value: "non_binary",        label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

function SectionStatus({ saving, saved, error }: { saving: boolean; saved: boolean; error: string }) {
  if (saving || (!saved && !error)) return null;
  return (
    <Text style={saved ? s.savedText : s.errorText}>
      {saved ? "✓ Saved" : error}
    </Text>
  );
}

function Label({ text, required, note }: { text: string; required?: boolean; note?: string }) {
  return (
    <Text style={s.label}>
      {text}{required ? <Text style={s.required}> *</Text> : null}
      {note ? <Text style={s.labelNote}>  {note}</Text> : null}
    </Text>
  );
}

function SaveButton({ onPress, saving, label }: { onPress: () => void; saving: boolean; label: string }) {
  return (
    <TouchableOpacity style={s.saveBtn} onPress={onPress} disabled={saving} activeOpacity={0.8}>
      {saving
        ? <ActivityIndicator color={colors.white} size="small" />
        : <Text style={s.saveBtnText}>{label}</Text>}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, profile, updateProfile, changePassword, signOut } = useAuth();

  const email = user?.email ?? "";

  // ── Forum Identity ─────────────────────────────────────────────────────────
  const [screenName, setScreenName] = useState(profile?.screen_name ?? "");
  const [idSaving, setIdSaving] = useState(false);
  const [idSaved,  setIdSaved]  = useState(false);
  const [idError,  setIdError]  = useState("");

  async function saveIdentity() {
    setIdError(""); setIdSaved(false);
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(screenName.trim())) {
      setIdError("3–20 chars: letters, numbers, underscores only."); return;
    }
    setIdSaving(true);
    try {
      await updateProfile({ screen_name: screenName.trim() });
      setIdSaved(true);
      setTimeout(() => setIdSaved(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Save failed.";
      setIdError(msg.includes("unique") || msg.includes("duplicate")
        ? "That screen name is already taken."
        : msg);
    } finally { setIdSaving(false); }
  }

  // ── Personal Details ───────────────────────────────────────────────────────
  const [name,         setName]         = useState(profile?.name ?? "");
  const [age,          setAge]          = useState(profile?.age ? String(profile.age) : "");
  const [gender,       setGender]       = useState(profile?.gender ?? "");
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailSaved,  setDetailSaved]  = useState(false);
  const [detailError,  setDetailError]  = useState("");

  async function saveDetails() {
    setDetailError(""); setDetailSaved(false);
    if (!name.trim()) { setDetailError("Full name cannot be blank."); return; }
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setDetailError("Please enter a valid age."); return;
    }
    if (!gender) { setDetailError("Please select your gender."); return; }
    setDetailSaving(true);
    try {
      await updateProfile({ name: name.trim(), age: ageNum, gender });
      setDetailSaved(true);
      setTimeout(() => setDetailSaved(false), 3000);
    } catch (err: unknown) {
      setDetailError(err instanceof Error ? err.message : "Save failed.");
    } finally { setDetailSaving(false); }
  }

  // ── Security ───────────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [pwSaving,    setPwSaving]    = useState(false);
  const [pwSaved,     setPwSaved]     = useState(false);
  const [pwError,     setPwError]     = useState("");

  async function savePassword() {
    setPwError(""); setPwSaved(false);
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true);
    try {
      await changePassword(newPassword);
      setNewPassword("");
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Save failed.");
    } finally { setPwSaving(false); }
  }

  const displayInitial = (screenName || name || email || "R")[0].toUpperCase();

  return (
    <SafeAreaView style={s.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Avatar header */}
          <View style={s.header}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{displayInitial}</Text>
            </View>
            <Text style={s.headerName}>{name || "—"}</Text>
            {screenName ? (
              <Text style={s.screenName}>@{screenName}</Text>
            ) : null}
            <Text style={s.headerEmail}>{email}</Text>
          </View>

          {/* ── Forum Identity ──────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Forum Identity</Text>
            <Text style={s.cardSub}>How you appear in forum posts and reviews.</Text>

            <View style={s.infoBanner}>
              <Text style={s.infoBannerText}>
                Your <Text style={{ fontWeight: "700" }}>screen name</Text> is the only name others ever see — your real name stays private.
              </Text>
            </View>

            <Label text="Screen name" required note="3–20 chars" />
            <View style={s.inputRow}>
              <Text style={s.inputPrefix}>@</Text>
              <TextInput
                style={[s.input, s.inputFlex]}
                value={screenName}
                onChangeText={t => setScreenName(t.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20))}
                placeholder="e.g. neopolis_resident"
                placeholderTextColor={colors.gray[400]}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {screenName.length >= 3 && (
              <Text style={s.previewText}>You will appear as @{screenName}</Text>
            )}

            <SectionStatus saving={idSaving} saved={idSaved} error={idError} />
            <SaveButton onPress={saveIdentity} saving={idSaving} label="Save Screen Name" />
          </View>

          {/* ── Personal Details ──────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Personal Details</Text>
            <Text style={s.cardSub}>Kept private — used for community analytics only.</Text>

            <Label text="Full name" required />
            <TextInput
              style={s.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={colors.gray[400]}
            />

            <Label text="Age" required />
            <TextInput
              style={s.input}
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 34"
              placeholderTextColor={colors.gray[400]}
              keyboardType="numeric"
              maxLength={3}
            />

            <Label text="Gender" required />
            <View style={s.genderRow}>
              {GENDER_OPTIONS.map(o => (
                <TouchableOpacity
                  key={o.value}
                  style={[s.genderChip, gender === o.value && s.genderChipActive]}
                  onPress={() => setGender(o.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.genderChipText, gender === o.value && s.genderChipTextActive]}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <SectionStatus saving={detailSaving} saved={detailSaved} error={detailError} />
            <SaveButton onPress={saveDetails} saving={detailSaving} label="Save Personal Details" />
          </View>

          {/* ── Contact ───────────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Contact Information</Text>
            {email ? (
              <>
                <Label text="Email address" />
                <TextInput
                  style={[s.input, s.inputDisabled]}
                  value={email}
                  editable={false}
                />
                <Text style={s.hintText}>Managed by your sign-in provider — cannot be changed here.</Text>
              </>
            ) : null}
          </View>

          {/* ── Security ──────────────────────────────────────────── */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Security</Text>

            <Label text="New password" note="min 8 characters" />
            <View style={s.inputRow}>
              <TextInput
                style={[s.input, s.inputFlex]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={colors.gray[400]}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn}>
                <Text style={s.eyeText}>{showPw ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>

            <SectionStatus saving={pwSaving} saved={pwSaved} error={pwError} />
            <SaveButton onPress={savePassword} saving={pwSaving} label="Change Password" />
          </View>

          {/* ── Sign Out ──────────────────────────────────────────── */}
          <TouchableOpacity style={s.signOut} onPress={signOut} activeOpacity={0.8}>
            <Text style={s.signOutText}>Sign Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.gray[50] },
  scroll: { padding: 16, paddingBottom: 40 },

  header:      { alignItems: "center", paddingVertical: 24 },
  avatar:      {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.brand[600], alignItems: "center", justifyContent: "center", marginBottom: 12,
  },
  avatarText:  { color: colors.white, fontSize: 32, fontWeight: "800" },
  headerName:  { fontSize: 20, fontWeight: "800", color: colors.gray[900] },
  screenName:  { fontSize: 15, fontWeight: "700", color: colors.brand[600], marginTop: 2 },
  headerEmail: { fontSize: 13, color: colors.gray[400], marginTop: 4 },

  card:    {
    backgroundColor: colors.white, borderRadius: 16,
    padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: colors.gray[100],
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: colors.gray[900], marginBottom: 2 },
  cardSub:   { fontSize: 12, color: colors.gray[400], marginBottom: 12 },

  infoBanner: {
    backgroundColor: colors.amber[50], borderWidth: 1, borderColor: "#fde68a",
    borderRadius: 10, padding: 10, marginBottom: 14,
  },
  infoBannerText: { fontSize: 12, color: "#92400e", lineHeight: 17 },

  label:     { fontSize: 11, fontWeight: "700", color: colors.gray[500], marginBottom: 6, marginTop: 10 },
  required:  { color: "#ef4444" },
  labelNote: { fontWeight: "400", color: colors.gray[400] },

  input: {
    borderWidth: 1, borderColor: colors.gray[200], borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: colors.gray[900], backgroundColor: colors.white,
    marginBottom: 4,
  },
  inputDisabled: { backgroundColor: colors.gray[50], color: colors.gray[400] },
  inputFlex:     { flex: 1, marginBottom: 0 },
  inputRow:      { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  inputPrefix:   { fontSize: 18, color: colors.gray[400], paddingBottom: 2 },

  previewText: { fontSize: 11, color: colors.brand[600], marginBottom: 4 },
  hintText:    { fontSize: 11, color: colors.gray[400], marginTop: 2 },

  genderRow:         { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  genderChip:        {
    borderWidth: 1, borderColor: colors.gray[200], borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  genderChipActive:  { borderColor: colors.brand[600], backgroundColor: colors.brand[50] },
  genderChipText:    { fontSize: 13, color: colors.gray[600] },
  genderChipTextActive: { color: colors.brand[700], fontWeight: "700" },

  eyeBtn:  { paddingHorizontal: 10 },
  eyeText: { fontSize: 13, color: colors.brand[600], fontWeight: "600" },

  saveBtn:     {
    backgroundColor: colors.brand[600], borderRadius: 12,
    paddingVertical: 12, alignItems: "center", marginTop: 10,
  },
  saveBtnText: { color: colors.white, fontWeight: "700", fontSize: 14 },

  savedText: { fontSize: 12, color: colors.green[600], marginTop: 6 },
  errorText: { fontSize: 12, color: "#dc2626", marginTop: 6 },

  signOut:     {
    backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca",
    paddingVertical: 14, borderRadius: 14, alignItems: "center", marginTop: 8,
  },
  signOutText: { color: "#dc2626", fontWeight: "700", fontSize: 15 },
});
