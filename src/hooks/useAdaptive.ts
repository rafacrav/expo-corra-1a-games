import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { adaptDifficulty } from "@/lib/adaptive.functions";
import { saveGameSession } from "@/lib/sessions.functions";
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
  const save = useServerFn(saveGameSession);
  const [profile, setProfile] = useState<AdaptiveProfile>(DEFAULT_ADAPTIVE);
  const [thinking, setThinking] = useState(false);
  const historyRef = useRef<RoundResult[]>([]);
  const askedRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);
  const savingRef = useRef(false);
  const startedRef = useRef<number>(Date.now());
  const statsRef = useRef({ correct: 0, wrong: 0, rounds: 0, streak: 0, best: 0 });



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

  const persist = useCallback(
    async (level: number) => {
      if (savingRef.current) return;
      savingRef.current = true;
      try {
        const s = statsRef.current;
        const out = await save({
          data: {
            id: sessionIdRef.current,
            game,
            correct: s.correct,
            wrong: s.wrong,
            rounds: s.rounds,
            bestStreak: s.best,
            aiLevel: level,
            durationSeconds: Math.round((Date.now() - startedRef.current) / 1000),
          },
        });
        if (out.id) sessionIdRef.current = out.id;
      } catch {
        /* silencioso: não atrapalha o jogo */
      } finally {
        savingRef.current = false;
      }
    },
    [game, save],
  );

  const record = useCallback(
    (r: RoundResult) => {
      historyRef.current = [...historyRef.current, r].slice(-20);
      const s = statsRef.current;
      s.rounds += 1;
      if (r.correct) {
        s.correct += 1;
        s.streak += 1;
        s.best = Math.max(s.best, s.streak);
      } else {
        s.wrong += 1;
        s.streak = 0;
      }
      setProfile((prev) => {
        const next = heuristicAdjust(prev, historyRef.current);
        void persist(next.level);
        return next;
      });
      if (historyRef.current.length % EVERY === 0) {
        setProfile((prev) => {
          void call(prev.level);
          return prev;
        });
      }
    },
    [call, persist],
  );

  const reset = useCallback(() => {
    historyRef.current = [];
    statsRef.current = { correct: 0, wrong: 0, rounds: 0, streak: 0, best: 0 };
    sessionIdRef.current = null;
    startedRef.current = Date.now();
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
