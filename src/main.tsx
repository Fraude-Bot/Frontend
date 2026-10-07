import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/presentation/App";
import { DependencyProvider } from "@/presentation/providers/DependencyProvider";
import { ErrorBoundary } from "@/presentation/shared/components/ErrorBoundary";
import { createDependencies } from "@/infrastructure/di/container";
import { reportUnexpectedUiError } from "@/infrastructure/observability/error-reporter";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary onError={reportUnexpectedUiError}>
      <DependencyProvider dependencies={createDependencies()}>
        <App />
      </DependencyProvider>
    </ErrorBoundary>
  </StrictMode>,
);
