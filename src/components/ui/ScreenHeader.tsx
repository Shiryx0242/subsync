import React from "react";
import { Appbar, Badge } from "react-native-paper";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Avatar } from "react-native-paper";

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  userEmail?: string;
  notificationCount?: number;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  userEmail,
  notificationCount = 0,
  onNotificationPress,
  onProfilePress,
}) => {
  const navigation = useNavigation();

  return (
    <Appbar.Header style={{ backgroundColor: "#F8FAFC", elevation: 0 }}>
      {showBack && (
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      )}
      
      {!showBack && userEmail && (
        <View className="ml-2 mr-2" onTouchEnd={onProfilePress}>
           <Avatar.Text 
             size={36} 
             label={userEmail.substring(0, 1).toUpperCase()} 
             style={{ backgroundColor: "#7C3AED" }}
             color="#FFFFFF"
           />
        </View>
      )}

      <Appbar.Content 
        title={title || "SubSync"} 
        subtitle={subtitle}
        titleStyle={{ fontWeight: "700", fontSize: 20 }}
      />
      
      <View>
        <Appbar.Action icon="bell-outline" onPress={onNotificationPress} />
        {notificationCount > 0 && (
          <Badge
            visible={true}
            size={18}
            style={{ position: "absolute", top: 8, right: 8, backgroundColor: "#EF4444" }}
          >
            {notificationCount}
          </Badge>
        )}
      </View>
    </Appbar.Header>
  );
};
