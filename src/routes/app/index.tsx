import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/app/")({
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  useEffect(() => {
    const t = setTimeout(() => {
      navigate({ to: hasOnboarded ? "/app/home" : "/app/onboarding" });
    }, 1400);
    return () => clearTimeout(t);
  }, [navigate, hasOnboarded]);
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="phone-frame items-center justify-center">
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <motion.div
            initial={{ scale: 0.7, rotate: -8, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 14 }}
            className="w-32 h-32 rounded-3xl bg-accent border-[2.5px] border-ink shadow-[6px_6px_0_var(--ink)] flex items-center justify-center text-white text-6xl font-bold"
          >
            c
          </motion.div>
          <div className="text-2xl font-bold mt-2">comaqui</div>
          <div className="font-hand text-xl text-accent">pede onde estiveres</div>
          <div className="flex gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-ink"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
