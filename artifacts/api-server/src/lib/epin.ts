export function generateEpin(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pin = "";
  for (let i = 0; i < length; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
}

export const PACKAGES = {
  starter: { price: 1100, bv: 0.5 },
  smart: { price: 2100, bv: 1 },
  silver: { price: 5200, bv: 2 },
  gold: { price: 10100, bv: 4 },
} as const;

export type PackageType = keyof typeof PACKAGES;

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateMemberId(): string {
  const prefix = "JL";
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${num}`;
}

export const DEDUCTION_RATE = 0.15; // 15% total
export const ADMIN_FEE_RATE = 0.10; // 10%
export const TDS_RATE = 0.05;        // 5%

export function calculateWithdrawal(gross: number): { gross: number; deduction: number; net: number } {
  const deduction = gross * DEDUCTION_RATE;
  return { gross, deduction, net: gross - deduction };
}
