import { useState } from "react";
import { PACK_PRICE_BRL, PACK_SIZE, PLAYERS, TOTAL_PLAYERS, TOTAL_RARE, type Player } from "@/lib/players";
import { formatBRL, formatPct } from "@/lib/figurinhas-math";
import { PackRevealModal } from "./PackRevealModal";
import stickerPackAsset from "@/assets/sticker-pack-panini.png.asset.json";
const stickerPackImg = stickerPackAsset.url;

export function PackOpener({
  onOpen,
  lastPack,
  totalPacks,
  totalSpent,
  collectedCount,
  rareCollected,
  duplicates,
  totalStickers,
}: {
  onOpen: () => Player[];
  lastPack: Player[] | null;
  totalPacks: number;
  totalSpent: number;
  collectedCount: number;
  rareCollected: number;
  duplicates: number;
  totalStickers: number;
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

  const completion = collectedCount / TOTAL_PLAYERS;
  const repeatRate = totalStickers > 0 ? duplicates / totalStickers : 0;

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-4">
      {/* Live stats — atualizam em tempo real a cada pacote */}
      <div className="grid w-full grid-cols-2 gap-2">
        <Stat label="COLETADAS" value={`${collectedCount}/${TOTAL_PLAYERS}`} hint={formatPct(completion)} />
        <Stat label="LENDAS DOURADAS" value={`${rareCollected}/${TOTAL_RARE}`} accent />
        <Stat label="PACOTES" value={String(totalPacks)} hint={`${totalStickers} figs`} />
        <Stat label="GASTO" value={formatBRL(totalSpent)} hint={`${formatPct(repeatRate)} rep.`} />
      </div>

      {/* Barra de progresso ao vivo */}
      <div className="w-full">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${completion * 100}%` }}
          />
        </div>
      </div>

      <div className="relative flex h-44 w-full items-center justify-center">
        <img
          src={stickerPackImg}
          alt="Pacote de figurinhas Copa 2026"
          width={176}
          height={176}
          loading="lazy"
          className={`h-44 w-44 object-contain drop-shadow-2xl transition-transform duration-500 ${
            opening ? "scale-110 rotate-12 opacity-30" : "hover:rotate-3"
          }`}
        />
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 font-display text-[10px] tracking-widest text-primary-foreground">
          COPA 2026
        </span>
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
        <PackRevealModal pack={revealed} onClose={() => setRevealed(null)} />
      )}
    </div>
  );
}

function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-2 ${accent ? "border-gold bg-gold/5" : "border-border bg-muted"}`}>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`font-display text-xl leading-tight ${accent ? "text-gradient-gold" : "text-foreground"}`}>
        {value}
      </p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
