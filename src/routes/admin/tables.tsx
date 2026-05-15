import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { TABLES } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/tables")({ component: Tables });

function Tables() {
  const [sel, setSel] = useState<number | null>(7);
  return (
    <AdminShell title="Mesas & QR">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 grid grid-cols-4 gap-3">
          {TABLES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSel(t.id)}
              className={`brutal-card aspect-square flex flex-col items-center justify-center gap-1 ${
                sel === t.id ? "bg-accent text-white" : t.occupied ? "bg-warn/20" : ""
              } ${!t.active ? "opacity-40" : ""}`}
            >
              <div className="font-hand text-4xl">{t.number}</div>
              <div className="text-[10px] uppercase">
                {t.occupied ? "ocupada" : t.active ? "livre" : "inativa"}
              </div>
            </button>
          ))}
        </div>
        {sel && (
          <div className="brutal-card p-4">
            <div className="font-bold mb-2">Mesa {sel}</div>
            <div className="bg-white aspect-square brutal-border flex items-center justify-center mt-2">
              <div className="qr-grid !opacity-100 m-4" />
            </div>
            <div className="font-hand text-accent text-2xl text-center mt-3">comaqui.app/m/{sel}</div>
            <button className="cta mt-3 !text-xs">Imprimir QR</button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
