import { useQueryState } from "nuqs";

export const useCountry = () => {
  return useQueryState("country");
};
