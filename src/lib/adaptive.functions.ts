import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const roundSchema = z.object({
  round: z.number().int(),
  correct: z.boolean(),
  timedOut: z.boolean(),
  seconds: z.number(),
  maxSeconds: z.number(),
});

const inputSchema = z.object({
  game: z.string().min(1).max(40),
  currentLevel: z.number().int().min(1).max(5),
  history: z.array(roundSchema).max(20),
});

type Out = {
  level: number;
  timeMultiplier: number;
  hint: string | null;
  reason: string | null;
};

function fallback(input: z.infer<typeof inputSchema>): Out {
  const recent = input.history.slice(-4);
  const hits = recent.filter((r) => r.correct).length;
  let level = input.currentLevel;
  if (recent.length >= 3) {
    if (hits === recent.length) level += 1;
    else if (hits <= 1) level -= 1;
  }
  level = Math.min(5, Math.max(1, level));
  return {
    level,
    timeMultiplier: level <= 2 ? 1.3 : level >= 4 ? 0.9 : 1,
    hint: null,
    reason: null,
  };
}

/**
 * Analisa o perfil do jogador (escolaridade, acessibilidade) + desempenho recente
 * e devolve o nível de dificuldade, o multiplicador de tempo e uma dica em PT-BR.
 */
export const adaptDifficulty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data, context }): Promise<Out> => {
    const { supabase, userId } = context;
    let profileLine = "Perfil não informado.";
    try {
      const { data: p } = await supabase
        .from("profiles")
        .select("education_level, has_disability, disability_description")
        .eq("id", userId)
        .maybeSingle();
      if (p) {
        profileLine = `Escolaridade: ${p.education_level || "não informada"}. Possui deficiência: ${
          p.has_disability ? `sim (${p.disability_description || "não detalhada"})` : "não"
        }.`;
      }
    } catch {
      /* segue com o padrão */
    }

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return fallback(data);

    const perf = data.history
      .slice(-10)
      .map(
        (r) =>
          `rodada ${r.round}: ${r.timedOut ? "tempo esgotado" : r.correct ? "acertou" : "errou"} em ${r.seconds.toFixed(1)}s de ${r.maxSeconds}s`,
      )
      .join("; ");

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.7-flash",
          messages: [
            {
              role: "system",
              content:
                "Você calibra a dificuldade de jogos educativos de matemática e física para uma feira de ciências escolar. Responda SEMPRE apenas com JSON válido no formato {\"level\":1-5,\"timeMultiplier\":0.6-2.0,\"hint\":\"...\",\"reason\":\"...\"}. level 1 = bem fácil, 5 = desafio. timeMultiplier ajusta o tempo por rodada (maior = mais tempo). hint: uma frase curta em português do Brasil ajudando o jogador na próxima rodada. reason: uma frase curta explicando o ajuste. Seja acolhedor; dê mais tempo e nível menor para jogadores com deficiência ou escolaridade mais baixa que estejam errando.",
            },
            {
              role: "user",
              content: `Jogo: ${data.game}. ${profileLine} Nível atual: ${data.currentLevel}. Desempenho recente: ${perf || "ainda sem rodadas"}.`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) {
        console.error("adaptDifficulty gateway error", res.status, await res.text());
        return fallback(data);
      }

      const json = await res.json();
      const raw = json?.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw.replace(/^```json|```$/g, "").trim());
      return {
        level: Math.min(5, Math.max(1, Math.round(Number(parsed.level) || data.currentLevel))),
        timeMultiplier: Math.min(2.5, Math.max(0.6, Number(parsed.timeMultiplier) || 1)),
        hint: typeof parsed.hint === "string" ? parsed.hint.slice(0, 180) : null,
        reason: typeof parsed.reason === "string" ? parsed.reason.slice(0, 180) : null,
      };
    } catch (e) {
      console.error("adaptDifficulty failed", e);
      return fallback(data);
    }
  });
