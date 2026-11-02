import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(val: number): string {
  return new Intl.NumberFormat("en-US").format(val);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toUpperCase()) {
    case "APPROVED":
    case "COMPLETED":
    case "SETTLED":
    case "ACTIVE":
    case "AVAILABLE":
      return "bg-[#EAF3EB] text-[#27532F] border border-[#CDE3D0]";
    case "IN_PROGRESS":
    case "BIDDING":
    case "RUNNING":
    case "BUSY":
      return "bg-[#EBF2FA] text-[#28568A] border border-[#BCD1E7]";
    case "COUNTEROFFERED":
    case "REVIEW":
    case "UNDER_REVIEW":
    case "EVALUATING":
      return "bg-[#F7F3E8] text-[#8C6D23] border border-[#E5DAC2]";
    case "PENDING":
    case "OPEN":
    case "DRAFT":
      return "bg-[#F7F3E8] text-[#8C6D23] border border-[#E5DAC2]";
    case "REJECTED":
    case "FAILED":
    case "DISPUTED":
    case "CANCELLED":
    case "OFFLINE":
      return "bg-[#F8ECEC] text-[#7A2929] border border-[#ECCACA]";
    default:
      return "bg-[#EAE5D7] text-[#77796F] border border-[#E4DFD2]";
  }
}
