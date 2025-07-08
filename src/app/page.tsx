"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import React from "react";
import { CompanyDetailsStep, WebsiteUrlStep } from "@/components/forms";
import {
  useCountry,
  useCurrentStep,
  useDescription,
  useLanguage,
  useName,
  useSector,
} from "@/hooks/state";
import { CompanySchema } from "@/schemas/company";

export default function CompanyProfileForm() {
  const [currentStep] = useCurrentStep();
  const [, setName] = useName();
  const [, setSector] = useSector();
  const [, setCountry] = useCountry();
  const [, setLanguage] = useLanguage();
  const [, setDescription] = useDescription();

  const { object, submit } = useObject({
    api: "/api/ai/completion/company",
    schema: CompanySchema,
  });

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
            {currentStep === 1 ? (
              <WebsiteUrlStep
                generate={({ websiteUrl }) => {
                  submit({ websiteUrl });
                }}
              />
            ) : (
              <CompanyDetailsStep />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
