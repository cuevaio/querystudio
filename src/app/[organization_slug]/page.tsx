import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { OrganizationTopics } from "@/components/organization-topics";
import { db } from "@/db";
import { organization } from "@/db/schema";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ organization_slug: string }>;
}) {
  const { organization_slug } = await params;
  const org = await db.query.organization.findFirst({
    where: eq(organization.slug, organization_slug),
    with: {
      topics: {
        with: {
          queries: true,
        },
      },
    },
  });

  if (!org) {
    return notFound();
  }

  return (
    <OrganizationTopics
      organization={{
        ...org,
        topics: org.topics
          .toSorted((a, b) => a.name.localeCompare(b.name, "es-ES"))
          .map((topic) => ({
            ...topic,
            queries: topic.queries.toSorted((a, b) =>
              a.content.localeCompare(b.content, "es-ES"),
            ),
          })),
      }}
    />
  );
}
