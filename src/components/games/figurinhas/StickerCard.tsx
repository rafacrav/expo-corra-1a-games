import type { Player } from "@/lib/players";

export function StickerCard({
  player,
  owned,
  count = 0,
  onClick,
  size = "md",
  flipDelay = 0,
}: {
  player: Player;
  owned: boolean;
  count?: number;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  flipDelay?: number;
}) {
  const dims = size === "sm" ? "h-24 w-[68px]" : size === "lg" ? "h-64 w-44" : "h-36 w-24";
  const isFoil = player.rare && owned;

  if (!owned) {
    return (
      <div
        className={`${dims} flex items-center justify-center rounded-md border-2 border-dashed border-border bg-background/40`}
        aria-label={`Figurinha não coletada nº ${player.number}`}
      >
        <span className="font-display text-xl text-muted-foreground/50">
          {String(player.number).padStart(2, "0")}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${flipDelay}ms` }}
      className={`${dims} group relative animate-flip-in overflow-hidden rounded-md border-2 text-left shadow-card transition-transform hover:-translate-y-1
        ${isFoil ? "border-gold shadow-glow-gold" : "border-primary"}
        ${isFoil ? "sticker-shine" : ""}`}
      aria-label={`Ver ${player.name}`}
    >
      {/* Card background */}
      <div
        className="absolute inset-0"
        style={{
          background: isFoil
            ? "linear-gradient(160deg, oklch(0.9 0.18 95), oklch(0.7 0.2 75) 50%, oklch(0.55 0.18 145))"
            : "linear-gradient(160deg, oklch(0.55 0.2 145), oklch(0.32 0.12 145))",
        }}
      />
      {/* Stripe */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-1.5 py-1">
        <span className="font-display text-[10px] tracking-widest text-background/90">
          BRA
        </span>
        <span className="rounded-sm bg-background/30 px-1 font-display text-[10px] text-foreground">
          {player.position}
        </span>
      </div>
      {/* Number badge */}
      <div className="absolute right-1 top-5 flex h-7 w-7 items-center justify-center rounded-sm bg-background/80 font-display text-base text-secondary">
        {player.number}
      </div>
      {/* Silhouette */}
      <div className="absolute inset-x-2 bottom-9 flex items-end justify-center">
        <svg viewBox="0 0 64 64" className="h-3/5 w-3/5 fill-background/30">
          <circle cx="32" cy="18" r="10" />
          <path d="M10 60 Q10 38 32 38 Q54 38 54 60 Z" />
        </svg>
      </div>
      {/* Name */}
      <div className="absolute inset-x-0 bottom-0 bg-background/85 px-1 py-1">
        <p className="truncate font-display text-[11px] leading-none text-foreground">
          {player.name}
        </p>
      </div>
      {count > 1 && (
        <div className="absolute left-1 top-5 rounded-full bg-secondary px-1.5 font-mono text-[10px] font-bold text-background">
          ×{count}
        </div>
      )}
    </button>
  );
}
