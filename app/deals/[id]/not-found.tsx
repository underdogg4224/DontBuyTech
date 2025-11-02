import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Not Found Page for Deal Details
 *
 * Displayed when a deal ID doesn't exist or is invalid
 */
export default function DealNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-6">
              <SearchX className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Deal Not Found</h1>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground text-lg">
            The deal you're looking for doesn't exist or may have been removed.
          </p>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This could be because:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• The deal has expired and been archived</li>
              <li>• The deal ID is incorrect</li>
              <li>• The deal was removed by moderators</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/">
                Browse All Deals
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/categories">
                View Categories
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
