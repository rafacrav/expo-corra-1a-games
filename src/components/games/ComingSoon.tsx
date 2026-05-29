export function ComingSoon({ title, formula }: { title: string; formula: string }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
      <span className="font-display text-5xl text-gradient-gold">EM BREVE</span>
      <h3 className="font-display text-2xl text-foreground">{title}</h3>
      <code className="rounded bg-background/60 px-3 py-1 font-mono text-sm text-secondary">
        {formula}
      </code>
      <p className="max-w-md text-sm text-muted-foreground">
        Este jogo está sendo finalizado. O Jogo 1 (Figurinhas da Copa) já está disponível
        com todas as mecânicas, IA e painel matemático.
      </p>
    </div>
  );
}
