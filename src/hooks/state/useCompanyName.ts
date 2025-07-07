import { useQueryState } from "nuqs";

export const useCompanyName = () => {
  return useQueryState("companyName");
};
