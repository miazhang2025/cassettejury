import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { PhysicsProvider } from "@/context/PhysicsContext";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cassettejury.vercel.app";
const DESCRIPTION =
  "A pocket jury for creative deadlocks. Nine AI characters — each with their own job, taste, and agenda — deliberate your question live and hand down a verdict.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Cassette Jury — an AI jury for creative deadlocks",
  description: DESCRIPTION,
  openGraph: {
    title: "Cassette Jury",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Cassette Jury",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "The Cassette Jury — a panel of colorful 3D blob characters on a wooden stage",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cassette Jury",
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Only the weights actually used: Blaka (display), Bayon (writeup),
            IBM Plex Mono 400/500/600/700 + italic 400 (body). */}
        <link
          href="https://fonts.googleapis.com/css2?family=Bayon&family=Blaka&family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AppProvider>
          <PhysicsProvider>
            {children}
          </PhysicsProvider>
        </AppProvider>
      </body>
    </html>
  );
}
