import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/app/rate")({
  component: Rate,
});

function Rate() {
  const [stars, setStars] = useState(5);
  const [tags, setTags] = useState<string[]>(["Rápido"]);
  const navigate = useNavigate();

  const toggle = (t: string) =>
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <button onClick={() => navigate({ to: "/app/home" })} className="iconbtn">←</button>
          <div className="text-base font-bold">Avaliar pedido</div>
          <button onClick={() => navigate({ to: "/app/home" })} className="text-xs text-ink/60">Saltar</button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="text-xl font-bold">Como foi o pedido?</div>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <motion.button
                key={n}
                whileTap={{ scale: 0.85 }}
                onClick={() => setStars(n)}
                className={`text-4xl ${n <= stars ? "" : "grayscale opacity-30"}`}
              >
                ⭐
              </motion.button>
            ))}
          </div>
          <div className="font-hand text-2xl text-accent mt-2">
            {stars >= 4 ? "boa!" : stars === 3 ? "podia ser melhor" : "lamentamos"}
          </div>
          <div className="text-xs text-ink/60 mt-3">O que correu bem?</div>
          <div className="flex gap-2 flex-wrap justify-center max-w-[260px]">
            {["Rápido", "Saboroso", "Embalagem 👌", "Estafeta simpático", "Quente"].map((t) => (
              <button
                key={t}
                onClick={() => toggle(t)}
                className={`pill-chip !text-[10px] ${
                  tags.includes(t) ? "bg-accent text-white" : ""
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => navigate({ to: "/app/wallet" })} className="cta">
          Enviar avaliação
        </button>
      </div>
    </div>
  );
}
