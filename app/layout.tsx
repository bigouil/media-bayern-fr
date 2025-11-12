import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StructuredData } from "@/components/StructuredData";
import { generateOrganizationSchema } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://media-bayern.fr'),
  title: {
    default: "Media Bayern - Actualité FC Bayern Munich",
    template: "%s | Media Bayern",
  },
  description: "Toute l'actualité du FC Bayern Munich : articles, mercato, matchs, compétitions",
  keywords: ["Bayern Munich", "FC Bayern", "Bundesliga", "Football", "Actualités", "Mercato"],
  authors: [{ name: "Media Bayern" }],
  creator: "Media Bayern",
  publisher: "Media Bayern",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://media-bayern.fr",
    siteName: "Media Bayern",
    title: "Media Bayern - Actualité FC Bayern Munich",
    description: "Toute l'actualité du FC Bayern Munich : articles, mercato, matchs, compétitions",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Media Bayern",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Media Bayern - Actualité FC Bayern Munich",
    description: "Toute l'actualité du FC Bayern Munich : articles, mercato, matchs, compétitions",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/api/rss" />
        <StructuredData data={organizationSchema} />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} antialiased min-h-screen flex flex-col`}>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
