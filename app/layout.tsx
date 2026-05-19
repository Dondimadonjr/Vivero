import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vivero-sage.vercel.app"),
  title: "Vivero Frijolito | Plantas de colección",
  description:
    "Vivero Frijolito: plantas de colección, monsteras, philodendros, especies exóticas e insumos para amantes de las plantas.",
  keywords: [
    "vivero",
    "plantas",
    "plantas de interior",
    "monsteras",
    "philodendros",
    "plantas exóticas",
    "insumos para plantas",
    "vivero frijolito",
  ],
  openGraph: {
    title: "Vivero Frijolito | Plantas de colección",
    description:
      "Plantas de colección, especies exóticas e insumos para llenar tu hogar de vida.",
    type: "website",
    locale: "es_CL",
    siteName: "Vivero Frijolito",
    images: [
      {
        url: "/og-vivero.jpg",
        width: 1200,
        height: 630,
        alt: "Vivero Frijolito - Plantas de colección",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vivero Frijolito | Plantas de colección",
    description:
      "Plantas de colección, especies exóticas e insumos para llenar tu hogar de vida.",
    images: ["/og-vivero.jpg"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}