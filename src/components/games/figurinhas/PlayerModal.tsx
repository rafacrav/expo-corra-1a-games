import { useEffect, useState } from "react";
import type { Player } from "@/lib/players";
import { getPlayerPhoto } from "@/lib/player-photos";
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
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getPlayerPhoto(player.wiki).then((src) => {
      if (!cancelled) setPhoto(src);
    });
    return () => {
      cancelled = true;
    };
  }, [player.wiki]);

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
        className="animate-pop-in relative grid w-full max-w-2xl gap-6 rounded-2xl border border-border bg-card p-6 shadow-card md:grid-cols-[auto_1fr]"
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 h-8 w-8 rounded-full border border-border bg-muted font-display text-lg text-foreground hover:bg-destructive hover:text-destructive-foreground"
        >
          ×
        </button>

        <div className="flex justify-center">
          <StickerCard player={player} owned size="lg" />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="font-display text-xs tracking-widest text-primary">
              {player.position} • CAMISA {player.number}
              {player.rare && (
                <span className="ml-2 rounded bg-gradient-gold px-2 py-0.5 text-background">
                  RARO • FOIL
                </span>
              )}
            </p>
            <h2 className="font-display text-4xl text-foreground">{player.name}</h2>
          </div>

          {photo ? (
            <a
              href={`https://en.wikipedia.org/wiki/${player.wiki}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-md border border-border bg-muted"
              title="Foto via Wikipedia"
            >
              <img
                src={photo}
                alt={player.name}
                className="h-56 w-full object-cover object-top"
              />
              <p className="px-2 py-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                Foto: Wikipedia
              </p>
            </a>
          ) : (
            <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border bg-muted text-xs text-muted-foreground">
              Foto indisponível
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Cópias" value={`×${count}`} />
            <Stat label="Tipo" value={player.rare ? "Foil" : "Comum"} />
            <Stat label="ID" value={`#${String(player.id + 1).padStart(2, "0")}`} />
          </div>
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
