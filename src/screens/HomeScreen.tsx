import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  TrendingUp,
  AlertTriangle,
  Plus,
  Inbox,
  PieChart,
  Download,
  ListFilter,
} from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { LoadingState } from "../components/ui/LoadingState";
import { ReminderBanner } from "../components/ReminderBanner";
import { SubCard } from "../components/SubCard";
import { AddSubscriptionModal } from "../components/AddSubscriptionModal";
import { Subscription } from "../types/subscription";
import { useAuth } from "../context/AuthContext";
import {
  getStoredSubscriptions,
  saveSubscription,
  deleteSubscription,
} from "../services/storageService";
import {
  calculateMonthlyTotal,
  isDueTomorrow,
  isDueToday,
  isDueSoon,
  formatCurrency,
  getDaysRemaining,
} from "../utils/dateUtils";
import {
  scheduleSubscriptionReminder,
  cancelSubscriptionReminders,
  requestNotificationPermissions,
} from "../services/notificationService";

export const HomeScreen: React.FC = () => {
  const { user, isConfigured } = useAuth();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | undefined>(undefined);

  useEffect(() => {
    if (route.params?.openAddModal) {
      setEditingSub(undefined);
      setModalVisible(true);
      (navigation as any).setParams({ openAddModal: false });
    }
  }, [route.params?.openAddModal, navigation]);

  const loadData = useCallback(async () => {
    try {
      const stored = await getStoredSubscriptions(user?.id);
      stored.sort((a, b) => getDaysRemaining(a.billingDate, a.cycle) - getDaysRemaining(b.billingDate, b.cycle));
      setSubscriptions(stored);
    } catch (error) {
      console.error("Error loading subscriptions", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
    });
    requestNotificationPermissions();
    return unsubscribe;
  }, [loadData, navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleAddSubscription = async (newSub: Subscription) => {
    const updated = await saveSubscription(newSub, user?.id);
    updated.sort((a, b) => getDaysRemaining(a.billingDate, a.cycle) - getDaysRemaining(b.billingDate, b.cycle));
    setSubscriptions(updated);
    await scheduleSubscriptionReminder(newSub);
  };

  const handleEditSubscription = (sub: Subscription) => {
    setEditingSub(sub);
    setModalVisible(true);
  };

  const handleDeleteSubscription = async (id: string) => {
    const updated = await deleteSubscription(id, user?.id);
    updated.sort((a, b) => getDaysRemaining(a.billingDate, a.cycle) - getDaysRemaining(b.billingDate, b.cycle));
    setSubscriptions(updated);
    await cancelSubscriptionReminders(id);
  };

  const urgentSubs = subscriptions.filter((sub) => isDueSoon(sub.billingDate, sub.cycle, 7));
  const dueTomorrowSubs = subscriptions.filter((sub) => isDueTomorrow(sub.billingDate, sub.cycle));
  const dueTodaySubs = subscriptions.filter((sub) => isDueToday(sub.billingDate, sub.cycle));
  const totalMonthlyCost = calculateMonthlyTotal(subscriptions);

  let nextBillingText = "No bills scheduled";
  if (subscriptions.length > 0) {
    if (dueTodaySubs.length > 0) nextBillingText = "Next billing: Today";
    else if (dueTomorrowSubs.length > 0) nextBillingText = "Next billing: Tomorrow";
    else {
      const days = getDaysRemaining(subscriptions[0].billingDate, subscriptions[0].cycle);
      nextBillingText = `Next in ${days} days`;
    }
  }

  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  return (
    <View className="flex-1 bg-[#F7F8FC]">
      <ScreenHeader
        userEmail={user?.email || "Guest"}
        notificationCount={urgentSubs.length}
        onProfilePress={() => navigation.navigate("Profile" as never)}
        onNotificationPress={() => navigation.navigate("Calendar" as never)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#6C4DF6"]} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <ReminderBanner urgentSubscriptions={urgentSubs} onActionPress={() => navigation.navigate("Calendar" as never)} />

        {/* Total Spending Card */}
        <View className="bg-white rounded-[24px] p-6 mx-4 my-2 shadow-sm border border-slate-100 overflow-hidden">
          <View className="absolute top-0 right-0 w-32 h-32 bg-[#6C4DF6]/10 rounded-full blur-2xl -mr-10 -mt-10" />
          
          <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            TOTAL SPENDING
          </Text>
          <Text className="text-[36px] font-extrabold text-[#171717] tracking-tight mb-4">
            {formatCurrency(totalMonthlyCost)}
          </Text>

          <View className="flex-row items-center justify-between border-t border-slate-100 pt-4">
            <View className="flex-row items-center bg-[#F7F8FC] px-3 py-1.5 rounded-xl">
              <TrendingUp size={14} color="#6C4DF6" />
              <Text className="text-xs font-semibold text-[#6C4DF6] ml-1.5">
                {subscriptions.length} Active
              </Text>
            </View>
            <View className="flex-row items-center">
              {urgentSubs.length > 0 ? (
                <>
                  <AlertTriangle size={14} color="#F59E0B" />
                  <Text className="text-xs font-medium text-amber-500 ml-1.5">{urgentSubs.length} due soon</Text>
                </>
              ) : (
                <Text className="text-xs font-medium text-slate-400">{nextBillingText}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between px-6 my-4">
          <TouchableOpacity onPress={() => { setEditingSub(undefined); setModalVisible(true); }} className="items-center">
            <View className="w-12 h-12 rounded-full bg-[#6C4DF6]/10 items-center justify-center mb-1">
              <Plus size={20} color="#6C4DF6" />
            </View>
            <Text className="text-xs font-medium text-[#777777]">Add</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate("Insights" as never)} className="items-center">
            <View className="w-12 h-12 rounded-full bg-[#6C4DF6]/10 items-center justify-center mb-1">
              <ListFilter size={20} color="#6C4DF6" />
            </View>
            <Text className="text-xs font-medium text-[#777777]">Category</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate("Insights" as never)} className="items-center">
            <View className="w-12 h-12 rounded-full bg-[#6C4DF6]/10 items-center justify-center mb-1">
              <PieChart size={20} color="#6C4DF6" />
            </View>
            <Text className="text-xs font-medium text-[#777777]">Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Alert.alert("Export", "Export functionality coming soon.")} className="items-center">
            <View className="w-12 h-12 rounded-full bg-[#6C4DF6]/10 items-center justify-center mb-1">
              <Download size={20} color="#6C4DF6" />
            </View>
            <Text className="text-xs font-medium text-[#777777]">Export</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Payments */}
        <View className="px-4 mt-2">
          <View className="flex-row items-center justify-between mb-4 px-2">
            <Text className="text-lg font-bold text-[#171717]">Upcoming Payments</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Calendar" as never)}>
              <Text className="text-sm font-semibold text-[#6C4DF6]">See all &gt;</Text>
            </TouchableOpacity>
          </View>

          {subscriptions.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center border border-slate-100">
              <View className="w-16 h-16 rounded-full bg-[#6C4DF6]/10 items-center justify-center mb-4">
                <Inbox size={32} color="#6C4DF6" />
              </View>
              <Text className="text-base font-bold text-[#171717]">No Subscriptions Yet</Text>
              <Text className="text-xs text-[#777777] text-center mt-2 mb-6">
                Tap + to add your first subscription.
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                className="bg-[#6C4DF6] px-6 py-3 rounded-xl flex-row items-center"
              >
                <Plus size={16} color="#FFFFFF" />
                <Text className="text-white text-sm font-bold ml-2">Add First</Text>
              </TouchableOpacity>
            </View>
          ) : (
            subscriptions.slice(0, 5).map((sub) => (
              <SubCard 
                key={sub.id} 
                subscription={sub} 
                onPress={() => handleEditSubscription(sub)}
                onDelete={handleDeleteSubscription} 
              />
            ))
          )}
        </View>
      </ScrollView>

      <AddSubscriptionModal
        visible={modalVisible}
        editingSubscription={editingSub}
        onClose={() => setModalVisible(false)}
        onSave={handleAddSubscription}
      />
    </View>
  );
};
