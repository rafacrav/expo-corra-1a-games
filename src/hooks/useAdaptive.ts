import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adaptDifficulty } from "@/lib/adaptive.functions";
import {
  DEFAULT_ADAPTIVE,
  clampLevel,
  clampMultiplier,
  effectiveRound,
  heuristicAdjust,
  scaledTime,
  type AdaptiveProfile,
  type RoundResult,
} from "@/lib/adaptive";

const EVERY = 3; // consulta a IA a cada N rodadas

export function useAdaptive(game: string) {
  const ask = useServerFn(adaptDifficulty);
  const [profile, setProfile] = useState<AdaptiveProfile>(DEFAULT_ADAPTIVE);
  const [thinking, setThinking] = useState(false);
  const historyRef = useRef<RoundResult[]>([]);
  const askedRef = useRef(false);

  const call = useCallback(
    async (currentLevel: number) => {
      setThinking(true);
      try {
        const out = await ask({
          data: { game, currentLevel, history: historyRef.current.slice(-10) },
        });
        setProfile({
          level: clampLevel(out.level),
          timeMultiplier: clampMultiplier(out.timeMultiplier),
          hint: out.hint,
          reason: out.reason,
          source: "ia",
        });
      } catch {
        /* mantém o nível atual */
      } finally {
        setThinking(false);
      }
    },
    [ask, game],
  );

  // Calibração inicial pelo perfil do cadastro
  useEffect(() => {
    if (askedRef.current) return;
    askedRef.current = true;
    void call(DEFAULT_ADAPTIVE.level);
  }, [call]);

  const record = useCallback(
    (r: RoundResult) => {
      historyRef.current = [...historyRef.current, r].slice(-20);
      setProfile((prev) => heuristicAdjust(prev, historyRef.current));
      if (historyRef.current.length % EVERY === 0) {
        setProfile((prev) => {
          void call(prev.level);
          return prev;
        });
      }
    },
    [call],
  );

  const reset = useCallback(() => {
    historyRef.current = [];
    setProfile(DEFAULT_ADAPTIVE);
    void call(DEFAULT_ADAPTIVE.level);
  }, [call]);

  return {
    profile,
    thinking,
    record,
    reset,
    roundFor: (round: number) => effectiveRound(round, profile.level),
    timeFor: (baseSeconds: number) => scaledTime(baseSeconds, profile.timeMultiplier),
  };
}
