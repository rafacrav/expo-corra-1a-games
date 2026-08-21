import { useCallback, useEffect, useMemo, useState } from "react";
import type { Player } from "@/lib/players";
import { StickerCard } from "./StickerCard";

export function PackRevealModal({ pack, onClose }: { pack: Player[]; onClose: () => void }) {
  // A equipe mantém as raras douradas no fim para valorizar a última revelação do pacote.
  const ordered = useMemo(() => {
    const commons = pack.filter((p) => !p.rare);
    const rares = pack.filter((p) => p.rare);
    return [...commons, ...rares];
  }, [pack]);

  const [index, setIndex] = useState(0);
  const total = ordered.length;

  const advance = useCallback(() => {
    if (index >= total - 1) {
      onClose();
      return;
    }

    setIndex((currentIndex) => currentIndex + 1);
  }, [index, onClose, total]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [advance, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground/70 p-4 backdrop-blur-md"
    >
      <button
        onClick={onClose}
        aria-label="Fechar"
        className="absolute right-4 top-4 h-10 w-10 rounded-full border border-border bg-card font-display text-lg text-foreground shadow-card hover:bg-muted"
      >
        ×
      </button>

      <p className="mb-3 font-display text-xs tracking-widest text-background/90">
        {`FIGURINHA ${index + 1} DE ${total}`}
      </p>

      {/* A interface organiza as figurinhas ainda fechadas em uma pilha. */}
      <div
        onClick={advance}
        className="relative flex h-[420px] w-[280px] cursor-pointer items-center justify-center select-none"
      >
        {ordered.map((p, i) => {
          const offset = i - index;
          if (offset < 0) return null;

          const isTop = offset === 0;
          const stackDepth = Math.min(offset, 4);
          const translateY = stackDepth * 8;
          const scale = 1 - stackDepth * 0.04;
          const rotate = stackDepth === 0 ? 0 : (i % 2 === 0 ? -1 : 1) * stackDepth;

          return (
            <div
              key={`${p.id}-${i}`}
              className="absolute transition-all duration-500 ease-out"
              style={{
                transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                zIndex: total - offset,
                opacity: offset > 4 ? 0 : 1,
              }}
            >
              {isTop ? (
                <div className="animate-pop-in flex flex-col items-center gap-3">
                  <StickerCard player={p} owned size="lg" />
                  <div className="text-center">
                    <p className="font-display text-xs tracking-widest text-background/80">
                      {p.position} • CAMISA {p.number}
                      {p.rare && (
                        <span className="ml-2 rounded bg-gradient-gold px-2 py-0.5 text-foreground">
                          LENDA DOURADA
                        </span>
                      )}
                    </p>
                    <h3 className="font-display text-2xl text-background">{p.name}</h3>
                  </div>
                </div>
              ) : (
                // A interface preserva o suspense exibindo o verso das próximas figurinhas.
                <div className="h-64 w-44 rounded-md border-2 border-primary-foreground/30 bg-gradient-to-br from-primary to-primary/70 shadow-card">
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-3xl tracking-widest text-primary-foreground/80">
                      ?
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={advance}
        className="mt-6 rounded-md bg-primary px-6 py-3 font-display text-base tracking-widest text-primary-foreground shadow-glow-green transition hover:scale-[1.02] active:scale-95"
      >
        {index === total - 1 ? "CONCLUIR" : "PRÓXIMA →"}
      </button>
      <p className="mt-2 text-xs text-background/70">
        toque na figurinha • {total - index} restante{total - index !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
