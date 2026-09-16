import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { LogOut, Cloud, Bell, Shield, ChevronRight } from "lucide-react-native";
import { useAuth } from "../context/AuthContext";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { Avatar } from "react-native-paper";

export const ProfileScreen: React.FC = () => {
  const { user, isConfigured, signOut, guestMode } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const getInitials = (email: string) => {
    return email ? email.substring(0, 1).toUpperCase() : "G";
  };

  return (
    <View className="flex-1 bg-[#F7F8FC]">
      <ScreenHeader title="Profile" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        {/* Profile Card */}
        <View className="bg-white rounded-[24px] p-6 items-center shadow-sm border border-slate-100 mb-6">
          <Avatar.Text 
            size={80} 
            label={getInitials(user?.email || "")} 
            style={{ backgroundColor: "#6C4DF6" }}
            color="#FFFFFF"
          />
          <Text className="text-xl font-bold text-slate-900 mt-4">
            {user?.email ? user.email.split("@")[0] : "Guest User"}
          </Text>
          <Text className="text-sm text-slate-500 mt-1">
            {user?.email || "Local storage mode"}
          </Text>
          
          <View className="mt-4 flex-row items-center bg-slate-50 px-3 py-1.5 rounded-full">
            <Cloud size={14} color={isConfigured && !guestMode ? "#10B981" : "#94A3B8"} />
            <Text className="text-xs font-medium text-slate-600 ml-1.5">
              {isConfigured && !guestMode ? "Cloud Synced" : "Local Only"}
            </Text>
          </View>
        </View>

        {/* Settings Menu */}
        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2">Settings</Text>
        <View className="bg-white rounded-[24px] p-2 shadow-sm border border-slate-100 mb-6">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-slate-50">
            <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center">
              <Bell size={16} color="#6C4DF6" />
            </View>
            <Text className="flex-1 text-sm font-medium text-slate-800 ml-3">Notification Settings</Text>
            <ChevronRight size={16} color="#CBD5E1" />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center">
              <Shield size={16} color="#3B82F6" />
            </View>
            <Text className="flex-1 text-sm font-medium text-slate-800 ml-3">Privacy & Security</Text>
            <ChevronRight size={16} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* Action Menu */}
        <TouchableOpacity 
          onPress={handleSignOut}
          className="bg-white rounded-[24px] p-4 flex-row items-center justify-center shadow-sm border border-slate-100"
        >
          <LogOut size={18} color="#EF4444" />
          <Text className="text-sm font-bold text-red-500 ml-2">
            {guestMode ? "Exit Guest Mode" : "Sign Out"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};
