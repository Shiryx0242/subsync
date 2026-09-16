import React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, Calendar, Plus, PieChart, User } from "lucide-react-native";
import { HomeScreen } from "../screens/HomeScreen";
import { CalendarScreen } from "../screens/CalendarScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

// Empty screen component for the Add tab (action is intercepted)
const EmptyScreen = () => <View />;

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          backgroundColor: "#FFFFFF",
          borderRadius: 24,
          height: 64,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.05)",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Home size={24} color={focused ? "#6C4DF6" : "#CBD5E1"} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Calendar size={24} color={focused ? "#6C4DF6" : "#CBD5E1"} />
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={EmptyScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Prevent default navigation
            e.preventDefault();
            // In a real implementation we would open the modal here,
            // but we are triggering it from inside HomeScreen or a Global state.
            // For simplicity in this structure, we can navigate to Home and trigger a params
            // Or better yet, we just navigate to a dedicated screen if we want.
            // Wait, to trigger a modal from TabNavigator, we usually use a custom TabBarButton.
            // For now, let's let Home handle the modal and we just navigate to Home with a param.
            navigation.navigate("Home", { openAddModal: true });
          },
        })}
        options={{
          tabBarIcon: () => (
            <View className="w-12 h-12 rounded-full bg-[#6C4DF6] items-center justify-center -mt-6 shadow-lg shadow-purple-500/40 border-4 border-[#F7F8FC]">
              <Plus size={24} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <PieChart size={24} color={focused ? "#6C4DF6" : "#CBD5E1"} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <User size={24} color={focused ? "#6C4DF6" : "#CBD5E1"} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
