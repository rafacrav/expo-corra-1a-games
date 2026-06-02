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
    if (!isCleanInt(r)) continue;
    const result = Math.round(r);
    // Garante solução única: nenhum outro operador pode dar o mesmo resultado
    const others = OPS.filter((o) => o !== op).some((o) => {
      const rr = apply(a, o, b);
      return isCleanInt(rr) && Math.round(rr) === result;
    });
    if (others) continue;
    return { a, b, op, result };
  }
  return { a: 6, b: 2, op: "×", result: 12 };
}

const MAX_ROUNDS = 15;
const BASE_TIME = 20; // segundos na fase 1
const MIN_TIME = 5;   // segundos mínimo na fase final

function maxTimeForRound(round: number) {
  return Math.max(MIN_TIME, BASE_TIME - (round - 1));
}

export function OperadorGame({
  pushDiary,
}: {
  pushDiary: (e: Omit<DiaryEntry, "id" | "at">) => void;
}) {
  const [round, setRound] = useState(1);
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generate());
  const [picked, setPicked] = useState<Op | null>(null);
  const [score, setScore] = useState({ acertos: 0, erros: 0 });
  const [reveal, setReveal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(() => Date.now());
  const [now, setNow] = useState<number>(() => Date.now());
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [won, setWon] = useState(false);

  const maxTime = maxTimeForRound(round);

  const next = useCallback(() => {
    if (round >= MAX_ROUNDS) {
      // Última rodada já foi; não faz nada aqui (won já está true)
      return;
    }
    setRound((r) => r + 1);
    setPuzzle(generate());
    setPicked(null);
    setReveal(false);
    setStartedAt(Date.now());
    setNow(Date.now());
    setLastTime(null);
  }, [round]);

  const restart = useCallback(() => {
    setRound(1);
    setPuzzle(generate());
    setPicked(null);
    setReveal(false);
    setScore({ acertos: 0, erros: 0 });
    setStreak(0);
    setBestStreak(0);
    setStartedAt(Date.now());
    setNow(Date.now());
    setLastTime(null);
    setWon(false);
  }, []);

  // Timer tick while answering
  useEffect(() => {
    if (reveal || won) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [reveal, won, puzzle]);

  // Auto-timeout
  useEffect(() => {
    if (reveal || won) return;
    const elapsed = (now - startedAt) / 1000;
    if (elapsed >= maxTime) {
      // Tempo esgotado = erro
      setLastTime(maxTime);
      setPicked("+" as Op); // placeholder, não importa
      setReveal(true);
      setScore((s) => ({ acertos: s.acertos, erros: s.erros + 1 }));
      setStreak(0);
      pushDiary({
        game: "Operador",
        formula: `${puzzle.a} ? ${puzzle.b} = ${puzzle.result}`,
        detail: `⏱ tempo esgotado (${maxTime}s) — correto: ${puzzle.op}`,
      });
    }
  }, [now, startedAt, maxTime, reveal, won, puzzle, pushDiary]);

  const choose = (op: Op) => {
    if (reveal || won) return;
    const elapsed = (Date.now() - startedAt) / 1000;
    setLastTime(elapsed);
    setPicked(op);
    setReveal(true);
    const ok = op === puzzle.op;
    setScore((s) => ({
      acertos: s.acertos + (ok ? 1 : 0),
      erros: s.erros + (ok ? 0 : 1),
    }));
    setStreak((s) => {
      const ns = ok ? s + 1 : 0;
      setBestStreak((b) => Math.max(b, ns));
      return ns;
    });
    if (ok && round === MAX_ROUNDS) {
      setWon(true);
    }
    pushDiary({
      game: "Operador",
      formula: `${puzzle.a} ${op} ${puzzle.b} = ${apply(puzzle.a, op, puzzle.b) ?? "?"}`,
      detail: ok ? `✓ ${elapsed.toFixed(1)}s` : `errou — correto: ${puzzle.op}`,
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
      if (e.key === "Enter" && reveal && !won) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reveal, won, next]);

  const total = score.acertos + score.erros;
  const taxa = total > 0 ? Math.round((score.acertos / total) * 100) : 0;
  const elapsed = reveal ? (lastTime ?? 0) : (now - startedAt) / 1000;
  const remaining = Math.max(0, maxTime - elapsed);

  if (won) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
        <div className="mb-4 text-6xl">🏆</div>
        <h2 className="font-display text-3xl text-gradient-gold">
          Você venceu!
        </h2>
        <p className="mt-2 text-muted-foreground">
          Completou todas as {MAX_ROUNDS} fases.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <p className="font-display text-2xl text-primary">{score.acertos}</p>
            <p className="font-mono text-[10px] text-muted-foreground">acertos</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <p className="font-display text-2xl text-destructive">{score.erros}</p>
            <p className="font-mono text-[10px] text-muted-foreground">erros</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <p className="font-display text-2xl text-gradient-gold">{taxa}%</p>
            <p className="font-mono text-[10px] text-muted-foreground">taxa</p>
          </div>
        </div>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          🔥 Recorde de streak: {bestStreak}
        </p>
        <button
          onClick={restart}
          className="mt-6 rounded-md bg-primary px-6 py-3 font-display text-sm tracking-widest text-primary-foreground hover:opacity-90"
        >
          JOGAR NOVAMENTE
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      {/* Painel principal */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Descubra o operador
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md border px-2 py-1 font-mono text-xs ${
                remaining <= 5 && !reveal
                  ? "border-destructive/60 text-destructive"
                  : "border-border text-muted-foreground"
              }`}
            >
              ⏱ {remaining.toFixed(1)}s / {maxTime}s
            </span>
            <span className="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-primary">
              🔥 {streak}
            </span>
            <span className="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-muted-foreground">
              {round}/{MAX_ROUNDS}
            </span>
          </div>
        </div>

        {/* Barra de progresso das fases */}
        <div className="mt-3 flex gap-1">
          {Array.from({ length: MAX_ROUNDS }).map((_, i) => {
            const idx = i + 1;
            let cls = "h-1.5 flex-1 rounded-full ";
            if (idx < round) cls += "bg-primary";
            else if (idx === round) cls += "bg-primary/40 animate-pulse";
            else cls += "bg-muted";
            return <div key={idx} className={cls} />;
          })}
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
              {picked === puzzle.op
                ? `Acertou! 🎉 ${lastTime !== null ? `em ${lastTime.toFixed(1)}s` : ""}`
                : "Quase! Veja a resposta:"}
            </p>
            <p className="mt-1 font-mono text-muted-foreground">
              {puzzle.a} {puzzle.op} {puzzle.b} = {puzzle.result}
            </p>
            {round < MAX_ROUNDS ? (
              <button
                onClick={next}
                className="mt-3 rounded-md bg-primary px-4 py-2 font-display text-sm tracking-widest text-primary-foreground hover:opacity-90"
              >
                PRÓXIMO →
              </button>
            ) : (
              <button
                onClick={restart}
                className="mt-3 rounded-md bg-primary px-4 py-2 font-display text-sm tracking-widest text-primary-foreground hover:opacity-90"
              >
                JOGAR NOVAMENTE
              </button>
            )}
          </div>
        )}
      </div>

      {/* Painel matemático */}
      <aside className="rounded-xl border border-border bg-card p-5">
        <h4 className="font-display text-lg text-foreground">Painel matemático</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {reveal
            ? "Resultados de cada operação possível com a e b:"
            : "Os resultados aparecem aqui após você responder."}
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
                {!reveal
                  ? "···"
                  : r === null
                    ? "—"
                    : Number.isInteger(r)
                      ? r
                      : r.toFixed(2)}
                {reveal && matches ? "  ✓" : ""}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Streak
            </p>
            <p className="font-display text-2xl text-primary">🔥 {streak}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              recorde: {bestStreak}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Tempo restante
            </p>
            <p className={`font-display text-2xl ${remaining <= 5 && !reveal ? "text-destructive" : "text-foreground"}`}>
              {remaining.toFixed(1)}s
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {reveal ? "última rodada" : `max ${maxTime}s`}
            </p>
          </div>
        </div>

        <div className="mt-2 rounded-lg border border-border bg-surface-2 p-3">
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
