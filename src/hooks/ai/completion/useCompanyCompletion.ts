import { useMutation } from "@tanstack/react-query";
import type { z } from "zod";
import type { CompanySchema } from "@/schemas/company";

export const useCompanyCompletion = () => {
  return useMutation({
    mutationFn: async (companyWebsiteUrl: string) => {
      const response = await fetch("/api/ai/completion/company", {
        method: "POST",
        body: JSON.stringify({ companyWebsiteUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete company");
      }

      const data = (await response.json()).data as z.infer<
        typeof CompanySchema
      >;
      return data;
    },
  });
};
