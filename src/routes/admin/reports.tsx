import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/reports")({ component: Reports });

function Reports() {
  return (
    <AdminShell title="Relatórios">
      <div className="grid grid-cols-3 gap-4">
        {[
          ["Receita semanal", "2.418 €", "+8%"],
          ["Pedidos semanais", "187", "+12%"],
          ["Cancelamentos", "3", "−2"],
        ].map(([t, v, d]) => (
          <div key={t} className="brutal-card p-4">
            <div className="text-[10px] uppercase tracking-wider text-ink/60">{t}</div>
            <div className="font-hand text-4xl text-accent mt-2">{v}</div>
            <div className="text-xs text-ok mt-1">{d}</div>
          </div>
        ))}
      </div>
      <div className="brutal-card p-4 mt-4 h-72 flex items-center justify-center font-hand text-2xl text-ink/40">
        [ gráfico de receita · 30 dias ]
      </div>
    </AdminShell>
  );
}
