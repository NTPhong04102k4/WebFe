import type { AuthUser } from "@/stores/authStore";
import type {
  FacebookUserResponse,
  GoogleUserResponse,
  UserResponse,
} from "src/shared/types/Reponse/auth/user";
import { getRolesFromToken } from "src/services/decode";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function hasString(
  v: Record<string, unknown>,
  k: string,
): v is Record<string, string> {
  return typeof v[k] === "string";
}

function hasNumber(
  v: Record<string, unknown>,
  k: string,
): v is Record<string, number> {
  return typeof v[k] === "number";
}

export function isBackendUserResponse(v: unknown): v is UserResponse {
  if (!isRecord(v)) return false;
  return (
    hasNumber(v, "userID") && hasString(v, "userUUID") && hasString(v, "email")
  );
}

export function isGoogleUserResponse(v: unknown): v is GoogleUserResponse {
  if (!isRecord(v)) return false;
  return (
    hasString(v, "UserID") &&
    hasString(v, "UserUUID") &&
    hasString(v, "FullName")
  );
}

export function isFacebookUserResponse(v: unknown): v is FacebookUserResponse {
  if (!isRecord(v)) return false;
  return (
    hasString(v, "UserID") &&
    hasString(v, "UserUUID") &&
    hasString(v, "FullName")
  );
}

export function toAuthUserFromBackend(
  profile: UserResponse,
  token: string,
): AuthUser {
  const roles = getRolesFromToken(token);
  return {
    id: profile.userID,
    userID: profile.userID,
    userUUID: profile.userUUID,
    userCode: profile.userCode,
    username: profile.username,
    email: profile.email,
    fullName: profile.fullName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    address: profile.address,
    image: profile.image,
    role: roles[0] ?? "Customer",
  };
}

export function toAuthUserFromGoogle(
  u: GoogleUserResponse,
  token: string,
): AuthUser {
  const roles = getRolesFromToken(token);
  const id = Number.parseInt(u.UserID, 10) || 0;
  return {
    id,
    userID: id,
    userUUID: u.UserUUID,
    userCode: u.UserCode,
    username: u.Username,
    email: u.Email,
    fullName: u.FullName,
    firstName: u.FirstName,
    lastName: u.LastName,
    phone: u.Phone ?? "",
    address: u.Address ?? "",
    image: u.Image ?? "",
    role: roles[0] ?? "Customer",
  };
}

export function toAuthUserFromFacebook(
  u: FacebookUserResponse,
  token: string,
): AuthUser {
  const roles = getRolesFromToken(token);
  const id = Number.parseInt(u.UserID, 10) || 0;
  return {
    id,
    userID: id,
    userUUID: u.UserUUID,
    userCode: u.UserCode,
    username: u.Username ?? "",
    email: u.Email ?? "",
    fullName: u.FullName,
    firstName: u.FirstName,
    lastName: u.LastName,
    phone: u.Phone ?? "",
    address: u.Address ?? "",
    image: u.Image ?? "",
    role: roles[0] ?? "Customer",
  };
}
