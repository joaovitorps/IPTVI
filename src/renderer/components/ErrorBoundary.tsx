import { cn } from "@renderer/lib/utils";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className={cn(
            "min-h-screen",
            "bg-zinc-950",
            "flex",
            "items-center",
            "justify-center",
            "p-6",
          )}
        >
          <div
            className={cn(
              "max-w-md",
              "w-full",
              "bg-zinc-900",
              "border",
              "border-zinc-800",
              "rounded-3xl",
              "p-8",
              "shadow-2xl",
              "text-center",
            )}
          >
            <div className={cn("mb-6", "flex", "justify-center")}>
              <div className={cn("p-4", "bg-red-500/10", "rounded-2xl")}>
                <AlertTriangle className={cn("text-red-500", "w-12", "h-12")} />
              </div>
            </div>

            <h1 className={cn("text-2xl", "font-bold", "text-white", "mb-2")}>
              Something went wrong
            </h1>
            <p className={cn("text-zinc-400", "mb-6")}>
              An unexpected error occurred. We&apos;ve logged the error and you
              can try to refresh the page.
            </p>

            {this.state.error && (
              <div
                className={cn(
                  "mb-6",
                  "p-4",
                  "bg-zinc-950",
                  "rounded-xl",
                  "border",
                  "border-zinc-800",
                  "text-left",
                  "overflow-auto",
                  "max-h-40",
                )}
              >
                <p
                  className={cn(
                    "text-red-400",
                    "text-xs",
                    "font-mono",
                    "break-all",
                  )}
                >
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className={cn(
                "w-full",
                "flex",
                "justify-center",
                "items-center",
                "gap-2",
                "rounded-xl",
                "py-3",
                "px-4",
                "bg-amber-500",
                "hover:bg-amber-600",
                "transition-colors",
                "text-zinc-950",
                "font-bold",
              )}
            >
              <RefreshCcw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
