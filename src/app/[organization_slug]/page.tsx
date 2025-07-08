import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
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
  });

  if (!org) {
    return notFound();
  }

  return <div>OrganizationPage</div>;
}
