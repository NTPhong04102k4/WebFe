import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            fontFamily: "Arial, sans-serif",
          }}
        >
          <h2 style={{ color: "#e74c3c", marginBottom: "0.5rem" }}>
            Đã xảy ra lỗi
          </h2>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            {this.state.error?.message ?? "Lỗi không xác định"}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: "0.5rem 1.5rem",
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
