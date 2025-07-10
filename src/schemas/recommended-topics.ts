import { z } from "zod";
import { AIGeneratedQuerySchema } from "./ai-generated-query";

export const RecommendedTopicsSchema = z.object({
  topic_1: z.string(),
  description_1: z.string(),
  queries_1: z.array(AIGeneratedQuerySchema),

  topic_2: z.string(),
  description_2: z.string(),
  queries_2: z.array(AIGeneratedQuerySchema),

  topic_3: z.string(),
  description_3: z.string(),
  queries_3: z.array(AIGeneratedQuerySchema),

  topic_4: z.string(),
  description_4: z.string(),
  queries_4: z.array(AIGeneratedQuerySchema),

  topic_5: z.string(),
  description_5: z.string(),
  queries_5: z.array(AIGeneratedQuerySchema),

  topic_6: z.string(),
  description_6: z.string(),
  queries_6: z.array(AIGeneratedQuerySchema),

  topic_7: z.string(),
  description_7: z.string(),
  queries_7: z.array(AIGeneratedQuerySchema),

  topic_8: z.string(),
  description_8: z.string(),
  queries_8: z.array(AIGeneratedQuerySchema),

  topic_9: z.string(),
  description_9: z.string(),
  queries_9: z.array(AIGeneratedQuerySchema),

  topic_10: z.string(),
  description_10: z.string(),
  queries_10: z.array(AIGeneratedQuerySchema),
});

export type RecommendedTopicsSchema = z.infer<typeof RecommendedTopicsSchema>;
