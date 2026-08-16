"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const CONTEO_LINKS = [
  { href: "/", label: "Resumen" },
  { href: "/parcelas", label: "Parcelas" },
  { href: "/arboles", label: "Árboles" },
  { href: "/ramas", label: "Ramas" },
  { href: "/conteos", label: "Conteos" },
];

const CRM_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sugerencias", label: "Sugerencias" },
  { href: "/pipeline", label: "Tablero" },
  { href: "/calendario", label: "Calendario" },
  { href: "/productores", label: "Productores" },
  { href: "/agronomos", label: "Agrónomos" },
];

function NavGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 self-center px-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300/80">
      {children}
    </span>
  );
}

export function NavLinks() {
  const pathname = usePathname();

  function renderLink(link: { href: string; label: string }) {
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
  }

  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto">
      <NavGroupLabel>Conteo</NavGroupLabel>
      {CONTEO_LINKS.map(renderLink)}
      <span className="mx-1.5 h-5 w-px shrink-0 bg-emerald-100/25" aria-hidden="true" />
      <NavGroupLabel>CRM</NavGroupLabel>
      <span className="flex items-center gap-1 rounded-full bg-black/10 p-1">{CRM_LINKS.map(renderLink)}</span>
    </nav>
  );
}
