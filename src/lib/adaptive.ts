/** Núcleo da dificuldade adaptativa compartilhada pelos jogos de rodadas. */

export type AdaptiveLevel = 1 | 2 | 3 | 4 | 5;

export type RoundResult = {
  round: number;
  correct: boolean;
  timedOut: boolean;
  seconds: number;
  maxSeconds: number;
};

export type AdaptiveProfile = {
  level: AdaptiveLevel;
  timeMultiplier: number;
  hint: string | null;
  reason: string | null;
  source: "inicial" | "ia" | "automático";
};

export const LEVEL_LABEL: Record<AdaptiveLevel, string> = {
  1: "Bem tranquilo",
  2: "Tranquilo",
  3: "Equilibrado",
  4: "Puxado",
  5: "Desafio",
};

export const DEFAULT_ADAPTIVE: AdaptiveProfile = {
  level: 3,
  timeMultiplier: 1,
  hint: null,
  reason: null,
  source: "inicial",
};

export function clampLevel(n: number): AdaptiveLevel {
  return Math.min(5, Math.max(1, Math.round(n || 3))) as AdaptiveLevel;
}

export function clampMultiplier(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(2.5, Math.max(0.6, n));
}

/**
 * Converte a rodada real numa "rodada efetiva" usada pelos geradores de puzzle:
 * nível baixo gera números menores, nível alto acelera a curva.
 */
export function effectiveRound(round: number, level: AdaptiveLevel): number {
  return Math.min(22, Math.max(1, Math.round(round + (level - 3) * 2.5)));
}

export function scaledTime(baseSeconds: number, multiplier: number): number {
  return Math.max(4, Math.round(baseSeconds * clampMultiplier(multiplier)));
}

/** Ajuste local, imediato, entre as consultas à IA. */
export function heuristicAdjust(
  current: AdaptiveProfile,
  history: RoundResult[],
): AdaptiveProfile {
  const recent = history.slice(-4);
  if (recent.length < 3) return current;
  const hits = recent.filter((r) => r.correct).length;
  const fast = recent.filter((r) => r.correct && r.seconds < r.maxSeconds * 0.45).length;

  let level = current.level as number;
  if (hits === recent.length && fast >= 2) level += 1;
  else if (hits <= 1) level -= 1;
  else return current;

  const next = clampLevel(level);
  if (next === current.level) return current;
  return {
    ...current,
    level: next,
    timeMultiplier: clampMultiplier(next < current.level ? current.timeMultiplier + 0.15 : current.timeMultiplier - 0.1),
    source: "automático",
    reason:
      next > current.level
        ? "Você está indo rápido e acertando — subimos um pouco o nível."
        : "Erros seguidos — deixamos mais leve e com mais tempo.",
  };
}
