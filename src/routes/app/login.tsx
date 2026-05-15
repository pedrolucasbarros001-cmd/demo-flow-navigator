import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/app/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const setUser = useAppStore((s) => s.setUser);
  const [phone, setPhone] = useState("");

  const submit = () => {
    if (phone.trim()) setUser("Cliente", "+351 " + phone);
    navigate({ to: "/app/home" });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <button onClick={() => navigate({ to: "/app/onboarding" })} className="iconbtn">←</button>
          <div className="text-sm font-bold">Continuar</div>
          <button onClick={() => navigate({ to: "/app/home" })} className="text-xs text-ink/60">Saltar</button>
        </div>

        <div className="text-2xl font-bold mt-6">Olá! 👋</div>
        <p className="text-sm text-ink/70 mt-1">
          Insere o teu número para continuar.<br />
          <span className="text-xs text-ink/50">Sem conta? Pedido funciona na mesma.</span>
        </p>

        <div className="field mt-6">
          <span className="text-ink/50">+351</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9XX XXX XXX"
            inputMode="tel"
            autoFocus
          />
        </div>
        <p className="text-xs text-ink/60 mt-2">
          Reconhecemos clientes pelo número — morada e preferências aparecem automaticamente.
        </p>

        <div className="mt-auto" />
        <button onClick={submit} className="cta">Continuar</button>
        <button
          onClick={() => navigate({ to: "/app/home" })}
          className="text-xs text-center text-ink/60 mt-3 hover:text-ink"
        >
          Criar conta com password (opcional) ›
        </button>
      </div>
    </div>
  );
}
