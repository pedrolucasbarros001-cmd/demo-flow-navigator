import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { RESTAURANT } from "@/lib/mock-data";

export const Route = createFileRoute("/app/checkout")({
  component: Checkout,
});

function Checkout() {
  const navigate = useNavigate();
  const { cart, mode, table, address, credits, setMode, setAddress } = useAppStore();
  const [useCredits, setUseCredits] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("19:30");
  const [outOfZone, setOutOfZone] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const fee = mode === "entrega" ? RESTAURANT.deliveryFee : 0;
  const credit = useCredits ? Math.min(credits, subtotal) : 0;
  const total = subtotal + fee - credit;

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <button onClick={() => navigate({ to: "/app/cart" })} className="iconbtn">←</button>
          <div className="text-base font-bold">Checkout</div>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide mt-3 space-y-3">
          {/* Mode */}
          <Section title="A · Como queres receber?">
            <div className="flex gap-2">
              {(["entrega", "recolha"] as const).map((m) => (
                <button
                  key={m}
                  disabled={!!table}
                  onClick={() => setMode(m)}
                  className={`pill-chip flex-1 justify-center !text-[10px] ${
                    mode === m ? "bg-ink text-white" : ""
                  } ${table ? "opacity-50" : ""}`}
                >
                  {m === "entrega" ? "🛵 Entrega" : "🏪 Recolha"}
                </button>
              ))}
              {table && (
                <span className="pill-chip flex-1 justify-center !text-[10px] bg-accent text-white">
                  🍽️ Mesa {table}
                </span>
              )}
            </div>
            {mode === "entrega" && !table && (
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-ink/60 font-bold">Morada</div>
                <input
                  className="field mt-1 !p-3 !text-sm"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <button
                  onClick={() => setOutOfZone(!outOfZone)}
                  className="text-[10px] text-ink/50 mt-1 underline"
                >
                  {outOfZone ? "Tentar zona OK" : "Simular fora da zona"}
                </button>
                {outOfZone && (
                  <div className="banner mt-2 !bg-[oklch(0.94_0.1_30)] text-[11px]">
                    ⚠️ Fora da zona de entrega — muda para Recolha ou agenda.
                  </div>
                )}
              </div>
            )}
          </Section>

          {/* Timing */}
          <Section title="B · Quando?">
            <div className="flex gap-2">
              <button
                onClick={() => setScheduling(false)}
                className={`pill-chip flex-1 justify-center !text-[10px] ${!scheduling ? "bg-ink text-white" : ""}`}
              >
                Assim que possível
              </button>
              <button
                onClick={() => setScheduling(true)}
                className={`pill-chip flex-1 justify-center !text-[10px] ${scheduling ? "bg-ink text-white" : ""}`}
              >
                Agendar
              </button>
            </div>
            {scheduling && (
              <div className="mt-2">
                <div className="flex gap-2 flex-wrap">
                  {["19:00", "19:30", "20:00", "20:30", "21:00"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setScheduleTime(t)}
                      className={`pill-chip !text-[10px] ${scheduleTime === t ? "bg-accent text-white" : ""}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {/* Credits */}
          <Section title="C · Créditos">
            <label className="flex items-center justify-between">
              <span className="text-sm">
                Usar <b>{credits.toFixed(2).replace(".", ",")} €</b> em créditos
              </span>
              <button
                onClick={() => setUseCredits(!useCredits)}
                className={`w-10 h-6 rounded-full border-2 border-ink relative transition ${
                  useCredits ? "bg-accent" : "bg-white"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-ink transition-all ${
                    useCredits ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          </Section>

          {/* Payment */}
          <Section title="D · Pagamento">
            <div className="space-y-2">
              {[
                { id: "mbway", label: "MB WAY", emoji: "📱", on: true },
                { id: "cartao", label: "Cartão", emoji: "💳" },
                { id: "balcao", label: "No balcão", emoji: "💵" },
              ].map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border-2 border-ink ${
                    p.on ? "bg-accent-soft" : "bg-white"
                  }`}
                >
                  <div className="text-xl">{p.emoji}</div>
                  <div className="flex-1 text-sm font-bold">{p.label}</div>
                  {p.on && <span className="pill-chip !text-[9px] bg-accent text-white">Selecionado</span>}
                </div>
              ))}
            </div>
          </Section>

          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink/60">Subtotal</span>
              <span>{subtotal.toFixed(2).replace(".", ",")} €</span>
            </div>
            {fee > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-ink/60">Taxa de entrega</span>
                <span>{fee.toFixed(2).replace(".", ",")} €</span>
              </div>
            )}
            {credit > 0 && (
              <div className="flex items-center justify-between text-ok">
                <span>Créditos aplicados</span>
                <span>−{credit.toFixed(2).replace(".", ",")} €</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-ink">
          <span className="font-bold">Total</span>
          <span className="font-hand text-2xl text-accent">{total.toFixed(2).replace(".", ",")} €</span>
        </div>
        <button
          onClick={() => navigate({ to: "/app/pay" })}
          className="cta mt-2"
          disabled={outOfZone}
        >
          Pagar com MB WAY
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="brutal-card p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/60 font-bold mb-2">{title}</div>
      {children}
    </div>
  );
}
