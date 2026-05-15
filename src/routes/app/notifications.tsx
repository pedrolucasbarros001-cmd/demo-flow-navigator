import { createFileRoute, Link } from "@tanstack/react-router";
import { NOTIFICATIONS } from "@/lib/mock-data";

export const Route = createFileRoute("/app/notifications")({ component: Notif });

function Notif() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <Link to="/app/account" className="iconbtn">←</Link>
          <div className="text-base font-bold">Notificações</div>
          <div className="w-9" />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide mt-3 space-y-2">
          {NOTIFICATIONS.map((n) => (
            <div key={n.id} className="brutal-card p-3 flex gap-3">
              <div className="text-2xl">{n.icon}</div>
              <div className="flex-1">
                <div className="font-bold text-sm">{n.title}</div>
                <div className="text-[11px] text-ink/60">{n.sub}</div>
              </div>
              <div className="text-[10px] text-ink/40">{n.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
