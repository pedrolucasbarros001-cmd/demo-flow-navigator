import { motion } from "framer-motion";
import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useAppStore } from "@/store/app-store";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-0 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="phone-frame"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function PhoneTopBar({
  left,
  center,
  right,
}: {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mt-2">
      <div className="w-9 flex items-center">{left}</div>
      <div className="text-sm font-bold flex-1 text-center">{center}</div>
      <div className="w-9 flex items-center justify-end">{right}</div>
    </div>
  );
}

export function PhoneTabbar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const tabs = [
    { to: "/app/home", icon: "🍽️", label: "Menu" },
    { to: "/app/wallet", icon: "💰", label: "Carteira" },
    { to: "/app/history", icon: "🧾", label: "Histórico" },
    { to: "/app/account", icon: "👤", label: "Conta" },
  ];
  return (
    <div className="phone-tabbar">
      {tabs.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          className={`phone-tab ${path === t.to ? "on" : ""}`}
          aria-label={t.label}
        >
          <span>{t.icon}</span>
        </Link>
      ))}
    </div>
  );
}

export function CartBadge() {
  const cart = useAppStore((s) => s.cart);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  return (
    <Link to="/app/cart" className="iconbtn accent relative" aria-label="Carrinho">
      🛍
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-accent text-white border-2 border-ink text-[10px] font-bold flex items-center justify-center px-1">
          {count}
        </span>
      )}
    </Link>
  );
}
