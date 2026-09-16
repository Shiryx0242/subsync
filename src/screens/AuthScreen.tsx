import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Settings,
  X,
  Database,
} from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

export const AuthScreen: React.FC = () => {
  const {
    isConfigured,
    configUrl,
    configKey,
    signIn,
    signUp,
    continueAsGuest,
    updateConfig,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Config inputs
  const [inputUrl, setInputUrl] = useState(configUrl);
  const [inputKey, setInputKey] = useState(configKey);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter both your email and password.");
      return;
    }

    if (mode === "signup") {
      if (password.length < 6) {
        Alert.alert("Weak Password", "Password must be at least 6 characters long.");
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        Alert.alert("Password Mismatch", "Passwords do not match. Please re-enter.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await signIn(email.trim(), password);
        if (res.error) {
          Alert.alert("Sign In Failed", res.error);
        }
      } else {
        const res = await signUp(email.trim(), password);
        if (res.error) {
          Alert.alert("Sign Up Failed", res.error);
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to proceed.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    const randomNum = Math.floor(Math.random() * 900 + 100);
    setEmail(`user${randomNum}@subsync.app`);
    setPassword("123456");
    setConfirmPassword("123456");
  };

  const handleSaveConfig = async () => {
    if (!inputUrl.trim() || !inputKey.trim()) {
      Alert.alert("Incomplete", "Please provide both Supabase URL and Anon Key.");
      return;
    }

    const success = await updateConfig(inputUrl.trim(), inputKey.trim());
    if (success) {
      Alert.alert("Connected", "Supabase credentials updated successfully!");
      setShowConfig(false);
    } else {
      Alert.alert(
        "Invalid Credentials",
        "Please check your Supabase Project URL and Anon Key."
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 48 }}
      >
          {/* Top Bar with Settings */}
          <View className="flex-row justify-end mb-4">
            <TouchableOpacity
              onPress={() => setShowConfig(!showConfig)}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Settings size={16} color={isConfigured ? "#059669" : "#64748B"} />
            </TouchableOpacity>
          </View>

          {/* Collapsible Supabase Config Drawer */}
          {showConfig && (
            <View className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 shadow-sm">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-sm font-bold text-slate-900">
                  Supabase Project Settings
                </Text>
                <TouchableOpacity onPress={() => setShowConfig(false)} hitSlop={10}>
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text className="text-xs font-semibold text-slate-500 mb-1">
                Project URL
              </Text>
              <TextInput
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="https://your-project.supabase.co"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 mb-3"
              />

              <Text className="text-xs font-semibold text-slate-500 mb-1">
                Anon Key
              </Text>
              <TextInput
                value={inputKey}
                onChangeText={setInputKey}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 mb-4"
              />

              <TouchableOpacity
                onPress={handleSaveConfig}
                style={{
                  backgroundColor: "#7C3AED",
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>
                  Save Supabase Settings
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* App Brand Header */}
          <View className="items-center mb-8">
            <View className="w-16 h-16 rounded-2xl bg-purple-600 items-center justify-center shadow-lg shadow-purple-600/30 mb-3">
              <Sparkles size={32} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-extrabold text-slate-900 tracking-tight">
              SubSync
            </Text>
            <Text className="text-sm font-medium text-slate-500 mt-1">
              Smart Subscription & Bill Tracker
            </Text>
          </View>

          {/* Sign In / Sign Up Switcher */}
          <View className="flex-row bg-slate-200/70 p-1 rounded-2xl mb-6 border border-slate-200">
            <TouchableOpacity
              onPress={() => setMode("signin")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: mode === "signin" ? "#FFFFFF" : "transparent",
                shadowColor: mode === "signin" ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: mode === "signin" ? 0.05 : 0,
                shadowRadius: 2,
                elevation: mode === "signin" ? 1 : 0,
              }}
            >
              <Text
                className={`text-sm font-bold ${
                  mode === "signin" ? "text-slate-900" : "text-slate-500"
                }`}
              >
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("signup")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
                backgroundColor: mode === "signup" ? "#FFFFFF" : "transparent",
                shadowColor: mode === "signup" ? "#000" : "transparent",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: mode === "signup" ? 0.05 : 0,
                shadowRadius: 2,
                elevation: mode === "signup" ? 1 : 0,
              }}
            >
              <Text
                className={`text-sm font-bold ${
                  mode === "signup" ? "text-slate-900" : "text-slate-500"
                }`}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm shadow-slate-200/50">
            {/* Email Field */}
            <Text className="text-xs font-semibold text-slate-700 mb-2">
              Email Address
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 mb-4">
              <Mail size={18} color="#94A3B8" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                className="flex-1 ml-3 text-base text-slate-900 font-medium"
              />
            </View>

            {/* Password Field */}
            <Text className="text-xs font-semibold text-slate-700 mb-2">
              Password {mode === "signup" && "(at least 6 characters)"}
            </Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 mb-4">
              <Lock size={18} color="#94A3B8" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 ml-3 text-base text-slate-900 font-medium"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                {showPassword ? (
                  <EyeOff size={18} color="#94A3B8" />
                ) : (
                  <Eye size={18} color="#94A3B8" />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password Field (Sign Up Only) */}
            {mode === "signup" && (
              <View className="mb-4">
                <Text className="text-xs font-semibold text-slate-700 mb-2">
                  Confirm Password
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5">
                  <Lock size={18} color="#94A3B8" />
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 ml-3 text-base text-slate-900 font-medium"
                  />
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: "#7C3AED", // purple-600
                borderRadius: 16,
                paddingVertical: 16,
                marginTop: 8,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#7C3AED",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 16 }}>
                  {mode === "signin" ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Auto Fill Demo Link */}
            <TouchableOpacity
              onPress={handleQuickFill}
              hitSlop={10}
              style={{ marginTop: 24, alignItems: "center" }}
            >
              <Text style={{ fontSize: 12, fontWeight: "bold", color: "#7C3AED" }}>
                ⚡ Auto Fill Demo Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Continue as Guest */}
          <TouchableOpacity
            onPress={continueAsGuest}
            hitSlop={14}
            style={{ marginTop: 32, marginBottom: 16, alignItems: "center", justifyContent: "center" }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B" }}>
              Continue as Guest (Offline Mode) →
            </Text>
          </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
};
