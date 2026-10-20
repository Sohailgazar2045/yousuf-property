"use client";

/* Last-resort screen if the root layout itself fails; it can't rely on the layout's fonts or providers. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#faf8f4",
          color: "#1e293b",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#64748b" }} dir="rtl" lang="ur">
            کچھ غلط ہو گیا
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              height: 48,
              padding: "0 24px",
              borderRadius: 16,
              border: 0,
              background: "#004d40",
              color: "#fff",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
