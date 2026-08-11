import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "X-Lab",
  description: "X-Lab — AI Systems Research Lab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
