"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { createOrganization } from "@/actions/create-organization";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCountry,
  useCurrentStep,
  useDescription,
  useLanguage,
  useName,
  useSector,
  useSelectedTopics,
  useWebsiteUrl,
} from "@/hooks/state";
import type { AIGeneratedQuery } from "@/schemas/ai-generated-query";
import { RecommendedTopicsSchema } from "@/schemas/recommended-topics";
import { Badge } from "../ui/badge";

export function TopicsSelectionStep() {
  const router = useRouter();
  const [, setCurrentStep] = useCurrentStep();
  const [selectedTopics, setSelectedTopics] = useSelectedTopics();

  const [recomendedTopicsAndqueries, setRecomendedTopicsAndqueries] =
    React.useState<RecommendedTopicsSchema | null>(null);

  const [isHydrated, setIsHydrated] = React.useState(false);

  // Hydrate from localStorage after component mounts to prevent SSR mismatch
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem("recomendedTopicsAndqueries");
      if (cached) {
        try {
          setRecomendedTopicsAndqueries(JSON.parse(cached));
        } catch (error) {
          console.error("Failed to parse cached topics:", error);
          window.localStorage.removeItem("recomendedTopicsAndqueries");
        }
      }
    }
    setIsHydrated(true);
  }, []);

  // Track if we've already initiated an API call to prevent multiple calls
  const hasInitiatedCall = React.useRef(false);

  // Get company details for API call
  const [websiteUrl] = useWebsiteUrl();
  const [name] = useName();
  const [sector] = useSector();
  const [country] = useCountry();
  const [language] = useLanguage();
  const [description] = useDescription();

  const { object, submit, isLoading } = useObject({
    api: "/api/ai/completion/suggested-topics",
    schema: RecommendedTopicsSchema,
    onFinish: (data) => {
      if (data.object) {
        console.log(data.object);
        setRecomendedTopicsAndqueries(data.object);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "recomendedTopicsAndqueries",
            JSON.stringify(data.object),
          );
        }
      }
    },
  });

  const [state, formAction, isPending] = React.useActionState(
    createOrganization,
    {
      input: {
        name: "",
        websiteUrl: "",
        sector: "",
        country: "",
        language: "",
        description: "",
        topics: "",
      },
      output: { success: false },
    },
  );

  // Check if we have all required data for API call
  const hasRequiredData = React.useMemo(() => {
    return !!(websiteUrl && name && country && language && description);
  }, [websiteUrl, name, country, language, description]);

  // Stable callback to call the API
  const callAPI = React.useCallback(() => {
    if (hasRequiredData && !hasInitiatedCall.current) {
      hasInitiatedCall.current = true;
      setTimeout(() => {
        submit({
          websiteUrl,
          name,
          sector,
          country,
          language,
          description,
        });
      }, 1000);
    }
  }, [
    hasRequiredData,
    websiteUrl,
    name,
    sector,
    country,
    language,
    description,
    submit,
  ]);

  // Call API only once when we have all required data and no cached data
  React.useEffect(() => {
    if (
      isHydrated &&
      hasRequiredData &&
      !recomendedTopicsAndqueries &&
      !hasInitiatedCall.current &&
      !isLoading
    ) {
      callAPI();
    }
  }, [
    isHydrated,
    hasRequiredData,
    recomendedTopicsAndqueries,
    isLoading,
    callAPI,
  ]);

  // Handle form submission feedback
  React.useEffect(() => {
    if (state.output.success) {
      const successOutput = state.output as {
        success: true;
        data: { slug: string; run: { id: string; publicAccessToken: string } };
      };

      // Use setTimeout to ensure navigation happens after form submission completes
      setTimeout(() => {
        const url = `/${successOutput.data.slug}/seed?runId=${successOutput.data.run.id}&publicAccessToken=${successOutput.data.run.publicAccessToken}`;
        console.log("Navigating to:", url);
        router.push(url);
      }, 100);

      toast.success("Organization created successfully!");
    } else if (state.output.error) {
      toast.error(state.output.error);
    }
  }, [state.output, router]);

  const handleTopicToggle = (topicId: number) => {
    const isSelected = selectedTopics.includes(topicId);
    if (isSelected) {
      setSelectedTopics(selectedTopics.filter((id) => id !== topicId));
    } else {
      setSelectedTopics([...selectedTopics, topicId]);
    }
  };

  const handleRegenerate = () => {
    if (isLoading) {
      toast.error("Please wait for the current generation to finish.");
      return;
    }

    if (hasRequiredData) {
      // Clear localStorage and local state
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("recomendedTopicsAndqueries");
      }
      setRecomendedTopicsAndqueries(null);
      setSelectedTopics([]);
      setSelectedTopic(null);

      // Reset the call tracker and submit new request
      hasInitiatedCall.current = false;
      submit({
        websiteUrl,
        name,
        sector,
        country,
        language,
        description,
      });
    }
  };

  const [selectedTopic, setSelectedTopic] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (Object.keys(object || {}).length > 0) {
      const currentTopic = `topic-${Math.floor(Object.keys(object || {}).length / 3)}`;
      setSelectedTopic(currentTopic);
    }
  }, [object]);

  // Use cached data if available, otherwise use streaming object
  const topics = React.useMemo(() => {
    if (recomendedTopicsAndqueries) {
      return recomendedTopicsAndqueries;
    }
    return object;
  }, [recomendedTopicsAndqueries, object]);

  const selectedTopicsData = React.useMemo(() => {
    const _topics = [];
    for (const topic of selectedTopics) {
      const _topic = topics?.[`topic_${topic}` as keyof typeof topics] as
        | string
        | undefined;
      const _description = topics?.[
        `description_${topic}` as keyof typeof topics
      ] as string | undefined;
      const _queries = topics?.[`queries_${topic}` as keyof typeof topics] as
        | AIGeneratedQuery[]
        | undefined;
      if (_topic) {
        _topics.push({
          name: _topic,
          description: _description,
          queries: _queries,
        });
      }
    }
    return _topics;
  }, [topics, selectedTopics]);

  return (
    <form className="space-y-6" action={formAction}>
      {selectedTopics.length > 0 && (
        <input
          type="hidden"
          name="topics"
          defaultValue={JSON.stringify(selectedTopicsData)}
        />
      )}
      {name && <input type="hidden" name="name" defaultValue={name} />}
      {websiteUrl && (
        <input type="hidden" name="websiteUrl" defaultValue={websiteUrl} />
      )}
      {sector && <input type="hidden" name="sector" defaultValue={sector} />}
      {country && <input type="hidden" name="country" defaultValue={country} />}
      {language && (
        <input type="hidden" name="language" defaultValue={language} />
      )}
      {description && (
        <input type="hidden" name="description" defaultValue={description} />
      )}

      <div className="flex items-start justify-between">
        <div>
          <h2 className="mb-2 font-semibold text-2xl text-foreground">
            Select Topics
          </h2>
          <p className="text-muted-foreground">
            Choose the topics that are most relevant to your business.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? "Generating..." : "Regenerate"}
        </Button>
      </div>

      {isLoading && !topics && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-2 h-12 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      )}

      {topics && Object.keys(topics).length > 0 && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {selectedTopics.length} of{" "}
            {Math.ceil(Object.keys(topics).length / 3)} topics selected
          </p>

          <Accordion
            type="single"
            className="space-y-2"
            value={selectedTopic || ""}
            collapsible
            onValueChange={(value) => {
              console.log(value);
              if (value) {
                setSelectedTopic(value);
              } else {
                setSelectedTopic(null);
              }
            }}
          >
            {new Array(10).fill(0).map((_, i) => {
              const topic = topics?.[`topic_${i + 1}` as keyof typeof topics] as
                | string
                | undefined;
              const description = topics?.[
                `description_${i + 1}` as keyof typeof topics
              ] as string | undefined;
              const queries = topics?.[
                `queries_${i + 1}` as keyof typeof topics
              ] as { query: string; companySpecific: boolean }[] | undefined;

              if (!topic) return null;

              return (
                <AccordionItem
                  key={`topic-${i + 1}`}
                  value={`topic-${i + 1}`}
                  className="flex items-start gap-2 rounded-lg border border-border bg-card px-4 py-3 last:border-b-1"
                >
                  <Checkbox
                    checked={selectedTopics.includes(i + 1)}
                    onCheckedChange={() => handleTopicToggle(i + 1)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                  <div className="grow">
                    <AccordionTrigger className="w-full p-0 hover:no-underline">
                      <div className="flex w-full items-center gap-3">
                        <div className="flex-1 text-left">
                          <h3 className="font-medium text-foreground">
                            {topic}
                          </h3>
                          <p className="mt-1 text-muted-foreground text-sm">
                            {description}
                          </p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pb-0">
                      <h4 className="mb-2 font-medium text-foreground text-xs">
                        Sample Queries:
                      </h4>
                      {queries?.map((query, index) => {
                        if (!query) return null;
                        return (
                          <div
                            key={`${query.query}-${index}`}
                            className="rounded-md bg-muted p-3 text-muted-foreground text-sm"
                          >
                            {query.query}
                            {query.companySpecific && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-muted-foreground text-xs"
                              >
                                Company
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </AccordionContent>
                  </div>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(2)}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="px-8 py-2"
          disabled={isLoading || isPending || selectedTopics.length === 0}
        >
          {isPending
            ? "Creating..."
            : `Create Profile (${selectedTopics.length} selected)`}
        </Button>
      </div>
    </form>
  );
}
