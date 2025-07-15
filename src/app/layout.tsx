import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { eq } from "drizzle-orm";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { userId } from "@/lib/user-id";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QueryStudio - AI-Powered Market Analysis",
  description:
    "Transform your market research with AI-powered competitor analysis and insights",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header user={user || null} />
            <main className="flex-1 bg-background">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
