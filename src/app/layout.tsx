import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ChatWidget } from "@/components/layout/chat-widget";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { getCategoryMenu } from "@/modules/categories/menu";
import { JsonLd } from "@/components/seo/json-ld";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Plus Jakarta Sans (SIL Open Font License), latin subset, one variable file.
// It is bundled instead of fetched from Google at build time: on the production
// server Google returned font URLs this Next.js version could not read, and
// the build failed.
const displaySans = localFont({
  src: "./fonts/PlusJakartaSans-latin-variable.woff2",
  variable: "--font-display-sans",
  weight: "200 800",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "SouqFeed — Dubai IT Wholesale Market";
const description = "Real-time offers. Verified suppliers. Better sourcing.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title,
  description,
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "en_AE",
    images: ["/images/hero-dubai-creek.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/hero-dubai-creek.jpg"],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const categoryMenu = await getCategoryMenu();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displaySans.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <JsonLd />
        <SiteHeader categories={categoryMenu} />
        {/* The admin shell has no mobile bottom nav, so it drops that padding. */}
        <main className="flex flex-1 flex-col pb-16 has-data-[slot=sidebar-wrapper]:pb-0 md:pb-0">
          {children}
        </main>
        <SiteFooter />
        <MobileBottomNav />
        <ChatWidget />
      </body>
    </html>
  );
}
