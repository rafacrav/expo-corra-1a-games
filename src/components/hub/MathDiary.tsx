import { useEffect, useRef } from "react";

export type DiaryEntry = {
  id: string;
  game: string;
  formula: string;
  detail: string;
  at: number;
};

export function MathDiary({ entries }: { entries: DiaryEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ left: ref.current.scrollWidth, behavior: "smooth" });
  }, [entries.length]);

  return (
    <section className="relative z-10 border-t border-border bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm tracking-widest text-secondary">
            DIÁRIO MATEMÁTICO • TEMPO REAL
          </h4>
          <span className="font-mono text-[10px] text-muted-foreground">
            {entries.length} eventos
          </span>
        </div>
        <div
          ref={ref}
          className="flex gap-2 overflow-x-auto pb-1"
          aria-live="polite"
        >
          {entries.length === 0 && (
            <p className="text-xs italic text-muted-foreground">
              Comece a jogar — as fórmulas aparecem aqui em tempo real.
            </p>
          )}
          {entries.map((e) => (
            <article
              key={e.id}
              className="animate-pop-in min-w-[220px] shrink-0 rounded-md border border-border bg-background/60 p-2"
            >
              <p className="font-display text-[10px] tracking-widest text-primary">{e.game}</p>
              <code className="block font-mono text-xs text-secondary">{e.formula}</code>
              <p className="mt-1 text-[11px] text-muted-foreground">{e.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
