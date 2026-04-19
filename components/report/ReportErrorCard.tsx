import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ReportErrorCardProps = {
  message: string;
  onRetry: () => void;
};

export function ReportErrorCard({ message, onRetry }: ReportErrorCardProps) {
  return (
    <Card className="report-card rounded-[30px] border-destructive/30">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-destructive/10 p-2 text-destructive">
            <AlertCircle className="size-4" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-white">We couldn&apos;t load this report</CardTitle>
            <CardDescription className="text-slate-400">
              One of the required solar data services failed to respond.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-slate-300">{message}</p>
        <Button onClick={onRetry}>Retry</Button>
      </CardContent>
    </Card>
  );
}
