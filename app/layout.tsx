import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavLinks } from "@/components/NavLinks";
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
  title: "CRM Captación de Productores",
  description: "CRM para el equipo de agrónomos: seguimiento, dashboard, tablero y calendario de captación de productores",
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
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <header className="bg-gradient-to-r from-emerald-800 to-emerald-700 shadow-sm">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-6">
            <span className="font-semibold text-white shrink-0">🍒 CRM Captación</span>
            <NavLinks />
          </div>
        </header>
        <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
