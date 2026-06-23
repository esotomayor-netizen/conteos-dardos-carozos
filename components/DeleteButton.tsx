"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteButton({ url }: { url: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")) return;
    setLoading(true);
    const res = await fetch(url, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:underline text-sm disabled:opacity-50"
    >
      {loading ? "..." : "Eliminar"}
    </button>
  );
}
