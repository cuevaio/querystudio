import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NotFoundPageProps {
  params: Promise<{
    organization_slug: string;
    topic_id: string;
  }>;
}

export default async function TopicNotFound({ params }: NotFoundPageProps) {
  const { organization_slug } = await params;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="mb-4 font-bold text-3xl">Topic Not Found</h1>
      <p className="mb-8 text-muted-foreground">
        Sorry, the topic you are looking for does not exist or you do not have
        access.
      </p>
      <div className="flex gap-4">
        <Link href={`/${organization_slug}`}>
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Organization
          </Button>
        </Link>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
