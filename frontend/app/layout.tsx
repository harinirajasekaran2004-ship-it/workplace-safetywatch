import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workplace SafetyWatch — Multi-Agent Hazard Detection & Incident Management",
  description: "Multi-Agent AI Safety Pipeline built with LangGraph, Groq, FastAPI, and Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
