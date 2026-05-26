import { jwtDecode } from "jwt-decode";
import type { AuthUser } from "@/services/types/auth.types";

/**
 * Mapping đầy đủ JWT claims từ ASP.NET Core backend
 *
 * Backend gửi (sau fix):
 *   sub           = Username                     (e.g. "phong123")
 *   email         = user.Email                   (e.g. "phong@gmail.com")
 *   name          = FirstName + " " + LastName   (e.g. "Phong Nguyen")
 *   unique_name   = Username                     (e.g. "phong123")
 *   UserCode      = user.UserCode                (e.g. "USR_001")
 *   http://...nameidentifier = user.UserUUID     (Guid string)
 *   http://...role           = "Customer"
 *   jti, iat, exp            = token metadata
 */
interface JwtPayload {
  // Standard claims
  sub?: string; // Username
  email?: string; // Email thật của user
  name?: string; // FullName (FirstName + LastName)
  unique_name?: string; // Username (same as sub)
  exp?: number;
  iat?: number;
  jti?: string;

  // ASP.NET Core long-form claims
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string; // UserUUID (Guid)
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"?: string; // FullName (nếu có)
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string; // Role

  // Custom claims
  UserCode?: string; // e.g. "USR_001"
  StaffID?: string; // chỉ cho Staff/Admin
}

export type DecodedUser = AuthUser;

export function decodeToken(token: string): DecodedUser | null {
  try {
    const p = jwtDecode<JwtPayload>(token);

    // Role: ASP.NET URI claim → fallback "role" claim
    const role =
      p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      "Customer";

    // FullName: "name" claim (JwtRegisteredClaimNames.Name được ASP.NET serialize thành "name")
    // Fallback về ClaimTypes.Name URI → unique_name
    const fullName =
      p.name ??
      p["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
      p.unique_name ??
      p.sub ??
      "";

    // Username: unique_name → sub
    const username = p.unique_name ?? p.sub ?? "";

    // Email thật
    const email = p.email ?? "";

    // UserUUID (Guid string) từ NameIdentifier claim
    // Không parseInt vì UUID không phải số — giữ nguyên string
    const userUUID =
      p[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ?? "";

    // id dạng số: chỉ có giá trị cho Staff (StaffID là int)
    // Với Customer, userUUID là Guid → id = 0, dùng userUUID thay thế
    const numericId = parseInt(p.StaffID ?? "", 10) || 0;

    return {
      id: numericId,
      userID: numericId,
      userUUID, // Guid string — dùng để identify Customer
      userCode: p.UserCode ?? "", // "USR_001"
      username,
      email,
      fullName,
      role,
    };
  } catch {
    return null;
  }
}
