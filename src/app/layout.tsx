import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Check-In | Athlete Performance",
  description: "Track readiness and set daily goals for peak performance.",
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
