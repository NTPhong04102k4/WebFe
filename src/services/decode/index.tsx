import { jwtDecode } from "jwt-decode";

/**
 * Interface for decoded JWT payload
 */
export interface DecodedToken {
  exp?: number; // Expiration time (Unix timestamp)
  iat?: number; // Issued at time (Unix timestamp)
  sub?: string; // Subject (usually user ID)
  [key: string]: any; // Other custom claims
}

/**
 * Decode JWT token and return the payload
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export const decodeToken = (token: string | null): DecodedToken | null => {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired or invalid, false otherwise
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }

  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

/**
 * Get expiration time from JWT token
 * @param token - JWT token string
 * @returns Expiration date or null if invalid
 */
export const getTokenExpiration = (token: string | null): Date | null => {
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    // exp is in Unix timestamp (seconds), convert to Date
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error("Error getting token expiration:", error);
    return null;
  }
};

/**
 * Get time until token expires
 * @param token - JWT token string
 * @returns Time in milliseconds until expiration, or null if invalid/expired
 */
export const getTimeUntilExpiration = (token: string | null): number | null => {
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    const currentTime = Date.now() / 1000;
    const expirationTime = decoded.exp;
    const timeUntilExpiration = (expirationTime - currentTime) * 1000; // Convert to milliseconds

    return timeUntilExpiration > 0 ? timeUntilExpiration : null;
  } catch (error) {
    console.error("Error getting time until expiration:", error);
    return null;
  }
};

/**
 * Get user ID from JWT token (from 'sub' claim or custom 'userId' claim)
 * @param token - JWT token string
 * @returns User ID or null if not found
 */
export const getUserIdFromToken = (token: string | null): string | null => {
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeToken(token);
    if (!decoded) {
      return null;
    }

    // Try common JWT claims for user ID
    return (
      decoded.sub || decoded.userId || decoded.id || decoded.userID || null
    );
  } catch (error) {
    console.error("Error getting user ID from token:", error);
    return null;
  }
};

/**
 * Get all claims from JWT token
 * @param token - JWT token string
 * @returns All token claims or null if invalid
 */
export const getTokenClaims = (token: string | null): DecodedToken | null => {
  return decodeToken(token);
};

const ROLE_CLAIM_KEYS = [
  "role",
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
] as const;

/** Roles from JWT (ASP.NET thường dùng claim `role` hoặc URL claim). */
export const getRolesFromToken = (token: string | null): string[] => {
  const d = decodeToken(token);
  if (!d) {
    return [];
  }
  for (const key of ROLE_CLAIM_KEYS) {
    const raw = d[key];
    if (raw === undefined || raw === null) {
      continue;
    }
    if (Array.isArray(raw)) {
      return raw.map(String);
    }
    if (typeof raw === "string") {
      return [raw];
    }
  }
  return [];
};

/**
 * Validate JWT token (check if it exists and is not expired)
 * @param token - JWT token string
 * @returns true if token is valid and not expired, false otherwise
 */
export const isValidToken = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  return !isTokenExpired(token);
};
