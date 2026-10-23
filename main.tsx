import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import { MotionConfig } from "motion/react";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import "./index.css";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1,
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={
      <main className="grid min-h-screen place-items-center p-6">
        <section className="card max-w-md p-6 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-2">Please reload FundaAzu to continue.</p>
          <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>Reload</button>
        </section>
      </main>
    }>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <App />
        </AuthProvider>
      </MotionConfig>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
