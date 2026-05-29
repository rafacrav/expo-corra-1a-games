import { useEffect } from "react";
import type { Player } from "@/lib/players";
import { StickerCard } from "./StickerCard";

export function PlayerModal({
  player,
  count,
  onClose,
}: {
  player: Player;
  count: number;
  onClose: () => void;
}) {
  // ESC close
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-muted/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in relative flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 h-8 w-8 rounded-full border border-border bg-muted font-display text-lg text-foreground hover:bg-destructive hover:text-destructive-foreground"
        >
          ×
        </button>

        <StickerCard player={player} owned size="lg" />

        <div className="text-center">
          <p className="font-display text-xs tracking-widest text-primary">
            {player.position} • CAMISA {player.number}
            {player.rare && (
              <span className="ml-2 rounded bg-gradient-gold px-2 py-0.5 text-background">
                RARO • FOIL
              </span>
            )}
          </p>
          <h2 className="font-display text-3xl text-foreground">{player.name}</h2>
        </div>

        <div className="grid w-full grid-cols-3 gap-2 text-center">
          <Stat label="Cópias" value={`×${count}`} />
          <Stat label="Tipo" value={player.rare ? "Foil" : "Comum"} />
          <Stat label="ID" value={`#${String(player.id + 1).padStart(2, "0")}`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted p-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-xl text-primary">{value}</p>
    </div>
  );
}
