import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";

const NAV = [
  { to: "/admin", label: "Hoje", icon: "📊" },
  { to: "/admin/orders", label: "Pedidos", icon: "📋" },
  { to: "/admin/menu", label: "Menu", icon: "🍔" },
  { to: "/admin/tables", label: "Mesas & QR", icon: "🪑" },
  { to: "/admin/customers", label: "Clientes", icon: "👥" },
  { to: "/admin/promos", label: "Promoções", icon: "🎁" },
  { to: "/admin/reports", label: "Relatórios", icon: "📈" },
  { to: "/admin/settings", label: "Definições", icon: "⚙️" },
];

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-60 border-r-2 border-ink bg-white p-4 flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-accent border-2 border-ink flex items-center justify-center text-white font-bold">c</div>
          <div className="font-bold">comaqui · admin</div>
        </Link>
        <nav className="space-y-1 flex-1">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/admin" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold ${
                  active ? "bg-ink text-white" : "hover:bg-paper-2"
                }`}
              >
                <span>{n.icon}</span>
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>
        
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>
          <div className="flex items-center gap-2">
            <span className="pill-chip bg-ok text-white">● Aberto</span>
            <div className="w-9 h-9 rounded-full bg-accent border-2 border-ink flex items-center justify-center text-white text-sm font-bold">P</div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
