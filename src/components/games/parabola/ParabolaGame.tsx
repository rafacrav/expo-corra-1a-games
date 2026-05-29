import { useEffect, useMemo, useRef, useState } from "react";
import type { DiaryEntry } from "@/components/hub/MathDiary";

const G = 9.81;

type Phase = "idle" | "playing" | "done";

export function ParabolaGame({
  pushDiary,
}: {
  pushDiary: (e: Omit<DiaryEntry, "id" | "at">) => void;
}) {
  const [angle, setAngle] = useState(45); // degrees
  const [v0, setV0] = useState(18); // m/s
  const [vDog, setVDog] = useState(0); // m/s (0 = auto match)
  const [phase, setPhase] = useState<Phase>("idle");
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const theta = (angle * Math.PI) / 180;
  const vx = v0 * Math.cos(theta);
  const vy = v0 * Math.sin(theta);
  const tFlight = (2 * vy) / G; // seconds
  const range = (v0 * v0 * Math.sin(2 * theta)) / G; // meters
  const hMax = (vy * vy) / (2 * G);

  const dogSpeed = vDog === 0 ? vx : vDog; // auto = vx (perfect catch)
  const dogX = dogSpeed * Math.min(t, tFlight);
  const ballX = vx * Math.min(t, tFlight);
  const ballY = Math.max(0, vy * t - 0.5 * G * t * t);

  // scaling — fit into svg view
  const fieldWidthM = Math.max(range, dogSpeed * tFlight, 30) + 4;
  const fieldHeightM = Math.max(hMax + 2, 12);
  const VIEW_W = 600;
  const VIEW_H = 280;
  const sx = VIEW_W / fieldWidthM;
  const sy = (VIEW_H - 40) / fieldHeightM;
  const groundY = VIEW_H - 20;
  const toPx = (xm: number, ym: number) => ({
    x: 20 + xm * sx,
    y: groundY - ym * sy,
  });

  const trajectoryPath = useMemo(() => {
    const steps = 80;
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const tt = (i / steps) * tFlight;
      const x = vx * tt;
      const y = vy * tt - 0.5 * G * tt * tt;
      const p = toPx(x, y);
      d += `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `;
    }
    return d;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [angle, v0, fieldWidthM, fieldHeightM]);

  useEffect(() => {
    if (phase !== "playing") return;
    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      const simT = elapsed * 1.2; // slight slow-mo for feel
      if (simT >= tFlight) {
        setT(tFlight);
        setPhase("done");
        const landX = vx * tFlight;
        const catchX = dogSpeed * tFlight;
        const err = Math.abs(landX - catchX);
        pushDiary({
          game: "Parábola & MU",
          formula: `R = v₀²·sen(2θ)/g = ${range.toFixed(2)} m`,
          detail: `θ=${angle}° v₀=${v0} m/s · cachorro ${dogSpeed.toFixed(1)} m/s · erro ${err.toFixed(2)} m ${err < 0.5 ? "✅ PEGOU" : "❌"}`,
        });
        return;
      }
      setT(simT);
      rafRef.current = requestAnimationFrame(tick);
    };
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const play = () => {
    setT(0);
    setPhase("playing");
  };
  const reset = () => {
    setT(0);
    setPhase("idle");
  };

  const ball = toPx(ballX, ballY);
  const dog = toPx(dogX, 0);
  const landing = toPx(range, 0);
  const catchErr = Math.abs(range - dogSpeed * tFlight);
  const caught = phase === "done" && catchErr < 0.5;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        {/* Field */}
        <div className="overflow-hidden rounded-lg border border-border bg-gradient-to-b from-sky-100 to-emerald-50">
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-auto w-full">
            {/* sky stripes */}
            <defs>
              <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>
              <linearGradient id="grass" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#86efac" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
            </defs>
            <rect width={VIEW_W} height={groundY} fill="url(#sky)" />
            <rect y={groundY} width={VIEW_W} height={VIEW_H - groundY} fill="url(#grass)" />

            {/* meter ticks */}
            {Array.from({ length: Math.floor(fieldWidthM / 5) + 1 }).map((_, i) => {
              const xm = i * 5;
              const p = toPx(xm, 0);
              return (
                <g key={i}>
                  <line x1={p.x} y1={groundY} x2={p.x} y2={groundY + 4} stroke="#065f46" strokeWidth="1" />
                  <text x={p.x} y={groundY + 14} fontSize="9" fill="#065f46" textAnchor="middle" fontFamily="monospace">
                    {xm}m
                  </text>
                </g>
              );
            })}

            {/* trajectory */}
            <path
              d={trajectoryPath}
              fill="none"
              stroke="oklch(0.58 0.18 255)"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity="0.55"
            />

            {/* landing marker */}
            <circle cx={landing.x} cy={landing.y} r="4" fill="oklch(0.58 0.18 255)" opacity="0.5" />

            {/* kicker (origin) */}
            <g transform={`translate(20, ${groundY})`}>
              <circle cx="0" cy="-12" r="5" fill="#1e293b" />
              <rect x="-2" y="-7" width="4" height="10" fill="#1e293b" />
            </g>

            {/* dog */}
            <g transform={`translate(${dog.x - 18}, ${groundY - 22})`}>
              <text fontSize="28">🐕</text>
            </g>

            {/* ball */}
            <g transform={`translate(${ball.x}, ${ball.y})`}>
              <circle r="7" fill="white" stroke="#0f172a" strokeWidth="1.5" />
              <path d="M 0 -7 L 3 -3 L 0 0 L -3 -3 Z" fill="#0f172a" />
            </g>

            {/* catch flash */}
            {caught && (
              <g transform={`translate(${ball.x}, ${ball.y - 20})`}>
                <text fontSize="14" textAnchor="middle" fill="#16a34a" fontWeight="bold">
                  PEGOU! 🎉
                </text>
              </g>
            )}
            {phase === "done" && !caught && (
              <g transform={`translate(${ball.x}, ${ball.y - 20})`}>
                <text fontSize="12" textAnchor="middle" fill="#dc2626" fontWeight="bold">
                  errou por {catchErr.toFixed(2)} m
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Controls */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Slider label="Ângulo θ" value={angle} min={10} max={85} step={1} unit="°" onChange={setAngle} disabled={phase === "playing"} />
          <Slider label="Velocidade v₀" value={v0} min={5} max={30} step={0.5} unit=" m/s" onChange={setV0} disabled={phase === "playing"} />
          <Slider
            label={vDog === 0 ? "Cachorro (AUTO)" : "Cachorro"}
            value={vDog}
            min={0}
            max={30}
            step={0.5}
            unit=" m/s"
            onChange={setVDog}
            disabled={phase === "playing"}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={play}
            disabled={phase === "playing"}
            className="flex-1 rounded-md bg-gradient-green px-4 py-2 font-display text-lg tracking-widest text-primary-foreground shadow-glow-green disabled:opacity-50"
          >
            {phase === "done" ? "JOGAR DE NOVO" : "CHUTAR ⚽"}
          </button>
          <button
            onClick={reset}
            className="rounded-md border border-border bg-muted px-4 py-2 font-display text-sm tracking-widest text-muted-foreground hover:border-primary"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Math panel */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h3 className="font-display text-2xl">
          Painel <span className="text-gradient-gold">Matemático</span>
        </h3>

        <Block
          label="Componentes da velocidade"
          formula={`vₓ = v₀·cos θ = ${vx.toFixed(2)} m/s\nv_y = v₀·sen θ = ${vy.toFixed(2)} m/s`}
          value={`${v0} m/s @ ${angle}°`}
        />
        <Block
          label="Tempo de voo"
          formula={`T = 2·v_y / g = 2·${vy.toFixed(2)} / ${G}`}
          value={`${tFlight.toFixed(2)} s`}
        />
        <Block
          label="Altura máxima"
          formula={`H = v_y² / (2g)`}
          value={`${hMax.toFixed(2)} m`}
        />
        <Block
          label="Alcance (onde a bola cai)"
          formula={`R = v₀²·sen(2θ) / g`}
          value={`${range.toFixed(2)} m`}
          accent
        />
        <Block
          label={vDog === 0 ? "Velocidade do cachorro (AUTO = vₓ)" : "Velocidade do cachorro (MU)"}
          formula={`d = v_cão · T → v_cão = R / T = ${(range / tFlight).toFixed(2)} m/s`}
          value={`${dogSpeed.toFixed(2)} m/s`}
        />
        {phase === "done" && (
          <p
            className={`rounded-md p-2 text-center font-display text-lg ${
              caught ? "bg-gradient-green text-primary-foreground" : "bg-destructive/15 text-destructive"
            }`}
          >
            {caught ? "🎯 INTERCEPTOU!" : `Errou por ${catchErr.toFixed(2)} m`}
          </p>
        )}
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block rounded-md border border-border bg-muted p-3">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="font-display text-lg text-primary">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}

function Block({
  label,
  formula,
  value,
  accent,
}: {
  label: string;
  formula: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-md border p-3 ${accent ? "border-primary bg-primary/5" : "border-border bg-muted"}`}>
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <code className="block whitespace-pre py-1 font-mono text-[11px] text-primary">{formula}</code>
      <p className={`font-display text-2xl ${accent ? "text-gradient-gold" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
