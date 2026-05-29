import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string().min(1).max(80),
  position: z.string().min(1).max(20),
  number: z.number().int().min(1).max(99),
});

/**
 * Generates a short, kid-friendly Portuguese description of a Brazilian football player
 * via the Lovable AI Gateway. Always returns 2-3 sentences max.
 */
export const describePlayer = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return {
        description:
          `${data.name} (${data.position}, camisa ${data.number}) — jogador brasileiro de destaque.`,
        error: "AI indisponível no momento.",
      };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "Você escreve descrições curtas (2-3 frases, máx 60 palavras) de jogadores de futebol brasileiros para uma feira de ciências escolar. Tom: animado, acessível, em português do Brasil. Inclua 1 curiosidade marcante. Nunca invente estatísticas precisas.",
            },
            {
              role: "user",
              content: `Descreva o jogador: ${data.name}, posição ${data.position}, camisa ${data.number}.`,
            },
          ],
          max_completion_tokens: 200,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("AI gateway error:", res.status, txt);
        const msg =
          res.status === 429
            ? "Muitas consultas — tente em instantes."
            : res.status === 402
              ? "Créditos de IA esgotados."
              : "Erro ao gerar descrição.";
        return {
          description: `${data.name} — ${data.position}, camisa ${data.number}.`,
          error: msg,
        };
      }

      const json = await res.json();
      const description =
        json?.choices?.[0]?.message?.content?.trim() ??
        `${data.name} — ${data.position}, camisa ${data.number}.`;
      return { description, error: null as string | null };
    } catch (e) {
      console.error("describePlayer failed:", e);
      return {
        description: `${data.name} — ${data.position}, camisa ${data.number}.`,
        error: "Falha de rede.",
      };
    }
  });
