import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiaryEntry } from "@/components/hub/MathDiary";

type Scenario = {
  emoji: string;
  subject: string;
  verb: string;
  unit: "m/s" | "km/h";
};

const SCENARIOS: Scenario[] = [
  { emoji: "⚽", subject: "a bola chutada", verb: "rolou", unit: "m/s" },
  { emoji: "🚴", subject: "o ciclista", verb: "pedalou", unit: "km/h" },
  { emoji: "🏃", subject: "o corredor", verb: "correu", unit: "m/s" },
  { emoji: "🚗", subject: "o carro", verb: "andou", unit: "km/h" },
  { emoji: "🐢", subject: "a tartaruga", verb: "caminhou", unit: "m/s" },
  { emoji: "🛹", subject: "o skatista", verb: "deslizou", unit: "m/s" },
  { emoji: "🚌", subject: "o ônibus", verb: "rodou", unit: "km/h" },
  { emoji: "🐎", subject: "o cavalo", verb: "galopou", unit: "km/h" },
];

type Ask = "v" | "s" | "t";

type Puzzle = {
  scenario: Scenario;
  s: number; // deslocamento
  t: number; // tempo
  v: number; // velocidade (s/t)
  sUnit: string;
  tUnit: string;
  ask: Ask;
  answer: number;
};

function rint(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generate(round: number): Puzzle {
  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const sUnit = scenario.unit === "m/s" ? "m" : "km";
  const tUnit = scenario.unit === "m/s" ? "s" : "h";

  // Dificuldade cresce
  const vMax = Math.min(4 + round, 20);
  const tMax = Math.min(3 + round, 12);
  const v = rint(2, vMax);
  const t = rint(2, tMax);
  const s = v * t;

  const asks: Ask[] = ["v", "v", "s", "t"]; // mais perguntas de v
  const ask = asks[Math.floor(Math.random() * asks.length)];
  const answer = ask === "v" ? v : ask === "s" ? s : t;

  return { scenario, s, t, v, sUnit, tUnit, ask, answer };
}

function buildOptions(answer: number): number[] {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const delta = rint(-5, 5);
    const cand = Math.max(1, answer + (delta === 0 ? 1 : delta));
    set.add(cand);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

const MAX_ROUNDS = 15;
const BASE_TIME = 25;
const MIN_TIME = 8;
const maxTimeForRound = (round: number) => Math.max(MIN_TIME, BASE_TIME - (round - 1));

type Props = { pushDiary: (e: Omit<DiaryEntry, "id" | "at">) => void };

export function VelocidadeGame({ pushDiary }: Props) {
  const [round, setRound] = useState(1);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate(1));
  const [options, setOptions] = useState<number[]>(() => buildOptions(puzzle.answer));
  const [picked, setPicked] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [hits, setHits] = useState(0);
  const [miss, setMiss] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [won, setWon] = useState(false);

  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [lastTime, setLastTime] = useState<number | null>(null);

  const maxTime = maxTimeForRound(round);
  const elapsed = (now - startedAt) / 1000;
  const remaining = Math.max(0, maxTime - elapsed);

  useEffect(() => {
    if (reveal || won) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [reveal, won]);

  const handlePick = useCallback(
    (n: number, timedOut = false) => {
      if (reveal) return;
      const ok = !timedOut && n === puzzle.answer;
      const t = (Date.now() - startedAt) / 1000;
      setPicked(timedOut ? -1 : n);
      setReveal(true);
      setLastTime(t);
      if (ok) {
        setHits((h) => h + 1);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
      } else {
        setMiss((m) => m + 1);
        setStreak(0);
      }
      const unitLabel =
        puzzle.ask === "v" ? puzzle.scenario.unit : puzzle.ask === "s" ? puzzle.sUnit : puzzle.tUnit;
      pushDiary({
        game: "velocidade",
        formula: `v = Δs/Δt = ${puzzle.s}${puzzle.sUnit} / ${puzzle.t}${puzzle.tUnit}`,
        detail: ok
          ? `${puzzle.ask} = ${puzzle.answer}${unitLabel} ✓`
          : timedOut
            ? `tempo esgotado — ${puzzle.ask} = ${puzzle.answer}${unitLabel}`
            : `errou — ${puzzle.ask} = ${puzzle.answer}${unitLabel}`,
      });
    },
    [puzzle, reveal, startedAt, pushDiary],
  );

  useEffect(() => {
    if (reveal || won) return;
    if (remaining <= 0) handlePick(-1, true);
  }, [remaining, reveal, won, handlePick]);

  const next = useCallback(() => {
    if (round >= MAX_ROUNDS) {
      setWon(true);
      return;
    }
    const nr = round + 1;
    const p = generate(nr);
    setRound(nr);
    setPuzzle(p);
    setOptions(buildOptions(p.answer));
    setPicked(null);
    setReveal(false);
    setLastTime(null);
    setStartedAt(Date.now());
    setNow(Date.now());
  }, [round]);

  const restart = useCallback(() => {
    const p = generate(1);
    setRound(1);
    setPuzzle(p);
    setOptions(buildOptions(p.answer));
    setPicked(null);
    setReveal(false);
    setHits(0);
    setMiss(0);
    setStreak(0);
    setBestStreak(0);
    setWon(false);
    setLastTime(null);
    setStartedAt(Date.now());
    setNow(Date.now());
  }, []);

  const accuracy = useMemo(() => {
    const total = hits + miss;
    return total === 0 ? 0 : Math.round((hits / total) * 100);
  }, [hits, miss]);

  if (won) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <div className="text-5xl">🏆</div>
        <h3 className="mt-3 font-display text-3xl text-foreground">Você venceu!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Concluiu as {MAX_ROUNDS} rodadas de velocidade média.
        </p>
        <div className="mx-auto mt-5 grid max-w-md grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg bg-muted p-3">
            <div className="font-mono text-2xl text-foreground">{hits}</div>
            <div className="text-xs text-muted-foreground">acertos</div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="font-mono text-2xl text-foreground">{accuracy}%</div>
            <div className="text-xs text-muted-foreground">precisão</div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="font-mono text-2xl text-primary">{bestStreak}</div>
            <div className="text-xs text-muted-foreground">melhor streak</div>
          </div>
        </div>
        <button
          onClick={restart}
          className="mt-6 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Jogar de novo
        </button>
      </div>
    );
  }

  const lowTime = remaining < 5;
  const { scenario, s, t, v, sUnit, tUnit, ask } = puzzle;

  const question =
    ask === "v"
      ? `Qual a velocidade média?`
      : ask === "s"
        ? `Qual o deslocamento percorrido?`
        : `Quanto tempo levou?`;

  const unitLabel = ask === "v" ? scenario.unit : ask === "s" ? sUnit : tUnit;

  const known = (
    <>
      {ask !== "s" && (
        <>
          <span className="rounded bg-background px-2 py-1">Δs = {s} {sUnit}</span>
        </>
      )}
      {ask !== "t" && (
        <>
          <span className="rounded bg-background px-2 py-1">Δt = {t} {tUnit}</span>
        </>
      )}
      {ask !== "v" && (
        <>
          <span className="rounded bg-background px-2 py-1">v = {v} {scenario.unit}</span>
        </>
      )}
    </>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded bg-muted px-2 py-1 font-mono text-foreground">
              rodada {round}/{MAX_ROUNDS}
            </span>
            <span className="rounded bg-muted px-2 py-1 font-mono text-primary">
              🔥 streak {streak}
            </span>
          </div>
          <div
            className={`rounded px-2 py-1 font-mono text-xs ${
              lowTime && !reveal
                ? "border border-destructive text-destructive"
                : "bg-muted text-foreground"
            }`}
          >
            ⏱ {remaining.toFixed(1)}s / {maxTime}s
          </div>
        </div>

        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((round - 1) / MAX_ROUNDS) * 100}%` }}
          />
        </div>

        <div className="rounded-xl bg-muted/50 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">cenário</div>
          <p className="mt-2 text-base text-foreground">
            <span className="text-2xl">{scenario.emoji}</span> {scenario.subject} {scenario.verb}{" "}
            {ask !== "s" ? <strong>{s} {sUnit}</strong> : <strong>uma certa distância</strong>}{" "}
            em{" "}
            {ask !== "t" ? <strong>{t} {tUnit}</strong> : <strong>um certo tempo</strong>}
            {ask !== "v" && (
              <>
                {" "}
                a uma velocidade de <strong>{v} {scenario.unit}</strong>
              </>
            )}
            .
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{question}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-sm text-foreground">
            {known}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {options.map((n) => {
            const isPicked = picked === n;
            const isCorrect = reveal && n === puzzle.answer;
            const isWrong = reveal && isPicked && n !== puzzle.answer;
            return (
              <button
                key={n}
                disabled={reveal}
                onClick={() => handlePick(n)}
                className={`rounded-lg border px-3 py-3 font-mono text-lg transition ${
                  isCorrect
                    ? "border-primary bg-primary/15 text-primary"
                    : isWrong
                      ? "border-destructive bg-destructive/10 text-destructive"
                      : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {n} {unitLabel}
              </button>
            );
          })}
        </div>

        {reveal && (
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            {picked === puzzle.answer ? (
              <span className="text-primary">
                Acertou! 🎉 {ask} = {puzzle.answer} {unitLabel}
                {lastTime !== null && (
                  <span className="ml-2 text-muted-foreground">em {lastTime.toFixed(1)}s</span>
                )}
              </span>
            ) : picked === -1 ? (
              <span className="text-destructive">
                ⏱ Tempo esgotado! A resposta era {puzzle.answer} {unitLabel}.
              </span>
            ) : (
              <span className="text-destructive">
                Era {puzzle.answer} {unitLabel}. Você escolheu {picked}.
              </span>
            )}
            <button
              onClick={next}
              className="ml-3 rounded bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {round >= MAX_ROUNDS ? "VER RESULTADO →" : "PRÓXIMO →"}
            </button>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            ✅ {hits} • ❌ {miss} • precisão {accuracy}%
          </span>
          <button onClick={restart} className="underline-offset-2 hover:underline">
            reiniciar
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h4 className="font-display text-lg text-foreground">Velocidade Média</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          A velocidade média é o deslocamento dividido pelo tempo:{" "}
          <code className="text-primary">v = Δs / Δt</code>. Isolando, temos{" "}
          <code className="text-primary">Δs = v · Δt</code> e{" "}
          <code className="text-primary">Δt = Δs / v</code>.
        </p>

        <div className="mt-4 space-y-2 font-mono text-sm">
          {ask === "v" && (
            <>
              <div className="rounded bg-muted px-3 py-2 text-foreground">
                v = Δs / Δt = {s} {sUnit} / {t} {tUnit}
              </div>
              {reveal && (
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  v = <span className="text-primary">{v} {scenario.unit}</span>
                </div>
              )}
            </>
          )}
          {ask === "s" && (
            <>
              <div className="rounded bg-muted px-3 py-2 text-foreground">
                Δs = v · Δt = {v} · {t}
              </div>
              {reveal && (
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  Δs = <span className="text-primary">{s} {sUnit}</span>
                </div>
              )}
            </>
          )}
          {ask === "t" && (
            <>
              <div className="rounded bg-muted px-3 py-2 text-foreground">
                Δt = Δs / v = {s} / {v}
              </div>
              {reveal && (
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  Δt = <span className="text-primary">{t} {tUnit}</span>
                </div>
              )}
            </>
          )}
          {!reveal && (
            <div className="rounded bg-muted px-3 py-2 text-muted-foreground">
              ··· calcule e escolha a resposta
            </div>
          )}
        </div>

        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          ⏱ {remaining.toFixed(1)}s restantes • streak{" "}
          <span className="text-primary">{streak}</span> • melhor{" "}
          <span className="text-primary">{bestStreak}</span>
        </div>
      </div>
    </div>
  );
}
