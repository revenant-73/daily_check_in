import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { MobileNav } from "@/components/layout/MobileNav";
import { Suspense } from "react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Daily Check-In | Athlete Performance",
  description: "Track readiness and set daily goals for peak performance.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans relative pb-20 md:pb-0">
        {children}
        {session?.user && (
          <Suspense fallback={null}>
            <MobileNav role={session.user.role || "player"} />
          </Suspense>
        )}
      </body>
    </html>
  );
}
