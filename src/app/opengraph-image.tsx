import { ImageResponse } from "next/og";

export const alt = "Navis Docs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e40af 45%, #172554 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              color: "white",
              letterSpacing: -2,
              lineHeight: 1.05,
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
            }}
          >
            Navis Docs
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.88)",
              maxWidth: 780,
              lineHeight: 1.35,
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
            }}
          >
            Operational knowledge, organized for teams who run the work.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
