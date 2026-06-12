import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Camera, CheckCircle2, Download, Loader2 } from "lucide-react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro — ExpoCorra" },
      { name: "description", content: "Crie sua conta na ExpoCorra e receba seu QR code único." },
    ],
  }),
  component: CadastroPage,
});

const EDUCATION_LEVELS = [
  "Ensino Fundamental",
  "Ensino Médio — 1º ano",
  "Ensino Médio — 2º ano",
  "Ensino Médio — 3º ano",
  "Ensino Superior",
  "Outro",
];

function CadastroPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [hasDisability, setHasDisability] = useState<"sim" | "nao">("nao");
  const [disabilityDescription, setDisabilityDescription] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ userId: string; qrDataUrl: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !educationLevel || !email.trim() || password.length < 6) {
      setError("Preencha todos os campos. Senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (hasDisability === "sim" && !disabilityDescription.trim()) {
      setError("Por favor, descreva a deficiência ou marque 'Não'.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/jogos`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            education_level: educationLevel,
            has_disability: hasDisability === "sim",
            disability_description: hasDisability === "sim" ? disabilityDescription.trim() : null,
          },
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("already")) {
          setError("Esse e-mail já está cadastrado. Faça login.");
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) {
        setError("Cadastro falhou. Tente de novo.");
        setLoading(false);
        return;
      }

      // QR code points to the published profile URL (which we can build later); for now, encode UUID + base.
      const qrPayload = `${window.location.origin}/u/${userId}`;
      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        width: 480,
        margin: 2,
        color: { dark: "#0a0a0a", light: "#ffffff" },
      });

      setSuccess({ userId, qrDataUrl });
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Erro inesperado. Tente novamente.");
      setLoading(false);
    }
  };

  const downloadQr = () => {
    if (!success) return;
    const a = document.createElement("a");
    a.href = success.qrDataUrl;
    a.download = `expocorra-qr-${success.userId.slice(0, 8)}.png`;
    a.click();
  };

  const downloadUuid = () => {
    if (!success) return;
    const blob = new Blob([success.userId], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expocorra-uuid-${success.userId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (success) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-elegant sm:p-8">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-6 w-6" />
            <h1 className="font-display text-2xl font-bold text-foreground">Cadastro feito!</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Esse é o seu QR code único. <strong className="text-foreground">Baixe</strong> e
            <strong className="text-foreground"> tire um print</strong> agora — ele identifica você na feira.
          </p>

          <div className="mt-6 flex flex-col items-center">
            <img
              src={success.qrDataUrl}
              alt="Seu QR code ExpoCorra"
              className="w-64 rounded-xl border-4 border-primary/30 bg-white p-2"
            />
            <code className="mt-3 break-all rounded bg-muted px-2 py-1 font-mono text-[11px] text-muted-foreground">
              {success.userId}
            </code>
          </div>

          <div className="mt-5 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
            <div className="flex items-start gap-2">
              <Camera className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <strong>Tire um print da tela agora!</strong> Você também pode baixar o QR como imagem
                pelo botão abaixo.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={downloadQr}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Download className="h-4 w-4" /> Baixar QR
            </button>
            <button
              onClick={downloadUuid}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-muted px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              <Download className="h-4 w-4" /> Baixar UUID (.txt)
            </button>
          </div>

          <button
            onClick={() => navigate({ to: "/jogos" })}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-display text-base font-semibold text-primary-foreground shadow-glow-green hover:bg-primary/90"
          >
            Ir pros jogos →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar
        </Link>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-elegant sm:p-8">
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Criar conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vamos gerar seu QR code único pra usar na feira.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome" required>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={50}
                  className="input"
                  required
                />
              </Field>
              <Field label="Sobrenome" required>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={80}
                  className="input"
                  required
                />
              </Field>
            </div>

            <Field label="Nível de escolaridade" required>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="input"
                required
              >
                <option value="">— escolha —</option>
                {EDUCATION_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </Field>

            <Field label="Possui alguma deficiência?" required>
              <div className="flex gap-2">
                <RadioPill checked={hasDisability === "nao"} onClick={() => setHasDisability("nao")}>Não</RadioPill>
                <RadioPill checked={hasDisability === "sim"} onClick={() => setHasDisability("sim")}>Sim</RadioPill>
              </div>
            </Field>

            {hasDisability === "sim" && (
              <Field label="Qual deficiência?" required>
                <input
                  type="text"
                  value={disabilityDescription}
                  onChange={(e) => setDisabilityDescription(e.target.value)}
                  maxLength={200}
                  placeholder="Ex: auditiva, visual, motora, TEA…"
                  className="input"
                  required
                />
              </Field>
            )}

            <Field label="E-mail" required>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
                className="input"
                required
              />
            </Field>

            <Field label="Senha (mín. 6 caracteres)" required>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                maxLength={72}
                className="input"
                required
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-display text-base font-semibold text-primary-foreground shadow-glow-green hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Criando conta..." : "Criar conta e gerar QR"}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              Já tem conta?{" "}
              <Link to="/auth" className="text-primary hover:underline">
                Fazer login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">
        {label}{required && <span className="text-primary"> *</span>}
      </span>
      {children}
    </label>
  );
}

function RadioPill({ checked, onClick, children }: { checked: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition ${
        checked
          ? "border-primary bg-primary/15 text-primary"
          : "border-border bg-muted text-muted-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
