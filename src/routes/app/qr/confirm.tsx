import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/app/qr/confirm")({
  component: TableConfirm,
});

function TableConfirm() {
  const navigate = useNavigate();
  const table = useAppStore((s) => s.table) ?? 7;

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <button onClick={() => navigate({ to: "/app/qr" })} className="iconbtn">←</button>
          <div className="text-sm font-bold">Mesa detetada</div>
          <div className="w-9" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <motion.div
            initial={{ scale: 0.7, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 220 }}
            className="w-24 h-24 rounded-2xl bg-accent-soft border-2 border-ink flex items-center justify-center text-5xl font-bold shadow-[4px_4px_0_var(--ink)]"
          >
            {table}
          </motion.div>
          <div className="text-2xl font-bold">Mesa {table}</div>
          <div className="text-sm text-ink/70 text-center px-6">
            Pizzaria do Bairro · Av. da Liberdade
            <br />
            <span className="text-xs text-ink/50">
              Pedidos vão directamente à cozinha em teu nome.
            </span>
          </div>
          <div className="banner mt-2 max-w-[260px] text-[11px]">
            💡 Podes dividir a conta no final · pagar no app ou ao balcão.
          </div>
        </div>
        <Link to="/app/home" className="cta">
          Começar pedido para a mesa
        </Link>
        <Link to="/app/qr" className="text-xs text-center text-ink/50 mt-3">
          Não é esta a mesa? Ler outro QR ›
        </Link>
      </div>
    </div>
  );
}
