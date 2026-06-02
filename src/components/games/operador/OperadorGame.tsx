import { useCallback, useEffect, useMemo, useState } from "react";
import type { DiaryEntry } from "@/components/hub/MathDiary";

type Op = "+" | "−" | "×" | "÷" | "^" | "√";

const OPS: Op[] = ["+", "−", "×", "÷", "^", "√"];

function apply(a: number, op: Op, b: number): number | null {
  switch (op) {
    case "+":
      return a + b;
    case "−":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? null : a / b;
    case "^":
      return Math.pow(a, b);
    case "√":
      // a √ b → raiz b-ésima de a  (ex.: 9 √ 2 = 3)
      if (b === 0) return null;
      if (a < 0 && b % 2 === 0) return null;
      return Math.sign(a) * Math.pow(Math.abs(a), 1 / b);
  }
}

function isCleanInt(n: number | null): n is number {
  return n !== null && Number.isFinite(n) && Math.abs(n - Math.round(n)) < 1e-9 && Math.abs(n) < 1e6;
}

type Puzzle = { a: number; b: number; op: Op; result: number };

function generate(): Puzzle {
  for (let i = 0; i < 200; i++) {
    const op = OPS[Math.floor(Math.random() * OPS.length)];
    let a: number, b: number;
    switch (op) {
      case "+":
      case "−":
        a = 1 + Math.floor(Math.random() * 30);
        b = 1 + Math.floor(Math.random() * 30);
        break;
      case "×":
        a = 2 + Math.floor(Math.random() * 11);
        b = 2 + Math.floor(Math.random() * 11);
        break;
      case "÷":
        b = 2 + Math.floor(Math.random() * 9);
        a = b * (2 + Math.floor(Math.random() * 9));
        break;
      case "^":
        a = 2 + Math.floor(Math.random() * 8);
        b = 2 + Math.floor(Math.random() * 3);
        break;
      case "√":
        b = 2 + Math.floor(Math.random() * 2); // raiz 2 ou 3
        a = Math.pow(2 + Math.floor(Math.random() * 6), b);
        break;
    }
    const r = apply(a, op, b);
    if (isCleanInt(r)) return { a, b, op, result: Math.round(r) };
  }
  return { a: 6, b: 2, op: "×", result: 12 };
}

export function OperadorGame({
  pushDiary,
}: {
  pushDiary: (e: Omit<DiaryEntry, "id" | "at">) => void;
}) {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate());
  const [picked, setPicked] = useState<Op | null>(null);
  const [score, setScore] = useState({ acertos: 0, erros: 0 });
  const [reveal, setReveal] = useState(false);

  const next = useCallback(() => {
    setPuzzle(generate());
    setPicked(null);
    setReveal(false);
  }, []);

  const choose = (op: Op) => {
    if (reveal) return;
    setPicked(op);
    setReveal(true);
    const ok = op === puzzle.op;
    setScore((s) => ({
      acertos: s.acertos + (ok ? 1 : 0),
      erros: s.erros + (ok ? 0 : 1),
    }));
    pushDiary({
      game: "Operador",
      formula: `${puzzle.a} ${op} ${puzzle.b} = ${apply(puzzle.a, op, puzzle.b) ?? "?"}`,
      detail: ok ? "✓ acertou o operador" : `errou — correto: ${puzzle.op}`,
    });
  };

  const candidates = useMemo(
    () =>
      OPS.map((op) => {
        const r = apply(puzzle.a, op, puzzle.b);
        const matches = isCleanInt(r) && r === puzzle.result;
        return { op, r, matches };
      }),
    [puzzle],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && reveal) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reveal, next]);

  const total = score.acertos + score.erros;
  const taxa = total > 0 ? Math.round((score.acertos / total) * 100) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      {/* Painel principal */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Descubra o operador
          </span>
          <button
            onClick={next}
            className="rounded-md border border-border bg-surface-2 px-3 py-1 font-display text-xs tracking-widest text-foreground hover:border-primary"
          >
            NOVO ENIGMA
          </button>
        </div>

        <div className="my-8 flex items-center justify-center gap-3 sm:gap-5 font-display text-5xl sm:text-6xl">
          <span className="text-foreground">{puzzle.a}</span>
          <span
            className={`flex h-16 w-16 items-center justify-center rounded-lg border-2 transition-all sm:h-20 sm:w-20 ${
              reveal
                ? picked === puzzle.op
                  ? "border-primary bg-primary/20 text-primary"
                  : "border-destructive bg-destructive/20 text-destructive"
                : "border-dashed border-muted-foreground text-muted-foreground"
            }`}
          >
            {reveal ? picked : "?"}
          </span>
          <span className="text-foreground">{puzzle.b}</span>
          <span className="text-muted-foreground">=</span>
          <span className="text-gradient-gold">{puzzle.result}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {OPS.map((op) => {
            const isPicked = picked === op;
            const isAnswer = puzzle.op === op;
            return (
              <button
                key={op}
                onClick={() => choose(op)}
                disabled={reveal}
                className={`h-14 rounded-lg border font-display text-2xl transition-all
                  ${
                    reveal
                      ? isAnswer
                        ? "border-primary bg-primary/20 text-primary"
                        : isPicked
                          ? "border-destructive bg-destructive/20 text-destructive"
                          : "border-border bg-surface-2 text-muted-foreground opacity-50"
                      : "border-border bg-surface-2 text-foreground hover:-translate-y-0.5 hover:border-primary"
                  }`}
              >
                {op}
              </button>
            );
          })}
        </div>

        {reveal && (
          <div className="mt-5 rounded-lg border border-border bg-surface-2 p-4 text-sm">
            <p className="font-display text-lg text-foreground">
              {picked === puzzle.op ? "Acertou! 🎉" : "Quase! Veja a resposta:"}
            </p>
            <p className="mt-1 font-mono text-muted-foreground">
              {puzzle.a} {puzzle.op} {puzzle.b} = {puzzle.result}
            </p>
            <button
              onClick={next}
              className="mt-3 rounded-md bg-primary px-4 py-2 font-display text-sm tracking-widest text-primary-foreground hover:opacity-90"
            >
              PRÓXIMO →
            </button>
          </div>
        )}
      </div>

      {/* Painel matemático */}
      <aside className="rounded-xl border border-border bg-card p-5">
        <h4 className="font-display text-lg text-foreground">Painel matemático</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Em tempo real, o resultado de cada operação possível com a e b:
        </p>

        <ul className="mt-3 space-y-1 font-mono text-sm">
          {candidates.map(({ op, r, matches }) => (
            <li
              key={op}
              className={`flex items-center justify-between rounded px-2 py-1 ${
                reveal && matches ? "bg-primary/15 text-primary" : "text-muted-foreground"
              }`}
            >
              <span>
                {puzzle.a} {op} {puzzle.b}
              </span>
              <span>
                ={" "}
                {r === null
                  ? "—"
                  : Number.isInteger(r)
                    ? r
                    : r.toFixed(2)}
                {reveal && matches ? "  ✓" : ""}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-lg border border-border bg-surface-2 p-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Placar
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-display text-2xl text-primary">{score.acertos}</span>
            <span className="font-mono text-xs text-muted-foreground">acertos</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-display text-2xl text-destructive">{score.erros}</span>
            <span className="font-mono text-xs text-muted-foreground">erros</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between border-t border-border pt-1">
            <span className="font-display text-xl text-gradient-gold">{taxa}%</span>
            <span className="font-mono text-xs text-muted-foreground">taxa</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Dica: <code className="rounded bg-muted px-1 text-primary">a √ b</code> = raiz b-ésima de
          a. Ex.: 8 √ 3 = 2 (pois 2³ = 8).
        </p>
      </aside>
    </div>
  );
}
