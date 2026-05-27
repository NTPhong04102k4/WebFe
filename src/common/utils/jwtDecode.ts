import { jwtDecode } from "jwt-decode";
import type { AuthUser } from "@/services/types/auth.types";

/**
 * JWT claims sau khi backend fix (Option A):
 *
 * Customer:
 *   sub         = user.UserUUID  (Guid) → DefaultInboundClaimTypeMap maps → NameIdentifier ✓
 *   UserCode    = "USR_001"      (custom claim)
 *   email, name, unique_name     = user info
 *   role        = "Customer"
 *
 * Staff/Admin:
 *   sub         = staff.StaffID  (int string) → maps → NameIdentifier
 *   StaffID     = staff.StaffID  (custom claim, giữ lại)
 *   name, unique_name            = staff info
 *   role        = "Admin" | "Staff" | ...
 */
interface JwtPayload {
  sub?: string;
  email?: string;
  name?: string;
  unique_name?: string;
  exp?: number;
  iat?: number;
  jti?: string;

  // ASP.NET Core long-form claims
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;

  // Custom claims
  UserCode?: string;
  StaffID?: string;
}

function isGuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  );
}

export type DecodedUser = AuthUser;

export function decodeToken(token: string): DecodedUser | null {
  try {
    const p = jwtDecode<JwtPayload>(token);

    const role =
      p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      "Customer";

    const fullName =
      p.name ??
      p["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
      p.unique_name ??
      "";

    const email = p.email ?? "";

    // UserUUID: sau fix, sub = UUID cho Customer
    // Fallback: nameidentifier URI (khi DefaultOutboundClaimTypeMap bị disable phía backend)
    const rawNameId =
      p["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    let userUUID = "";
    if (isGuid(p.sub)) {
      userUUID = p.sub;
    } else if (isGuid(rawNameId)) {
      userUUID = rawNameId;
    }

    // Username: unique_name hoặc UserCode (sub không còn là username với Customer)
    const username = p.unique_name ?? p.UserCode ?? p.sub ?? "";

    // id số: chỉ có giá trị cho Staff (StaffID là int)
    const numericId = parseInt(p.StaffID ?? "", 10) || 0;

    return {
      id: numericId,
      userID: numericId,
      userUUID,
      userCode: p.UserCode ?? "",
      username,
      email,
      fullName,
      role,
    };
  } catch {
    return null;
  }
}
