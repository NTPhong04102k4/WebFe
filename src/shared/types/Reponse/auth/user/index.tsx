export interface LoginResponse {
  token: string;
  message: string;
}
export interface RegisterResponse {
  success: boolean;
  errorCode: string | null;
  message: string;
  data: null;
}
export interface UserResponse {
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
  passwordHash: string;
  passwordSalt: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  idSocial: string;
  lastLoginDate: Date;
  loginAttempts: number;
  isLocked: boolean;
  lockUntil: Date | null;
  isActive: true;
  createdDate: Date;
  updatedDate: Date;
  image: string;
}
export interface RegisterVerifyResponse {
  success: boolean;
  errorCode: string | null;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      fullName: string;
      emailVerified: boolean;
    };
  };
}
export interface ResendOtpResponse {
  success: boolean;
  errorCode: string | null;
  message: string;
  data: null;
}

export interface GoogleUserResponse {
  FirstName: string;
  Address: string;
  Image: string;
  Username: string;
  Email: string;
  IdentityNumber: string;
  Phone: string;
  DateOfBirth: Date | null;
  Gender: string;
  LastName: string;
  FullName: string;
  UserCode: string;
  UserID: string;
  UserUUID: string;
  tokens: {
    access_token: string;
    token_type: string;
  };
}
export interface FacebookUserResponse {
  FirstName: string;
  Address: string;
  Image: string;
  Username: string;
  Email: string;
  IdentityNumber: string;
  Phone: string;
  DateOfBirth: Date | null;
  Gender: string;
  LastName: string;
  FullName: string;
  UserCode: string;
  UserID: string;
  UserUUID: string;
  tokens: {
    access_token: string;
    token_type: string;
  };
}
