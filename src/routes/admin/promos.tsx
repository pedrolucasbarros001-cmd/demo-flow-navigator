import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/promos")({ component: Promos });

function Promos() {
  return (
    <AdminShell title="Créditos & promoções">
      <div className="grid grid-cols-2 gap-4">
        {[
          { t: "Cashback 2%", s: "Em todos os pedidos · ativo", on: true },
          { t: "2x1 Hambúrgueres às 3ªs", s: "Das 19h às 22h · ativo", on: true },
          { t: "Volta cá · 1 € de crédito", s: "Após 14 dias sem pedir", on: false },
          { t: "Aniversário · 5 €", s: "No mês do aniversário", on: true },
        ].map((p) => (
          <div key={p.t} className="brutal-card p-4 flex items-center gap-3">
            <div className="text-3xl">🎁</div>
            <div className="flex-1">
              <div className="font-bold">{p.t}</div>
              <div className="text-xs text-ink/60">{p.s}</div>
            </div>
            <div className={`w-12 h-7 rounded-full border-2 border-ink relative ${p.on ? "bg-ok" : "bg-white"}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-ink ${p.on ? "left-6" : "left-0.5"}`} />
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
