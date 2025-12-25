import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center gap-6 text-center p-4">
      <div className="p-6 bg-muted rounded-2xl">
        <FileQuestion className="w-16 h-16 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground max-w-xs mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>
      <Button asChild className="gap-2">
        <Link href="/">
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
