import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  educationLevel: string;
  hasDisability: boolean;
  disabilityDescription: string | null;
  createdAt: string;
  sessions: number;
  correct: number;
  wrong: number;
};

export type AdminGameStat = {
  game: string;
  sessions: number;
  correct: number;
  wrong: number;
  players: number;
  avgLevel: number | null;
};

export type AdminOverview = {
  isAdmin: boolean;
  totals: {
    players: number;
    sessions: number;
    correct: number;
    wrong: number;
    accuracy: number;
    withDisability: number;
    todaySignups: number;
  };
  byEducation: { label: string; count: number }[];
  byGame: AdminGameStat[];
  signupsByDay: { day: string; count: number }[];
  players: AdminPlayer[];
};

const EMPTY: AdminOverview = {
  isAdmin: false,
  totals: {
    players: 0,
    sessions: 0,
    correct: 0,
    wrong: 0,
    accuracy: 0,
    withDisability: 0,
    todaySignups: 0,
  },
  byEducation: [],
  byGame: [],
  signupsByDay: [],
  players: [],
};

/** Verifica se o usuário logado é administrador. */
export const checkIsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isAdmin: boolean }> => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: data === true };
  });

/** Dados agregados do painel administrativo. */
export const getAdminOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOverview> => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (isAdmin !== true) return EMPTY;

    const [{ data: profiles }, { data: sessions }] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, education_level, has_disability, disability_description, created_at",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("game_sessions")
        .select("user_id, game, correct, wrong, ai_level")
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);

    const rows = profiles ?? [];
    const plays = sessions ?? [];

    const perUser = new Map<string, { sessions: number; correct: number; wrong: number }>();
    const perGame = new Map<
      string,
      { sessions: number; correct: number; wrong: number; players: Set<string>; levels: number[] }
    >();

    for (const s of plays) {
      const u = perUser.get(s.user_id) ?? { sessions: 0, correct: 0, wrong: 0 };
      u.sessions += 1;
      u.correct += s.correct;
      u.wrong += s.wrong;
      perUser.set(s.user_id, u);

      const g =
        perGame.get(s.game) ??
        { sessions: 0, correct: 0, wrong: 0, players: new Set<string>(), levels: [] };
      g.sessions += 1;
      g.correct += s.correct;
      g.wrong += s.wrong;
      g.players.add(s.user_id);
      if (typeof s.ai_level === "number") g.levels.push(s.ai_level);
      perGame.set(s.game, g);
    }

    const education = new Map<string, number>();
    const days = new Map<string, number>();
    const today = new Date().toISOString().slice(0, 10);
    let withDisability = 0;
    let todaySignups = 0;

    const players: AdminPlayer[] = rows.map((p) => {
      const label = p.education_level?.trim() || "Não informado";
      education.set(label, (education.get(label) ?? 0) + 1);
      const day = p.created_at.slice(0, 10);
      days.set(day, (days.get(day) ?? 0) + 1);
      if (p.has_disability) withDisability += 1;
      if (day === today) todaySignups += 1;
      const stat = perUser.get(p.id);
      return {
        id: p.id,
        firstName: p.first_name,
        lastName: p.last_name,
        educationLevel: label,
        hasDisability: p.has_disability,
        disabilityDescription: p.disability_description,
        createdAt: p.created_at,
        sessions: stat?.sessions ?? 0,
        correct: stat?.correct ?? 0,
        wrong: stat?.wrong ?? 0,
      };
    });

    const correct = plays.reduce((a, s) => a + s.correct, 0);
    const wrong = plays.reduce((a, s) => a + s.wrong, 0);

    return {
      isAdmin: true,
      totals: {
        players: rows.length,
        sessions: plays.length,
        correct,
        wrong,
        accuracy: correct + wrong > 0 ? correct / (correct + wrong) : 0,
        withDisability,
        todaySignups,
      },
      byEducation: [...education.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count),
      byGame: [...perGame.entries()]
        .map(([game, g]) => ({
          game,
          sessions: g.sessions,
          correct: g.correct,
          wrong: g.wrong,
          players: g.players.size,
          avgLevel: g.levels.length
            ? g.levels.reduce((a, b) => a + b, 0) / g.levels.length
            : null,
        }))
        .sort((a, b) => b.sessions - a.sessions),
      signupsByDay: [...days.entries()]
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => (a.day < b.day ? -1 : 1))
        .slice(-14),
      players,
    };
  });
