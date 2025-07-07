import { useQueryState } from "nuqs";

export const useLanguage = () => {
  return useQueryState("language");
};
