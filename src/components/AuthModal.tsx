import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { X, Mail, Lock, User, LogOut, Settings, CheckCircle, Database } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const {
    user,
    isConfigured,
    configUrl,
    configKey,
    signIn,
    signUp,
    signOut,
    updateConfig,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Config inputs
  const [inputUrl, setInputUrl] = useState(configUrl);
  const [inputKey, setInputKey] = useState(configKey);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const res = await signIn(email.trim(), password);
        if (res.error) {
          Alert.alert("Sign In Failed", res.error);
        } else {
          Alert.alert("Success", "Signed in successfully!");
          onClose();
        }
      } else {
        const res = await signUp(email.trim(), password);
        if (res.error) {
          Alert.alert("Sign Up Failed", res.error);
        } else if (res.message) {
          Alert.alert("Check Email", res.message);
          setMode("signin");
        } else {
          Alert.alert("Success", "Account created and signed in!");
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!inputUrl.trim() || !inputKey.trim()) {
      Alert.alert("Incomplete", "Please provide both Supabase URL and Anon Key.");
      return;
    }

    const success = await updateConfig(inputUrl.trim(), inputKey.trim());
    if (success) {
      Alert.alert("Success", "Supabase credentials updated successfully!");
      setShowConfig(false);
    } else {
      Alert.alert("Invalid Credentials", "Please enter a valid Supabase project URL and anon key.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-3xl max-h-[85%] p-6 shadow-2xl">
          {/* Top Bar */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
            <View>
              <Text className="text-xl font-bold text-slate-900">
                {user ? "Account & Cloud Sync" : "Supabase Account"}
              </Text>
              <Text className="text-xs text-slate-400 mt-0.5">
                {user
                  ? "Your subscriptions are synced across devices"
                  : "Sign in to backup your subscriptions in cloud"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 bg-slate-100 rounded-full items-center justify-center"
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
            {/* Logged In View */}
            {user ? (
              <View className="items-center py-4">
                <View className="w-16 h-16 rounded-full bg-purple-100 items-center justify-center mb-3">
                  <User size={32} color="#7C3AED" />
                </View>
                <Text className="text-base font-bold text-slate-800">
                  {user.email}
                </Text>
                <View className="flex-row items-center bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mt-2">
                  <CheckCircle size={13} color="#059669" />
                  <Text className="text-xs font-semibold text-emerald-700 ml-1.5">
                    Cloud Sync Active
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={async () => {
                    await signOut();
                    onClose();
                  }}
                  className="mt-8 w-full bg-rose-50 border border-rose-200 rounded-2xl py-3.5 flex-row items-center justify-center"
                >
                  <LogOut size={18} color="#E11D48" />
                  <Text className="text-rose-600 font-bold text-sm ml-2">
                    Sign Out
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Logged Out / Auth Form View */
              <View>
                {/* Supabase Status Banner */}
                <View
                  className={`p-3 rounded-2xl mb-4 flex-row items-center justify-between border ${
                    isConfigured
                      ? "bg-emerald-50/70 border-emerald-200"
                      : "bg-amber-50/70 border-amber-200"
                  }`}
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <Database
                      size={16}
                      color={isConfigured ? "#059669" : "#D97706"}
                    />
                    <Text
                      className={`text-xs ml-2 font-medium ${
                        isConfigured ? "text-emerald-800" : "text-amber-800"
                      }`}
                    >
                      {isConfigured
                        ? "Supabase Connected"
                        : "Supabase Not Configured (Using Local Storage)"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowConfig(!showConfig)}
                    className="p-1.5 rounded-lg bg-white/80 border border-slate-200"
                  >
                    <Settings size={14} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* Collapsible Supabase Config Form */}
                {showConfig && (
                  <View className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
                    <Text className="text-xs font-bold text-slate-800 mb-1">
                      Supabase Project URL
                    </Text>
                    <TextInput
                      value={inputUrl}
                      onChangeText={setInputUrl}
                      placeholder="https://xyzcompany.supabase.co"
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 mb-3"
                    />

                    <Text className="text-xs font-bold text-slate-800 mb-1">
                      Supabase Anon Key
                    </Text>
                    <TextInput
                      value={inputKey}
                      onChangeText={setInputKey}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      placeholderTextColor="#94A3B8"
                      autoCapitalize="none"
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 mb-3"
                    />

                    <TouchableOpacity
                      onPress={handleSaveConfig}
                      className="bg-purple-600 rounded-xl py-2.5 items-center"
                    >
                      <Text className="text-white text-xs font-bold">
                        Save Supabase Keys
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Sign In / Sign Up Switcher */}
                <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-5">
                  <TouchableOpacity
                    onPress={() => setMode("signin")}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      mode === "signin" ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        mode === "signin" ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setMode("signup")}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      mode === "signup" ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        mode === "signup" ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      Create Account
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Email Input */}
                <Text className="text-xs font-semibold text-slate-700 mb-1.5">
                  Email
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 mb-4">
                  <Mail size={16} color="#94A3B8" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 ml-2.5 text-sm text-slate-800 font-medium"
                  />
                </View>

                {/* Password Input */}
                <Text className="text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 mb-6">
                  <Lock size={16} color="#94A3B8" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    autoCapitalize="none"
                    className="flex-1 ml-2.5 text-sm text-slate-800 font-medium"
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleAuth}
                  disabled={loading}
                  className="bg-purple-600 rounded-2xl py-4 items-center justify-center shadow-md shadow-purple-500/30 mb-4"
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white font-bold text-base">
                      {mode === "signin" ? "Sign In to SubSync" : "Create Account"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
