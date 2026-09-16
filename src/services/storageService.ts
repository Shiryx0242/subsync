import AsyncStorage from "@react-native-async-storage/async-storage";
import { Subscription } from "../types/subscription";
import { getSupabase } from "./supabase";

const STORAGE_KEY = "@subsync_subscriptions";

/**
 * Loads subscriptions for the current state (Cloud if authenticated, Local if guest).
 */
export const getStoredSubscriptions = async (userId?: string): Promise<Subscription[]> => {
  // If user is authenticated, try fetching from Supabase cloud first
  if (userId) {
    try {
      const client = await getSupabase();
      if (client) {
        const { data, error } = await client
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .order("billing_date", { ascending: true });

        if (!error && data) {
          const mapped: Subscription[] = data.map((row: any) => ({
            id: row.id,
            name: row.name,
            price: Number(row.price),
            billingDate: row.billing_date,
            brandColor: row.brand_color,
            category: row.category,
            logo: row.logo || undefined,
            cycle: row.cycle || "monthly",
          }));

          // Cache in local storage
          await AsyncStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(mapped));
          return mapped;
        }
      }
    } catch (cloudErr) {
      console.log("Failed to fetch from cloud, falling back to cache:", cloudErr);
      // Fallback to user-specific cache
      const cached = await AsyncStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (cached) return JSON.parse(cached);
    }
  }

  // Guest / Default local storage
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json !== null) {
      return JSON.parse(json);
    }
    return [];
  } catch (error) {
    console.error("Failed to load local subscriptions", error);
    return [];
  }
};

/**
 * Saves a subscription to Cloud (if authenticated) and Local storage.
 */
export const saveSubscription = async (
  subscription: Subscription,
  userId?: string
): Promise<Subscription[]> => {
  // 1. Cloud Save if authenticated
  if (userId) {
    try {
      const client = await getSupabase();
      if (client) {
        await client.from("subscriptions").upsert({
          id: subscription.id,
          user_id: userId,
          name: subscription.name,
          price: subscription.price,
          billing_date: subscription.billingDate,
          brand_color: subscription.brandColor,
          category: subscription.category,
          logo: subscription.logo ?? null,
          cycle: subscription.cycle,
        });
      }
    } catch (err) {
      console.error("Cloud save failed (will keep local copy):", err);
    }
  }

  // 2. Local Save / Cache
  const storageKey = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
  const current = await getStoredSubscriptions(userId);
  const existingIndex = current.findIndex((item) => item.id === subscription.id);

  let updated: Subscription[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = subscription;
  } else {
    updated = [subscription, ...current];
  }

  await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  return updated;
};

/**
 * Deletes a subscription from Cloud (if authenticated) and Local storage.
 */
export const deleteSubscription = async (
  id: string,
  userId?: string
): Promise<Subscription[]> => {
  // 1. Cloud Delete
  if (userId) {
    try {
      const client = await getSupabase();
      if (client) {
        await client.from("subscriptions").delete().eq("id", id).eq("user_id", userId);
      }
    } catch (err) {
      console.error("Cloud delete error:", err);
    }
  }

  // 2. Local Delete
  const storageKey = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
  const current = await getStoredSubscriptions(userId);
  const updated = current.filter((item) => item.id !== id);

  await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  return updated;
};
