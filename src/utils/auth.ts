// src/utils/auth.ts
export const getAccessToken = (): string | null =>
  localStorage.getItem("accessToken") || null;

type JWTPayload = { exp?: number; [k: string]: any };

export const parseJwt = (token: string): JWTPayload | null => {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
};

export const isTokenValid = (token: string | null, skewSeconds = 5): boolean => {
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now + skewSeconds;
};
