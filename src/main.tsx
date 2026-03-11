import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends Component<
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
          fontFamily: 'system-ui, sans-serif',
          background: '#fff3cd',
          color: '#856404',
          minHeight: '100vh',
        }}>
          <h1 style={{ marginBottom: 8 }}>Something went wrong</h1>
          <pre style={{ overflow: 'auto', fontSize: 12 }}>
            {this.state.error.message}
          </pre>
          <pre style={{ overflow: 'auto', fontSize: 11, marginTop: 12, opacity: 0.8 }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");
createRoot(root).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
