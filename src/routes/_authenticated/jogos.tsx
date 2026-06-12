import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Album as AlbumIcon, Calculator, LogOut, Move, Scale, ShoppingCart, Sparkles, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

export const Route = createFileRoute("/_authenticated/jogos")({
  head: () => ({
    meta: [
      { title: "Jogos — ExpoCorra" },
      { name: "description", content: "Hub de jogos de matemática e física da ExpoCorra." },
    ],
  }),
  component: HubPage,
});

const GAMES: GameMeta[] = [
  { id: "figurinhas", title: "Figurinhas da Copa", subtitle: "Probabilidade & Coupon Collector", formula: "P = (N − coletadas) / N", status: "ready", icon: <AlbumIcon className="h-5 w-5" /> },
  { id: "parabola", title: "Parábola & MU", subtitle: "Cachorro pega a bola — projétil + movimento uniforme", formula: "y(t) = v₀sinθ·t − ½gt²", status: "ready", icon: <Target className="h-5 w-5" /> },
  { id: "hipotenusa", title: "Hipotenusa", subtitle: "Triângulo retângulo no mundo real", formula: "a² + b² = c²", status: "ready", icon: <Move className="h-5 w-5" /> },
  { id: "primeiro-grau", title: "Função do 1º Grau", subtitle: "Monte a equação no mercadinho", formula: "5x + 4 = 14", status: "ready", icon: <ShoppingCart className="h-5 w-5" /> },
  { id: "velocidade", title: "Velocidade Média", subtitle: "Chuta a bola — mede deslocamento e tempo", formula: "v = Δs / Δt", status: "ready", icon: <Sparkles className="h-5 w-5" /> },
  { id: "operador", title: "Descubra o Operador", subtitle: "1 ? 5 = −4 — qual operação?", formula: "+ − × ÷ ^ √", status: "ready", icon: <Calculator className="h-5 w-5" /> },
  { id: "regra-tres", title: "Regra de Três", subtitle: "Proporção direta e inversa do dia a dia", formula: "a/b = c/x", status: "ready", icon: <Scale className="h-5 w-5" /> },
];

function HubPage() {
  const navigate = useNavigate();
  const [active, setActive] = useState<string>("figurinhas");
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [profile, setProfile] = useState<{ first_name: string; last_name: string } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle();
      if (data) setProfile(data);
    })();
  }, []);

  const pushDiary = useCallback((e: Omit<DiaryEntry, "id" | "at">) => {
    setDiary((prev) =>
      [...prev, { ...e, id: `${Date.now()}-${Math.random()}`, at: Date.now() }].slice(-30),
    );
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const activeGame = GAMES.find((g) => g.id === active)!;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow-green">
              <span className="font-display text-lg font-bold leading-none">EC</span>
            </div>
            <div className="leading-tight">
              <h1 className="font-display text-base font-bold text-foreground sm:text-xl">
                ExpoCorra <span className="text-gradient-blue">Games Hub</span>
              </h1>
              <p className="text-[11px] text-muted-foreground">Matemática &amp; física que você joga</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="font-display text-sm text-primary">
                {profile ? `${profile.first_name} ${profile.last_name}` : "Jogador"}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {userId ? userId.slice(0, 13) + "…" : "—"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-2xl sm:text-3xl text-foreground">
              Escolha o <span className="text-gradient-blue">jogo</span>
            </h2>
            <p className="font-mono text-xs text-muted-foreground">7 jogos • 7 disponíveis</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-7">
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

        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-3xl text-foreground">{activeGame.title}</h2>
            <code className="rounded bg-muted px-2 py-1 font-mono text-xs text-primary">
              {activeGame.formula}
            </code>
          </div>
          {active === "figurinhas" ? <FigurinhasGame pushDiary={pushDiary} />
            : active === "parabola" ? <ParabolaGame pushDiary={pushDiary} />
            : active === "operador" ? <OperadorGame pushDiary={pushDiary} />
            : active === "primeiro-grau" ? <PrimeiroGrauGame pushDiary={pushDiary} />
            : active === "hipotenusa" ? <HipotenusaGame pushDiary={pushDiary} />
            : active === "velocidade" ? <VelocidadeGame pushDiary={pushDiary} />
            : active === "regra-tres" ? <RegraTresGame pushDiary={pushDiary} />
            : <ComingSoon title={activeGame.title} formula={activeGame.formula} />}
        </section>
      </main>

      <MathDiary entries={diary} />
    </div>
  );
}
