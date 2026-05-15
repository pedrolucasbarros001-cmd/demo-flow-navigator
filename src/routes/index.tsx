import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "comaqui — demo" },
      { name: "description", content: "Demo navegável: app cliente, admin do restaurante e KDS de cozinha." },
    ],
  }),
  component: Launcher,
});

function Launcher() {
  return (
    <div className="min-h-screen w-full bg-paper">
      <header className="px-6 py-4 flex items-center justify-between border-b-2 border-ink">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent border-2 border-ink flex items-center justify-center text-white font-bold text-xl shadow-[3px_3px_0_var(--ink)]">
            c
          </div>
          <div>
            <div className="font-bold text-lg leading-none">comaqui</div>
            <div className="font-hand text-base text-ink/60 leading-none mt-1">demo de prospeção</div>
          </div>
        </div>
        <div className="hidden md:block font-hand text-lg text-accent">
          v1 · client + admin + cozinha
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Pede onde estiveres.
          </h1>
          <p className="font-hand text-3xl text-accent mt-3">
            entrega · recolha · mesa via QR
          </p>
          <p className="text-ink/70 mt-4 max-w-xl mx-auto">
            Demo navegável de uma plataforma para restaurantes — 3 produtos articulados,
            sem gaps. Escolhe um para abrir.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              to: "/app",
              tag: "App cliente",
              title: "Para quem encomenda",
              sub: "Mobile · carrossel de pratos, modos entrega/recolha/mesa, MB WAY, tracking",
              emoji: "🛍️",
              accent: true,
            },
            {
              to: "/admin",
              tag: "Admin restaurante",
              title: "Para o gerente",
              sub: "Desktop · dashboard, kanban de pedidos, menu, mesas/QR, clientes",
              emoji: "📊",
            },
            {
              to: "/kds",
              tag: "KDS cozinha",
              title: "Para a cozinha",
              sub: "Tablet · 3 colunas com pedidos a entrar, timers, modificadores",
              emoji: "🍳",
            },
          ].map((c, i) => (
            <motion.div
              key={c.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
            >
              <Link
                to={c.to}
                className={`brutal-card block p-6 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform ${c.accent ? "bg-accent-soft" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="pill-chip">{c.tag}</span>
                  <span className="text-4xl">{c.emoji}</span>
                </div>
                <h3 className="text-2xl font-bold">{c.title}</h3>
                <p className="text-sm text-ink/70 mt-2">{c.sub}</p>
                <div className="font-hand text-accent text-xl mt-4">abrir →</div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 brutal-card p-6 bg-white">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h4 className="font-bold text-lg">Como demonstrar</h4>
              <ol className="text-sm text-ink/80 mt-2 space-y-1 list-decimal list-inside">
                <li>Abre o <b>App cliente</b> e faz um pedido completo (entrega ou mesa via QR).</li>
                <li>Abre o <b>Admin</b> noutra aba — o pedido aparece em tempo real no kanban.</li>
                <li>Abre o <b>KDS</b> noutra aba — vê o pedido na cozinha. Avança o estado.</li>
                <li>Volta ao app cliente — o tracking acompanha o estado.</li>
              </ol>
              <p className="font-hand text-accent mt-3">tudo em sessionStorage · refresh limpa</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-ink px-6 py-6 text-center text-sm text-ink/60">
        comaqui · demo build · feita à medida para prospeção
      </footer>
    </div>
  );
}
