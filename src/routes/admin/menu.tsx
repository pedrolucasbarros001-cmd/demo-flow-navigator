import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAppStore } from "@/store/app-store";
import { PRODUCTS, CATEGORIES } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/menu")({ component: Menu });

function Menu() {
  const { unavailableProducts, toggleProductAvailable } = useAppStore();
  return (
    <AdminShell title="Menu & disponibilidade">
      <div className="space-y-6">
        {CATEGORIES.map((c) => (
          <div key={c.id}>
            <div className="font-bold mb-2">{c.name}</div>
            <div className="brutal-card divide-y-2 divide-ink/10">
              {PRODUCTS.filter((p) => p.category === c.id).map((p) => {
                const off = unavailableProducts.includes(p.id) || p.unavailable;
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3">
                    <div className="text-2xl">{p.emoji}</div>
                    <div className="flex-1">
                      <div className={`font-bold text-sm ${off ? "line-through text-ink/40" : ""}`}>{p.name}</div>
                      <div className="text-xs text-ink/60">{p.meta}</div>
                    </div>
                    <div className="font-bold mr-3">{p.price.toFixed(2).replace(".", ",")} €</div>
                    <button
                      onClick={() => toggleProductAvailable(p.id)}
                      className={`w-12 h-7 rounded-full border-2 border-ink relative ${off ? "bg-white" : "bg-ok"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-ink transition-all ${off ? "left-0.5" : "left-6"}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
