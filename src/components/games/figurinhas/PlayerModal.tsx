import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { Player } from "@/lib/players";
import { describePlayer } from "@/lib/ai.functions";
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
  const ai = useServerFn(describePlayer);
  const [desc, setDesc] = useState<string>("Gerando descrição com IA…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDesc("Gerando descrição com IA…");
    setError(null);
    ai({ data: { name: player.name, position: player.position, number: player.number } })
      .then((r) => {
        if (cancelled) return;
        setDesc(r.description);
        if (r.error) setError(r.error);
      })
      .catch((e) => {
        if (cancelled) return;
        setDesc(`${player.name} — ${player.position}, camisa ${player.number}.`);
        setError(e instanceof Error ? e.message : "Falha na IA");
      });
    return () => {
      cancelled = true;
    };
  }, [player.id, ai, player.name, player.position, player.number]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-pop-in relative grid w-full max-w-2xl gap-6 rounded-2xl border border-border bg-card p-6 shadow-card md:grid-cols-[auto_1fr]"
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 h-8 w-8 rounded-full border border-border bg-background/60 font-display text-lg text-foreground hover:bg-destructive hover:text-destructive-foreground"
        >
          ×
        </button>

        <div className="flex justify-center">
          <StickerCard player={player} owned size="lg" />
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="font-display text-xs tracking-widest text-secondary">
              {player.position} • CAMISA {player.number}
              {player.rare && (
                <span className="ml-2 rounded bg-gradient-gold px-2 py-0.5 text-background">
                  RARO • FOIL
                </span>
              )}
            </p>
            <h2 className="font-display text-4xl text-foreground">{player.name}</h2>
          </div>

          <div className="rounded-md border border-border bg-background/50 p-3">
            <p className="font-display text-xs tracking-widest text-primary">DESCRIÇÃO (IA)</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{desc}</p>
            {error && (
              <p className="mt-2 text-xs text-destructive">⚠ {error}</p>
            )}
          </div>

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
    <div className="rounded-md border border-border bg-background/40 p-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-display text-xl text-secondary">{value}</p>
    </div>
  );
}
