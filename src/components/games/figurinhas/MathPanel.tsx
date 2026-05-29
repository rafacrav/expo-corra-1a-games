import { PLAYERS } from "@/lib/players";
import {
  expectedCostToComplete,
  expectedPacksToComplete,
  expectedStickersToComplete,
  formatBRL,
  formatPct,
  probNewSticker,
} from "@/lib/figurinhas-math";

export function MathPanel({
  collectedCount,
  totalStickersOpened,
  duplicates,
}: {
  collectedCount: number;
  totalStickersOpened: number;
  duplicates: number;
}) {
  const N = PLAYERS.length;
  const pNew = probNewSticker(collectedCount, N);
  const repeatRate = totalStickersOpened > 0 ? duplicates / totalStickersOpened : 0;
  const expStickers = expectedStickersToComplete(collectedCount, N);
  const expPacks = expectedPacksToComplete(collectedCount);
  const expCost = expectedCostToComplete(collectedCount);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <h3 className="font-display text-2xl">
        Painel <span className="text-gradient-gold">Matemático</span>
      </h3>

      <Block
        label="Probabilidade da próxima ser inédita"
        formula={`P = (N − coletadas) / N = (${N} − ${collectedCount}) / ${N}`}
        value={formatPct(pNew)}
      />
      <Block
        label="Taxa de repetidas observada"
        formula={`repetidas / total = ${duplicates} / ${totalStickersOpened || 0}`}
        value={formatPct(repeatRate)}
      />
      <Block
        label="Coupon Collector — figurinhas restantes esperadas"
        formula={`E = Σ N/(N−k) para k = ${collectedCount}…${N - 1}`}
        value={`≈ ${Math.round(expStickers)}`}
        hint={`≈ ${Math.ceil(expPacks)} pacotes`}
      />
      <Block
        label="Custo esperado para completar"
        formula="custo = pacotes esperados × R$ 7,00"
        value={formatBRL(expCost)}
        accent
      />
      {collectedCount === N && (
        <p className="rounded-md bg-gradient-gold p-2 text-center font-display text-lg text-background">
          🏆 ÁLBUM COMPLETO!
        </p>
      )}
    </div>
  );
}

function Block({
  label,
  formula,
  value,
  hint,
  accent,
}: {
  label: string;
  formula: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-md border p-3 ${accent ? "border-primary bg-primary/5" : "border-border bg-muted"}`}>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <code className="block py-1 font-mono text-[11px] text-primary">{formula}</code>
      <div className="flex items-baseline justify-between">
        <p className={`font-display text-2xl ${accent ? "text-gradient-gold" : "text-foreground"}`}>{value}</p>
        {hint && <p className="font-mono text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
