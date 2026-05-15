import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/admin/")({ component: Dash });

function Dash() {
  const orders = useAppStore((s) => s.orders);
  const today = orders.length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const avg = today ? revenue / today : 0;
  const kpis = [
    { label: "Pedidos hoje", value: today, sub: "+3 vs. ontem", emoji: "📦" },
    { label: "Receita", value: `${revenue.toFixed(2).replace(".", ",")} €`, sub: "+12%", emoji: "💶" },
    { label: "Ticket médio", value: `${avg.toFixed(2).replace(".", ",")} €`, sub: "—", emoji: "🎟️" },
    { label: "Mesas ocupadas", value: "3 / 8", sub: "Mesas 3, 5, 7", emoji: "🪑" },
  ];
  return (
    <AdminShell title="Hoje · Dashboard">
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="brutal-card p-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-ink/60">{k.label}</div>
              <div className="text-xl">{k.emoji}</div>
            </div>
            <div className="font-hand text-4xl text-accent mt-2">{k.value}</div>
            <div className="text-xs text-ink/60 mt-1">{k.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="brutal-card p-4 col-span-2">
          <div className="font-bold mb-3">Vendas por hora</div>
          <div className="flex items-end gap-2 h-40">
            {[3, 5, 4, 8, 12, 18, 22, 15, 10, 6].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-accent border-2 border-ink rounded-t-md"
                  style={{ height: `${v * 6}px` }}
                />
                <div className="text-[10px] text-ink/60">{12 + i}h</div>
              </div>
            ))}
          </div>
        </div>
        <div className="brutal-card p-4">
          <div className="font-bold mb-3">Top pratos</div>
          <div className="space-y-2">
            {[
              ["🍔 Burger Smash", 18],
              ["🍳 Bitoque", 12],
              ["🍟 Menu Smash", 9],
              ["🐟 Bacalhau", 6],
            ].map(([n, c]) => (
              <div key={n as string} className="flex items-center justify-between text-sm">
                <span>{n}</span>
                <span className="font-bold">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
