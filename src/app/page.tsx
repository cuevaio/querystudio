"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { CompanyDetailsStep, WebsiteUrlStep } from "@/components/forms";
import {
  useBusinessSector,
  useCompanyName,
  useCountry,
  useCurrentStep,
  useDescription,
  useLanguage,
  useWebsiteUrl,
} from "@/hooks/state";
import { CompanySchema } from "@/schemas/company";

export default function CompanyProfileForm() {
  const [currentStep] = useCurrentStep();
  const [websiteUrl] = useWebsiteUrl();
  const [companyName] = useCompanyName();
  const [businessSector] = useBusinessSector();
  const [country] = useCountry();
  const [language] = useLanguage();
  const [description] = useDescription();

  const { object, isLoading, stop, submit } = useObject({
    api: "/api/ai/completion/company",
    schema: CompanySchema,
    onFinish: (completion) => {
      console.log(completion);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  return (
    <div className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-lg bg-card shadow-xl">
          {/* Header */}
          <div className="border-border border-b bg-card px-6 py-8">
            <h1 className="text-center font-bold text-3xl text-foreground">
              Create Company Profile
            </h1>
            <p className="mt-2 text-center text-muted-foreground">
              Step {currentStep} of 2
            </p>
          </div>

          {/* Progress Bar */}
          <div className="border-border border-b bg-muted px-6 py-4">
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${
                  currentStep >= 1
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                1
              </div>
              <div
                className={`mx-4 h-1 flex-1 ${
                  currentStep >= 2 ? "bg-primary" : "bg-muted-foreground/20"
                }`}
              ></div>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm ${
                  currentStep >= 2
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                2
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 py-8">
            {currentStep === 1 ? <WebsiteUrlStep /> : <CompanyDetailsStep />}
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-muted p-4">
          <button
            type="button"
            onClick={() =>
              submit({
                companyWebsiteUrl: "crafterstation.com",
              })
            }
          >
            Complete
          </button>
          <pre>{JSON.stringify(object, null, 2)}</pre>
          <pre>{object?.name}</pre>
        </div>

        {/* Debug Info */}
        <div className="mt-8 rounded-lg bg-muted p-4">
          <h3 className="mb-2 font-medium text-foreground text-sm">
            URL State Debug:
          </h3>
          <pre className="overflow-auto text-muted-foreground text-xs">
            {JSON.stringify(
              {
                websiteUrl,
                companyName,
                businessSector,
                country,
                language,
                description,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
