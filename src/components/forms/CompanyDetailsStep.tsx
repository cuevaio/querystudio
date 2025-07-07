"use client";

import { Sparkles } from "lucide-react";
import { toast } from "sonner";
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
import { useCompanyCompletion } from "@/hooks/ai/completion/useCompanyCompletion";
import { useBusinessSector } from "@/hooks/state/useBusinessSector";
import { useCompanyName } from "@/hooks/state/useCompanyName";
import { useCountry } from "@/hooks/state/useCountry";
import { useCurrentStep } from "@/hooks/state/useCurrentStep";
import { useDescription } from "@/hooks/state/useDescription";
import { useLanguage } from "@/hooks/state/useLanguage";
import { useWebsiteUrl } from "@/hooks/state/useWebsiteUrl";
import { BUSINESS_SECTORS } from "@/lib/constants/business-sectors";
import { COUNTRIES } from "@/lib/constants/countries";
import { LANGUAGES } from "@/lib/constants/languages";

export function CompanyDetailsStep() {
  const [websiteUrl] = useWebsiteUrl();

  const [, setCurrentStep] = useCurrentStep();

  const [companyName, setCompanyName] = useCompanyName();
  const [businessSector, setBusinessSector] = useBusinessSector();
  const [country, setCountry] = useCountry();
  const [language, setLanguage] = useLanguage();
  const [description, setDescription] = useDescription();

  const { mutate: completeCompany, isPending } = useCompanyCompletion();

  const handleRegenerate = async () => {
    if (!websiteUrl) {
      return;
    }

    completeCompany(websiteUrl, {
      onSuccess: (data) => {
        if (data.companyName) setCompanyName(data.companyName);
        if (data.businessSector) setBusinessSector(data.businessSector);
        if (data.country) setCountry(data.country);
        if (data.language) setLanguage(data.language);
        if (data.description) setDescription(data.description);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      companyName,
      businessSector,
      country,
      language,
      description,
      websiteUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          disabled={isPending || !websiteUrl}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isPending ? "Generating..." : "Regenerate"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label
            htmlFor="companyName"
            className="font-medium text-foreground text-sm"
          >
            Company Name
          </Label>
          <Input
            id="companyName"
            value={companyName || ""}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label
            htmlFor="businessSector"
            className="font-medium text-foreground text-sm"
          >
            Business Sector
          </Label>
          <Select
            value={businessSector || ""}
            onValueChange={setBusinessSector}
          >
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
            Country
          </Label>
          <Select value={country || ""} onValueChange={setCountry}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label
            htmlFor="language"
            className="font-medium text-foreground text-sm"
          >
            Language
          </Label>
          <Select value={language || ""} onValueChange={setLanguage}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label
          htmlFor="description"
          className="font-medium text-foreground text-sm"
        >
          Company Description / About
        </Label>
        <Textarea
          id="description"
          value={description || ""}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell us about your company, its mission, values, and what makes it unique..."
          className="mt-1 min-h-[120px]"
          required
        />
      </div>

      <Separator />

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
        >
          Back
        </Button>
        <Button type="submit" className="px-8 py-2">
          Create Profile
        </Button>
      </div>
    </form>
  );
}
