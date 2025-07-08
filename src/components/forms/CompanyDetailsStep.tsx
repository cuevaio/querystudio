"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Sparkles, WandSparklesIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { createOrganization } from "@/actions/create-organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useCountry,
  useCurrentStep,
  useDescription,
  useLanguage,
  useName,
  useSector,
  useWebsiteUrl,
} from "@/hooks/state";
import { BUSINESS_SECTORS } from "@/lib/constants/business-sectors";
import { cn } from "@/lib/utils";
import { CompanySchema } from "@/schemas/company";

export function CompanyDetailsStep({
  isLoadingInitial,
}: {
  isLoadingInitial: boolean;
}) {
  const [websiteUrl] = useWebsiteUrl();

  const [, setCurrentStep] = useCurrentStep();

  const [name, setName] = useName();
  const [sector, setSector] = useSector();
  const [country, setCountry] = useCountry();
  const [language, setLanguage] = useLanguage();
  const [description, setDescription] = useDescription();

  const {
    submit,
    object,
    isLoading: isLoadingRegenerate,
  } = useObject({
    api: "/api/ai/completion/company",
    schema: CompanySchema,
  });

  const isLoading = isLoadingInitial || isLoadingRegenerate;

  React.useEffect(() => {
    if (object) {
      if (object.name) {
        setName(object.name);
      }
      if (object.sector) {
        setSector(object.sector);
      }
      if (object.country) {
        setCountry(object.country);
      }
      if (object.language) {
        setLanguage(object.language);
      }
      if (object.description) {
        setDescription(object.description);
      }
    }
  }, [object, setName, setSector, setCountry, setLanguage, setDescription]);

  const [state, formAction, isPending] = React.useActionState(
    createOrganization,
    {
      input: {
        name: "",
        slug: "",
        websiteUrl: "",
        sector: "",
        country: "",
        language: "",
        description: "",
      },
      output: { success: false },
    },
  );

  // Handle form submission feedback
  React.useEffect(() => {
    if (state.output.success) {
      toast.success("Organization created successfully!");
      // Reset form or redirect
    } else if (state.output.error) {
      toast.error(state.output.error);
    }
  }, [state.output]);

  const handleRegenerate = async () => {
    if (!websiteUrl) {
      return;
    }

    setName(null);
    setSector(null);
    setCountry(null);
    setLanguage(null);
    setDescription(null);

    submit({
      websiteUrl,
    });
  };

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="websiteUrl"
        defaultValue={websiteUrl ?? undefined}
      />
      <input type="hidden" name="sector" value={sector ?? undefined} />
      <div className="flex items-start justify-between">
        <div>
          <h2 className="mb-2 font-semibold text-2xl text-foreground">
            Company Details
          </h2>
          <p className="text-muted-foreground">
            Tell us more about your company.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={isLoading || !websiteUrl}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isLoading ? "Generating..." : "Regenerate"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="name" className="font-medium text-foreground text-sm">
            Company Name
            <WandSparklesIcon
              className={cn(
                "size-4 text-muted-foreground/0 transition-all duration-300",
                {
                  "animate-pulse text-muted-foreground": isLoading && !name,
                },
              )}
            />
          </Label>
          <Input
            id="name"
            value={name || ""}
            onChange={(e) => setName(e.target.value)}
            className="mt-1"
            required
            name="name"
          />
        </div>

        <div>
          <Label
            htmlFor="sector"
            className="font-medium text-foreground text-sm"
          >
            Sector
            <WandSparklesIcon
              className={cn(
                "size-4 text-muted-foreground/0 transition-all duration-300",
                {
                  "animate-pulse text-muted-foreground": isLoading && !sector,
                },
              )}
            />
          </Label>
          <Select value={sector || ""} onValueChange={setSector}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_SECTORS.map((sector) => (
                <SelectItem key={sector.code} value={sector.code}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label
            htmlFor="country"
            className="font-medium text-foreground text-sm"
          >
            Country / Region
            <WandSparklesIcon
              className={cn(
                "size-4 text-muted-foreground/0 transition-all duration-300",
                {
                  "animate-pulse text-muted-foreground": isLoading && !country,
                },
              )}
            />
          </Label>
          <Input
            id="country"
            value={country || ""}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1"
            required
            name="country"
            disabled={isLoading}
            placeholder="e.g. United States"
          />
        </div>

        <div>
          <Label
            htmlFor="language"
            className="font-medium text-foreground text-sm"
          >
            Language
            <WandSparklesIcon
              className={cn(
                "size-4 text-muted-foreground/0 transition-all duration-300",
                {
                  "animate-pulse text-muted-foreground": isLoading && !language,
                },
              )}
            />
          </Label>
          <Input
            id="language"
            value={language || ""}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1"
            required
            name="language"
            disabled={isLoading}
            placeholder="e.g. English"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="description"
          className="font-medium text-foreground text-sm"
        >
          Company Description / About
          <WandSparklesIcon
            className={cn(
              "size-4 text-muted-foreground/0 transition-all duration-300",
              {
                "animate-pulse text-muted-foreground":
                  isLoading && !description,
              },
            )}
          />
        </Label>
        <Textarea
          id="description"
          value={description || ""}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 min-h-[120px]"
          required
          name="description"
          disabled={isLoading}
          placeholder="Tell us about your company, its mission, values, and what makes it unique..."
        />
      </div>

      <Separator />

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
          disabled={isPending || isLoading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="px-8 py-2"
          disabled={isPending || isLoading}
        >
          Create Profile
        </Button>
      </div>
    </form>
  );
}
