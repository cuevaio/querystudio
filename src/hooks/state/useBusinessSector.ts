import { useQueryState } from "nuqs";

export const useBusinessSector = () => {
  return useQueryState("businessSector");
};
