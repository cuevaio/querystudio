import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ClientProviders } from "./client";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <NuqsAdapter>
      <ClientProviders>{children}</ClientProviders>
    </NuqsAdapter>
  );
};
