import {
  FacebookUserResponse,
  GoogleUserResponse,
} from "src/shared/types/Reponse/auth/user";
export interface MappedUserData {
  userID: number;
  userUUID: string;
  userCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: Date | null;
  gender: string;
  identityNumber: string;
  phone: string;
  email: string;
  address: string;
  username: string;
  lastLoginDate: Date;
  loginAttempts: number;
  isLocked: boolean;
  lockUntil: Date | null;
  isActive: boolean;
  updatedDate: Date;
  image: string;
}

export const useSocialAuthMapper = () => {
  const mapGoogleUser = (googleUser: GoogleUserResponse): MappedUserData => {
    return {
      userID: parseInt(googleUser.UserID),
      userUUID: googleUser.UserUUID,
      userCode: googleUser.UserCode,
      firstName: googleUser.FirstName,
      lastName: googleUser.LastName,
      fullName: googleUser.FullName,
      dateOfBirth: null,
      gender: googleUser.Gender,
      identityNumber: googleUser.IdentityNumber,
      phone: googleUser.Phone ?? "",
      email: googleUser.Email,
      address: googleUser.Address ?? "",
      username: googleUser.Username,
      lastLoginDate: new Date(),
      loginAttempts: 0,
      isLocked: false,
      lockUntil: null,
      isActive: true,
      updatedDate: new Date(),
      image: googleUser.Image ?? "",
    };
  };
  const mapFacebookUser = (
    facebookUser: FacebookUserResponse
  ): MappedUserData => {
    return {
      userID: parseInt(facebookUser.UserID),
      userUUID: facebookUser.UserUUID,
      userCode: facebookUser.UserCode,
      firstName: facebookUser.FirstName,
      lastName: facebookUser.LastName,
      fullName: facebookUser.FullName,
      dateOfBirth: null,
      gender: facebookUser.Gender,
      identityNumber: facebookUser.IdentityNumber,
      phone: facebookUser.Phone ?? "",
      email: facebookUser.Email ?? "",
      address: facebookUser.Address ?? "",
      username: facebookUser.Username ?? "",
      lastLoginDate: new Date(),
      loginAttempts: 0,
      isLocked: false,
      lockUntil: null,
      isActive: true,
      updatedDate: new Date(),
      image: facebookUser.Image ?? "",
    };
  };
  return {
    mapGoogleUser,
    mapFacebookUser,
  };
};
