import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react-native";
import dayjs from "dayjs";
import { ScreenHeader } from "../components/ui/ScreenHeader";
import { SubCard } from "../components/SubCard";
import { Subscription } from "../types/subscription";
import { getStoredSubscriptions } from "../services/storageService";
import { useAuth } from "../context/AuthContext";
import { getNextBillingDate } from "../utils/dateUtils";
import { useNavigation } from "@react-navigation/native";

export const CalendarScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
  const [selectedDate, setSelectedDate] = useState(dayjs().startOf("day"));

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      const stored = await getStoredSubscriptions(user?.id);
      setSubscriptions(stored);
    });
    return unsubscribe;
  }, [navigation, user?.id]);

  const prevMonth = () => setCurrentMonth(currentMonth.subtract(1, "month"));
  const nextMonth = () => setCurrentMonth(currentMonth.add(1, "month"));

  // Calculate dots for calendar
  const billingDatesMap = useMemo(() => {
    const map = new Map<string, string[]>(); // date string -> array of brand colors
    subscriptions.forEach(sub => {
      const nextDate = getNextBillingDate(sub.billingDate, sub.cycle);
      // Ensure we map dates occurring in the current viewed month
      // For simplicity, we just use the next billing date. 
      // If a user is viewing a future month, this simple logic will only show the *next* occurrence.
      // A full implementation would calculate occurrences per month, but for UI mapping this works for the immediate next bill.
      const dateStr = nextDate.format("YYYY-MM-DD");
      const colors = map.get(dateStr) || [];
      if (!colors.includes(sub.brandColor)) {
         colors.push(sub.brandColor);
      }
      map.set(dateStr, colors);
    });
    return map;
  }, [subscriptions]);

  const renderCalendar = () => {
    const daysInMonth = currentMonth.daysInMonth();
    const firstDayOfWeek = currentMonth.day(); // 0 is Sunday
    
    const days = [];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Header
    const header = (
      <View className="flex-row justify-between px-2 mb-2" key="header">
        {weekDays.map((d, i) => (
          <Text key={i} className="text-xs font-semibold text-slate-400 w-10 text-center">{d}</Text>
        ))}
      </View>
    );

    days.push(header);

    let currentWeek = [];
    // Padding days
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push(<View key={`empty-${i}`} className="w-10 h-10 m-1" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = currentMonth.date(d);
      const dateStr = date.format("YYYY-MM-DD");
      const isSelected = date.isSame(selectedDate, "day");
      const isToday = date.isSame(dayjs(), "day");
      
      const dots = billingDatesMap.get(dateStr) || [];

      currentWeek.push(
        <TouchableOpacity
          key={d}
          onPress={() => setSelectedDate(date)}
          className={`w-10 h-10 m-1 items-center justify-center rounded-full ${
            isSelected ? "bg-[#6C4DF6]" : isToday ? "bg-[#6C4DF6]/10" : ""
          }`}
        >
          <Text className={`text-sm font-medium ${isSelected ? "text-white" : isToday ? "text-[#6C4DF6]" : "text-slate-700"}`}>
            {d}
          </Text>
          <View className="flex-row mt-0.5 space-x-0.5">
            {dots.slice(0, 3).map((color, i) => (
              <View key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: isSelected ? "white" : color }} />
            ))}
          </View>
        </TouchableOpacity>
      );

      if (currentWeek.length === 7) {
        days.push(<View key={`week-${d}`} className="flex-row justify-between px-2">{currentWeek}</View>);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(<View key={`empty-end-${currentWeek.length}`} className="w-10 h-10 m-1" />);
      }
      days.push(<View key={`week-end`} className="flex-row justify-between px-2">{currentWeek}</View>);
    }

    return days;
  };

  const selectedDateSubs = subscriptions.filter(sub => 
    getNextBillingDate(sub.billingDate, sub.cycle).isSame(selectedDate, "day")
  );

  return (
    <View className="flex-1 bg-[#F7F8FC]">
      <ScreenHeader title="Reminders" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar Card */}
        <View className="bg-white rounded-[24px] p-4 mx-4 my-4 shadow-sm border border-slate-100">
          <View className="flex-row items-center justify-between mb-4 px-2">
            <TouchableOpacity onPress={prevMonth} className="p-2 bg-slate-50 rounded-full">
              <ChevronLeft size={20} color="#171717" />
            </TouchableOpacity>
            <Text className="text-base font-bold text-slate-800">
              {currentMonth.format("MMMM YYYY")}
            </Text>
            <TouchableOpacity onPress={nextMonth} className="p-2 bg-slate-50 rounded-full">
              <ChevronRight size={20} color="#171717" />
            </TouchableOpacity>
          </View>
          
          {renderCalendar()}
        </View>

        {/* Details Section */}
        <View className="px-4 mt-2 mb-10">
          <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">
            {selectedDate.format("dddd, D MMM YYYY").toUpperCase()}
          </Text>

          {selectedDateSubs.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center justify-center border border-slate-100">
              <Text className="text-sm font-medium text-slate-500">No payments scheduled for this day.</Text>
            </View>
          ) : (
            selectedDateSubs.map(sub => (
              <SubCard key={sub.id} subscription={sub} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};
