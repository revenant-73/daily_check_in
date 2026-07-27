import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hapticFeedback(type: "light" | "medium" | "heavy" | "success" = "light") {
  if (typeof window === "undefined" || !window.navigator.vibrate) return;

  switch (type) {
    case "light":
      window.navigator.vibrate(10);
      break;
    case "medium":
      window.navigator.vibrate(20);
      break;
    case "heavy":
      window.navigator.vibrate(50);
      break;
    case "success":
      window.navigator.vibrate([10, 30, 10]);
      break;
  }
}
