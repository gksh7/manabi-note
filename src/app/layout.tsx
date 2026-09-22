import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manabi Note",
  description: "学びを記録し、整理し、共有するためのノートアプリ",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
