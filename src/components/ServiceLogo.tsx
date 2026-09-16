import React, { useState } from "react";
import { View } from "react-native";
import { Avatar } from "react-native-paper";

interface ServiceLogoProps {
  name: string;
  logo?: string;
  size?: number;
  brandColor?: string;
}

export const ServiceLogo: React.FC<ServiceLogoProps> = ({
  name,
  logo,
  size = 48,
  brandColor = "#7C3AED",
}) => {
  const [imageError, setImageError] = useState(false);

  // Generate initials from name (e.g. "ChatGPT Plus" -> "CP")
  const getInitials = (str: string) => {
    const parts = str.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  if (!logo || imageError) {
    return (
      <View
        className="items-center justify-center rounded-2xl overflow-hidden"
        style={{ width: size, height: size, backgroundColor: brandColor }}
      >
        <Avatar.Text
          size={size}
          label={getInitials(name)}
          style={{ backgroundColor: "transparent" }}
          color="#FFFFFF"
        />
      </View>
    );
  }

  return (
    <View
      className="items-center justify-center rounded-2xl overflow-hidden shadow-sm shadow-slate-200"
      style={{ width: size, height: size, backgroundColor: "#FFFFFF" }}
    >
      <Avatar.Image
        size={size}
        source={{ uri: logo }}
        style={{ backgroundColor: "transparent" }}
        onError={() => setImageError(true)}
      />
    </View>
  );
};
