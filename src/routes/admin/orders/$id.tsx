import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/admin/orders/$id")({ component: OrderDetail });

function OrderDetail() {
  const { id } = useParams({ from: "/admin/orders/$id" });
  const { orders, updateOrderStatus } = useAppStore();
  const o = orders.find((x) => x.id === id);
  if (!o) return <AdminShell title="Pedido"><div>Não encontrado.</div></AdminShell>;
  return (
    <AdminShell title={`Pedido #${o.shortCode}`}>
      <Link to="/admin/orders" className="text-sm text-ink/60">← voltar ao kanban</Link>
      <div className="grid grid-cols-3 gap-4 mt-3">
        <div className="brutal-card p-4 col-span-2">
          <div className="font-bold mb-2">Itens</div>
          {o.items.map((i) => (
            <div key={i.id} className="flex items-center gap-3 py-2 border-b border-ink/10">
              <div className="text-2xl">{i.emoji}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{i.name} × {i.qty}</div>
                <div className="text-xs text-ink/60">{i.meta}</div>
              </div>
              <div className="font-bold">{(i.price * i.qty).toFixed(2).replace(".", ",")} €</div>
            </div>
          ))}
          <div className="flex items-center justify-between mt-3 pt-2 border-t-2 border-ink">
            <span className="font-bold">Total</span>
            <span className="font-hand text-2xl text-accent">{o.total.toFixed(2).replace(".", ",")} €</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="brutal-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-ink/60">Cliente</div>
            <div className="font-bold">{o.customerName}</div>
            <div className="text-xs text-ink/60">{o.customerPhone ?? "—"}</div>
            <div className="text-xs mt-1">{o.address ?? (o.table ? `Mesa ${o.table}` : "Recolha")}</div>
          </div>
          <div className="brutal-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-ink/60">Estado</div>
            <div className="font-bold capitalize">{o.status}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {(["novo", "preparando", "pronto", "entregue"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateOrderStatus(o.id, s)}
                  className={`pill-chip !text-[10px] ${o.status === s ? "bg-ink text-white" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
