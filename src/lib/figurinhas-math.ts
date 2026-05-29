import { PACK_PRICE_BRL, PACK_SIZE, TOTAL_PLAYERS } from "./players";

/** P(new) = (N - collected) / N */
export function probNewSticker(collectedCount: number, total = TOTAL_PLAYERS): number {
  return (total - collectedCount) / total;
}

/** Coupon Collector expected stickers: N * H_N where H_N is the Nth harmonic number */
export function harmonic(n: number): number {
  let h = 0;
  for (let k = 1; k <= n; k++) h += 1 / k;
  return h;
}

/** Expected number of stickers to complete starting from `collectedCount` */
export function expectedStickersToComplete(collectedCount: number, total = TOTAL_PLAYERS): number {
  let e = 0;
  for (let k = collectedCount; k < total; k++) {
    e += total / (total - k);
  }
  return e;
}

export function expectedPacksToComplete(collectedCount: number, total = TOTAL_PLAYERS, packSize = PACK_SIZE): number {
  return expectedStickersToComplete(collectedCount, total) / packSize;
}

export function expectedCostToComplete(collectedCount: number): number {
  return expectedPacksToComplete(collectedCount) * PACK_PRICE_BRL;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatPct(p: number): string {
  return `${(p * 100).toFixed(1)}%`;
}
