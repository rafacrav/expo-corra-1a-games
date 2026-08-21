import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiaryEntry } from "@/components/hub/MathDiary";

// Triplos pitagóricos escalados (a, b, c)
const PRIMITIVES: Array<[number, number, number]> = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
  [9, 40, 41],
  [12, 35, 37],
  [11, 60, 61],
  [16, 63, 65],
  [48, 55, 73],
  [13, 84, 85],
  [36, 77, 85],
  [39, 80, 89],
  [65, 72, 97],
];

type Scenario = {
  emoji: string;
  label: string;
  itemA: string;
  itemB: string;
  itemC: string;
};

const SCENARIOS: Scenario[] = [
  { emoji: "🏠", label: "telhado", itemA: "base", itemB: "altura", itemC: "beiral" },
  { emoji: "📐", label: "rampa", itemA: "distância horizontal", itemB: "altura", itemC: "rampa" },
  { emoji: "📺", label: "tela", itemA: "largura", itemB: "altura", itemC: "diagonal" },
  { emoji: "🪜", label: "escada", itemA: "distância da parede", itemB: "altura", itemC: "escada" },
  { emoji: "🚩", label: "bandeirinha", itemA: "haste vertical", itemB: "distância", itemC: "cabo" },
  {
    emoji: "⚽",
    label: "quadra",
    itemA: "largura",
    itemB: "profundidade",
    itemC: "diagonal do campo",
  },
  { emoji: "🗺️", label: "mapa", itemA: "leste", itemB: "norte", itemC: "distância em linha reta" },
  { emoji: "🛣️", label: "estrada", itemA: "horizontal", itemB: "subida", itemC: "comprimento" },
];

function rint(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Puzzle = {
  scenario: Scenario;
  a: number;
  b: number;
  c: number;
  askFor: "a" | "b" | "c";
  answer: number;
};

function RightTriangleDiagram({ puzzle }: { puzzle: Puzzle }) {
  const { a, b, c, askFor, scenario } = puzzle;
  const horizontalValue = askFor === "a" ? "?" : `${a} m`;
  const verticalValue = askFor === "b" ? "?" : `${b} m`;
  const hypotenuseValue = askFor === "c" ? "?" : `${c} m`;

  // A equipe mantém a proporção reconhecível mesmo quando os catetos são muito diferentes.
  const visualRatio = Math.min(1.8, Math.max(0.55, a / b));
  const triangleHeight = 190;
  const triangleWidth = triangleHeight * visualRatio;
  const rightX = 390 + triangleWidth / 2;
  const leftX = rightX - triangleWidth;
  const topY = 45;
  const baseY = topY + triangleHeight;
  const unknownColor = "var(--primary)";

  return (
    <figure className="mt-4 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <svg
        viewBox="0 0 640 300"
        role="img"
        aria-labelledby="triangle-title triangle-description"
        className="h-auto min-h-56 w-full"
      >
        <title id="triangle-title">Triângulo retângulo do cenário {scenario.label}</title>
        <desc id="triangle-description">
          Representação dos lados {scenario.itemA}, {scenario.itemB} e {scenario.itemC}.
        </desc>

        <defs>
          <linearGradient id="triangle-fill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
          </linearGradient>
          <pattern id="diagram-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
              opacity="0.5"
            />
          </pattern>
        </defs>

        <rect width="640" height="300" fill="url(#diagram-grid)" />
        <text x="24" y="32" fill="var(--muted-foreground)" fontSize="13" fontWeight="600">
          {scenario.emoji} REPRESENTAÇÃO DO CENÁRIO
        </text>

        <path
          d={`M ${leftX} ${baseY} L ${rightX} ${baseY} L ${rightX} ${topY} Z`}
          fill="url(#triangle-fill)"
          stroke="var(--foreground)"
          strokeWidth="4"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={`M ${rightX - 25} ${baseY} L ${rightX - 25} ${baseY - 25} L ${rightX} ${baseY - 25}`}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />

        <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontWeight="700">
          <text
            x={(leftX + rightX) / 2}
            y={baseY + 34}
            textAnchor="middle"
            fill={askFor === "a" ? unknownColor : "var(--foreground)"}
            fontSize={askFor === "a" ? 24 : 17}
          >
            {horizontalValue}
          </text>
          <text
            x={rightX + 22}
            y={(topY + baseY) / 2 + 6}
            fill={askFor === "b" ? unknownColor : "var(--foreground)"}
            fontSize={askFor === "b" ? 24 : 17}
          >
            {verticalValue}
          </text>
          <text
            x={(leftX + rightX) / 2 - 12}
            y={(topY + baseY) / 2 - 14}
            textAnchor="middle"
            fill={askFor === "c" ? unknownColor : "var(--foreground)"}
            fontSize={askFor === "c" ? 24 : 17}
          >
            {hypotenuseValue}
          </text>
        </g>
      </svg>

      <figcaption className="grid gap-2 border-t border-border bg-muted/40 p-3 text-xs sm:grid-cols-3">
        {[
          { key: "a", label: scenario.itemA, value: horizontalValue },
          { key: "b", label: scenario.itemB, value: verticalValue },
          { key: "c", label: scenario.itemC, value: hypotenuseValue },
        ].map((side) => (
          <div
            key={side.key}
            className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2"
          >
            <span className="min-w-0 truncate text-muted-foreground">{side.label}</span>
            <strong className={side.value === "?" ? "text-lg text-primary" : "text-foreground"}>
              {side.value}
            </strong>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}

function generate(round: number): Puzzle {
  // Dificuldade cresce: números maiores, mas sempre inteiros
  const maxScale = Math.min(round + 1, 8);
  const scale = rint(1, maxScale);

  const [pA, pB, pC] = PRIMITIVES[Math.floor(Math.random() * PRIMITIVES.length)];
  const a = pA * scale;
  const b = pB * scale;
  const c = pC * scale;

  const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];

  // Qual lado perguntar? Round mais alto → mais chance de perguntar cateto
  const r = Math.random();
  const askFor: "a" | "b" | "c" = r < 0.35 ? "a" : r < 0.7 ? "b" : "c";

  const answer = askFor === "a" ? a : askFor === "b" ? b : c;

  return { scenario, a, b, c, askFor, answer };
}

function buildOptions(answer: number): number[] {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const delta = rint(-15, 15);
    const candidate = Math.max(1, answer + (delta === 0 ? rint(1, 5) : delta));
    set.add(candidate);
  }
  return shuffle(Array.from(set));
}

const MAX_ROUNDS = 15;
const BASE_TIME = 25;
const MIN_TIME = 8;

function maxTimeForRound(round: number) {
  return Math.max(MIN_TIME, BASE_TIME - (round - 1));
}

type Props = { pushDiary: (e: Omit<DiaryEntry, "id" | "at">) => void };

export function HipotenusaGame({ pushDiary }: Props) {
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

  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
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
      const { a, b, c, askFor } = puzzle;
      const missing = askFor === "a" ? a : askFor === "b" ? b : c;
      pushDiary({
        game: "hipotenusa",
        formula: `a² + b² = c²  →  ${a}² + ${b}² = ${c}²`,
        detail: ok
          ? `${askFor} = ${missing} ✓`
          : timedOut
            ? `tempo esgotado — ${askFor} = ${missing}`
            : `errou — ${askFor} = ${missing}`,
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
          Concluiu as {MAX_ROUNDS} rodadas do Teorema de Pitágoras.
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

  const { scenario, a, b, c, askFor } = puzzle;
  const knownA = askFor !== "a" ? a : null;
  const knownB = askFor !== "b" ? b : null;
  const knownC = askFor !== "c" ? c : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      {/* Painel do jogo */}
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

        {/* Barra de progresso */}
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((round - 1) / MAX_ROUNDS) * 100}%` }}
          />
        </div>

        {/* Cenário */}
        <div className="rounded-xl bg-muted/50 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {scenario.emoji} {scenario.label}
          </div>
          <p className="mt-2 text-base text-foreground">
            {askFor === "c" ? (
              <>
                Sabemos que <strong>{scenario.itemA}</strong> = <strong>{knownA} m</strong> e{" "}
                <strong>{scenario.itemB}</strong> = <strong>{knownB} m</strong>.
                <br />
                Qual o valor de <strong>{scenario.itemC}</strong> (a hipotenusa)?
              </>
            ) : askFor === "a" ? (
              <>
                Sabemos que <strong>{scenario.itemB}</strong> = <strong>{knownB} m</strong> e{" "}
                <strong>{scenario.itemC}</strong> = <strong>{knownC} m</strong>.
                <br />
                Qual o valor de <strong>{scenario.itemA}</strong> (cateto)?
              </>
            ) : (
              <>
                Sabemos que <strong>{scenario.itemA}</strong> = <strong>{knownA} m</strong> e{" "}
                <strong>{scenario.itemC}</strong> = <strong>{knownC} m</strong>.
                <br />
                Qual o valor de <strong>{scenario.itemB}</strong> (cateto)?
              </>
            )}
          </p>

          <RightTriangleDiagram puzzle={puzzle} />
        </div>

        {/* Opções */}
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
                {n} m
              </button>
            );
          })}
        </div>

        {/* Revelação */}
        {reveal && (
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            {picked === puzzle.answer ? (
              <span className="text-primary">
                Acertou! 🎉{" "}
                {askFor === "c" ? scenario.itemC : askFor === "a" ? scenario.itemA : scenario.itemB}{" "}
                = {puzzle.answer} m
                {lastTime !== null && (
                  <span className="ml-2 text-muted-foreground">em {lastTime.toFixed(1)}s</span>
                )}
              </span>
            ) : picked === -1 ? (
              <span className="text-destructive">
                ⏱ Tempo esgotado! A resposta era{" "}
                {askFor === "c" ? scenario.itemC : askFor === "a" ? scenario.itemA : scenario.itemB}{" "}
                = {puzzle.answer} m.
              </span>
            ) : (
              <span className="text-destructive">
                Era{" "}
                {askFor === "c" ? scenario.itemC : askFor === "a" ? scenario.itemA : scenario.itemB}{" "}
                = {puzzle.answer} m. Você escolheu {picked} m.
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

      {/* Painel matemático */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h4 className="font-display text-lg text-foreground">Resolvendo com Pitágoras</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Teorema de Pitágoras: <code className="text-primary">a² + b² = c²</code>.
          {askFor === "c"
            ? " Para achar a hipotenusa: c = √(a² + b²)."
            : " Para achar um cateto: √(c² − outro²)."}
        </p>

        <div className="mt-4 space-y-2 font-mono text-sm">
          <div className="rounded bg-muted px-3 py-2 text-foreground">
            a = {a}, b = {b}, c = {c}
          </div>
          {reveal ? (
            askFor === "c" ? (
              <>
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  c² = {a}² + {b}² = {a * a} + {b * b} = {a * a + b * b}
                </div>
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  c = √{a * a + b * b} = <span className="text-primary">{c}</span>
                </div>
              </>
            ) : askFor === "a" ? (
              <>
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  a² = c² − b² = {c}² − {b}² = {c * c} − {b * b} = {c * c - b * b}
                </div>
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  a = √{c * c - b * b} = <span className="text-primary">{a}</span>
                </div>
              </>
            ) : (
              <>
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  b² = c² − a² = {c}² − {a}² = {c * c} − {a * a} = {c * c - a * a}
                </div>
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  b = √{c * c - a * a} = <span className="text-primary">{b}</span>
                </div>
              </>
            )
          ) : (
            <div className="rounded bg-muted px-3 py-2 text-muted-foreground">
              ··· aplique o teorema e escolha o valor correto
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
