"use client";

import dynamic from "next/dynamic";
import type { PredioProspeccion } from "@/lib/types";

const PrediosMap = dynamic(() => import("@/components/PrediosMap").then((m) => m.PrediosMap), { ssr: false });

export function PrediosMapClient({ predios }: { predios: PredioProspeccion[] }) {
  return <PrediosMap predios={predios} />;
}
