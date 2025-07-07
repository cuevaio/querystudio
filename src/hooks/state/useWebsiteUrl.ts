import { useQueryState } from "nuqs";

export const useWebsiteUrl = () => {
  return useQueryState("websiteUrl");
};
