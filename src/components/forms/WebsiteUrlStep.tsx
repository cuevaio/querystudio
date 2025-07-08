"use client";

import { Loader2 } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanyCompletion } from "@/hooks/ai/completion/useCompanyCompletion";
import {
  useCountry,
  useCurrentStep,
  useDescription,
  useLanguage,
  useName,
  useSector,
  useWebsiteUrl,
} from "@/hooks/state";

export function WebsiteUrlStep({
  generate,
}: {
  generate: ({ websiteUrl }: { websiteUrl: string }) => void;
}) {
  const [websiteUrl, setWebsiteUrl] = useWebsiteUrl();
  const [, setName] = useName();
  const [, setSector] = useSector();
  const [, setCountry] = useCountry();
  const [, setLanguage] = useLanguage();
  const [, setDescription] = useDescription();
  const [, setCurrentStep] = useCurrentStep();
  const { isPending } = useCompanyCompletion();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formWebsiteUrl = formData.get("websiteUrl") as string;

    setWebsiteUrl(formWebsiteUrl);

    if (!websiteUrl || formWebsiteUrl !== websiteUrl) {
      setName(null);
      setSector(null);
      setCountry(null);
      setLanguage(null);
      setDescription(null);
      generate({ websiteUrl: formWebsiteUrl });
    }

    setCurrentStep(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 font-semibold text-2xl text-foreground">
          Company Website
        </h2>
        <p className="text-muted-foreground">
          Enter your company's website URL to get started.
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={handleSubmit}
        name="websiteUrlForm"
        id="websiteUrlForm"
      >
        <div>
          <Label
            htmlFor="websiteUrl"
            className="font-medium text-foreground text-sm"
          >
            Website URL
          </Label>
          <Input
            id="websiteUrl"
            type="text"
            placeholder="https://example.com"
            defaultValue={websiteUrl ?? undefined}
            className="mt-1"
            name="websiteUrl"
            required
          />
        </div>
      </form>

      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          disabled={isPending}
          className="px-8 py-2"
          form="websiteUrlForm"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  );
}
