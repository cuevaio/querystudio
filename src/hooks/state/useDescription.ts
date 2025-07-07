import { useQueryState } from "nuqs";

export const useDescription = () => {
  return useQueryState("description");
};
