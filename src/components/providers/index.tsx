import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { ClientProviders } from "./client";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <ClientProviders>{children}</ClientProviders>
      <Toaster />
    </NuqsAdapter>
  );
};
