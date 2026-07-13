import { Suspense, type ReactNode } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

export function SuiteSuspenseBoundary({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
