import { CalculadoraFertilizacion } from "@/components/fertilizacion/CalculadoraFertilizacion";

export default function FertilizacionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Calculadora de fertilización poscosecha</h1>
        <p className="text-neutral-600">Ingresa los valores del cuartel y el análisis de suelo para obtener la dosis de N y K₂O a aplicar.</p>
      </div>
      <CalculadoraFertilizacion />
    </div>
  );
}
