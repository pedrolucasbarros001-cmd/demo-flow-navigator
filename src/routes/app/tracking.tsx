import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/app/tracking")({
  component: Tracking,
});

const stages = [
  { key: "novo", label: "Recebido", icon: "📨" },
  { key: "preparando", label: "A preparar", icon: "🔪" },
  { key: "pronto", label: "Pronto", icon: "✅" },
  { key: "entregue", label: "Entregue", icon: "🛵" },
];

function Tracking() {
  const lastOrderId = useAppStore((s) => s.lastOrderId);
  const orders = useAppStore((s) => s.orders);
  const order = orders.find((o) => o.id === lastOrderId) ?? orders[0];
  const stageIdx = stages.findIndex((s) => s.key === order?.status);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = order ? Math.max(0, Math.floor((Date.now() - order.createdAt) / 60000)) : 0;
  void tick;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="phone-frame items-center justify-center">
          <div className="flex-1 flex items-center justify-center text-sm text-ink/50">Sem pedidos.</div>
          <Link to="/app/home" className="cta">Ver menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <Link to="/app/home" className="iconbtn">←</Link>
          <div className="text-base font-bold">Acompanhar</div>
          <div className="iconbtn">⋯</div>
        </div>

        {/* code or map */}
        {order.mode === "recolha" ? (
          <div className="brutal-card mt-3 p-4 bg-accent-soft text-center">
            <div className="text-[10px] uppercase tracking-wider text-ink/60">O teu código</div>
            <div className="font-hand text-6xl text-accent leading-none mt-1">{order.shortCode}</div>
            <div className="text-xs text-ink/60 mt-2">Mostra no balcão para levantar</div>
          </div>
        ) : (
          <div className="brutal-card mt-3 h-32 map-bg relative overflow-hidden">
            <motion.div
              animate={{ x: [10, 240, 10], y: [60, 30, 60] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute text-2xl"
            >
              🛵
            </motion.div>
            <div className="absolute right-3 top-3 pill-chip text-[9px] bg-white">
              {order.mode === "mesa" ? `Mesa ${order.table}` : "Para tua casa"}
            </div>
          </div>
        )}

        <div className="brutal-card p-3 mt-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-ink/60">Pedido</div>
              <div className="font-bold">#{order.shortCode}</div>
            </div>
            <div>
              <div className="text-xs text-ink/60 text-right">Há</div>
              <div className="font-bold">{elapsed} min</div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {stages.map((s, i) => {
              const done = i <= stageIdx;
              const current = i === stageIdx;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-ink flex items-center justify-center text-sm ${
                      done ? "bg-accent text-white" : "bg-white"
                    } ${current ? "shadow-[2px_2px_0_var(--ink)]" : ""}`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${done ? "" : "text-ink/40"}`}>
                      {s.label}
                    </div>
                    {current && (
                      <div className="font-hand text-accent text-base leading-none">a decorrer…</div>
                    )}
                  </div>
                  <div className="text-lg">{s.icon}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto" />
        <div className="flex gap-2">
          <button className="cta ghost flex-1 !text-xs">Falar connosco</button>
          <Link to="/app/rate" className="cta accent flex-1 !text-xs text-center">
            Avaliar pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
