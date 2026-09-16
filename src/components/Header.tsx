import React from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { Bell, Cloud, CloudOff, LogOut } from "lucide-react-native";

interface HeaderProps {
  userName?: string;
  userEmail?: string | null;
  avatarUrl?: string;
  isCloudSynced?: boolean;
  onProfilePress?: () => void;
  onNotificationPress?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = "Guest User",
  userEmail,
  avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  isCloudSynced = false,
  onProfilePress,
  onNotificationPress,
  onSignOut,
}) => {
  const displayName = userEmail ? userEmail.split("@")[0] : userName;

  const handleSignOutConfirm = () => {
    if (onSignOut) {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out and return to the login screen?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Out", style: "destructive", onPress: onSignOut },
        ]
      );
    }
  };

  return (
    <View className="flex-row items-center justify-between py-4 px-1">
      {/* User Info & Avatar */}
      <TouchableOpacity
        onPress={onProfilePress}
        activeOpacity={0.7}
        className="flex-row items-center space-x-3 flex-1 mr-2"
      >
        <View className="relative">
          <Image
            source={{ uri: avatarUrl }}
            className="w-12 h-12 rounded-full border-2 border-purple-500/20"
          />
          <View
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
              isCloudSynced ? "bg-emerald-500" : "bg-amber-400"
            }`}
          />
        </View>
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1.5">
              {userEmail ? "Account" : "Guest Mode"}
            </Text>
            {isCloudSynced ? (
              <Cloud size={12} color="#059669" />
            ) : (
              <CloudOff size={12} color="#94A3B8" />
            )}
          </View>
          <Text className="text-xl font-bold text-slate-900" numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View className="flex-row items-center">
        {/* Notification Button */}
        <TouchableOpacity
          onPress={onNotificationPress}
          activeOpacity={0.7}
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100"
        >
          <Bell size={18} color="#475569" />
          <View className="absolute top-2.5 right-2.5 w-2 h-2 bg-purple-600 rounded-full" />
        </TouchableOpacity>

        {/* Sign Out Button */}
        {onSignOut && (
          <TouchableOpacity
            onPress={handleSignOutConfirm}
            activeOpacity={0.7}
            className="w-10 h-10 ml-2 bg-white rounded-full items-center justify-center shadow-sm border border-slate-100"
          >
            <LogOut size={16} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
