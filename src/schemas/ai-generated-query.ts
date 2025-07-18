import { z } from "zod";

export const AiGeneratedQuerySchema = z.object({
  text: z.string().min(1, "Query text is required"),
  queryType: z.enum(["product", "sector"], {
    required_error: "Query type is required",
  }),
});

export type AiGeneratedQuery = z.infer<typeof AiGeneratedQuerySchema>;
