import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "comaqui" },
      { name: "description", content: "Pede onde estiveres — entrega, recolha ou na mesa via QR." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
  component: () => null,
});
