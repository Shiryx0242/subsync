import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ActivityIndicator } from "react-native-paper";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
}) => {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50">
      <ActivityIndicator animating={true} color="#7C3AED" size="large" />
      <Text className="mt-4 text-sm font-medium text-slate-500">{message}</Text>
    </View>
  );
};
