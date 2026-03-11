import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24,
          fontFamily: "system-ui, sans-serif",
          background: "#fef2f2",
          color: "#b91c1c",
          minHeight: "100vh",
        }}>
          <h1 style={{ marginBottom: 8 }}>Something went wrong</h1>
          <pre style={{ overflow: "auto", fontSize: 12 }}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const el = document.getElementById("root");
if (!el) throw new Error("Root element #root not found");
createRoot(el).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
