import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { Subscription } from "../types/subscription";

const NOTIF_STORAGE_KEY = "@subsync_scheduled_notifs";

// Configure how notifications appear when app is open (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Initializes notification channels for Android.
 */
export const initNotifications = async (): Promise<void> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("billing-reminders", {
      name: "Billing Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7C3AED",
      sound: "default",
    });
  }
};

/**
 * Requests permission to display notifications.
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};

/**
 * Schedules reminders for a subscription:
 * 1. 1 day before due date at 09:00 AM
 * 2. On the due date at 09:00 AM
 */
export const scheduleSubscriptionReminder = async (
  sub: Subscription
): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("Notifications permission not granted; skipping schedule.");
      return;
    }

    await initNotifications();

    const scheduledIds: string[] = [];

    // 1. One day before
    const oneDayBefore = dayjs(sub.billingDate).subtract(1, "day").hour(9).minute(0).second(0);
    if (oneDayBefore.isAfter(dayjs())) {
      const id1 = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⚠️ Upcoming Payment: ${sub.name}`,
          body: `Tomorrow is your ${sub.name} payment due date of ฿${sub.price.toLocaleString("th-TH")}.`,
          sound: "default",
          data: { subId: sub.id, type: "one-day-before" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: oneDayBefore.toDate(),
          channelId: "billing-reminders",
        },
      });
      scheduledIds.push(id1);
    }

    // 2. On due date
    const dueDate = dayjs(sub.billingDate).hour(9).minute(0).second(0);
    if (dueDate.isAfter(dayjs())) {
      const id2 = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔔 Payment Due Today: ${sub.name}`,
          body: `Your ${sub.name} bill of ฿${sub.price.toLocaleString("th-TH")} is scheduled for today.`,
          sound: "default",
          data: { subId: sub.id, type: "due-today" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dueDate.toDate(),
          channelId: "billing-reminders",
        },
      });
      scheduledIds.push(id2);
    }

    // Save scheduled IDs mapped to sub.id
    if (scheduledIds.length > 0) {
      const storedMapJson = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
      const map: Record<string, string[]> = storedMapJson ? JSON.parse(storedMapJson) : {};
      map[sub.id] = scheduledIds;
      await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(map));
    }
  } catch (error) {
    console.error("Failed to schedule notification for subscription:", error);
  }
};

/**
 * Cancels all scheduled reminders associated with a subscription.
 */
export const cancelSubscriptionReminders = async (subId: string): Promise<void> => {
  try {
    const storedMapJson = await AsyncStorage.getItem(NOTIF_STORAGE_KEY);
    if (!storedMapJson) return;

    const map: Record<string, string[]> = JSON.parse(storedMapJson);
    const ids = map[subId];

    if (ids && ids.length > 0) {
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      delete map[subId];
      await AsyncStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(map));
    }
  } catch (error) {
    console.error("Failed to cancel scheduled notifications:", error);
  }
};

/**
 * Sends a test notification immediately (after 2 seconds) so the user can verify notifications.
 */
export const sendImmediateTestNotification = async (): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return false;
    }

    await initNotifications();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 SubSync Notification",
        body: "Test successful! You will receive reminders before your subscriptions renew.",
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
        channelId: "billing-reminders",
      },
    });

    return true;
  } catch (error) {
    console.error("Error sending test notification:", error);
    return false;
  }
};
