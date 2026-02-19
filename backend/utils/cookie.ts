import { Response, CookieOptions } from "express";

const isProduction = () => process.env.NODE_ENV === "production";

/**
 * Shared cookie options for the refresh token.
 * In production (cross-domain Vercel ↔ Render), we need:
 *   - secure: true          (HTTPS only)
 *   - sameSite: "none"      (allow cross-site cookie)
 * In development (same localhost origin):
 *   - secure: false
 *   - sameSite: "lax"       (default browser behaviour)
 */
export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/** Set the refresh-token cookie on the response. */
export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie("refreshToken", token, getRefreshTokenCookieOptions());
};

/**
 * Clear the refresh-token cookie.
 * Must use the SAME options (minus maxAge) so the browser actually removes it.
 */
export const clearRefreshTokenCookie = (res: Response): void => {
  const { maxAge: _, ...opts } = getRefreshTokenCookieOptions();
  res.clearCookie("refreshToken", opts);
};
