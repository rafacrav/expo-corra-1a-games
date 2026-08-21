import { type ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

export type GameMeta = {
  id: string;
  title: string;
  subtitle: string;
  formula: string;
  status: "ready" | "soon";
  icon: ReactNode;
};

export function GameCard({
  game,
  position,
  active,
  onClick,
}: {
  game: GameMeta;
  position: number;
  active: boolean;
  onClick: () => void;
}) {
  const isReady = game.status === "ready";
  return (
    <button
      onClick={onClick}
      disabled={!isReady}
      className={`group relative flex h-full min-h-48 w-full flex-col items-start overflow-hidden rounded-2xl border bg-card p-5 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${active ? "border-primary shadow-glow-gold" : "border-border hover:border-primary hover:shadow-card"}
        ${isReady ? "cursor-pointer hover:-translate-y-1" : "cursor-not-allowed opacity-60"}`}
    >
      <div
        className={`absolute -right-6 -top-6 h-32 w-32 rounded-full blur-3xl transition-opacity ${
          active ? "opacity-60" : "opacity-20 group-hover:opacity-40"
        }`}
        style={{ background: isReady ? "var(--gradient-green)" : "var(--muted)" }}
      />
      <div className="relative mb-4 flex w-full items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-2 text-primary">
          {game.icon}
        </div>
        <span className="font-mono text-xs font-semibold tracking-[0.16em] text-muted-foreground">
          JOGO {String(position).padStart(2, "0")}
        </span>
      </div>
      <h3 className="relative font-display text-xl leading-tight text-foreground">{game.title}</h3>
      <p className="relative mt-1 text-sm leading-relaxed text-muted-foreground">{game.subtitle}</p>
      <div className="relative mt-auto flex w-full items-end justify-between gap-3 pt-5">
        <code className="min-w-0 truncate rounded bg-muted px-2 py-1 font-mono text-[11px] text-primary">
          {game.formula}
        </code>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
          {isReady ? "Jogar" : "Em breve"}
          {isReady && (
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          )}
        </span>
      </div>
    </button>
  );
}
