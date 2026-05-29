import { useState } from "react";
import { PACK_PRICE_BRL, PACK_SIZE, PLAYERS, type Player } from "@/lib/players";
import { formatBRL } from "@/lib/figurinhas-math";
import { StickerCard } from "./StickerCard";
import stickerPackImg from "@/assets/sticker-pack.png";

export function PackOpener({
  onOpen,
  lastPack,
  totalPacks,
  totalSpent,
}: {
  onOpen: () => Player[];
  lastPack: Player[] | null;
  totalPacks: number;
  totalSpent: number;
}) {
  const [revealed, setRevealed] = useState<Player[] | null>(lastPack);
  const [opening, setOpening] = useState(false);

  const handleOpen = () => {
    setOpening(true);
    setRevealed(null);
    setTimeout(() => {
      const pack = onOpen();
      setRevealed(pack);
      setOpening(false);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex w-full items-center justify-between">
        <div>
          <p className="font-display text-xs tracking-widest text-primary">PACOTES ABERTOS</p>
          <p className="font-display text-3xl">{totalPacks}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xs tracking-widest text-primary">GASTO TOTAL</p>
          <p className="font-display text-3xl text-gradient-gold">{formatBRL(totalSpent)}</p>
        </div>
      </div>

      <div className="relative flex h-44 w-full items-center justify-center">
        <img
          src={stickerPackImg}
          alt="Pacote de figurinhas"
          width={176}
          height={176}
          loading="lazy"
          className={`h-44 w-44 object-contain drop-shadow-2xl transition-transform duration-500 ${
            opening ? "scale-110 rotate-12 opacity-30" : "hover:rotate-3"
          }`}
        />
      </div>

      <button
        onClick={handleOpen}
        disabled={opening}
        className="w-full rounded-md bg-primary px-6 py-3 font-display text-xl tracking-widest text-primary-foreground shadow-glow-green transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        {opening ? "ABRINDO…" : `ABRIR PACOTE • ${formatBRL(PACK_PRICE_BRL)}`}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        {PACK_SIZE} figurinhas por pacote • {PLAYERS.length} jogadores no álbum
      </p>

      {revealed && (
        <div className="grid w-full grid-cols-5 gap-2">
          {revealed.map((p, i) => (
            <StickerCard key={`${p.id}-${i}`} player={p} owned size="sm" flipDelay={i * 120} />
          ))}
        </div>
      )}
    </div>
  );
}
