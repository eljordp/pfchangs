import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "P.F. Chang's AI Receptionist",
  description: "AI-powered receptionist for P.F. Chang's Scottsdale Headquarters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
