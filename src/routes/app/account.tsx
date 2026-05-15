import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { PhoneTabbar } from "@/components/phone/PhoneFrame";

export const Route = createFileRoute("/app/account")({ component: Account });

function Account() {
  const { name, phone, credits } = useAppStore();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <Link to="/app/home" className="iconbtn">←</Link>
          <div className="text-base font-bold">Conta</div>
          <Link to="/app/notifications" className="iconbtn">🔔</Link>
        </div>
        <div className="brutal-card p-4 mt-3 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-accent border-2 border-ink flex items-center justify-center text-white text-xl font-bold">
            {(name[0] || "C").toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-bold">{name}</div>
            <div className="text-xs text-ink/60">{phone || "Sem número"}</div>
            <div className="font-hand text-accent text-base">{credits.toFixed(2).replace(".", ",")} € em créditos</div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          {[
            ["📍", "Moradas guardadas", "1 morada"],
            ["💳", "Métodos de pagamento", "MB WAY"],
            ["🔔", "Notificações", ""],
            ["🌍", "Idioma", "Português"],
            ["❓", "Ajuda & FAQ", ""],
            ["📜", "Termos & privacidade", ""],
          ].map(([e, t, sub]) => (
            <button key={t} className="w-full brutal-card p-3 flex items-center gap-3 text-left">
              <div className="text-xl">{e}</div>
              <div className="flex-1 font-bold text-sm">{t}</div>
              <div className="text-[11px] text-ink/50">{sub}</div>
              <div className="text-ink/40">›</div>
            </button>
          ))}
        </div>
        <Link to="/app/login" className="text-xs text-center text-ink/50 mt-auto">Terminar sessão ›</Link>
        <PhoneTabbar />
      </div>
    </div>
  );
}
