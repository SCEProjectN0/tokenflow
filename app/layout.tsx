import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Звездный Барабан | Интерактивное ТВ-шоу",
  description:
    "Авторская интерактивная игра с колесом удачи, угадыванием слов, финалом, рейтингом и праздничной телестудией.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
