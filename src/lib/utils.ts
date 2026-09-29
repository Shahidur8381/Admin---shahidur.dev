import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return dateStr;
}

export function truncate(str: string, length = 60) {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "…" : str;
}
