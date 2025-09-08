import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(1)}Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)}L`;
  } else if (price >= 1000) {
    return `₹${(price / 1000).toFixed(1)}K`;
  } else {
    return `₹${price.toLocaleString()}`;
  }
}

export function formatArea(area: number): string {
  return `${area.toLocaleString()} sq ft`;
}

export function generatePropertySlug(title: string, id: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `${slug}-${id.slice(-8)}`;
}

export function extractCityFromAddress(address: string): string {
  const parts = address.split(',');
  return parts.length > 1 ? parts[parts.length - 2].trim() : address;
}

export function calculatePricePerSqft(price: number, area: number): number {
  return Math.round(price / area);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
