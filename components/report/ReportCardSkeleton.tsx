import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ReportCardSkeleton() {
  return (
    <Card className="report-card rounded-[30px]">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-32 bg-white/10" />
        <Skeleton className="h-4 w-56 bg-white/10" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-28 bg-white/10" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-20 w-full bg-white/10" />
          <Skeleton className="h-20 w-full bg-white/10" />
          <Skeleton className="h-20 w-full bg-white/10" />
        </div>
      </CardContent>
    </Card>
  );
}
