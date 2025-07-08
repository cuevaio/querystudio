import { z } from "zod";

export const CompanySchema = z.object({
  name: z.string(),
  country: z.string().nullable(),
  language: z.string(),
  sector: z.string().nullable(),
  description: z.string(),
  website: z.string(),
});
