import { useQueryState } from "nuqs";

export const useName = () => {
  return useQueryState("name");
};
