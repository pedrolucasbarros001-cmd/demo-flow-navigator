import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

function Settings() {
  const { restaurantOpen, setOpen } = useAppStore();
  return (
    <AdminShell title="Definições">
      <div className="space-y-3 max-w-xl">
        <div className="brutal-card p-4 flex items-center justify-between">
          <div>
            <div className="font-bold">Restaurante aberto</div>
            <div className="text-xs text-ink/60">Quando desligado, app mostra "fechado · agendar"</div>
          </div>
          <button
            onClick={() => setOpen(!restaurantOpen)}
            className={`w-14 h-8 rounded-full border-2 border-ink relative ${restaurantOpen ? "bg-ok" : "bg-white"}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-ink ${restaurantOpen ? "left-7" : "left-0.5"}`} />
          </button>
        </div>
        {[
          ["🕐", "Horário", "Seg–Dom · 12h–23h"],
          ["📍", "Zona de entrega", "Lisboa centro · 5km"],
          ["💰", "Taxa de entrega", "1,99 €"],
          ["🧾", "IVA", "23%"],
          ["📱", "MB WAY", "Conectado"],
        ].map(([e, t, s]) => (
          <div key={t} className="brutal-card p-4 flex items-center gap-3">
            <div className="text-2xl">{e}</div>
            <div className="flex-1">
              <div className="font-bold">{t}</div>
              <div className="text-xs text-ink/60">{s}</div>
            </div>
            <div className="text-ink/40">›</div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
