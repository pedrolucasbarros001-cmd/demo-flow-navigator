import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { type OrderStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/kds/")({ component: KDS });

const COLS: { key: OrderStatus; label: string; bg: string }[] = [
  { key: "novo", label: "A receber", bg: "bg-warn" },
  { key: "preparando", label: "Em preparação", bg: "bg-accent" },
  { key: "pronto", label: "Pronto", bg: "bg-ok" },
];

const NEXT: Record<OrderStatus, OrderStatus | null> = {
  novo: "preparando",
  preparando: "pronto",
  pronto: "entregue",
  entregue: null,
  cancelado: null,
};

function KDS() {
  const { orders, updateOrderStatus } = useAppStore();
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-ink text-white p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-hand text-xl text-accent">← demo</Link>
          <div className="font-bold text-2xl">comaqui · cozinha</div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="pill-chip bg-ok text-white border-white">{orders.filter(o => o.status !== "entregue").length} ativos</span>
          <span className="font-hand text-accent text-xl">{new Date().toLocaleTimeString("pt-PT").slice(0, 5)}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {COLS.map((c) => (
          <div key={c.key} className="space-y-3">
            <div className={`pill-chip text-white border-white ${c.bg}`}>{c.label} · {orders.filter(o => o.status === c.key).length}</div>
            {orders.filter((o) => o.status === c.key).map((o) => {
              const mins = Math.floor((Date.now() - o.createdAt) / 60000);
              return (
                <motion.div
                  key={o.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white text-ink rounded-xl border-2 border-white shadow-[4px_4px_0_rgba(255,255,255,0.3)] overflow-hidden"
                >
                  <div className={`px-3 py-2 ${c.bg} text-white flex items-center justify-between`}>
                    <div className="font-bold">#{o.shortCode} · {o.mode === "mesa" ? `Mesa ${o.table}` : o.mode}</div>
                    <div className={`font-hand text-xl ${mins > 15 ? "text-bad" : ""}`}>{mins} min</div>
                  </div>
                  <div className="p-3 space-y-2">
                    {o.items.map((i) => (
                      <div key={i.id}>
                        <div className="font-bold">{i.qty}× {i.name}</div>
                        {i.meta && <div className="text-xs text-ink/60">→ {i.meta}</div>}
                      </div>
                    ))}
                  </div>
                  {NEXT[o.status] && (
                    <button
                      onClick={() => updateOrderStatus(o.id, NEXT[o.status]!)}
                      className="w-full bg-ink text-white py-2 font-bold text-sm hover:bg-accent transition"
                    >
                      → {NEXT[o.status] === "preparando" ? "Começar" : NEXT[o.status] === "pronto" ? "Marcar pronto" : "Entregar"}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
