import { useMutation } from "@tanstack/react-query";
import type { CompanyCompletion } from "@/app/api/ai/completion/company/route";

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

      const data = (await response.json()).data as CompanyCompletion;
      return data;
    },
  });
};
