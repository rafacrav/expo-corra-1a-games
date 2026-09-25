import { useCallback, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Album, Calculator, ChevronLeft, LockKeyhole, Target } from "lucide-react";
import { FigurinhasGame } from "@/components/games/figurinhas/FigurinhasGame";
import { OperadorGame } from "@/components/games/operador/OperadorGame";
import { ParabolaGame } from "@/components/games/parabola/ParabolaGame";
import { GameCard, type GameMeta } from "@/components/hub/GameCard";
import { MathDiary, type DiaryEntry } from "@/components/hub/MathDiary";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo grátis — ExpoCorra Games Hub" },
      {
        name: "description",
        content: "Jogue grátis três experiências de matemática e física da ExpoCorra, sem cadastro.",
      },
      { property: "og:title", content: "Demo grátis — ExpoCorra Games Hub" },
      {
        property: "og:description",
        content: "Experimente Figurinhas da Copa, Parábola & MU e Descubra o Operador sem fazer login.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DemoPage,
});

const DEMO_GAMES: GameMeta[] = [
  {
    id: "figurinhas",
    title: "Figurinhas da Copa",
    subtitle: "Abra pacotes e veja a probabilidade em tempo real",
    formula: "P = (N − coletadas) / N",
    status: "ready",
    icon: <Album className="h-5 w-5" />,
  },
  {
    id: "parabola",
    title: "Parábola & MU",
    subtitle: "Ajuste o chute para o cachorro pegar a bola",
    formula: "y(t) = v₀senθ·t − ½gt²",
    status: "ready",
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: "operador",
    title: "Descubra o Operador",
    subtitle: "Encontre a operação antes que o tempo acabe",
    formula: "+ − × ÷ ^ √",
    status: "ready",
    icon: <Calculator className="h-5 w-5" />,
  },
];

function DemoPage() {
  const [active, setActive] = useState<string | null>(null);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const pushDiary = useCallback((entry: Omit<DiaryEntry, "id" | "at">) => {
    setDiary((current) => [
      ...current,
      { ...entry, id: `${Date.now()}-${Math.random()}`, at: Date.now() },
    ].slice(-30));
  }, []);
  const selected = DEMO_GAMES.find((game) => game.id === active);

  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground shadow-glow-green">EC</span>
            <span className="min-w-0 leading-tight">
              <strong className="block truncate font-display text-base text-foreground sm:text-xl">ExpoCorra <span className="text-gradient-blue">Demo</span></strong>
              <span className="block text-[11px] text-muted-foreground">3 jogos · sem login</span>
            </span>
          </Link>
          <Link
            to="/cadastro"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 sm:text-sm"
          >
            <LockKeyhole className="h-3.5 w-3.5" />
            Liberar os 7
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        {!selected ? (
          <section>
            <div className="mb-5 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Demo gratuita</p>
              <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">Escolha um jogo</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Experimente três jogos agora. Seu progresso nesta demonstração fica somente neste aparelho.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {DEMO_GAMES.map((game, index) => (
                <GameCard
                  key={game.id}
                  game={game}
                  position={index + 1}
                  active={false}
                  onClick={() => setActive(game.id)}
                />
              ))}
            </div>
            <div className="mt-7 border-t border-border pt-5 text-center">
              <p className="text-sm text-muted-foreground">Quer jogar todos e salvar seu desempenho?</p>
              <Link to="/cadastro" className="mt-3 inline-flex rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
                Criar conta grátis
              </Link>
            </div>
          </section>
        ) : (
          <section>
            <button
              type="button"
              onClick={() => setActive(null)}
              className="mb-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" /> Voltar aos jogos
            </button>
            <div className="mb-4 border-b border-border pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Jogando a demo</p>
              <h1 className="mt-1 font-display text-2xl text-foreground sm:text-3xl">{selected.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{selected.subtitle}</p>
            </div>
            <div className="min-w-0 overflow-x-hidden">
              {active === "figurinhas" ? (
                <FigurinhasGame pushDiary={pushDiary} />
              ) : active === "parabola" ? (
                <ParabolaGame pushDiary={pushDiary} />
              ) : (
                <OperadorGame pushDiary={pushDiary} demo />
              )}
            </div>
          </section>
        )}
      </main>

      <MathDiary entries={diary} />
    </div>
  );
}