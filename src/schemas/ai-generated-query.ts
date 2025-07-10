import { z } from "zod";

export const AIGeneratedQuerySchema = z.object({
  query: z.string(),
  companySpecific: z.boolean(),
});

export type AIGeneratedQuery = z.infer<typeof AIGeneratedQuerySchema>;
