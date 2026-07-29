import { ImageResponse } from "next/og";

export const socialImageSize = { height: 630, width: 1200 };

export function createSocialImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background:
          "radial-gradient(circle at 78% 28%, #16c6cc 0, #0b314b 22%, #071a33 55%)",
        color: "white",
        display: "flex",
        height: "100%",
        justifyContent: "space-between",
        padding: "72px 82px",
        position: "relative",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: "68%" }}>
        <div
          style={{
            color: "#28d8db",
            display: "flex",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 5,
            textTransform: "uppercase",
          }}
        >
          Accesorios tecnológicos
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 78,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1.02,
            marginTop: 28,
          }}
        >
          Tecnología que te conecta.
        </div>
        <div
          style={{
            color: "#cbd5e1",
            display: "flex",
            fontSize: 28,
            lineHeight: 1.35,
            marginTop: 26,
          }}
        >
          Pagos flexibles y envíos a toda Colombia.
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          border: "2px solid rgba(255,255,255,.22)",
          borderRadius: 999,
          display: "flex",
          height: 230,
          justifyContent: "center",
          width: 230,
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "#19c8cc",
            borderRadius: 48,
            color: "#071a33",
            display: "flex",
            fontSize: 76,
            fontWeight: 900,
            height: 150,
            justifyContent: "center",
            width: 150,
          }}
        >
          OT
        </div>
      </div>
      <div
        style={{
          bottom: 48,
          color: "#f8c945",
          display: "flex",
          fontSize: 25,
          fontWeight: 800,
          letterSpacing: 4,
          position: "absolute",
          right: 82,
        }}
      >
        ODISSEY TECHNOLOGY
      </div>
    </div>,
    socialImageSize,
  );
}
