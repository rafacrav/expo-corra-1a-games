import { type ReactNode } from "react";

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
  active,
  onClick,
}: {
  game: GameMeta;
  active: boolean;
  onClick: () => void;
}) {
  const isReady = game.status === "ready";
  return (
    <button
      onClick={onClick}
      disabled={!isReady}
      className={`group relative flex flex-col items-start gap-2 overflow-hidden rounded-xl border bg-card p-4 text-left transition-all
        ${active ? "border-secondary shadow-glow-gold" : "border-border hover:border-primary"}
        ${isReady ? "cursor-pointer hover:-translate-y-0.5" : "cursor-not-allowed opacity-60"}`}
    >
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl transition-opacity ${
          active ? "opacity-60" : "opacity-20 group-hover:opacity-40"
        }`}
        style={{ background: isReady ? "var(--gradient-green)" : "var(--muted)" }}
      />
      <div className="relative flex w-full items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-2 text-secondary">
          {game.icon}
        </div>
        {!isReady && (
          <span className="rounded-full bg-muted px-2 py-0.5 font-display text-[10px] tracking-widest text-muted-foreground">
            EM BREVE
          </span>
        )}
        {isReady && (
          <span className="rounded-full bg-primary/20 px-2 py-0.5 font-display text-[10px] tracking-widest text-primary">
            JOGAR
          </span>
        )}
      </div>
      <h3 className="relative font-display text-xl leading-none text-foreground">{game.title}</h3>
      <p className="relative text-sm text-muted-foreground">{game.subtitle}</p>
      <code className="relative mt-1 rounded bg-background/60 px-2 py-1 font-mono text-[11px] text-secondary">
        {game.formula}
      </code>
    </button>
  );
}
