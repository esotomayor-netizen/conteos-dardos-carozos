export const dynamic = "force-dynamic";

function safeNext(next: string | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <form
        method="POST"
        action="/api/login"
        className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <div className="space-y-1 text-center">
          <div className="text-3xl">🍒</div>
          <h1 className="text-lg font-semibold text-neutral-900">CRM Captación</h1>
          <p className="text-sm text-neutral-500">Ingresa la clave del equipo para continuar</p>
        </div>

        <input type="hidden" name="next" value={next} />
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Contraseña"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />

        {params.error && <p className="text-sm text-red-600">Contraseña incorrecta. Intenta de nuevo.</p>}

        <button
          type="submit"
          className="w-full rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
