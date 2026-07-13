import { Component, ErrorInfo, ReactNode } from "react";
import { logger } from "@/lib/logger";
import { suiteHomeHref, suiteRouteHref } from "@/lib/suiteHref";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string; copyStatus: "idle" | "ok" | "fail" };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "", copyStatus: "idle" };

  /** Browser timers are numeric IDs (Node typings use `Timeout`; avoid cross-environment mismatch). */
  private copyStatusTimeoutId: number | null = null;

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Unknown runtime error",
      copyStatus: "idle",
    };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo): void {
    logger.error("App crashed:", error, errorInfo);
  }

  componentWillUnmount(): void {
    this.clearCopyStatusTimer();
  }

  private clearCopyStatusTimer = () => {
    if (this.copyStatusTimeoutId !== null) {
      window.clearTimeout(this.copyStatusTimeoutId);
      this.copyStatusTimeoutId = null;
    }
  };

  private copyDebug = async () => {
    const payload = {
      message: this.state.message,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      timestamp: new Date().toISOString(),
    };
    const text = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      this.setState({ copyStatus: "ok" });
    } catch {
      logger.error("Clipboard unavailable; diagnostics:", payload);
      this.setState({ copyStatus: "fail" });
      try {
        window.prompt("Copy this diagnostic JSON (Ctrl+C):", text);
      } catch {
        /* ignore */
      }
    }
    this.clearCopyStatusTimer();
    this.copyStatusTimeoutId = window.setTimeout(() => {
      this.copyStatusTimeoutId = null;
      this.setState((s) => (s.copyStatus === "idle" ? s : { ...s, copyStatus: "idle" }));
    }, 4000);
  };

  private tryRecover = () => {
    this.clearCopyStatusTimer();
    this.setState({ hasError: false, message: "", copyStatus: "idle" });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div
          className="max-w-xl w-full rounded-lg border border-destructive/40 bg-card p-5 space-y-3"
          role="alert"
          aria-live="assertive"
          aria-relevant="additions text"
        >
          <h1 className="text-lg font-semibold text-destructive">Something crashed</h1>
          <p className="text-sm text-muted-foreground">{this.state.message}</p>
          {this.state.copyStatus === "ok" && (
            <p className="text-xs text-primary">Diagnostics copied to the clipboard.</p>
          )}
          {this.state.copyStatus === "fail" && (
            <p className="text-xs text-muted-foreground">
              Clipboard blocked — use the dialog to copy, or check the browser console.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted/50"
              onClick={() => this.tryRecover()}
            >
              Try again
            </button>
            <button
              type="button"
              className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted/50"
              onClick={() => window.location.reload()}
            >
              Reload app
            </button>
            <button
              type="button"
              className="rounded border border-border px-3 py-1.5 text-sm hover:bg-muted/50"
              onClick={() => void this.copyDebug()}
            >
              Copy diagnostics
            </button>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            <a href={suiteHomeHref()} className="text-primary underline-offset-2 hover:underline">
              Arena workspace
            </a>
            <span className="mx-1.5 text-border">·</span>
            <a href={suiteRouteHref("/cluster")} className="underline-offset-2 hover:underline">
              Cluster
            </a>
            <span className="mx-1.5 text-border">·</span>
            <a href={suiteRouteHref("/toolkit")} className="underline-offset-2 hover:underline">
              Toolkit
            </a>
            <span className="mx-1.5 text-border">·</span>
            <a href={suiteRouteHref("/settings")} className="underline-offset-2 hover:underline">
              Settings
            </a>
          </p>
        </div>
      </div>
    );
  }
}
