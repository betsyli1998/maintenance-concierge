import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1440 0%, #5B4FCF 100%)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ textAlign: "center", color: "#fff", maxWidth: 600, padding: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🤖🔧</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
          Maintenance Concierge
        </h1>
        <p
          style={{
            fontSize: 18,
            opacity: 0.85,
            lineHeight: 1.7,
            marginBottom: 40,
          }}
        >
          AI-powered agentic workflow prototype for multifamily property
          maintenance. Experience a live call simulation, real-time agent
          enrichment, and proactive resident status updates.
        </p>
        <Link
          href="/demo"
          style={{
            background: "#10B981",
            color: "#fff",
            padding: "16px 40px",
            borderRadius: 12,
            fontSize: 18,
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-block",
            transition: "transform 0.2s",
          }}
        >
          Launch Demo →
        </Link>
        <p style={{ fontSize: 13, opacity: 0.5, marginTop: 24 }}>
          Built for HappyCo · Prototype by Claude
        </p>
      </div>
    </div>
  );
}
