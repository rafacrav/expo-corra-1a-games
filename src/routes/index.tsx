import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Album as AlbumIcon, Calculator, Move, Scale, ShoppingCart, Sparkles, Target } from "lucide-react";
import { TopBar } from "@/components/hub/TopBar";
import { GameCard, type GameMeta } from "@/components/hub/GameCard";
import { MathDiary, type DiaryEntry } from "@/components/hub/MathDiary";
import { FigurinhasGame } from "@/components/games/figurinhas/FigurinhasGame";
import { ParabolaGame } from "@/components/games/parabola/ParabolaGame";
import { OperadorGame } from "@/components/games/operador/OperadorGame";
import { PrimeiroGrauGame } from "@/components/games/primeiro-grau/PrimeiroGrauGame";
import { HipotenusaGame } from "@/components/games/hipotenusa/HipotenusaGame";
import { VelocidadeGame } from "@/components/games/velocidade/VelocidadeGame";
import { RegraTresGame } from "@/components/games/regra-tres/RegraTresGame";
import { ComingSoon } from "@/components/games/ComingSoon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExpoCorra Games Hub — Matemática que se joga" },
      {
        name: "description",
        content:
          "Centro interativo de jogos de matemática e física para a feira de ciências. Figurinhas da Copa, parábolas, Pitágoras e mais.",
      },
      { property: "og:title", content: "ExpoCorra Games Hub" },
      {
        property: "og:description",
        content: "6 jogos que escondem matemática real do dia a dia.",
      },
    ],
  }),
  component: HubPage,
});

const GAMES: GameMeta[] = [
  {
    id: "figurinhas",
    title: "Figurinhas da Copa",
    subtitle: "Probabilidade & Coupon Collector",
    formula: "P = (N − coletadas) / N",
    status: "ready",
    icon: <AlbumIcon className="h-5 w-5" />,
  },
  {
    id: "parabola",
    title: "Parábola & MU",
    subtitle: "Cachorro pega a bola — projétil + movimento uniforme",
    formula: "y(t) = v₀sinθ·t − ½gt²",
    status: "ready",
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: "hipotenusa",
    title: "Hipotenusa",
    subtitle: "Triângulo retângulo no mundo real",
    formula: "a² + b² = c²",
    status: "ready",
    icon: <Move className="h-5 w-5" />,
  },
  {
    id: "primeiro-grau",
    title: "Função do 1º Grau",
    subtitle: "Monte a equação no mercadinho",
    formula: "5x + 4 = 14",
    status: "ready",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    id: "velocidade",
    title: "Velocidade Média",
    subtitle: "Chuta a bola — mede deslocamento e tempo",
    formula: "v = Δs / Δt",
    status: "ready",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    id: "operador",
    title: "Descubra o Operador",
    subtitle: "1 ? 5 = −4 — qual operação?",
    formula: "+ − × ÷ ^ √",
    status: "ready",
    icon: <Calculator className="h-5 w-5" />,
  },
];

function HubPage() {
  const [active, setActive] = useState<string>("figurinhas");
  const [diary, setDiary] = useState<DiaryEntry[]>([]);

  const pushDiary = useCallback((e: Omit<DiaryEntry, "id" | "at">) => {
    setDiary((prev) =>
      [...prev, { ...e, id: `${Date.now()}-${Math.random()}`, at: Date.now() }].slice(-30),
    );
  }, []);

  const activeGame = GAMES.find((g) => g.id === active)!;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <TopBar />

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6">
        {/* Game grid */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">
              Escolha o <span className="text-gradient-blue">jogo</span>
            </h2>
            <p className="font-mono text-xs text-muted-foreground">6 jogos • 5 disponíveis</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {GAMES.map((g) => (
              <GameCard
                key={g.id}
                game={g}
                active={active === g.id && g.status === "ready"}
                onClick={() => g.status === "ready" && setActive(g.id)}
              />
            ))}
          </div>
        </section>

        {/* Active panel */}
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-3xl text-foreground">{activeGame.title}</h2>
            <code className="rounded bg-muted px-2 py-1 font-mono text-xs text-primary">
              {activeGame.formula}
            </code>
          </div>
          {active === "figurinhas" ? (
            <FigurinhasGame pushDiary={pushDiary} />
          ) : active === "parabola" ? (
            <ParabolaGame pushDiary={pushDiary} />
          ) : active === "operador" ? (
            <OperadorGame pushDiary={pushDiary} />
          ) : active === "primeiro-grau" ? (
            <PrimeiroGrauGame pushDiary={pushDiary} />
          ) : active === "hipotenusa" ? (
            <HipotenusaGame pushDiary={pushDiary} />
          ) : active === "velocidade" ? (
            <VelocidadeGame pushDiary={pushDiary} />
          ) : (
            <ComingSoon title={activeGame.title} formula={activeGame.formula} />
          )}
        </section>
      </main>

      <MathDiary entries={diary} />
    </div>
  );
}
