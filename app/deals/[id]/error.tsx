"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Error page for deal details
 *
 * Catches and displays runtime errors that occur during page rendering
 */
export default function DealError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Deal page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="border-red-200">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-50 p-6">
              <AlertCircle className="h-16 w-16 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Something Went Wrong</h1>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground text-lg">
            We encountered an error while loading this deal.
          </p>

          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-left">
              <p className="text-sm font-mono text-red-800 break-all">
                {error.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={reset} size="lg">
              Try Again
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                Go to Homepage
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            If this problem persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
