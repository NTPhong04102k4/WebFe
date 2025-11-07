import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [message, setMessage] = useState("Processing login...");

  useEffect(() => {
    // Check if we have an opener (popup window)
    if (!window.opener) {
      setStatus("error");
      setMessage("Invalid OAuth flow - no opener window found");
      return;
    }

    // Function to parse JSON from page content
    const parseResponseFromPage = () => {
      try {
        // Try to find JSON in page content (could be in script tag, pre tag, or body text)
        const bodyText =
          document.body.innerText || document.body.textContent || "";

        // Try to parse JSON from body text
        const jsonMatch = bodyText.match(/\{[\s\S]*"type"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const response = JSON.parse(jsonMatch[0]);
            return response;
          } catch (e) {
            // Try to find JSON in script tags
            const scripts = document.getElementsByTagName("script");
            for (let i = 0; i < scripts.length; i++) {
              const scriptContent = scripts[i].innerHTML;
              if (
                scriptContent.includes("FACEBOOK_LOGIN_SUCCESS") ||
                scriptContent.includes("GOOGLE_LOGIN_SUCCESS")
              ) {
                const jsonMatch2 = scriptContent.match(
                  /\{[\s\S]*"type"[\s\S]*\}/
                );
                if (jsonMatch2) {
                  try {
                    return JSON.parse(jsonMatch2[0]);
                  } catch (e2) {
                    // Continue
                  }
                }
              }
            }
          }
        }

        // Try to find JSON in pre tags
        const preTags = document.getElementsByTagName("pre");
        for (let i = 0; i < preTags.length; i++) {
          try {
            const response = JSON.parse(preTags[i].textContent || "");
            if (response.type) {
              return response;
            }
          } catch (e) {
            // Continue
          }
        }
      } catch (error) {
        console.error("Error parsing response from page:", error);
      }
      return null;
    };

    // Function to send response to parent and close
    const handleResponse = (response: any) => {
      if (!response) return;

      if (
        response.type === "FACEBOOK_LOGIN_SUCCESS" ||
        response.type === "GOOGLE_LOGIN_SUCCESS"
      ) {
        setStatus("success");
        setMessage(
          response.message || "Authentication successful! Closing window..."
        );

        // Send to parent window with proper format
        window.opener.postMessage(
          {
            type: response.type,
            user: response.user,
            token: response.token,
            tokens: response.token
              ? { access_token: response.token }
              : undefined,
          },
          "*"
        );

        // Close popup
        setTimeout(() => {
          window.close();
        }, 1000);
      } else if (
        response.type === "FACEBOOK_LOGIN_ERROR" ||
        response.type === "GOOGLE_LOGIN_ERROR"
      ) {
        setStatus("error");
        setMessage(
          response.message || response.error || "Authentication failed"
        );

        window.opener.postMessage(
          {
            type: response.type,
            error:
              response.message || response.error || "Authentication failed",
          },
          "*"
        );

        setTimeout(() => {
          window.close();
        }, 2000);
      }
    };

    // Extract data from URL
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const code = searchParams.get("code");
    const accessToken = searchParams.get("access_token");
    const state = searchParams.get("state");

    // Check for error in URL
    if (error) {
      const errorMsg = errorDescription || error || "Authentication failed";
      setStatus("error");
      setMessage(errorMsg);

      window.opener.postMessage(
        {
          type: "OAUTH_ERROR",
          error: errorMsg,
        },
        "*"
      );

      setTimeout(() => {
        window.close();
      }, 2000);
      return;
    }

    // Try to parse response from page content immediately
    const pageResponse = parseResponseFromPage();
    if (pageResponse) {
      handleResponse(pageResponse);
      return;
    }

    // If no response in page, check URL parameters
    if (code || accessToken) {
      // Wait a bit for page to load with response
      setTimeout(() => {
        const delayedResponse = parseResponseFromPage();
        if (delayedResponse) {
          handleResponse(delayedResponse);
        } else {
          // Fallback: send code to parent
          if (code && window.opener) {
            window.opener.postMessage(
              {
                type: "OAUTH_SUCCESS",
                code: code,
                state: state,
              },
              "*"
            );
          }
          setStatus("success");
          setMessage("Authentication successful! Closing window...");
          setTimeout(() => {
            window.close();
          }, 1000);
        }
      }, 500);
    } else {
      // Wait for page to load and check for JSON response
      setMessage("Waiting for authentication response...");

      // Check periodically for JSON response in page
      const checkInterval = setInterval(() => {
        const response = parseResponseFromPage();
        if (response) {
          clearInterval(checkInterval);
          handleResponse(response);
        }
      }, 200);

      // Listen for postMessage from backend
      const messageListener = (event: MessageEvent) => {
        if (event.data && typeof event.data === "object" && event.data.type) {
          clearInterval(checkInterval);
          window.removeEventListener("message", messageListener);
          handleResponse(event.data);
        }
      };

      window.addEventListener("message", messageListener);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        window.removeEventListener("message", messageListener);
        if (status === "processing") {
          setStatus("error");
          setMessage("Authentication timeout");
          if (window.opener) {
            window.opener.postMessage(
              {
                type: "OAUTH_ERROR",
                error: "Authentication timeout",
              },
              "*"
            );
          }
          setTimeout(() => {
            window.close();
          }, 2000);
        }
      }, 10000);
    }
  }, [location, searchParams, status]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "2rem",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {status === "processing" && (
          <div>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem",
              }}
            />
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}
        {status === "success" && (
          <div
            style={{ color: "#27ae60", fontSize: "3rem", marginBottom: "1rem" }}
          >
            ✓
          </div>
        )}
        {status === "error" && (
          <div
            style={{ color: "#e74c3c", fontSize: "3rem", marginBottom: "1rem" }}
          >
            ✗
          </div>
        )}
        <h2
          style={{
            margin: "0 0 0.5rem 0",
            color:
              status === "error"
                ? "#e74c3c"
                : status === "success"
                ? "#27ae60"
                : "#333",
          }}
        >
          {status === "processing"
            ? "Processing login..."
            : status === "success"
            ? "Success!"
            : "Error"}
        </h2>
        <p style={{ margin: 0, color: "#666" }}>{message}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
