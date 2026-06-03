import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiaryEntry } from "@/components/hub/MathDiary";

type Item = { name: string; emoji: string };

const ITEMS: Item[] = [
  { name: "maçã", emoji: "🍎" },
  { name: "banana", emoji: "🍌" },
  { name: "pão", emoji: "🥖" },
  { name: "leite", emoji: "🥛" },
  { name: "queijo", emoji: "🧀" },
  { name: "ovo", emoji: "🥚" },
  { name: "chocolate", emoji: "🍫" },
  { name: "sorvete", emoji: "🍦" },
];

type Puzzle = {
  item: Item;
  fixed: { item: Item; price: number };
  a: number; // quantidade do item desconhecido
  b: number; // preço fixo total (do "fixed")
  total: number;
  x: number; // preço unitário do item desconhecido
};

function rint(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function generate(round: number): Puzzle {
  // Dificuldade cresce com o round
  const xMax = Math.min(3 + round, 15);
  const aMax = Math.min(2 + Math.floor(round / 2), 9);
  const x = rint(2, xMax);
  const a = rint(2, aMax);
  const fixedPrice = rint(1, Math.min(5 + round, 20));
  const total = a * x + fixedPrice;

  const [it1, it2] = (() => {
    const idx1 = Math.floor(Math.random() * ITEMS.length);
    let idx2 = Math.floor(Math.random() * ITEMS.length);
    while (idx2 === idx1) idx2 = Math.floor(Math.random() * ITEMS.length);
    return [ITEMS[idx1], ITEMS[idx2]];
  })();

  return { item: it1, fixed: { item: it2, price: fixedPrice }, a, b: fixedPrice, total, x };
}

function buildOptions(answer: number): number[] {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const delta = rint(-4, 4);
    const candidate = Math.max(1, answer + (delta === 0 ? 1 : delta));
    set.add(candidate);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

const MAX_ROUNDS = 15;
const BASE_TIME = 25;
const MIN_TIME = 8;

function maxTimeForRound(round: number) {
  return Math.max(MIN_TIME, BASE_TIME - (round - 1));
}

type Props = { pushDiary: (e: Omit<DiaryEntry, "id" | "at">) => void };

export function PrimeiroGrauGame({ pushDiary }: Props) {
  const [round, setRound] = useState(1);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate(1));
  const [options, setOptions] = useState<number[]>(() => buildOptions(puzzle.x));
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
      const ok = !timedOut && n === puzzle.x;
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
      pushDiary({
        game: "primeiro-grau",
        title: ok ? "Resolveu a equação" : timedOut ? "Tempo esgotado" : "Errou a equação",
        detail: `${puzzle.a}x + ${puzzle.b} = ${puzzle.total} → x = ${puzzle.x}`,
        kind: ok ? "ok" : "err",
      });
    },
    [puzzle, reveal, startedAt, pushDiary],
  );

  // Timeout auto
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
    setOptions(buildOptions(p.x));
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
    setOptions(buildOptions(p.x));
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
          Concluiu as {MAX_ROUNDS} rodadas do mercadinho.
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

        {/* Cenário do mercadinho */}
        <div className="rounded-xl bg-muted/50 p-4">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            no mercadinho
          </div>
          <p className="mt-2 text-base text-foreground">
            Comprei <strong>{puzzle.a}</strong> {puzzle.item.name}
            {puzzle.a > 1 ? "s" : ""} {puzzle.item.emoji} e <strong>1</strong>{" "}
            {puzzle.fixed.item.name} {puzzle.fixed.item.emoji} de{" "}
            <strong>R$ {puzzle.fixed.price}</strong>. Paguei{" "}
            <strong>R$ {puzzle.total}</strong> no total.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Quanto custa cada {puzzle.item.name} {puzzle.item.emoji}?
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-lg text-foreground">
            <span className="rounded bg-background px-2 py-1">{puzzle.a}x</span>
            <span>+</span>
            <span className="rounded bg-background px-2 py-1">{puzzle.b}</span>
            <span>=</span>
            <span className="rounded bg-background px-2 py-1">{puzzle.total}</span>
          </div>
        </div>

        {/* Opções */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {options.map((n) => {
            const isPicked = picked === n;
            const isCorrect = reveal && n === puzzle.x;
            const isWrong = reveal && isPicked && n !== puzzle.x;
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
                R$ {n}
              </button>
            );
          })}
        </div>

        {/* Revelação */}
        {reveal && (
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-sm">
            {picked === puzzle.x ? (
              <span className="text-primary">
                Acertou! 🎉 x = {puzzle.x}
                {lastTime !== null && (
                  <span className="ml-2 text-muted-foreground">em {lastTime.toFixed(1)}s</span>
                )}
              </span>
            ) : picked === -1 ? (
              <span className="text-destructive">
                ⏱ Tempo esgotado! A resposta era x = {puzzle.x}.
              </span>
            ) : (
              <span className="text-destructive">
                Era x = {puzzle.x}. Você escolheu {picked}.
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
        <h4 className="font-display text-lg text-foreground">Resolvendo a equação</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Uma equação do 1º grau tem a forma <code className="text-primary">ax + b = c</code>.
          Isolamos x: <code className="text-primary">x = (c − b) / a</code>.
        </p>

        <div className="mt-4 space-y-2 font-mono text-sm">
          <div className="rounded bg-muted px-3 py-2 text-foreground">
            {puzzle.a}x + {puzzle.b} = {puzzle.total}
          </div>
          {reveal ? (
            <>
              <div className="rounded bg-muted px-3 py-2 text-foreground">
                {puzzle.a}x = {puzzle.total} − {puzzle.b} = {puzzle.total - puzzle.b}
              </div>
              <div className="rounded bg-muted px-3 py-2 text-foreground">
                x = {puzzle.total - puzzle.b} / {puzzle.a} ={" "}
                <span className="text-primary">{puzzle.x}</span>
              </div>
            </>
          ) : (
            <div className="rounded bg-muted px-3 py-2 text-muted-foreground">
              ··· resolva e escolha o valor de x
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
