"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            fontFamily: "system-ui, sans-serif",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Something went wrong!
          </h1>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            An unexpected error has occurred.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              backgroundColor: "#000",
              color: "#fff",
              padding: "0.75rem 1.5rem",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
