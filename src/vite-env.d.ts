/// <reference types="vite/client" />

interface FacebookSDK {
  init(params: {
    appId: string | undefined;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;
  login(
    callback: (response: { authResponse?: { accessToken: string } }) => void,
    options?: { scope?: string }
  ): void;
  api(path: string, callback: (response: unknown) => void): void;
}

interface Window {
  FB: FacebookSDK | undefined;
}

