import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/app/onboarding")({
  component: Onboarding,
});

const slides = [
  {
    icon: "🍔",
    title: "Menu sempre fresco",
    sub: "Categorias do dia, ingredientes claros, sem dúvidas.",
  },
  {
    type: "modes" as const,
    title: "Como queres receber?",
    sub: "Escolhe na Home · muda quando quiseres",
  },
  {
    icon: "💰",
    title: "Ganhas créditos a cada pedido",
    sub: "Voltas, ganhas. Voltas mais, ganhas mais.",
  },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);

  const finish = () => {
    setHasOnboarded(true);
    navigate({ to: "/app/login" });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <div className="w-9" />
          <div className="w-9" />
          <button
            onClick={finish}
            className="text-xs text-ink/60 hover:text-ink"
          >
            Saltar
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 px-2"
          >
            {slides[step].type === "modes" ? (
              <div className="w-full">
                <div className="text-xl font-bold text-center">{slides[step].title}</div>
                <div className="text-xs text-ink/60 text-center mt-1 mb-4">{slides[step].sub}</div>
                <div className="space-y-3">
                  <ModeCard emoji="🛵" title="Entrega ao domicílio" sub="Pedido chega a casa · ~25 min" tag="Padrão" tagBg="ok" border="ok" />
                  <ModeCard emoji="🏪" title="Recolha no balcão" sub="Vais buscar · ~20 min · sem taxa" />
                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 h-px bg-ink" />
                    <div className="text-[10px] uppercase tracking-wider text-ink/60">ou, na mesa</div>
                    <div className="flex-1 h-px bg-ink" />
                  </div>
                  <ModeCard emoji="📷" title="Comer aqui · lê o QR" sub="Aponta a câmara para o QR da mesa" dashed />
                </div>
              </div>
            ) : (
              <>
                <div className="img-ph soft w-40 h-40 rounded-3xl flex items-center justify-center text-6xl border-[2.5px]">
                  {slides[step].icon}
                </div>
                <div className="text-2xl font-bold text-center px-4">{slides[step].title}</div>
                <div className="text-sm text-ink/70 text-center px-4">{slides[step].sub}</div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-2 mb-4">
          {slides.map((_, i) => (
            <div key={i} className={`tab-dot ${i === step ? "on" : ""}`} />
          ))}
        </div>
        <button
          onClick={() => (step < slides.length - 1 ? setStep(step + 1) : finish())}
          className="cta"
        >
          {step < slides.length - 1 ? "Seguinte" : "Vamos começar"}
        </button>
        
      </div>
    </div>
  );
}

function ModeCard({
  emoji,
  title,
  sub,
  tag,
  tagBg,
  border,
  dashed,
}: {
  emoji: string;
  title: string;
  sub: string;
  tag?: string;
  tagBg?: string;
  border?: string;
  dashed?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 flex items-center gap-3 ${
        border === "ok" ? "border-2 border-ok bg-[oklch(0.92_0.08_155)]" : "border-2 border-ink bg-white"
      } ${dashed ? "border-dashed bg-paper-2" : ""}`}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="flex-1">
        <div className="font-bold text-xs">{title}</div>
        <div className="text-[11px] text-ink/70 mt-0.5">{sub}</div>
      </div>
      {tag && (
        <span className={`pill-chip text-[9px] ${tagBg === "ok" ? "bg-ok text-white border-ink" : ""}`}>
          {tag}
        </span>
      )}
    </div>
  );
}
