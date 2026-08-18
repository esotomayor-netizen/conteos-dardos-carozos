"use client";

import { usePathname } from "next/navigation";
import { NavLinks } from "@/components/NavLinks";

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname.startsWith("/login")) return null;

  return (
    <header className="bg-gradient-to-r from-emerald-800 to-emerald-700 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-white shrink-0">🍒 CRM Captación</span>
          <NavLinks />
        </div>
        <form method="POST" action="/api/logout">
          <button type="submit" className="whitespace-nowrap text-xs text-emerald-50/80 hover:text-white">
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}
