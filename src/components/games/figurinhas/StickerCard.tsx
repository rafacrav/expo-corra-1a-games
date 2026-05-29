import { useEffect, useState } from "react";
import type { Player } from "@/lib/players";
import { getPlayerPhoto } from "@/lib/player-photos";

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
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!owned) return;
    let cancelled = false;
    getPlayerPhoto(player.wiki).then((src) => {
      if (!cancelled) setPhoto(src);
    });
    return () => {
      cancelled = true;
    };
  }, [owned, player.wiki]);

  if (!owned) {
    return (
      <div
        className={`${dims} flex items-center justify-center rounded-md border-2 border-dashed border-border bg-muted`}
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
            ? "linear-gradient(160deg, oklch(0.92 0.14 90), oklch(0.78 0.16 70) 50%, oklch(0.6 0.18 60))"
            : "linear-gradient(160deg, oklch(0.7 0.16 255), oklch(0.5 0.2 260))",
        }}
      />
      {/* Real photo */}
      {photo ? (
        <img
          src={photo}
          alt={player.name}
          loading="lazy"
          className="absolute inset-x-0 bottom-6 top-7 h-[calc(100%-3.25rem)] w-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-x-2 bottom-9 flex items-end justify-center">
          <svg viewBox="0 0 64 64" className="h-3/5 w-3/5 fill-card/40">
            <circle cx="32" cy="18" r="10" />
            <path d="M10 60 Q10 38 32 38 Q54 38 54 60 Z" />
          </svg>
        </div>
      )}
      {/* Stripe */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/40 to-transparent px-1.5 py-1">
        <span className="font-display text-[10px] font-bold tracking-widest text-primary-foreground">
          BRA
        </span>
        <span className="rounded-sm bg-card/70 px-1 font-display text-[10px] font-semibold text-foreground">
          {player.position}
        </span>
      </div>
      {/* Number badge */}
      <div className="absolute right-1 top-5 z-10 flex h-7 w-7 items-center justify-center rounded-sm bg-card font-display text-base font-bold text-primary">
        {player.number}
      </div>
      {/* Name */}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-card/95 px-1 py-1">
        <p className="truncate font-display text-[11px] font-semibold leading-none text-foreground">
          {player.name}
        </p>
      </div>
      {count > 1 && (
        <div className="absolute left-1 top-5 z-10 rounded-full bg-primary px-1.5 font-mono text-[10px] font-bold text-primary-foreground">
          ×{count}
        </div>
      )}
    </button>
  );
}
