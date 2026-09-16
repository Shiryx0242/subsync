import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { Subscription } from "../types/subscription";
import { getStoredSubscriptions } from "../services/storageService";
import { useAuth } from "../context/AuthContext";
import { calculateMonthlyTotal, calculateYearlyEstimate, formatCurrency } from "../utils/dateUtils";
import { useNavigation } from "@react-navigation/native";
import { ServiceLogo } from "../components/ServiceLogo";

export const InsightsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const stored = await getStoredSubscriptions(user?.id);
      setSubscriptions(stored);
    });
    return unsubscribe;
  }, [navigation, user?.id]);

  const monthlyTotal = calculateMonthlyTotal(subscriptions);
  const yearlyTotal = calculateYearlyEstimate(subscriptions);

  // Group by category
  const categoryTotals = subscriptions.reduce((acc, sub) => {
    const cost = sub.cycle === "yearly" ? sub.price / 12 : sub.price;
    acc[sub.category] = (acc[sub.category] || 0) + cost;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({ name, amount }));

  // Sort by highest spending
  const topSpending = [...subscriptions]
    .sort((a, b) => {
      const costA = a.cycle === "yearly" ? a.price / 12 : a.price;
      const costB = b.cycle === "yearly" ? b.price / 12 : b.price;
      return costB - costA;
    })
    .slice(0, 5);

  return (
    <View className="flex-1 bg-[#F7F8FC]">
      <ScreenHeader title="Insights" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        
        <View className="flex-row space-x-4 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly</Text>
            <Text className="text-xl font-extrabold text-[#6C4DF6]">{formatCurrency(monthlyTotal)}</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 ml-3">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yearly Est.</Text>
            <Text className="text-xl font-extrabold text-[#171717]">{formatCurrency(yearlyTotal)}</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-slate-800 mb-3">Category Breakdown</Text>
        <View className="bg-white rounded-[24px] p-5 mb-6 shadow-sm border border-slate-100">
          {sortedCategories.length === 0 ? (
            <Text className="text-sm text-slate-400 text-center py-4">No data available</Text>
          ) : (
            sortedCategories.map((cat, index) => {
              const percentage = monthlyTotal > 0 ? (cat.amount / monthlyTotal) * 100 : 0;
              return (
                <View key={cat.name} className={`mb-3 ${index === sortedCategories.length - 1 ? 'mb-0' : ''}`}>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm font-medium text-slate-700">{cat.name}</Text>
                    <Text className="text-sm font-bold text-slate-900">{formatCurrency(cat.amount)}</Text>
                  </View>
                  <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <View 
                      className="h-full bg-[#6C4DF6] rounded-full" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <Text className="text-sm font-bold text-slate-800 mb-3">Top Spending Services</Text>
        <View className="bg-white rounded-[24px] p-2 shadow-sm border border-slate-100">
          {topSpending.length === 0 ? (
            <Text className="text-sm text-slate-400 text-center py-6">No data available</Text>
          ) : (
            topSpending.map((sub, index) => (
              <View 
                key={sub.id} 
                className={`flex-row items-center p-3 ${index < topSpending.length - 1 ? 'border-b border-slate-50' : ''}`}
              >
                <ServiceLogo name={sub.name} logo={sub.logo} brandColor={sub.brandColor} size={36} />
                <View className="flex-1 ml-3">
                  <Text className="text-sm font-bold text-slate-800">{sub.name}</Text>
                  <Text className="text-[10px] text-slate-400">{sub.category}</Text>
                </View>
                <Text className="text-sm font-bold text-slate-900">
                  {formatCurrency(sub.cycle === "yearly" ? sub.price / 12 : sub.price)}<Text className="text-[10px] font-normal text-slate-400">/mo</Text>
                </Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
};
