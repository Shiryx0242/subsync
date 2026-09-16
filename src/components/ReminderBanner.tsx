import React, { useState, useEffect } from "react";
import { Banner } from "react-native-paper";
import { Subscription } from "../types/subscription";
import { getDaysRemaining } from "../utils/dateUtils";

interface ReminderBannerProps {
  urgentSubscriptions: Subscription[];
  onActionPress?: () => void;
}

export const ReminderBanner: React.FC<ReminderBannerProps> = ({
  urgentSubscriptions,
  onActionPress,
}) => {
  const [visible, setVisible] = useState(true);

  // Auto-hide if there are no urgent subscriptions
  useEffect(() => {
    if (urgentSubscriptions.length === 0) {
      setVisible(false);
    } else {
      setVisible(true);
    }
  }, [urgentSubscriptions]);

  if (urgentSubscriptions.length === 0) return null;

  // Find the most urgent one
  const mostUrgent = urgentSubscriptions.sort(
    (a, b) => getDaysRemaining(a.billingDate, a.cycle) - getDaysRemaining(b.billingDate, b.cycle)
  )[0];

  const days = getDaysRemaining(mostUrgent.billingDate, mostUrgent.cycle);
  let urgencyText = "soon";
  if (days === 0) urgencyText = "today";
  else if (days === 1) urgencyText = "tomorrow";
  else urgencyText = `in ${days} days`;

  const bannerText =
    urgentSubscriptions.length > 1
      ? `${urgentSubscriptions.length} subscriptions are due within the next 7 days.`
      : `${mostUrgent.name} will be charged ${urgencyText}.`;

  return (
    <Banner
      visible={visible}
      actions={[
        {
          label: "View All",
          onPress: () => {
            if (onActionPress) onActionPress();
            setVisible(false);
          },
        },
        {
          label: "Dismiss",
          onPress: () => setVisible(false),
        },
      ]}
      icon="alert-circle-outline"
      style={{ backgroundColor: "#FFFBEB", borderRadius: 16, marginVertical: 8, marginHorizontal: 16 }}
    >
      {bannerText}
    </Banner>
  );
};
