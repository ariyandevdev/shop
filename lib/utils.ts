import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  price: number | string | { toString(): string }
): string {
  // Handle Prisma Decimal type and other types
  const numPrice =
    typeof price === "string"
      ? parseFloat(price)
      : typeof price === "number"
      ? price
      : parseFloat(price.toString());

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numPrice);
}
