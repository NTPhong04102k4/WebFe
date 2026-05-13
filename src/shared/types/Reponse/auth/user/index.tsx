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

export type UserProfile = {
  userID: string;
  userUUID?: string;
  userCode?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  dateOfBirth?: string | null;
  gender?: "Male" | "Female" | "Other" | string | null;
  identityNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  username: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  idSocial?: string | null;
  lastLoginDate?: string | null;
  loginAttempts?: number;
  isLocked?: boolean;
  lockUntil?: string | null;
  isActive: boolean;
  createdDate?: string;
  updatedDate?: string;
  image?: string | null;
  fcmToken?: string | null;
};

export type UserListPeriod = "7d" | "30d" | "all" | "custom";

export type UserListQuery = {
  page?: number;
  pageSize?: number;
  period?: UserListPeriod;
  fromDate?: string;
  toDate?: string;
  search?: string;
  email?: string;
  username?: string;
  phone?: string;
  isActive?: boolean;
  isLocked?: boolean;
  sortBy?: "createdDate" | "updatedDate" | "lastLoginDate" | "username";
  sortDir?: "asc" | "desc";
};

export type PagedUsersResponse = {
  items: UserProfile[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  period: UserListPeriod;
  fromDate?: string | null;
  toDate?: string | null;
  search?: string | null;
};

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
