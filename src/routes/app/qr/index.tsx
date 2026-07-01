import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/app/qr/")({
  component: QRScan,
});

function QRScan() {
  const navigate = useNavigate();
  const setTable = useAppStore((s) => s.setTable);

  useEffect(() => {
    const t = setTimeout(() => {
      setTable(7);
      navigate({ to: "/app/qr/confirm" });
    }, 2200);
    return () => clearTimeout(t);
  }, [navigate, setTable]);

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="phone-frame !bg-[#0e0f12] !border-[#0e0f12]">
        <div className="flex items-center justify-between mt-2">
          <button onClick={() => navigate({ to: "/app/home" })} className="iconbtn !bg-white/10 !border-white !text-white">×</button>
          <div className="text-sm font-bold text-white">Ler QR da mesa</div>
          <div className="iconbtn !bg-white/10 !border-white !text-white">⚡</div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 relative">
          <div className="w-52 h-52 border-[3px] border-white rounded-[20px] relative bg-white/10 flex items-center justify-center overflow-hidden">
            <div className="qr-grid" />
            {[
              [true, true],
              [true, false],
              [false, true],
              [false, false],
            ].map(([top, left], i) => (
              <div
                key={i}
                className="absolute w-6 h-6"
                style={{
                  borderTop: top ? "4px solid var(--accent)" : "",
                  borderBottom: !top ? "4px solid var(--accent)" : "",
                  borderLeft: left ? "4px solid var(--accent)" : "",
                  borderRight: !left ? "4px solid var(--accent)" : "",
                  top: top ? -3 : "auto",
                  bottom: !top ? -3 : "auto",
                  left: left ? -3 : "auto",
                  right: !left ? -3 : "auto",
                }}
              />
            ))}
            <motion.div
              className="absolute left-2 right-2 h-0.5 bg-accent shadow-[0_0_20px_var(--accent)]"
              initial={{ top: 0 }}
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="text-sm text-white text-center px-6 mt-2">
            Aponta a câmara para o QR da tua mesa
          </div>
          <div className="font-hand text-accent text-lg">auto-detect · 1 toque</div>
        </div>
        <button className="text-xs text-center text-white/60 mb-2">
          Inserir código manualmente ›
        </button>
      </div>
    </div>
  );
}
