import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const SUPABASE_URL  = process.env.EXPO_PUBLIC_SUPABASE_URL  ?? "";
const SUPABASE_ANON = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// SecureStore has a 2KB limit — chunk large values (Supabase tokens can be big)
const MAX_CHUNK = 1900;

const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") return localStorage.getItem(key);
    const count = await SecureStore.getItemAsync(`${key}_n`);
    if (!count) return SecureStore.getItemAsync(key);
    const parts = await Promise.all(
      Array.from({ length: parseInt(count) }, (_, i) =>
        SecureStore.getItemAsync(`${key}_${i}`)
      )
    );
    return parts.join("");
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") { localStorage.setItem(key, value); return; }
    if (value.length <= MAX_CHUNK) {
      await SecureStore.setItemAsync(key, value);
      return;
    }
    const n = Math.ceil(value.length / MAX_CHUNK);
    await SecureStore.setItemAsync(`${key}_n`, String(n));
    await Promise.all(
      Array.from({ length: n }, (_, i) =>
        SecureStore.setItemAsync(`${key}_${i}`, value.slice(i * MAX_CHUNK, (i + 1) * MAX_CHUNK))
      )
    );
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") { localStorage.removeItem(key); return; }
    const count = await SecureStore.getItemAsync(`${key}_n`);
    if (count) {
      await Promise.all([
        SecureStore.deleteItemAsync(`${key}_n`),
        ...Array.from({ length: parseInt(count) }, (_, i) =>
          SecureStore.deleteItemAsync(`${key}_${i}`)
        ),
      ]);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    storage,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});

