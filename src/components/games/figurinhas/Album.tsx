import { PLAYERS, type Player } from "@/lib/players";
import { StickerCard } from "./StickerCard";

export function Album({
  collection,
  onSelect,
}: {
  collection: Record<number, number>;
  onSelect: (p: Player) => void;
}) {
  const collectedCount = Object.keys(collection).length;
  const pct = (collectedCount / PLAYERS.length) * 100;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl">Álbum da Copa</h3>
        <span className="font-display text-primary">
          {collectedCount}/{PLAYERS.length}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-background/60">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "var(--gradient-green)" }}
        />
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-10">
        {PLAYERS.map((p) => {
          const count = collection[p.id] || 0;
          return (
            <StickerCard
              key={p.id}
              player={p}
              owned={count > 0}
              count={count}
              size="sm"
              onClick={() => count > 0 && onSelect(p)}
            />
          );
        })}
      </div>
    </div>
  );
}
