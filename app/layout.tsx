import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QA Automation Engineer | Futuristic Portfolio",
  description:
    "Premium futuristic portfolio for QA automation, Playwright, AI QA, API testing, and automation architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
