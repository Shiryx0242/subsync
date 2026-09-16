import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, Session } from "@supabase/supabase-js";
import {
  getSupabase,
  getSupabaseConfig,
  saveSupabaseConfig,
} from "../services/supabase";

const LOCAL_CURRENT_USER_KEY = "@subsync_current_user";
const LOCAL_USERS_KEY = "@subsync_local_users_db";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  guestMode: boolean;
  isConfigured: boolean;
  configUrl: string;
  configKey: string;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  updateConfig: (url: string, anonKey: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [configUrl, setConfigUrl] = useState("");
  const [configKey, setConfigKey] = useState("");

  const checkConfigAndSession = async () => {
    setLoading(true);
    try {
      const config = await getSupabaseConfig();
      setIsConfigured(config.isConfigured);
      setConfigUrl(config.url);
      setConfigKey(config.anonKey);

      // 1. If Supabase is configured, check cloud session
      if (config.isConfigured) {
        const client = await getSupabase();
        if (client) {
          const { data } = await client.auth.getSession();
          if (data.session) {
            setSession(data.session);
            setUser(data.session.user);
            setLoading(false);
            return;
          }

          // Listen to auth changes
          client.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession);
            setUser(newSession?.user ?? null);
            if (newSession?.user) {
              setGuestMode(false);
            }
          });
        }
      }

      // 2. Check local user session
      const savedUserJson = await AsyncStorage.getItem(LOCAL_CURRENT_USER_KEY);
      if (savedUserJson) {
        const localUser = JSON.parse(savedUserJson);
        setUser(localUser);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConfigAndSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    // If Supabase is configured, use Supabase Auth
    if (isConfigured) {
      const client = await getSupabase();
      if (client) {
        const { data, error } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { error: error.message };
        }

        setSession(data.session);
        setUser(data.user);
        setGuestMode(false);
        await AsyncStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(data.user));
        return {};
      }
    }

    // Local authentication fallback (works without needing Supabase setup)
    try {
      const usersDbJson = await AsyncStorage.getItem(LOCAL_USERS_KEY);
      const usersDb: Record<string, { id: string; email: string; password: string }> =
        usersDbJson ? JSON.parse(usersDbJson) : {};

      const existingUser = usersDb[email.toLowerCase()];
      if (existingUser) {
        if (existingUser.password === password) {
          const userObj = {
            id: existingUser.id,
            email: existingUser.email,
            aud: "authenticated",
            role: "authenticated",
            app_metadata: {},
            user_metadata: {},
            created_at: new Date().toISOString(),
          } as unknown as User;

          setUser(userObj);
          setGuestMode(false);
          await AsyncStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(userObj));
          return {};
        } else {
          return { error: "Incorrect password. Please try again." };
        }
      }

      // If user doesn't exist locally, create and log them in
      const newLocalId = `usr_${Date.now()}`;
      const newUser = { id: newLocalId, email: email.toLowerCase(), password };
      usersDb[email.toLowerCase()] = newUser;
      await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(usersDb));

      const userObj = {
        id: newLocalId,
        email: email.toLowerCase(),
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      } as unknown as User;

      setUser(userObj);
      setGuestMode(false);
      await AsyncStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(userObj));
      return {};
    } catch (err: any) {
      return { error: err?.message || "Failed to sign in." };
    }
  };

  const signUp = async (
    email: string,
    password: string
  ): Promise<{ error?: string; message?: string }> => {
    // If Supabase is configured, use Supabase Auth
    if (isConfigured) {
      const client = await getSupabase();
      if (client) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
        });

        if (error) {
          return { error: error.message };
        }

        if (data.user) {
          setSession(data.session ?? null);
          setUser(data.user);
          setGuestMode(false);
          await AsyncStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(data.user));
          return {};
        }
      }
    }

    // Local registration fallback
    try {
      const usersDbJson = await AsyncStorage.getItem(LOCAL_USERS_KEY);
      const usersDb: Record<string, { id: string; email: string; password: string }> =
        usersDbJson ? JSON.parse(usersDbJson) : {};

      const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      usersDb[email.toLowerCase()] = {
        id: newId,
        email: email.toLowerCase(),
        password,
      };
      await AsyncStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(usersDb));

      const userObj = {
        id: newId,
        email: email.toLowerCase(),
        aud: "authenticated",
        role: "authenticated",
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
      } as unknown as User;

      setUser(userObj);
      setGuestMode(false);
      await AsyncStorage.setItem(LOCAL_CURRENT_USER_KEY, JSON.stringify(userObj));
      return {};
    } catch (err: any) {
      return { error: err?.message || "Failed to create account." };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      const client = await getSupabase();
      if (client) {
        await client.auth.signOut();
      }
    }
    await AsyncStorage.removeItem(LOCAL_CURRENT_USER_KEY);
    setSession(null);
    setUser(null);
    setGuestMode(false);
  };

  const continueAsGuest = () => {
    setGuestMode(true);
  };

  const updateConfig = async (url: string, anonKey: string): Promise<boolean> => {
    const success = await saveSupabaseConfig(url, anonKey);
    if (success) {
      await checkConfigAndSession();
    }
    return success;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        guestMode,
        isConfigured,
        configUrl,
        configKey,
        signIn,
        signUp,
        signOut,
        continueAsGuest,
        updateConfig,
        refreshSession: checkConfigAndSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
