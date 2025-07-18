import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function QueryNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="mb-4 font-bold text-3xl">Query Not Found</h1>
      <p className="mb-8 text-muted-foreground">
        Sorry, the query you are looking for does not exist or you do not have
        access.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </Link>
        <Link href="../">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topic
          </Button>
        </Link>
      </div>
    </div>
  );
}
