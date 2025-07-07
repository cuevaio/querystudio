import { parseAsInteger, useQueryState } from "nuqs";

export const useCurrentStep = () => {
  return useQueryState("currentStep", parseAsInteger.withDefault(1));
};
