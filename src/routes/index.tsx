import { createFileRoute, Link } from "@tanstack/react-router";
import { Album, Calculator, GraduationCap, Move, QrCode, Scale, ShoppingCart, Sparkles, Target } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ExpoCorra — Matemática e Física que se Joga" },
      {
        name: "description",
        content:
          "Centro interativo de 7 jogos que escondem matemática e física do dia a dia. Cadastre-se, ganhe seu QR code e jogue na feira de ciências.",
      },
      { property: "og:title", content: "ExpoCorra — Matemática que se joga" },
      { property: "og:description", content: "7 jogos. Probabilidade, Pitágoras, MRU, parábola e mais — para a feira de ciências." },
    ],
  }),
  component: LandingPage,
});

const FEATURES = [
  { icon: <Album className="h-5 w-5" />, title: "Figurinhas da Copa", desc: "Probabilidade & coupon collector" },
  { icon: <Target className="h-5 w-5" />, title: "Parábola & MU", desc: "Cachorro pega a bola — projétil" },
  { icon: <Move className="h-5 w-5" />, title: "Hipotenusa", desc: "Pitágoras no mundo real" },
  { icon: <ShoppingCart className="h-5 w-5" />, title: "1º Grau", desc: "Monte a equação no mercadinho" },
  { icon: <Sparkles className="h-5 w-5" />, title: "Velocidade Média", desc: "v = Δs / Δt" },
  { icon: <Calculator className="h-5 w-5" />, title: "Operador Misterioso", desc: "Descubra a operação" },
  { icon: <Scale className="h-5 w-5" />, title: "Regra de Três", desc: "Proporção direta e inversa" },
];

function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow-green">
              <span className="font-display text-lg font-bold leading-none">EC</span>
            </div>
            <div className="leading-tight">
              <h1 className="font-display text-base font-bold text-foreground sm:text-xl">
                ExpoCorra <span className="text-gradient-blue">Games Hub</span>
              </h1>
              <p className="text-[11px] text-muted-foreground">Matemática &amp; física que você joga</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/auth"
              className="rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent sm:text-sm"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-glow-green hover:bg-primary/90 sm:text-sm"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[11px] text-primary">
                <Sparkles className="h-3 w-3" /> Feira de Ciências 1ºA
              </span>
              <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground sm:text-6xl">
                A matemática que <br />
                <span className="text-gradient-blue">você joga</span> de verdade.
              </h1>
              <p className="mt-5 text-base text-muted-foreground sm:text-lg">
                7 jogos curtos que escondem matemática e física do dia a dia — probabilidade,
                Pitágoras, parábolas, regra de três, MRU. Você joga, o sistema mostra a fórmula
                por trás. Sem decoreba.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/cadastro"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-display text-base font-semibold text-primary-foreground shadow-glow-green transition hover:scale-[1.02] hover:bg-primary/90"
                >
                  Fazer cadastro <QrCode className="h-4 w-4" />
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 font-display text-base font-semibold text-foreground hover:bg-accent"
                >
                  Já tenho conta
                </Link>
              </div>
              <p className="mt-3 font-mono text-[11px] text-muted-foreground">
                Cadastro = QR code único + acesso aos jogos
              </p>
            </div>

            {/* Right card */}
            <div className="relative">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-lg text-foreground">Como funciona</h3>
                </div>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">1</span>
                    <span><strong className="text-foreground">Cadastre-se</strong> com nome, escolaridade e e-mail.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">2</span>
                    <span><strong className="text-foreground">Receba seu QR code</strong> único — baixe ou tire print.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">3</span>
                    <span><strong className="text-foreground">Jogue os 7 mini-games</strong> e veja a matemática aparecer.</span>
                  </li>
                </ol>
              </div>
              <div className="pointer-events-none absolute -right-4 -top-4 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">
              7 jogos. <span className="text-gradient-blue">7 conceitos.</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Cada jogo mostra a fórmula real por trás da brincadeira.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    {f.icon}
                  </div>
                  <h3 className="mt-3 font-display text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            Pronto pra <span className="text-gradient-blue">jogar</span>?
          </h2>
          <p className="mt-3 text-muted-foreground">Cadastro leva 30 segundos. Você sai com seu QR code na mão.</p>
          <Link
            to="/cadastro"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-display text-base font-semibold text-primary-foreground shadow-glow-green hover:bg-primary/90"
          >
            Quero meu QR code <QrCode className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center">
        <p className="font-mono text-[11px] text-muted-foreground">
          ExpoCorra • Feira de Ciências • 2026
        </p>
      </footer>
    </div>
  );
}
