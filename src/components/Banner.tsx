import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AlertCircle, ArrowRight } from "lucide-react-native";
import { Subscription } from "../types/subscription";
import { formatCurrency } from "../utils/dateUtils";

interface BannerProps {
  urgentSubscriptions: Subscription[];
  onPress?: () => void;
}

export const Banner: React.FC<BannerProps> = ({
  urgentSubscriptions,
  onPress,
}) => {
  if (!urgentSubscriptions || urgentSubscriptions.length === 0) {
    return null;
  }

  const firstSub = urgentSubscriptions[0];
  const count = urgentSubscriptions.length;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 my-2 shadow-sm"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3.5">
          <AlertCircle size={22} color="#D97706" />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wider text-amber-800">
              Payment Due Tomorrow
            </Text>
            <Text className="text-xs font-bold text-amber-900">
              {formatCurrency(firstSub.price)}
            </Text>
          </View>
          <Text className="text-sm font-medium text-slate-700 mt-0.5" numberOfLines={1}>
            {firstSub.name}
            {count > 1 ? ` and ${count - 1} other bills are due tomorrow.` : " will be charged tomorrow."}
          </Text>
        </View>

        <View className="ml-2">
          <ArrowRight size={16} color="#D97706" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
