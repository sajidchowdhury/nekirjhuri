import { type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Reusable "Coming soon" / empty-state component.
 * Used by admin pages whose phase hasn't landed yet.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  phase,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  phase: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-soft/50 text-emerald-deep mb-5">
          <Icon className="h-8 w-8" />
        </span>
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="font-display font-700 text-xl text-emerald-deep">
            {title}
          </h2>
          <Badge className="bg-gold/15 text-gold-deep border-0">
            Phase {phase}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
