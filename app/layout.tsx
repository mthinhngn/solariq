import type { Metadata } from "next";
import { Exo_2, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const exo2 = Exo_2({
  variable: "--font-exo-2",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://solariq-drab.vercel.app"),
  title: {
    default: "SolarIQ",
    template: "%s | SolarIQ",
  },
  description:
    "Check roof capacity, savings, and neighborhood solar adoption from real permit records and satellite analysis.",
  applicationName: "SolarIQ",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${exo2.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
