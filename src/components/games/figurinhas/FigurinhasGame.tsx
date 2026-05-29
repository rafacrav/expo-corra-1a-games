import { useCallback, useEffect, useState } from "react";
import { PACK_PRICE_BRL, PACK_SIZE, PLAYERS, type Player } from "@/lib/players";
import { Album } from "./Album";
import { MathPanel } from "./MathPanel";
import { PackOpener } from "./PackOpener";
import { PlayerModal } from "./PlayerModal";
import type { DiaryEntry } from "@/components/hub/MathDiary";
import { formatPct, probNewSticker } from "@/lib/figurinhas-math";

const STORAGE_KEY = "expocorra.figurinhas.v1";

type SavedState = {
  collection: Record<number, number>;
  totalPacks: number;
  totalStickers: number;
  duplicates: number;
};

const EMPTY: SavedState = { collection: {}, totalPacks: 0, totalStickers: 0, duplicates: 0 };

function loadState(): SavedState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function FigurinhasGame({
  pushDiary,
}: {
  pushDiary: (e: Omit<DiaryEntry, "id" | "at">) => void;
}) {
  const [state, setState] = useState<SavedState>(EMPTY);
  const [lastPack, setLastPack] = useState<Player[] | null>(null);
  const [modalPlayer, setModalPlayer] = useState<Player | null>(null);

  useEffect(() => setState(loadState()), []);
  useEffect(() => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const openPack = useCallback((): Player[] => {
    const pack: Player[] = [];
    for (let i = 0; i < PACK_SIZE; i++) {
      const p = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
      pack.push(p);
    }
    setState((prev) => {
      const next: SavedState = {
        collection: { ...prev.collection },
        totalPacks: prev.totalPacks + 1,
        totalStickers: prev.totalStickers + PACK_SIZE,
        duplicates: prev.duplicates,
      };
      const before = Object.keys(prev.collection).length;
      for (const p of pack) {
        const existed = !!next.collection[p.id];
        next.collection[p.id] = (next.collection[p.id] || 0) + 1;
        if (existed) next.duplicates += 1;
      }
      const after = Object.keys(next.collection).length;
      const news = after - before;
      pushDiary({
        game: "Figurinhas",
        formula: `P(nova) = ${formatPct(probNewSticker(before))}`,
        detail: `Pacote #${next.totalPacks}: ${news} nova(s), ${PACK_SIZE - news} repetida(s).`,
      });
      return next;
    });
    setLastPack(pack);
    return pack;
  }, [pushDiary]);

  const reset = () => {
    if (confirm("Apagar coleção atual?")) {
      setState(EMPTY);
      setLastPack(null);
    }
  };

  const collectedCount = Object.keys(state.collection).length;

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr_320px]">
      <div className="space-y-4">
        <PackOpener
          onOpen={openPack}
          lastPack={lastPack}
          totalPacks={state.totalPacks}
          totalSpent={state.totalPacks * PACK_PRICE_BRL}
        />
        <button
          onClick={reset}
          className="w-full rounded-md border border-border bg-muted px-3 py-2 font-display text-sm tracking-widest text-muted-foreground hover:border-destructive hover:text-destructive"
        >
          REINICIAR COLEÇÃO
        </button>
      </div>

      <Album collection={state.collection} onSelect={setModalPlayer} />

      <MathPanel
        collectedCount={collectedCount}
        totalStickersOpened={state.totalStickers}
        duplicates={state.duplicates}
      />

      {modalPlayer && (
        <PlayerModal
          player={modalPlayer}
          count={state.collection[modalPlayer.id] || 0}
          onClose={() => setModalPlayer(null)}
        />
      )}
    </div>
  );
}
