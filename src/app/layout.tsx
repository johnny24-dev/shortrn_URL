import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shorten URL",
  description: "Create short links with simple analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
