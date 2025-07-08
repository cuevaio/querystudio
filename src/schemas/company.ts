import { z } from "zod";

export const CompanySchema = z.object({
  name: z.string(),
  description: z.string(),
  website: z.string(),
  sector: z.string().nullable(),
  country: z.string().nullable(),
  language: z.string(),
});
