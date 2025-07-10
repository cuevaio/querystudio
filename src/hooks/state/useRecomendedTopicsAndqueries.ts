"use client";

import { useLocalStorage } from "@uidotdev/usehooks";
import type { RecommendedTopicsSchema } from "@/schemas/recommended-topics";

export function useRecomendedTopicsAndqueries() {
  return useLocalStorage<RecommendedTopicsSchema | null>(
    "recomendedTopicsAndqueries",
    null,
  );
}
