import { parseAsArrayOf, parseAsInteger, useQueryState } from "nuqs";

export function useSelectedTopics() {
  return useQueryState(
    "selectedTopics",
    parseAsArrayOf(parseAsInteger).withDefault([]),
  );
}
