import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { PhoneTabbar } from "@/components/phone/PhoneFrame";

export const Route = createFileRoute("/app/wallet")({ component: Wallet });

function Wallet() {
  const credits = useAppStore((s) => s.credits);
  const moves = [
    { d: "Hoje", t: "Pedido #A23 (cashback)", v: 0.4 },
    { d: "Há 1 sem.", t: "Pedido #X88 (cashback)", v: 0.76 },
    { d: "Há 2 sem.", t: "Promoção 'volta cá'", v: 1.0 },
    { d: "Há 3 sem.", t: "Pedido #M12 (cashback)", v: 0.24 },
  ];
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <Link to="/app/home" className="iconbtn">←</Link>
          <div className="text-base font-bold">Carteira</div>
          <div className="w-9" />
        </div>
        <div className="brutal-card bg-accent-soft p-4 mt-3 text-center">
          <div className="text-[10px] uppercase tracking-wider text-ink/60">Saldo em créditos</div>
          <div className="font-hand text-5xl text-accent mt-1">{credits.toFixed(2).replace(".", ",")} €</div>
          <div className="text-xs text-ink/70 mt-1">Usa em qualquer pedido · sem prazo</div>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-ink/60 font-bold mt-4 mb-2">Movimentos</div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {moves.map((m, i) => (
            <div key={i} className="flex items-center gap-2 py-2 border-b border-ink/10">
              <div className="w-8 h-8 rounded-full bg-ok/20 border-2 border-ok flex items-center justify-center text-xs">+</div>
              <div className="flex-1">
                <div className="text-sm font-bold">{m.t}</div>
                <div className="text-[10px] text-ink/60">{m.d}</div>
              </div>
              <div className="text-sm font-bold text-ok">+{m.v.toFixed(2).replace(".", ",")} €</div>
            </div>
          ))}
        </div>
        <PhoneTabbar />
      </div>
    </div>
  );
}
