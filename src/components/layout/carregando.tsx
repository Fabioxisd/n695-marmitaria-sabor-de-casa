import { Skeleton } from "@/components/ui/skeleton";

export function Carregando() {
  return (
    <div className="space-y-4" aria-label="Carregando">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-5 w-96" />
      <div className="grid gap-4 pt-6 sm:grid-cols-2">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
    </div>
  );
}
