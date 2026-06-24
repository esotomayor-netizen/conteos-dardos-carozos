"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ESTADOS_CONTACTO, ESTADOS_CONTACTO_LABEL, type EstadoContacto } from "@/lib/types";

export function EstadoContactoSelect({ id, value }: { id: number; value: EstadoContacto }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(estado_contacto: EstadoContacto) {
    setLoading(true);
    const res = await fetch(`/api/predios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado_contacto }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <select
      value={value}
      disabled={loading}
      onChange={(e) => handleChange(e.target.value as EstadoContacto)}
      className="border rounded px-2 py-1 text-sm disabled:opacity-50"
    >
      {ESTADOS_CONTACTO.map((estado) => (
        <option key={estado} value={estado}>
          {ESTADOS_CONTACTO_LABEL[estado]}
        </option>
      ))}
    </select>
  );
}
