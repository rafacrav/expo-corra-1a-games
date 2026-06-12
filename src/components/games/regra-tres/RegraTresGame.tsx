import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiaryEntry } from "@/components/hub/MathDiary";

type Scenario = {
  emoji: string;
  story: (a: number, b: number, c: number, unitA: string, unitB: string) => string;
  unitA: string;
  unitB: string;
  inverse: boolean;
};

const DIRECT: Scenario[] = [
  {
    emoji: "🍞",
    unitA: "pães",
    unitB: "reais",
    inverse: false,
    story: (a, b, c) =>
      `Se ${a} pães custam R$ ${b}, quanto custam ${c} pães?`,
  },
  {
    emoji: "⛽",
    unitA: "litros",
    unitB: "km",
    inverse: false,
    story: (a, b, c) =>
      `Um carro faz ${b} km com ${a} litros. Quantos km fará com ${c} litros?`,
  },
  {
    emoji: "📏",
    unitA: "metros",
    unitB: "reais",
    inverse: false,
    story: (a, b, c) =>
      `${a} metros de tecido custam R$ ${b}. Quanto custam ${c} metros?`,
  },
  {
    emoji: "🧃",
    unitA: "caixas",
    unitB: "sucos",
    inverse: false,
    story: (a, b, c) =>
      `${a} caixas trazem ${b} sucos. Quantos sucos há em ${c} caixas?`,
  },
  {
    emoji: "🚗",
    unitA: "horas",
    unitB: "km",
    inverse: false,
    story: (a, b, c) =>
      `Em ${a} horas o carro percorre ${b} km (velocidade constante). Quanto percorre em ${c} horas?`,
  },
  {
    emoji: "📚",
    unitA: "páginas",
    unitB: "minutos",
    inverse: false,
    story: (a, b, c) =>
      `Para ler ${a} páginas, gasto ${b} minutos. Quanto gasto para ler ${c} páginas?`,
  },
];

const INVERSE: Scenario[] = [
  {
    emoji: "👷",
    unitA: "pedreiros",
    unitB: "dias",
    inverse: true,
    story: (a, b, c) =>
      `${a} pedreiros levam ${b} dias para terminar a obra. Quantos dias levarão ${c} pedreiros (mesmo ritmo)?`,
  },
  {
    emoji: "🚜",
    unitA: "tratores",
    unitB: "horas",
    inverse: true,
    story: (a, b, c) =>
      `${a} tratores aram o campo em ${b} horas. Em quantas horas ${c} tratores fariam o serviço?`,
  },
  {
    emoji: "🚰",
    unitA: "torneiras",
    unitB: "minutos",
    inverse: true,
    story: (a, b, c) =>
      `${a} torneiras enchem a caixa em ${b} minutos. Quantos minutos levariam ${c} torneiras?`,
  },
  {
    emoji: "🏃",
    unitA: "km/h",
    unitB: "horas",
    inverse: true,
    story: (a, b, c) =>
      `A ${a} km/h, a viagem dura ${b} horas. Quantas horas levaria a ${c} km/h?`,
  },
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
  answer: number;
};

function generate(round: number): Puzzle {
  // Round mais alto → mais chance de regra de três inversa
  const useInverse = Math.random() < Math.min(0.1 + round * 0.04, 0.5);
  const pool = useInverse ? INVERSE : DIRECT;
  const scenario = pool[Math.floor(Math.random() * pool.length)];

  // Garantir resultado inteiro
  let a = 0, b = 0, c = 0, answer = 0;
  const maxFactor = Math.min(2 + Math.floor(round / 2), 8);

  for (let tries = 0; tries < 50; tries++) {
    a = rint(2, 12);
    const factor = rint(2, maxFactor);
    c = a * factor;
    b = rint(2, 20);

    if (scenario.inverse) {
      // a · b = c · x  →  x = a·b/c
      const num = a * b;
      if (num % c === 0) {
        answer = num / c;
        if (answer >= 1 && answer !== b) break;
      }
    } else {
      // a/b = c/x  →  x = b·c/a
      const num = b * c;
      if (num % a === 0) {
        answer = num / a;
        if (answer >= 1 && answer !== b) break;
      }
    }
  }

  return { scenario, a, b, c, answer };
}

function buildOptions(answer: number): number[] {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const delta = rint(-Math.max(3, Math.floor(answer / 2)), Math.max(3, Math.floor(answer / 2)));
    const candidate = Math.max(1, answer + (delta === 0 ? rint(1, 3) : delta));
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

export function RegraTresGame({ pushDiary }: Props) {
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
      const { a, b, c, answer, scenario } = puzzle;
      pushDiary({
        game: "regra-tres",
        formula: scenario.inverse
          ? `${a}·${b} = ${c}·x  →  x = ${answer}`
          : `${a}/${b} = ${c}/x  →  x = ${answer}`,
        detail: ok
          ? `x = ${answer} ${scenario.unitB} ✓`
          : timedOut
            ? `tempo esgotado — x = ${answer}`
            : `errou — x = ${answer}`,
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
          Concluiu as {MAX_ROUNDS} rodadas da Regra de Três.
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
  const { scenario, a, b, c, answer } = puzzle;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
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
            <span
              className={`rounded px-2 py-1 font-mono ${
                scenario.inverse
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {scenario.inverse ? "inversa" : "direta"}
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
            {scenario.emoji} regra de três {scenario.inverse ? "inversa" : "direta"}
          </div>
          <p className="mt-2 text-base text-foreground">
            {scenario.story(a, b, c, scenario.unitA, scenario.unitB)}
          </p>

          {/* Tabela */}
          <div className="mt-3 inline-block rounded bg-background px-4 py-3 font-mono text-sm text-foreground">
            <div className="grid grid-cols-2 gap-x-6 gap-y-1">
              <div className="text-muted-foreground">{scenario.unitA}</div>
              <div className="text-muted-foreground">{scenario.unitB}</div>
              <div>{a}</div>
              <div>{b}</div>
              <div>{c}</div>
              <div className="text-primary">x</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {scenario.inverse ? "↑ grandezas inversamente proporcionais" : "↑ grandezas diretamente proporcionais"}
            </div>
          </div>
        </div>

        {/* Opções */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {options.map((n) => {
            const isPicked = picked === n;
            const isCorrect = reveal && n === answer;
            const isWrong = reveal && isPicked && n !== answer;
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
                {n}
              </button>
            );
          })}
        </div>

        {/* Revelação */}
        {reveal && (
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            {picked === answer ? (
              <span className="text-primary">
                Acertou! 🎉 x = {answer} {scenario.unitB}
                {lastTime !== null && (
                  <span className="ml-2 text-muted-foreground">em {lastTime.toFixed(1)}s</span>
                )}
              </span>
            ) : picked === -1 ? (
              <span className="text-destructive">
                ⏱ Tempo esgotado! A resposta era x = {answer} {scenario.unitB}.
              </span>
            ) : (
              <span className="text-destructive">
                Era x = {answer} {scenario.unitB}. Você escolheu {picked}.
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
        <h4 className="font-display text-lg text-foreground">Resolvendo com regra de três</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {scenario.inverse ? (
            <>
              Inversa: se uma grandeza dobra, a outra cai pela metade. Inverte uma coluna →{" "}
              <code className="text-primary">a · b = c · x</code>.
            </>
          ) : (
            <>
              Direta: ambas crescem juntas. Multiplica em cruz →{" "}
              <code className="text-primary">a/b = c/x</code>.
            </>
          )}
        </p>

        <div className="mt-4 space-y-2 font-mono text-sm">
          <div className="rounded bg-muted px-3 py-2 text-foreground">
            {a} {scenario.unitA} —— {b} {scenario.unitB}
          </div>
          <div className="rounded bg-muted px-3 py-2 text-foreground">
            {c} {scenario.unitA} —— x {scenario.unitB}
          </div>
          {reveal ? (
            scenario.inverse ? (
              <>
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  {a} · {b} = {c} · x
                </div>
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  x = ({a} · {b}) / {c} = {a * b} / {c} ={" "}
                  <span className="text-primary">{answer}</span>
                </div>
              </>
            ) : (
              <>
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  {a} · x = {b} · {c}
                </div>
                <div className="rounded bg-muted px-3 py-2 text-foreground">
                  x = ({b} · {c}) / {a} = {b * c} / {a} ={" "}
                  <span className="text-primary">{answer}</span>
                </div>
              </>
            )
          ) : (
            <div className="rounded bg-muted px-3 py-2 text-muted-foreground">
              ··· monte a proporção e descubra x
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
