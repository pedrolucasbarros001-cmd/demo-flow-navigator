import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/store/app-store";
import { type OrderStatus } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/orders/")({ component: Orders });

const COLS: { key: OrderStatus; label: string; color: string }[] = [
  { key: "novo", label: "Novo", color: "bg-warn" },
  { key: "preparando", label: "A preparar", color: "bg-accent" },
  { key: "pronto", label: "Pronto", color: "bg-ok" },
  { key: "entregue", label: "Entregue", color: "bg-ink" },
];

const NEXT: Record<OrderStatus, OrderStatus | null> = {
  novo: "preparando",
  preparando: "pronto",
  pronto: "entregue",
  entregue: null,
  cancelado: null,
};

function Orders() {
  const { orders, updateOrderStatus } = useAppStore();
  return (
    <AdminShell title="Pedidos · Kanban">
      <div className="grid grid-cols-4 gap-3">
        {COLS.map((c) => (
          <div key={c.key} className="space-y-2">
            <div className={`pill-chip text-white border-ink ${c.color}`}>
              {c.label} · {orders.filter((o) => o.status === c.key).length}
            </div>
            {orders
              .filter((o) => o.status === c.key)
              .map((o) => (
                <div key={o.id} className="brutal-card p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <Link to="/admin/orders/$id" params={{ id: o.id }} className="font-bold underline">
                      #{o.shortCode}
                    </Link>
                    <span className="text-xs text-ink/60">{o.mode}</span>
                  </div>
                  <div className="text-xs text-ink/60 mt-1">{o.customerName}</div>
                  <div className="text-xs mt-1">{o.items.length} itens · {o.total.toFixed(2).replace(".", ",")} €</div>
                  {NEXT[o.status] && (
                    <button
                      onClick={() => updateOrderStatus(o.id, NEXT[o.status]!)}
                      className="cta accent !py-1.5 !text-xs mt-2"
                    >
                      → {COLS.find((x) => x.key === NEXT[o.status]!)?.label}
                    </button>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
