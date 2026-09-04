import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Download, Loader2, Search, ShieldAlert, Users } from "lucide-react";
import { getAdminOverview, type AdminOverview } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel do organizador — ExpoCorra" },
      {
        name: "description",
        content: "Acompanhe os participantes e o desempenho nos jogos da ExpoCorra.",
      },
    ],
  }),
  component: AdminPage,
});

const GAME_NAMES: Record<string, string> = {
  operador: "Descubra o Operador",
  "primeiro-grau": "Função do 1º Grau",
  hipotenusa: "Hipotenusa",
  velocidade: "Velocidade Média",
  "regra-tres": "Regra de Três",
};

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function AdminPage() {
  const load = useServerFn(getAdminOverview);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const out = await load({});
        if (alive) setData(out);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  const players = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    if (!term) return data.players;
    return data.players.filter((p) =>
      `${p.firstName} ${p.lastName} ${p.educationLevel}`.toLowerCase().includes(term),
    );
  }, [data, q]);

  const exportCsv = () => {
    if (!data) return;
    const head = [
      "nome",
      "sobrenome",
      "escolaridade",
      "deficiencia",
      "descricao",
      "partidas",
      "acertos",
      "erros",
      "cadastro",
    ];
    const lines = data.players.map((p) =>
      [
        p.firstName,
        p.lastName,
        p.educationLevel,
        p.hasDisability ? "sim" : "não",
        p.disabilityDescription ?? "",
        p.sessions,
        p.correct,
        p.wrong,
        new Date(p.createdAt).toLocaleString("pt-BR"),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expocorra-participantes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
          <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-3 font-display text-xl font-bold text-foreground">Acesso restrito</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta área é só para organizadores da ExpoCorra.
          </p>
          <Link
            to="/jogos"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar aos jogos
          </Link>
        </div>
      </div>
    );
  }

  const t = data.totals;
  const maxDay = Math.max(1, ...data.signupsByDay.map((d) => d.count));

  return (
    <div className="min-h-dvh bg-background px-4 py-6 sm:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/jogos"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Jogos
            </Link>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Painel do organizador
            </h1>
          </div>
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Participantes" value={String(t.players)} hint={`${t.todaySignups} hoje`} />
          <Stat label="Partidas" value={String(t.sessions)} />
          <Stat
            label="Aproveitamento"
            value={pct(t.accuracy)}
            hint={`${t.correct} acertos · ${t.wrong} erros`}
          />
          <Stat label="Com deficiência" value={String(t.withDisability)} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-display text-base font-semibold text-foreground">
              Cadastros por dia
            </h2>
            {data.signupsByDay.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Nenhum cadastro ainda.</p>
            ) : (
              <div className="mt-4 flex h-32 items-end gap-1.5">
                {data.signupsByDay.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary/80"
                      style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: 4 }}
                      title={`${d.day}: ${d.count}`}
                    />
                    <span className="text-[9px] text-muted-foreground">{d.day.slice(8)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-display text-base font-semibold text-foreground">Escolaridade</h2>
            <ul className="mt-3 space-y-2">
              {data.byEducation.length === 0 && (
                <li className="text-sm text-muted-foreground">Sem dados.</li>
              )}
              {data.byEducation.map((e) => (
                <li key={e.label} className="flex items-center gap-2 text-sm">
                  <span className="w-40 shrink-0 truncate text-foreground">{e.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(e.count / Math.max(1, t.players)) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">{e.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-display text-base font-semibold text-foreground">
            Desempenho por jogo
          </h2>
          {data.byGame.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma partida registrada ainda.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2">Jogo</th>
                    <th className="pb-2">Partidas</th>
                    <th className="pb-2">Jogadores</th>
                    <th className="pb-2">Acertos</th>
                    <th className="pb-2">Aproveit.</th>
                    <th className="pb-2">Nível IA</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byGame.map((g) => (
                    <tr key={g.game} className="border-t border-border">
                      <td className="py-2 font-medium text-foreground">
                        {GAME_NAMES[g.game] ?? g.game}
                      </td>
                      <td className="py-2 text-muted-foreground">{g.sessions}</td>
                      <td className="py-2 text-muted-foreground">{g.players}</td>
                      <td className="py-2 text-muted-foreground">
                        {g.correct}/{g.correct + g.wrong}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {pct(g.correct + g.wrong ? g.correct / (g.correct + g.wrong) : 0)}
                      </td>
                      <td className="py-2 text-muted-foreground">
                        {g.avgLevel ? g.avgLevel.toFixed(1) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <Users className="h-4 w-4 text-primary" /> Participantes
            </h2>
            <label className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nome"
                className="input !pl-8 !py-2 w-56"
              />
            </label>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2">Nome</th>
                  <th className="pb-2">Escolaridade</th>
                  <th className="pb-2">Acessibilidade</th>
                  <th className="pb-2">Partidas</th>
                  <th className="pb-2">Acertos</th>
                  <th className="pb-2">Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {players.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-muted-foreground">
                      Nenhum participante encontrado.
                    </td>
                  </tr>
                )}
                {players.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="py-2 font-medium text-foreground">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="py-2 text-muted-foreground">{p.educationLevel}</td>
                    <td className="py-2 text-muted-foreground">
                      {p.hasDisability ? (p.disabilityDescription || "Sim") : "—"}
                    </td>
                    <td className="py-2 text-muted-foreground">{p.sessions}</td>
                    <td className="py-2 text-muted-foreground">
                      {p.correct}/{p.correct + p.wrong}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
