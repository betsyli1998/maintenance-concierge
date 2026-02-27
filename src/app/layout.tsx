import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maintenance Concierge | HappyCo Agentic Workflow Prototype",
  description:
    "Interactive prototype demonstrating AI-powered agentic workflows for multifamily property maintenance — live call copilot, proactive status updates, and work order automation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
