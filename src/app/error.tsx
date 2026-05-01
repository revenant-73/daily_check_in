"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("App Router Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tighter text-red-500">Something went wrong!</h2>
          <p className="text-muted-foreground">
            An error occurred while rendering this page. We've logged the error for investigation.
          </p>
        </div>
        
        <div className="p-4 bg-muted rounded-lg text-left overflow-auto max-h-60 font-mono text-sm border border-border">
          <p className="font-bold text-red-400">Error: {error.message || "No error message provided by Next.js"}</p>
          {error.digest && <p className="text-xs text-muted-foreground mt-1">Digest: {error.digest}</p>}
          <div className="mt-4 text-[10px] text-muted-foreground">
            <p>Note: If the message is omitted, this might be a production build error mask.</p>
            <p>Check the server console for the log prefixed with [ERROR].</p>
          </div>
          {error.stack && <pre className="mt-2 text-[10px] whitespace-pre-wrap opacity-50">{error.stack}</pre>}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = "/"}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-lg font-bold hover:bg-muted/80 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
