import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AuthCallback: React.FC = () => {
  const location = useLocation();

  const exchangeCodeWithBackend = async (code: string) => {
    try {
      console.log("🔍 Sending authorization code to backend");

      // Send authorization code to backend
      const response = await fetch("http://localhost:7250/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          redirectUri: window.location.origin + "/auth/callback",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to exchange code with backend");
      }

      const data = await response.json();
      console.log("🔍 Backend response:", data);

      return data; // Backend should return user info and tokens
    } catch (error) {
      console.error("❌ Error in exchangeCodeWithBackend:", error);
      throw error;
    }
  };

  useEffect(() => {
    // For authorization code flow, the code is in the URL query params
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");

    console.log("🔍 Auth callback received:", { code, state, error });

    if (error) {
      console.error("❌ OAuth error:", error);
      window.opener?.postMessage(
        {
          type: "GOOGLE_LOGIN_ERROR",
          error: error,
        },
        window.location.origin
      );
    } else if (code && state === "google_login") {
      console.log("🔍 Processing Google OAuth authorization code");

      // Send code to backend for token exchange
      exchangeCodeWithBackend(code)
        .then((data) => {
          console.log("🎉 Sending backend response to parent window");
          window.opener?.postMessage(
            {
              type: "GOOGLE_LOGIN_SUCCESS",
              user: data.user,
              tokens: data.tokens, // Access token, refresh token, etc.
            },
            window.location.origin
          );
        })
        .catch((error) => {
          console.error("❌ Error exchanging code with backend:", error);
          window.opener?.postMessage(
            {
              type: "GOOGLE_LOGIN_ERROR",
              error: error.message,
            },
            window.location.origin
          );
        });
    }

    // Close the popup
    window.close();
  }, [location]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h2>Processing login...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
