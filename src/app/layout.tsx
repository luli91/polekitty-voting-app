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
  metadataBase: new URL("https://polekitty-voting-app.vercel.app"), 
  
  title: "PoleKitty - Muestra Anual Mejor Performance",
  description: "Sistema oficial de votación en vivo para la muestra anual de PoleKitty",
  
  icons: {
    icon: "/pole_kitty_fondo.jpg", 
  },
  
  openGraph: {
    title: "PoleKitty - Votación en Vivo",
    description: "Apoyá a las participantes de la muestra anual",
    images: ["/pole_kitty_fondo.jpg"], 
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}