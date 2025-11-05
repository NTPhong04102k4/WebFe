import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const AuthCallback: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // This component is only used as a fallback
    // The actual OAuth flow should redirect directly to backend API
    console.log(
      "🔍 Frontend callback page accessed - this should not happen in normal OAuth flow"
    );

    // Show error message
    window.opener?.postMessage(
      {
        type: "OAUTH_ERROR",
        error: "Invalid OAuth flow - should redirect to backend API",
      },
      "*"
    );

    // Close the popup
    setTimeout(() => {
      window.close();
    }, 2000);
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
