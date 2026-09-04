import { Brain, Lightbulb, Loader2 } from "lucide-react";
import { LEVEL_LABEL, type AdaptiveProfile } from "@/lib/adaptive";

export function AdaptiveBadge({
  profile,
  thinking,
}: {
  profile: AdaptiveProfile;
  thinking: boolean;
}) {
  return (
    <div className="mb-3 rounded-xl border border-primary/25 bg-primary/5 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2 py-1 font-display text-[11px] tracking-widest text-primary">
          {thinking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Brain className="h-3.5 w-3.5" />
          )}
          IA · NÍVEL {profile.level} — {LEVEL_LABEL[profile.level].toUpperCase()}
        </span>
        <span className="rounded-md bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
          tempo ×{profile.timeMultiplier.toFixed(2)}
        </span>
        {profile.reason && (
          <span className="text-[11px] leading-snug text-muted-foreground">{profile.reason}</span>
        )}
      </div>
      {profile.hint && (
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-foreground">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          {profile.hint}
        </p>
      )}
    </div>
  );
}
