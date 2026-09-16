import "./global.css";
import React, { useEffect, useState } from "react";
import { View, StatusBar, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider, ActivityIndicator } from "react-native-paper";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { MainTabNavigator } from "./src/navigation/MainTabNavigator";
import { AuthScreen } from "./src/screens/AuthScreen";
import { LoadingState } from "./src/components/ui/LoadingState";

const AppContent: React.FC = () => {
  const { user, guestMode, loading } = useAuth();
  
  // Use Paper's ActivityIndicator for initial loading (school requirement)
  if (loading) {
    return (
      <View className="flex-1 bg-[#F7F8FC] items-center justify-center p-6">
        <StatusBar barStyle="dark-content" />
        <View className="w-16 h-16 rounded-2xl bg-purple-100 items-center justify-center mb-4">
          <Sparkles size={32} color="#6C4DF6" />
        </View>
        <ActivityIndicator animating={true} color="#6C4DF6" size="large" />
        <Text className="mt-4 text-base font-bold text-slate-800">
          SubSync
        </Text>
        <Text className="mt-1 text-xs text-slate-400">
          Checking your account session...
        </Text>
      </View>
    );
  }

  // If user is logged in or chose to continue as guest, show the main dashboard (Tab Navigator)
  if (user || guestMode) {
    return <MainTabNavigator />;
  }

  // Otherwise, land on the Login / Create Account screen as the initial screen
  return <AuthScreen />;
};

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
