import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { X, Check, Plus, Calendar } from "lucide-react-native";
import { ActivityIndicator } from "react-native-paper";
import dayjs from "dayjs";
import { Subscription, POPULAR_PRESETS, ServicePreset, CATEGORIES } from "../types/subscription";
import { ServiceLogo } from "./ServiceLogo";

interface AddSubscriptionModalProps {
  visible: boolean;
  editingSubscription?: Subscription;
  onClose: () => void;
  onSave: (subscription: Subscription) => Promise<void>;
}

const COLOR_OPTIONS = [
  "#6B46C1", // Deep Purple
  "#E50914", // Netflix Red
  "#1DB954", // Spotify Green
  "#0071E3", // Apple Blue
  "#10A37F", // OpenAI Teal
  "#F59E0B", // Amber / Gold
  "#EC4899", // Rose / Pink
  "#0F172A", // Slate Dark
];

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  visible,
  editingSubscription,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [logoUrl, setLogoUrl] = useState("");
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [isSaving, setIsSaving] = useState(false);

  const [filterCategory, setFilterCategory] = useState("All");

  const [billingDate, setBillingDate] = useState(
    dayjs().add(1, "month").format("YYYY-MM-DD")
  );

  useEffect(() => {
    if (visible) {
      if (editingSubscription) {
        setName(editingSubscription.name);
        setPrice(editingSubscription.price.toString());
        setSelectedColor(editingSubscription.brandColor);
        setCategory(editingSubscription.category);
        setLogoUrl(editingSubscription.logo || "");
        setCycle(editingSubscription.cycle);
        setBillingDate(editingSubscription.billingDate);
      } else {
        resetForm();
      }
    }
  }, [visible, editingSubscription]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setSelectedColor(COLOR_OPTIONS[0]);
    setCategory(CATEGORIES[0]);
    setLogoUrl("");
    setCycle("monthly");
    setBillingDate(dayjs().add(1, "month").format("YYYY-MM-DD"));
    setIsSaving(false);
  };

  const handleSelectPreset = (preset: ServicePreset) => {
    setName(preset.name);
    setSelectedColor(preset.brandColor);
    setCategory(preset.category);
    setLogoUrl(preset.logo);
    setCycle(preset.cycle || "monthly");
    if (preset.defaultPrice) {
      setPrice(preset.defaultPrice.toString());
    }
  };

  const handleSelectQuickDate = (days: number) => {
    setBillingDate(dayjs().add(days, "day").format("YYYY-MM-DD"));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Required Field", "Please enter the subscription name.");
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      Alert.alert("Invalid Price", "Please enter a valid amount.");
      return;
    }

    if (!dayjs(billingDate, "YYYY-MM-DD", true).isValid()) {
      Alert.alert("Invalid Date", "Please enter a valid date in YYYY-MM-DD format.");
      return;
    }

    setIsSaving(true);
    
    const newSub: Subscription = {
      id: editingSubscription ? editingSubscription.id : `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      price: parsedPrice,
      billingDate: billingDate,
      brandColor: selectedColor,
      category: category,
      cycle: cycle,
      logo: logoUrl || undefined,
    };

    try {
      await onSave(newSub);
      resetForm();
      onClose();
    } catch (error) {
      Alert.alert("Error", "Failed to save subscription.");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter presets based on selected filterCategory
  const filteredPresets = filterCategory === "All" 
    ? POPULAR_PRESETS 
    : POPULAR_PRESETS.filter(p => p.category === filterCategory);

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
        <View className="bg-white rounded-t-3xl max-h-[90%] p-6 shadow-2xl">
          {/* Header */}
          <View className="flex-row items-center justify-between pb-4 border-b border-slate-100">
            <View>
              <Text className="text-xl font-bold text-slate-900">
                {editingSubscription ? "Edit Subscription" : "New Subscription"}
              </Text>
              <Text className="text-xs text-slate-400 mt-0.5">
                Add your real service details
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
            
            {/* Horizontal Category Selector for Presets */}
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select a Preset
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 -mx-1">
              {["All", ...CATEGORIES].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setFilterCategory(cat)}
                  className={`mr-2 px-3 py-1.5 rounded-full border ${
                    filterCategory === cat
                      ? "bg-purple-600 border-purple-600"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Text className={`text-xs font-medium ${filterCategory === cat ? "text-white" : "text-slate-600"}`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Presets Grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-1">
              {filteredPresets.map((preset) => {
                const isSelected = name.toLowerCase() === preset.name.toLowerCase();
                return (
                  <TouchableOpacity
                    key={preset.id}
                    onPress={() => handleSelectPreset(preset)}
                    className={`mr-3 p-3 rounded-2xl border items-center w-28 ${
                      isSelected ? "bg-purple-50 border-purple-500" : "bg-white border-slate-200"
                    }`}
                  >
                    <ServiceLogo name={preset.name} logo={preset.logo} brandColor={preset.brandColor} size={40} />
                    <Text 
                      className={`text-[10px] font-medium mt-2 text-center ${isSelected ? "text-purple-700 font-bold" : "text-slate-700"}`}
                      numberOfLines={1}
                    >
                      {preset.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Form Fields */}
            <View className="flex-row items-center space-x-3 mb-4">
              <View className="flex-1">
                <Text className="text-xs font-semibold text-slate-700 mb-1.5">Service Name *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Netflix"
                  placeholderTextColor="#94A3B8"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-medium"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-xs font-semibold text-slate-700 mb-1.5">Price (฿) *</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#94A3B8"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm font-bold"
                />
              </View>
            </View>

            {/* Billing Cycle */}
            <Text className="text-xs font-semibold text-slate-700 mb-1.5">Billing Cycle</Text>
            <View className="flex-row items-center mb-4 space-x-2">
              <TouchableOpacity
                onPress={() => setCycle("monthly")}
                className={`flex-1 py-3 rounded-xl border items-center ${
                  cycle === "monthly" ? "bg-purple-100 border-purple-500" : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text className={`text-sm font-medium ${cycle === "monthly" ? "text-purple-700" : "text-slate-600"}`}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCycle("yearly")}
                className={`flex-1 ml-2 py-3 rounded-xl border items-center ${
                  cycle === "yearly" ? "bg-purple-100 border-purple-500" : "bg-slate-50 border-slate-200"
                }`}
              >
                <Text className={`text-sm font-medium ${cycle === "yearly" ? "text-purple-700" : "text-slate-600"}`}>
                  Yearly
                </Text>
              </TouchableOpacity>
            </View>

            {/* Next Billing Date */}
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-xs font-semibold text-slate-700">
                Next Billing Date: {dayjs(billingDate).format("DD MMM YYYY")}
              </Text>
            </View>

            {/* Manual Date Input */}
            <TextInput
              value={billingDate}
              onChangeText={setBillingDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94A3B8"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm mb-4"
            />

            {/* Quick date shortcuts */}
            <View className="flex-row flex-wrap gap-2 mb-4">
              {[
                { label: "Tomorrow", days: 1 },
                { label: "7 Days", days: 7 },
                { label: "30 Days", days: 30 },
              ].map((item) => {
                const isCurrent = billingDate === dayjs().add(item.days, "day").format("YYYY-MM-DD");
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => handleSelectQuickDate(item.days)}
                    className={`px-3 py-1.5 rounded-lg border ${
                      isCurrent ? "bg-purple-600 border-purple-600" : "bg-slate-100 border-slate-200"
                    }`}
                  >
                    <Text className={`text-xs font-medium ${isCurrent ? "text-white" : "text-slate-600"}`}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Category selection */}
            <Text className="text-xs font-semibold text-slate-700 mb-1.5">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-1">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`mr-2 px-3 py-1.5 rounded-xl border ${
                    category === cat ? "bg-slate-900 border-slate-900" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Text className={`text-xs font-medium ${category === cat ? "text-white" : "text-slate-600"}`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Brand Color Selection */}
            <Text className="text-xs font-semibold text-slate-700 mb-2">Card Accent Color</Text>
            <View className="flex-row flex-wrap mb-6">
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedColor(c)}
                  className="w-8 h-8 rounded-full items-center justify-center mr-2 mb-2"
                  style={{ backgroundColor: c }}
                >
                  {selectedColor === c && <Check size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isSaving}
              className={`rounded-2xl py-4 items-center justify-center mb-8 shadow-md flex-row ${
                isSaving ? "bg-purple-400 shadow-purple-400/30" : "bg-purple-600 shadow-purple-600/30"
              }`}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" animating={true} />
              ) : (
                <>
                  <Plus size={18} color="#FFFFFF" />
                  <Text className="text-white font-bold text-base ml-2">Save Subscription</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
