export const BASE_URL = import.meta.env.BASE_URL ?? "/";

export function getToken(): string | null {
  return localStorage.getItem("jipe_token");
}

export function getRole(): string | null {
  return localStorage.getItem("jipe_role");
}

export function setAuth(token: string, role: string) {
  localStorage.setItem("jipe_token", token);
  localStorage.setItem("jipe_role", role);
}

export function clearAuth() {
  localStorage.removeItem("jipe_token");
  localStorage.removeItem("jipe_role");
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function isAdmin(): boolean {
  return getRole() === "admin";
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}
