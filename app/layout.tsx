import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TokenFlow AI Workspace",
  description:
    "AI-powered context optimizer, agent workflow, and adaptive model routing for high-efficiency prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}
