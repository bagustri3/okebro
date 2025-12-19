import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pacifico",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "GAPLE OKE BRO",
    template: "%s | GAPLE OKE BRO",
  },
  description:
    "Aplikasi pencatatan dan statistik permainan Gaple. Dibuat oleh SI-TECHNO.",
  applicationName: "GAPLE OKE BRO",
  authors: [{ name: "SI-TECHNO" }],
  creator: "SI-TECHNO",
  publisher: "SI-TECHNO",

  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },

  openGraph: {
    title: "GAPLE OKE BRO",
    description:
      "Aplikasi pencatatan dan statistik permainan Gaple. Dibuat oleh SI-TECHNO.",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "GAPLE OKE BRO Logo",
      },
    ],
  },

  twitter: {
    card: "summary",
    title: "GAPLE OKE BRO",
    description:
      "Aplikasi pencatatan dan statistik permainan Gaple. Dibuat oleh SI-TECHNO.",
    images: ["/logo.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
