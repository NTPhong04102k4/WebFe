// Facebook SDK TypeScript definitions
declare global {
  interface Window {
    FB: any;
    fbAsyncInit?: () => void;
  }
}

export interface FacebookAuthResponse {
  accessToken: string;
  expiresIn: number;
  signedRequest: string;
  userID: string;
}

export interface FacebookUserInfo {
  id: string;
  name: string;
  email: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookLoginStatus {
  status: "connected" | "not_authorized" | "unknown";
  authResponse?: FacebookAuthResponse;
}

export interface FacebookSDK {
  init: (config: {
    appId: string;
    cookie: boolean;
    xfbml: boolean;
    version: string;
  }) => void;

  getLoginStatus: (callback: (response: FacebookLoginStatus) => void) => void;

  login: (
    callback: (response: FacebookLoginStatus) => void,
    options?: {
      scope: string;
      return_scopes: boolean;
    }
  ) => void;

  logout: (callback: (response: any) => void) => void;

  api: (path: string, callback: (response: any) => void) => void;

  AppEvents: {
    logPageView: () => void;
  };
}

export {};
