import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const schema = z.object({
  id: z.string().uuid().nullable().optional(),
  game: z.string().min(1).max(40),
  correct: z.number().int().min(0).max(999),
  wrong: z.number().int().min(0).max(999),
  rounds: z.number().int().min(0).max(999),
  bestStreak: z.number().int().min(0).max(999),
  aiLevel: z.number().int().min(1).max(5).nullable().optional(),
  durationSeconds: z.number().int().min(0).max(86400).nullable().optional(),
});

/** Cria (ou atualiza) o registro da partida atual do jogador. */
export const saveGameSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data, context }): Promise<{ id: string | null }> => {
    const { supabase, userId } = context;
    const row = {
      user_id: userId,
      game: data.game,
      correct: data.correct,
      wrong: data.wrong,
      rounds: data.rounds,
      best_streak: data.bestStreak,
      ai_level: data.aiLevel ?? null,
      duration_seconds: data.durationSeconds ?? null,
    };

    if (data.id) {
      const { error } = await supabase.from("game_sessions").update(row).eq("id", data.id);
      if (error) {
        console.error("saveGameSession update", error);
        return { id: data.id };
      }
      return { id: data.id };
    }

    const { data: inserted, error } = await supabase
      .from("game_sessions")
      .insert(row)
      .select("id")
      .single();
    if (error) {
      console.error("saveGameSession insert", error);
      return { id: null };
    }
    return { id: inserted.id };
  });
