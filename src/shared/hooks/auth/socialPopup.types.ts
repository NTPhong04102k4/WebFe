export interface SocialTokens {
  access_token: string;
  token_type: string;
}

export interface OAuthSuccessMessage {
  type: "OAUTH_SUCCESS";
  user?: unknown;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  refreshToken?: string;
  tokens?: SocialTokens;
}

export interface OAuthErrorMessage {
  type: "OAUTH_ERROR";
  error?: string;
  message?: string;
}

export interface GoogleLoginSuccessMessage {
  type: "GOOGLE_LOGIN_SUCCESS";
  user?: unknown;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  refreshToken?: string;
  tokens?: SocialTokens;
  message?: string;
}

export interface GoogleLoginErrorMessage {
  type: "GOOGLE_LOGIN_ERROR";
  error?: string;
  message?: string;
}

export interface FacebookLoginSuccessMessage {
  type: "FACEBOOK_LOGIN_SUCCESS";
  user?: unknown;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  refreshToken?: string;
  tokens?: SocialTokens;
}

export interface FacebookLoginErrorMessage {
  type: "FACEBOOK_LOGIN_ERROR";
  error?: string;
  message?: string;
}

export type SocialAuthMessage =
  | OAuthSuccessMessage
  | OAuthErrorMessage
  | GoogleLoginSuccessMessage
  | GoogleLoginErrorMessage
  | FacebookLoginSuccessMessage
  | FacebookLoginErrorMessage;

export type SocialAuthProvider = "google" | "facebook";

export type SocialAuthResult = {
  provider: SocialAuthProvider;
  user: unknown;
  refreshToken?: string;
  tokens: SocialTokens;
};

