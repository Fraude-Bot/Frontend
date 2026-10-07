import { Component, type ErrorInfo, type ReactNode } from "react";

const SAFE_CONSOLE_MESSAGE =
  "[ErrorBoundary] An unexpected UI error occurred.";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
      return;
    }

    // The default reporter intentionally receives no error object, message,
    // stack, route, or component tree because those may contain sensitive data.
    console.error(SAFE_CONSOLE_MESSAGE);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <main
            role="alert"
            className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center font-[Nunito]"
          >
            <h1 className="text-2xl font-extrabold text-gray-950">
              Algo salió mal
            </h1>
            <p className="mt-3 max-w-md text-gray-600">
              Actualiza la página para volver a intentarlo.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-md bg-red-600 px-5 py-2.5 font-bold text-white hover:bg-red-700"
            >
              Actualizar página
            </button>
          </main>
        )
      );
    }

    return this.props.children;
  }
}
