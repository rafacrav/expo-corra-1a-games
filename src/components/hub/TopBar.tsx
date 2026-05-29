import { useEffect, useState, type ReactElement } from "react";
import { getVisitorId } from "@/lib/visitor";

/** Tiny inline SVG QR that encodes the visitor UUID deterministically for visual flair.
 *  Not a real QR scanner target — used as a "QR-simulation" placeholder per spec. */
function FauxQR({ value, size = 96 }: { value: string; size?: number }) {
  const cells = 17;
  // hash-driven cell map
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  const isFinder = (x: number, y: number) => {
    const inBox = (cx: number, cy: number) =>
      x >= cx && x < cx + 7 && y >= cy && y < cy + 7 &&
      ((x === cx || x === cx + 6 || y === cy || y === cy + 6) ||
        (x >= cx + 2 && x <= cx + 4 && y >= cy + 2 && y <= cy + 4));
    return inBox(0, 0) || inBox(cells - 7, 0) || inBox(0, cells - 7);
  };
  const isFinderArea = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= cells - 8 && y < 8) || (x < 8 && y >= cells - 8);

  const rects: ReactElement[] = [];
  for (let y = 0; y < cells; y++)
    for (let x = 0; x < cells; x++) {
      const fill = isFinderArea(x, y) ? isFinder(x, y) : rng() > 0.5;
      if (fill) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
    }
  return (
    <svg viewBox={`0 0 ${cells} ${cells}`} width={size} height={size} className="rounded-md bg-foreground p-1">
      <g fill="var(--background)">{rects}</g>
    </svg>
  );
}

export function TopBar() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => setVisitorId(getVisitorId()), []);

  return (
    <header className="relative z-10 border-b border-border bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-glow-green">
            <span className="font-display text-2xl leading-none">EC</span>
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-2xl text-foreground sm:text-3xl">
              EXPO<span className="text-gradient-gold">CORRA</span> GAMES HUB
            </h1>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Matemática &amp; física que você joga
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="font-display text-sm text-primary">Visitante</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {visitorId ? visitorId.slice(0, 13) + "…" : "—"}
            </p>
          </div>
          <button
            onClick={() => {
              setScanning(true);
              setTimeout(() => setScanning(false), 1400);
            }}
            className="group relative"
            aria-label="Simular leitura de QR Code"
          >
            {visitorId && <FauxQR value={visitorId} size={56} />}
            <span
              className={`pointer-events-none absolute inset-0 rounded-md border-2 border-primary transition-opacity ${
                scanning ? "animate-pulse opacity-100" : "opacity-0 group-hover:opacity-60"
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
