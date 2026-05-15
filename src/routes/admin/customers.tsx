import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/customers")({ component: Customers });

const ROWS = [
  ["Marta S.", "VIP", 24, "412 €", "8,40 €", "Hoje"],
  ["Tiago F.", "Regular", 11, "186 €", "2,20 €", "Ontem"],
  ["Joana M.", "Novo", 2, "31 €", "0,40 €", "Há 3 dias"],
  ["Pedro R.", "Regular", 9, "142 €", "1,80 €", "Há 1 sem."],
  ["Sofia L.", "VIP", 32, "598 €", "12,10 €", "Há 2 dias"],
];

function Customers() {
  return (
    <AdminShell title="Clientes">
      <div className="brutal-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-2 border-b-2 border-ink">
            <tr>
              {["Cliente", "Nível", "Pedidos", "Gasto total", "Créditos", "Último"].map((h) => (
                <th key={h} className="text-left px-4 py-2 text-[10px] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={i} className="border-b border-ink/10 hover:bg-paper-2/50">
                {r.map((c, j) => (
                  <td key={j} className="px-4 py-3">
                    {j === 1 ? (
                      <span className={`pill-chip !text-[9px] ${c === "VIP" ? "bg-accent text-white" : ""}`}>{c}</span>
                    ) : (
                      c
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
