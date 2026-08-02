import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { Toaster } from "@/components/ui/sonner";

const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteUrl = configuredUrl
  ? configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`
  : vercelUrl
    ? `https://${vercelUrl}`
    : "http://localhost:3000";

const title = "annotated — clip the web, annotate reality";
const description =
  "Clip a moment, add what you think, and publish it with the original context still attached.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · annotated",
  },
  description,
  applicationName: "annotated",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "annotated",
    title,
    description,
    images: [
      {
        url: "/social/annotated-link-preview.png",
        width: 1200,
        height: 630,
        alt: "annotated — The web moves fast. Keep what matters.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/social/annotated-link-preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/PPMori-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen font-sans text-zinc-900">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Nav />
        <main id="main-content">{children}</main>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
