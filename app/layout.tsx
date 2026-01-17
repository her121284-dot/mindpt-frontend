import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINDPT",
  description: "AI-powered conversation assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
