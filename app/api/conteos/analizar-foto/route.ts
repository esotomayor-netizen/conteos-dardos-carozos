import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { TIPOS_ESTRUCTURA } from "@/lib/types";

const analizarSchema = z.object({
  imagen_base64: z.string().min(1),
  media_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
  tipo_estructura: z.enum(TIPOS_ESTRUCTURA),
});

const PROMPT = `Eres un experto en fruticultura analizando una foto de una rama de un árbol frutal en estado de dormancia invernal.
Cuenta cuántas estructuras del tipo "{{TIPO}}" son visibles e identificables con claridad en la imagen.
Definiciones: "dardo" = brote corto y fructífero (espuela), "carozo" = estructura nodal asociada a fruto de carozo, "brote" = brote vegetativo nuevo, "flor" = flor o yema floral, "vegetativo" = brote o yema vegetativa.
Responde ÚNICAMENTE con un JSON válido de la forma {"cantidad": <entero>, "confianza": "alta"|"media"|"baja", "comentario": "<máx 25 palabras en español>"}. No agregues texto fuera del JSON.`;

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Falta la variable de entorno ANTHROPIC_API_KEY" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const parsed = analizarSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { imagen_base64, media_type, tipo_estructura } = parsed.data;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type, data: imagen_base64 } },
          { type: "text", text: PROMPT.replace("{{TIPO}}", tipo_estructura) },
        ],
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return NextResponse.json({ error: "Respuesta inesperada del modelo" }, { status: 502 });
  }

  let resultado: { cantidad: number; confianza: string; comentario: string };
  try {
    const match = textBlock.text.match(/\{[\s\S]*\}/);
    resultado = JSON.parse(match ? match[0] : textBlock.text);
  } catch {
    return NextResponse.json({ error: "No se pudo interpretar la respuesta del modelo" }, { status: 502 });
  }

  return NextResponse.json(resultado);
}
