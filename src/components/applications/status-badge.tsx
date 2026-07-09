import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const toneByStatus: Record<string, string> = {
  准备投递: "border-primary/20 bg-primary/5 text-primary",
  已投递: "border-primary/20 bg-primary/10 text-primary",
  测评: "border-sky-200 bg-sky-50 text-sky-700",
  笔试: "border-primary/25 bg-primary/10 text-primary",
  一面: "border-primary/30 bg-primary/10 text-primary",
  二面: "border-primary/30 bg-primary/10 text-primary",
  HR面: "border-primary/30 bg-primary/10 text-primary",
  Offer: "border-emerald-200 bg-emerald-50 text-emerald-700",
  拒绝: "border-destructive/20 bg-destructive/10 text-destructive",
  其他: "border-muted-foreground/20 bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", toneByStatus[status] ?? toneByStatus["其他"])}>
      {status}
    </Badge>
  );
}