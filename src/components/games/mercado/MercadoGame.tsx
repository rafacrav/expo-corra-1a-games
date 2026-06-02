import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DiaryEntry } from "@/components/hub/MathDiary";

type Item = { name: string; emoji: string };

const UNKNOWN_ITEMS: Item[] = [
  { name: "banana", emoji: "🍌" },
  { name: "maçã", emoji: "🍎" },
  { name: "pão", emoji: "🥖" },
  { name: "ovo", emoji: "🥚" },
  { name: "tomate", emoji: "🍅" },
  { name: "queijo", emoji: "🧀" },
  { name: "laranja", emoji: "🍊" },
  { name: "leite", emoji: "🥛" },
];

const EXTRA_ITEMS: Item[] = [
  { name: "chocolate", emoji: "🍫" },
  { name: "refrigerante", emoji: "🥤" },
  { name: "sorvete", emoji: "🍦" },
  { name: "biscoito", emoji: "🍪" },
];

type Puzzle = {
  unknown: Item;
  a: number; // quantidade do desconhecido (coef de x)
  x: number; // preço unitário (resposta)
  extras: { item: Item; qty: number; price: number }[]; // soma -> b
  b: number; // soma fixa
  total: number; // a*x + b
  options: number[];
};

const MAX_ROUNDS = 15;
const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function generate(round: number): Puzzle {
  // dificuldade cresce com a rodada
  const diff = Math.min(5, Math.ceil(round / 3));
  const unknown = pick(UNKNOWN_ITEMS);
  const a = rnd(2, 2 + diff * 2); // 2..12
  const x = rnd(2, 3 + diff * 2); // resposta inteira
  const numExtras = round <= 3 ? 0 : rnd(1, Math.min(2, diff));

  const extras: Puzzle["extras"] = [];
  let b = 0;
  const used = new Set<string>([unknown.name]);
  for (let i = 0; i < numExtras; i++) {
    let item: Item;
    do {
      item = pick(EXTRA_ITEMS);
    } while (used.has(item.name));
    used.add(item.name);
    const qty = rnd(1, 3);
    const price = rnd(2, 8);
    extras.push({ item, qty, price });
    b += qty * price;
  }
  const total = a * x + b;

  // gerar opções
  const set = new Set<number>([x]);
  while (set.size < 4) {
    const delta = rnd(-3, 3);
    const v = x + delta;
    if (v > 0 && v !== x) set.add(v);
  }
  const options = [...set].sort(() => Math.random() - 0.5);

  return { unknown, a, x, extras, b, total, options };
}

export function MercadoGame({ pushDiary }: { pushDiary: (e: Omit<DiaryEntry, "id" | "at">) => void }) {
  const [round, setRound] = useState(1);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate(1));
  const [picked, setPicked] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [won, setWon] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
  const timedOutRef = useRef(false);

  const maxTime = Math.max(5, 22 - (round - 1));
  const elapsed = (now - startedAt) / 1000;
  const remaining = Math.max(0, maxTime - elapsed);

  useEffect(() => {
    if (reveal || won) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [reveal, won]);

  const finish = useCallback(
    (chosen: number | null, timeout: boolean) => {
      if (reveal) return;
      timedOutRef.current = timeout;
      setReveal(true);
      setPicked(chosen);
      const correct = chosen === puzzle.x;
      if (correct) {
        setHits((h) => h + 1);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
      } else {
        setMisses((m) => m + 1);
        setStreak(0);
      }
      const eq = `${puzzle.a}x${puzzle.b > 0 ? ` + ${puzzle.b}` : ""} = ${puzzle.total}`;
      pushDiary({
        game: "Mercadinho",
        formula: `${eq}`,
        detail: correct ? `x = ${puzzle.x} ✓` : timeout ? `tempo esgotado — x = ${puzzle.x}` : `errou — x = ${puzzle.x}`,
      });
    },
    [puzzle, reveal, pushDiary],
  );

  useEffect(() => {
    if (!reveal && !won && remaining <= 0) finish(null, true);
  }, [remaining, reveal, won, finish]);

  const next = useCallback(() => {
    if (round >= MAX_ROUNDS) {
      setWon(true);
      return;
    }
    const nr = round + 1;
    setRound(nr);
    setPuzzle(generate(nr));
    setPicked(null);
    setReveal(false);
    setStartedAt(Date.now());
    setNow(Date.now());
  }, [round]);

  const restart = useCallback(() => {
    setRound(1);
    setPuzzle(generate(1));
    setPicked(null);
    setReveal(false);
    setHits(0);
    setMisses(0);
    setStreak(0);
    setBestStreak(0);
    setWon(false);
    setStartedAt(Date.now());
    setNow(Date.now());
  }, []);

  const equation = useMemo(() => {
    const left = `${puzzle.a}·x${puzzle.b > 0 ? ` + ${puzzle.b}` : ""}`;
    return `${left} = ${puzzle.total}`;
  }, [puzzle]);

  if (won) {
    const acc = hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;
    return (
      <div className="rounded-2xl border border-primary bg-card p-8 text-center shadow-glow-gold">
        <div className="mb-2 text-6xl">🏆</div>
        <h3 className="font-display text-3xl text-foreground">Caixa fechado!</h3>
        <p className="mt-2 text-muted-foreground">Você terminou as {MAX_ROUNDS} rodadas do mercadinho.</p>
        <div className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-3 text-left">
          <Stat label="Acertos" value={hits} />
          <Stat label="Erros" value={misses} />
          <Stat label="Precisão" value={`${acc}%`} />
          <Stat label="Melhor sequência" value={bestStreak} />
        </div>
        <button
          onClick={restart}
          className="mt-6 rounded-md bg-primary px-6 py-2 font-display text-sm tracking-widest text-primary-foreground hover:opacity-90"
        >
          JOGAR DE NOVO
        </button>
      </div>
    );
  }

  const lowTime = remaining < 5 && !reveal;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      {/* Painel do jogo */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm tracking-widest text-muted-foreground">
              RODADA {round}/{MAX_ROUNDS}
            </span>
            <span className="font-mono text-xs text-primary">🔥 streak {streak}</span>
          </div>
          <div
            className={`rounded-md border px-3 py-1 font-mono text-xs ${
              lowTime ? "border-destructive text-destructive" : "border-border text-muted-foreground"
            }`}
          >
            ⏱ {remaining.toFixed(1)}s / {maxTime}s
          </div>
        </div>

        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(round / MAX_ROUNDS) * 100}%` }}
          />
        </div>

        {/* Cena do mercadinho */}
        <div className="rounded-xl border border-border bg-surface-2 p-4">
          <p className="mb-3 font-display text-xs tracking-widest text-muted-foreground">
            NO CAIXA DO MERCADINHO
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col items-center rounded-lg bg-card px-4 py-3">
              <div className="text-4xl">{puzzle.unknown.emoji}</div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                {puzzle.a}× {puzzle.unknown.name}
              </div>
              <div className="font-display text-sm text-primary">a R$ x</div>
            </div>
            {puzzle.extras.map((ex, i) => (
              <div key={i} className="flex flex-col items-center rounded-lg bg-card px-4 py-3">
                <div className="text-4xl">{ex.item.emoji}</div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  {ex.qty}× {ex.item.name}
                </div>
                <div className="font-display text-sm text-foreground">R$ {ex.price}</div>
              </div>
            ))}
            <div className="ml-auto rounded-lg border border-primary bg-card px-4 py-3 text-right">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Total
              </div>
              <div className="font-display text-2xl text-primary">R$ {puzzle.total}</div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Qual o preço de <span className="text-foreground">cada {puzzle.unknown.name}</span> (x)?
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {puzzle.options.map((v) => {
            const isPicked = picked === v;
            const isCorrect = v === puzzle.x;
            const cls = !reveal
              ? "border-border bg-card hover:border-primary"
              : isCorrect
                ? "border-primary bg-primary/10 text-primary"
                : isPicked
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-border bg-card opacity-60";
            return (
              <button
                key={v}
                disabled={reveal}
                onClick={() => finish(v, false)}
                className={`rounded-lg border px-3 py-3 font-display text-lg transition-all ${cls}`}
              >
                R$ {v}
              </button>
            );
          })}
        </div>

        {reveal && (
          <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4">
            {picked === puzzle.x ? (
              <p className="font-display text-lg text-primary">Acertou! 🎉</p>
            ) : timedOutRef.current ? (
              <p className="font-display text-lg text-destructive">Tempo esgotado ⏱</p>
            ) : (
              <p className="font-display text-lg text-destructive">Quase! A resposta era x = {puzzle.x}.</p>
            )}
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {equation} ⇒ x = ({puzzle.total}
              {puzzle.b > 0 ? ` − ${puzzle.b}` : ""}) ÷ {puzzle.a} = {puzzle.x}
            </p>
            <button
              onClick={next}
              className="mt-3 rounded-md bg-primary px-4 py-2 font-display text-xs tracking-widest text-primary-foreground hover:opacity-90"
            >
              {round >= MAX_ROUNDS ? "VER RESULTADO →" : "PRÓXIMO →"}
            </button>
          </div>
        )}
      </div>

      {/* Painel matemático */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-display text-xs tracking-widest text-muted-foreground">EQUAÇÃO DO 1º GRAU</p>
          <code className="mt-2 block rounded bg-muted px-3 py-2 font-mono text-base text-primary">
            a·x + b = total
          </code>
          <code className="mt-2 block rounded bg-muted px-3 py-2 font-mono text-base text-foreground">
            {equation}
          </code>
          {reveal ? (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              x = (total − b) ÷ a = ({puzzle.total}
              {puzzle.b > 0 ? ` − ${puzzle.b}` : ""}) ÷ {puzzle.a} ={" "}
              <span className="text-primary">{puzzle.x}</span>
            </p>
          ) : (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Isole o x: subtraia o que é fixo e divida pelo coeficiente.
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Acertos" value={hits} />
          <Stat label="Erros" value={misses} />
          <Stat label="Streak" value={streak} />
          <Stat label="Melhor" value={bestStreak} />
        </div>
        <button
          onClick={restart}
          className="w-full rounded-md border border-border bg-card px-3 py-2 font-display text-xs tracking-widest text-muted-foreground hover:border-primary hover:text-primary"
        >
          REINICIAR
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-xl text-foreground">{value}</div>
    </div>
  );
}
