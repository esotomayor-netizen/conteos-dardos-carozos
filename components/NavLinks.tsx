"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Resumen" },
  { href: "/parcelas", label: "Parcelas" },
  { href: "/arboles", label: "Árboles" },
  { href: "/ramas", label: "Ramas" },
  { href: "/conteos", label: "Conteos" },
  { href: "/productores", label: "Productores" },
  { href: "/agronomos", label: "Agrónomos" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 text-sm overflow-x-auto">
      {NAV_LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              active ? "bg-white text-emerald-800 font-medium" : "text-emerald-50 hover:bg-emerald-700/60"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
