import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </main>
  );
}
