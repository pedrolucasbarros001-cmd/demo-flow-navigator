import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { PhoneTabbar } from "@/components/phone/PhoneFrame";
import { HISTORY } from "@/lib/mock-data";

export const Route = createFileRoute("/app/history")({ component: History });

function History() {
  const orders = useAppStore((s) => s.orders).filter((o) => o.customerName !== "Mesa 5");
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <Link to="/app/home" className="iconbtn">←</Link>
          <div className="text-base font-bold">Histórico</div>
          <div className="w-9" />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide mt-3 space-y-2">
          {orders.map((o) => (
            <Link key={o.id} to="/app/tracking" className="brutal-card p-3 flex items-center gap-3">
              <div className="text-2xl">{o.items[0]?.emoji ?? "🍔"}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">#{o.shortCode} · {o.mode}</div>
                <div className="text-[11px] text-ink/60">{o.items.map(i => i.name).join(", ")}</div>
              </div>
              <div className="font-bold">{o.total.toFixed(2).replace(".", ",")} €</div>
            </Link>
          ))}
          {HISTORY.map((h) => (
            <div key={h.id} className="brutal-card p-3 flex items-center gap-3 opacity-80">
              <div className="text-2xl">🍔</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{h.title}</div>
                <div className="text-[11px] text-ink/60">{h.date} · {h.status}</div>
              </div>
              <div className="font-bold">{h.total.toFixed(2).replace(".", ",")} €</div>
            </div>
          ))}
        </div>
        <PhoneTabbar />
      </div>
    </div>
  );
}
