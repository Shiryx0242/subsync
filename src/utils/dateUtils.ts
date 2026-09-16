import dayjs from "dayjs";
import { Subscription } from "../types/subscription";

/**
 * Normalizes a date to the next upcoming occurrence based on cycle.
 * If billingDate is in the past, it advances it by months/years until it's >= today.
 */
export const getNextBillingDate = (billingDate: string, cycle: "monthly" | "yearly"): dayjs.Dayjs => {
  const originalDate = dayjs(billingDate).startOf("day");
  const today = dayjs().startOf("day");

  if (!originalDate.isValid()) {
    return today;
  }

  let nextDate = originalDate;
  
  // Advance date if it's in the past
  if (nextDate.isBefore(today)) {
    if (cycle === "monthly") {
      // Find the next occurrence in the current/future months
      const monthsDiff = today.diff(originalDate, 'month');
      nextDate = originalDate.add(monthsDiff, 'month');
      
      // If adding monthsDiff still keeps it in the past (e.g. earlier day in month), add 1 more
      if (nextDate.isBefore(today)) {
        nextDate = nextDate.add(1, 'month');
      }
    } else { // yearly
      const yearsDiff = today.diff(originalDate, 'year');
      nextDate = originalDate.add(yearsDiff, 'year');
      
      if (nextDate.isBefore(today)) {
        nextDate = nextDate.add(1, 'year');
      }
    }
  }

  return nextDate;
};

/**
 * Calculates how many days are remaining until the next billing date.
 */
export const getDaysRemaining = (billingDate: string, cycle: "monthly" | "yearly" = "monthly"): number => {
  const target = getNextBillingDate(billingDate, cycle);
  const today = dayjs().startOf("day");
  return target.diff(today, "day");
};

/**
 * Checks if a subscription is due tomorrow.
 */
export const isDueTomorrow = (billingDate: string, cycle: "monthly" | "yearly" = "monthly"): boolean => {
  return getDaysRemaining(billingDate, cycle) === 1;
};

/**
 * Checks if a subscription is due today.
 */
export const isDueToday = (billingDate: string, cycle: "monthly" | "yearly" = "monthly"): boolean => {
  return getDaysRemaining(billingDate, cycle) === 0;
};

/**
 * Checks if a subscription is due within a given number of days.
 */
export const isDueSoon = (billingDate: string, cycle: "monthly" | "yearly" = "monthly", daysThreshold: number = 7): boolean => {
  const days = getDaysRemaining(billingDate, cycle);
  return days >= 0 && days <= daysThreshold;
};

/**
 * Calculates the monthly equivalent cost.
 */
export const getMonthlyEquivalent = (price: number, cycle: "monthly" | "yearly"): number => {
  return cycle === "yearly" ? price / 12 : price;
};

/**
 * Calculates the total monthly cost of all subscriptions.
 */
export const calculateMonthlyTotal = (subscriptions: Subscription[]): number => {
  return subscriptions.reduce((sum, sub) => sum + getMonthlyEquivalent(sub.price, sub.cycle), 0);
};

/**
 * Calculates the yearly estimate of all subscriptions.
 */
export const calculateYearlyEstimate = (subscriptions: Subscription[]): number => {
  return calculateMonthlyTotal(subscriptions) * 12;
};

/**
 * Formats a date string into a user-friendly format (e.g. "17 Sep 2026").
 */
export const formatDisplayDate = (billingDate: string, cycle: "monthly" | "yearly" = "monthly"): string => {
  return getNextBillingDate(billingDate, cycle).format("DD MMM YYYY");
};

/**
 * Formats price in Thai Baht format (e.g. "฿419").
 */
export const formatCurrency = (amount: number): string => {
  // Use minimumFractionDigits and maximumFractionDigits to show decimals only if needed
  return `฿${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
