import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/app/pay")({
  component: Pay,
});

function Pay() {
  const navigate = useNavigate();
  const placeOrder = useAppStore((s) => s.placeOrder);
  const [done, setDone] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const id = placeOrder({});
      setOrderId(id);
      setDone(true);
    }, 2400);
    return () => clearTimeout(t);
  }, [placeOrder]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => navigate({ to: "/app/tracking" }), 1700);
    return () => clearTimeout(t);
  }, [done, navigate]);

  if (done) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
        <div className="phone-frame">
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 280 }}
              className="w-24 h-24 rounded-full bg-ok border-2 border-ink flex items-center justify-center text-white text-5xl shadow-[4px_4px_0_var(--ink)]"
            >
              ✓
            </motion.div>
            <div className="text-2xl font-bold">Pedido confirmado!</div>
            <div className="font-hand text-3xl text-accent">obrigada · até já 🍔</div>
            <div className="text-xs text-ink/60">#{orderId?.slice(-4)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <div className="iconbtn">←</div>
          <div className="text-sm font-bold">A aguardar MB WAY</div>
          <div className="w-9" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-full border-[6px] border-ink/20 border-t-accent"
          />
          <div className="text-lg font-bold mt-2">Confirma na app MB WAY</div>
          <div className="text-sm text-ink/60 text-center px-6">
            Recebeste uma notificação no telemóvel.<br />Tens até 2 minutos.
          </div>
          <div className="banner mt-2 max-w-[260px] text-[11px]">
            💡 Se não receberes, abre a app MB WAY manualmente.
          </div>
        </div>
        <button className="cta ghost">Cancelar</button>
      </div>
    </div>
  );
}
