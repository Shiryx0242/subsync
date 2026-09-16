import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL_STORAGE_KEY = "@subsync_supabase_url";
const SUPABASE_ANON_STORAGE_KEY = "@subsync_supabase_anon_key";

// Default credentials from project
const DEFAULT_SUPABASE_URL = "https://gablqzjzghoeqmpumdzs.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhYmxxemp6Z2hvZXFtcHVtZHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MjAxNjAsImV4cCI6MjEwNTA5NjE2MH0.2bhCWmufJ-M21HeNgOH9VCeT9ortR_pbsmUjy9pt9aY";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Checks if a given URL is a valid Supabase URL format.
 */
const isValidSupabaseUrl = (url?: string): boolean => {
  if (!url) return false;
  if (url.includes("your-project.supabase.co")) return false;
  return url.startsWith("https://") && url.includes(".supabase.co");
};

/**
 * Checks if a given Anon Key is valid.
 */
const isValidAnonKey = (key?: string): boolean => {
  if (!key) return false;
  if (key === "your-anon-key-here") return false;
  return key.length > 20;
};

/**
 * Gets currently active Supabase credentials (from storage, env, or defaults).
 */
export const getSupabaseConfig = async (): Promise<{
  url: string;
  anonKey: string;
  isConfigured: boolean;
}> => {
  const storedUrl = await AsyncStorage.getItem(SUPABASE_URL_STORAGE_KEY);
  const storedKey = await AsyncStorage.getItem(SUPABASE_ANON_STORAGE_KEY);

  const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const finalUrl = storedUrl || envUrl || DEFAULT_SUPABASE_URL;
  const finalKey = storedKey || envKey || DEFAULT_SUPABASE_ANON_KEY;

  const isConfigured = isValidSupabaseUrl(finalUrl) && isValidAnonKey(finalKey);

  return {
    url: finalUrl,
    anonKey: finalKey,
    isConfigured,
  };
};

/**
 * Updates stored Supabase credentials and re-initializes client.
 */
export const saveSupabaseConfig = async (
  url: string,
  anonKey: string
): Promise<boolean> => {
  if (!isValidSupabaseUrl(url) || !isValidAnonKey(anonKey)) {
    return false;
  }

  await AsyncStorage.setItem(SUPABASE_URL_STORAGE_KEY, url);
  await AsyncStorage.setItem(SUPABASE_ANON_STORAGE_KEY, anonKey);
  supabaseInstance = null; // force re-init
  return true;
};

/**
 * Returns the active Supabase client instance (or creates one if configured).
 */
export const getSupabase = async (): Promise<SupabaseClient | null> => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const { url, anonKey, isConfigured } = await getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }

  supabaseInstance = createClient(url, anonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return supabaseInstance;
};
