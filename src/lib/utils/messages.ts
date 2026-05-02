import { MOTIVATIONAL_MESSAGES } from "../constants/motivational-messages";

export function getDailyMotivationalMessage() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - startOfYear.getTime()) + ((startOfYear.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Use day of year + year to ensure it changes every year even on same day
  const seed = dayOfYear + now.getFullYear();
  const index = seed % MOTIVATIONAL_MESSAGES.length;
  
  return MOTIVATIONAL_MESSAGES[index];
}
