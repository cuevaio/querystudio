"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanyCompletion } from "@/hooks/ai/completion/useCompanyCompletion";
import { useBusinessSector } from "@/hooks/state/useBusinessSector";
import { useCompanyName } from "@/hooks/state/useCompanyName";
import { useCountry } from "@/hooks/state/useCountry";
import { useCurrentStep } from "@/hooks/state/useCurrentStep";
import { useDescription } from "@/hooks/state/useDescription";
import { useLanguage } from "@/hooks/state/useLanguage";
import { useWebsiteUrl } from "@/hooks/state/useWebsiteUrl";

export function WebsiteUrlStep() {
  const [websiteUrl, setWebsiteUrl] = useWebsiteUrl();
  const [, setCompanyName] = useCompanyName();
  const [, setBusinessSector] = useBusinessSector();
  const [, setCountry] = useCountry();
  const [, setLanguage] = useLanguage();
  const [, setDescription] = useDescription();
  const [, setCurrentStep] = useCurrentStep();
  const { mutate: completeCompany, isPending } = useCompanyCompletion();

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const formWebsiteUrl = formData.get("websiteUrl") as string;

    if (!websiteUrl || formWebsiteUrl !== websiteUrl) {
      completeCompany(formWebsiteUrl, {
        onSuccess: (data) => {
          // Set the form data with AI completion results
          setCompanyName(data.name);
          setBusinessSector(data.sector);
          setCountry(data.country);
          setLanguage(data.language);
          setDescription(data.description);
          setWebsiteUrl(formWebsiteUrl);
          setCurrentStep(2);
        },
        onError: (error) => {
          toast.error(error.message);
        },
      });
    } else {
      setCurrentStep(2);
    }
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
        onSubmit={handleNext}
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
