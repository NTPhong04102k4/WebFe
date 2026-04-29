import type { AuthUser } from "@/stores/authStore";
import type {
  FacebookUserResponse,
  GoogleUserResponse,
} from "src/shared/types/Reponse/auth/user";
import { getRolesFromToken } from "src/services/decode";

export const useSocialAuthMapper = () => {
  const mapGoogleUser = (googleUser: GoogleUserResponse, token: string): AuthUser => {
    const roles = getRolesFromToken(token);
    const id = Number.parseInt(googleUser.UserID, 10) || 0;
    return {
      id,
      userID: id,
      userUUID: googleUser.UserUUID,
      userCode: googleUser.UserCode,
      firstName: googleUser.FirstName,
      lastName: googleUser.LastName,
      fullName: googleUser.FullName,
      phone: googleUser.Phone ?? "",
      email: googleUser.Email,
      address: googleUser.Address ?? "",
      username: googleUser.Username,
      image: googleUser.Image ?? "",
      role: roles[0] ?? "Customer",
    };
  };
  const mapFacebookUser = (facebookUser: FacebookUserResponse, token: string): AuthUser => {
    const roles = getRolesFromToken(token);
    const id = Number.parseInt(facebookUser.UserID, 10) || 0;
    return {
      id,
      userID: id,
      userUUID: facebookUser.UserUUID,
      userCode: facebookUser.UserCode,
      firstName: facebookUser.FirstName,
      lastName: facebookUser.LastName,
      fullName: facebookUser.FullName,
      phone: facebookUser.Phone ?? "",
      email: facebookUser.Email ?? "",
      address: facebookUser.Address ?? "",
      username: facebookUser.Username ?? "",
      image: facebookUser.Image ?? "",
      role: roles[0] ?? "Customer",
    };
  };
  return {
    mapGoogleUser,
    mapFacebookUser,
  };
};
