import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Conteos Dardos y Carozos",
  description: "Plataforma para registrar conteos de estructuras vegetales: ramas, dardos y carozos",
};

const NAV_LINKS = [
  { href: "/", label: "Resumen" },
  { href: "/parcelas", label: "Parcelas" },
  { href: "/arboles", label: "Árboles" },
  { href: "/ramas", label: "Ramas" },
  { href: "/conteos", label: "Conteos" },
  { href: "/productores", label: "Productores (CRM)" },
  { href: "/agronomos", label: "Agrónomos" },
];

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
        <header className="border-b border-neutral-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6">
            <span className="font-semibold">🌿 Conteos Dardos y Carozos</span>
            <nav className="flex gap-4 text-sm">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:underline">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
