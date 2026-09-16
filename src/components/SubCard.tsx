import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Calendar, Trash2 } from "lucide-react-native";
import { Badge } from "react-native-paper";
import { Subscription } from "../types/subscription";
import {
  getDaysRemaining,
  isDueSoon,
  formatCurrency,
  formatDisplayDate,
} from "../utils/dateUtils";
import { ServiceLogo } from "./ServiceLogo";

interface SubCardProps {
  subscription: Subscription;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

export const SubCard: React.FC<SubCardProps> = ({
  subscription,
  onPress,
  onDelete,
}) => {
  const daysLeft = getDaysRemaining(subscription.billingDate, subscription.cycle);
  const showWarningBadge = isDueSoon(subscription.billingDate, subscription.cycle, 7);

  const getDaysLeftText = () => {
    if (daysLeft === 0) return "TODAY";
    if (daysLeft === 1) return "TOMORROW";
    if (daysLeft < 0) return `OVERDUE`;
    return `${daysLeft} DAYS`;
  };

  const getBadgeColor = () => {
    if (daysLeft === 0) return "#EF4444"; // red
    if (daysLeft === 1) return "#F59E0B"; // orange
    if (daysLeft <= 7) return "#8B5CF6"; // purple
    return "#94A3B8"; // neutral
  };

  const handleLongPress = () => {
    if (onDelete) {
      Alert.alert(
        "Delete Subscription",
        `Are you sure you want to remove ${subscription.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDelete(subscription.id),
          },
        ]
      );
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={handleLongPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 shadow-sm relative overflow-hidden"
    >
      <View className="flex-row items-center justify-between">
        {/* Logo & Info */}
        <View className="flex-row items-center flex-1 pr-2">
          <ServiceLogo 
            name={subscription.name} 
            logo={subscription.logo} 
            brandColor={subscription.brandColor} 
            size={48} 
          />

          {/* Details */}
          <View className="flex-1 ml-3.5">
            <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
              {subscription.name}
            </Text>
            
            <View className="flex-row items-center mt-0.5">
              <Text className="text-xs text-slate-500 mr-2" numberOfLines={1}>
                {subscription.category}
              </Text>
            </View>

            <View className="flex-row items-center mt-1.5">
              <Calendar size={12} color="#94A3B8" />
              <Text className="text-[11px] text-slate-400 font-light ml-1">
                Renews {formatDisplayDate(subscription.billingDate, subscription.cycle)}
              </Text>
            </View>
          </View>
        </View>

        {/* Price & Badge */}
        <View className="items-end justify-between h-full py-1">
          <View className="items-end">
            <Text className="text-base font-bold text-slate-900">
              {formatCurrency(subscription.price)}
            </Text>
            <Text className="text-[10px] font-light text-slate-400">
              / {subscription.cycle === "yearly" ? "year" : "month"}
            </Text>
          </View>

          <View className="mt-2 flex-row items-center">
            {showWarningBadge ? (
              <Badge style={{ backgroundColor: getBadgeColor(), paddingHorizontal: 6, fontWeight: "600" }}>
                {getDaysLeftText()}
              </Badge>
            ) : (
              <View className="px-2 py-0.5 rounded-full bg-slate-100">
                <Text className="text-[10px] font-medium text-slate-500">
                  {getDaysLeftText()}
                </Text>
              </View>
            )}
            
            {onDelete && (
              <TouchableOpacity
                onPress={handleLongPress}
                className="ml-2 p-1"
              >
                <Trash2 size={14} color="#CBD5E1" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
