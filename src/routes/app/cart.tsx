import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAppStore } from "@/store/app-store";
import { RESTAURANT } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/app/cart")({
  component: Cart,
});

function Cart() {
  const navigate = useNavigate();
  const { cart, mode, table, updateQty, removeFromCart, credits } = useAppStore();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const fee = mode === "entrega" && cart.length ? RESTAURANT.deliveryFee : 0;
  const total = subtotal + fee;

  if (cart.length === 0) return <CartEmpty />;

  if (table) return <CartTable />;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <button onClick={() => navigate({ to: "/app/home" })} className="iconbtn">←</button>
          <div className="text-base font-bold">Carrinho</div>
          <div className="w-9" />
        </div>

        <div className="banner mt-3 text-[11px]">
          {mode === "entrega" ? "🛵 Entrega" : "🏪 Recolha no balcão"} ·{" "}
          {mode === "entrega" ? "~25 min" : "~20 min"}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide mt-3 -mx-1 px-1">
          <AnimatePresence>
            {cart.map((i) => (
              <motion.div
                layout
                key={i.id}
                exit={{ opacity: 0, x: -50 }}
                className="flex items-center gap-2 py-2 border-b border-ink/10"
              >
                <div className="img-ph soft w-12 h-12 rounded-xl flex items-center justify-center text-2xl">
                  {i.emoji}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm leading-tight">{i.name}</div>
                  <div className="text-[11px] text-ink/60 leading-tight mt-0.5">{i.meta}</div>
                  <div className="font-hand text-accent text-base mt-0.5">
                    {(i.price * i.qty).toFixed(2).replace(".", ",")} €
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(i.id, -1)} className="qty-btn">−</button>
                  <span className="w-5 text-center font-bold text-sm">{i.qty}</span>
                  <button onClick={() => updateQty(i.id, 1)} className="qty-btn accent">+</button>
                </div>
                <button
                  onClick={() => removeFromCart(i.id)}
                  className="text-ink/40 ml-1 text-xs hover:text-bad"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-1 text-sm mt-3">
          <Row label="Subtotal" value={`${subtotal.toFixed(2).replace(".", ",")} €`} />
          {mode === "entrega" && (
            <Row label="Taxa de entrega" value={`${fee.toFixed(2).replace(".", ",")} €`} />
          )}
          <Row label="Créditos disponíveis" value={`${credits.toFixed(2).replace(".", ",")} €`} muted />
          <div className="flex items-center justify-between pt-1 border-t-2 border-ink mt-1">
            <span className="font-bold">Total</span>
            <span className="font-bold font-hand text-accent text-xl">
              {total.toFixed(2).replace(".", ",")} €
            </span>
          </div>
        </div>

        <Link to="/app/checkout" className="cta mt-3">
          Ir para checkout — {total.toFixed(2).replace(".", ",")} €
        </Link>
        <Link to="/app/home" className="text-xs text-center text-ink/50 mt-2">
          Adicionar mais produtos ›
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-ink/50" : "text-ink/60"}>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function CartEmpty() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <Link to="/app/home" className="iconbtn">←</Link>
          <div className="text-base font-bold">Carrinho</div>
          <div className="w-9" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="img-ph w-32 h-32 rounded-3xl flex items-center justify-center text-6xl">🛍</div>
          <div className="text-xl font-bold">Ainda nada por aqui</div>
          <div className="text-sm text-ink/70 text-center px-6">
            Volta ao menu para escolher um prato.
          </div>
        </div>
        <Link to="/app/home" className="cta">
          Ver menu
        </Link>
        <div className="text-xs text-center text-ink/60 mt-3">
          Tens <b>2,40 €</b> em créditos à espera ›
        </div>
      </div>
    </div>
  );
}

function CartTable() {
  const navigate = useNavigate();
  const { cart, table, name } = useAppStore();
  // mock other people's items
  const otherItems = [
    { name: "Bitoque do Chef", meta: "mal-passado", price: 12.5, who: "Tiago" },
    { name: "Cerveja Super Bock", meta: "", price: 2.5, who: "Tiago" },
  ];
  const myTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const otherTotal = otherItems.reduce((s, i) => s + i.price, 0);
  const tableTotal = myTotal + otherTotal;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-paper p-4">
      <div className="phone-frame">
        <div className="flex items-center justify-between mt-2">
          <button onClick={() => navigate({ to: "/app/home" })} className="iconbtn">←</button>
          <div className="text-base font-bold">Mesa {table} · pedido</div>
          <span className="font-hand text-accent text-base">Editar</span>
        </div>
        <div className="banner ok mt-3 text-[11px]">
          🍽️ Pedidos da mesa: {cart.length + otherItems.length} itens · {tableTotal.toFixed(2).replace(".", ",")} €
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide mt-3">
          {cart.map((i) => (
            <Row2 key={i.id} name={i.name} meta={i.meta} price={i.price * i.qty} who={name || "Eu"} mine />
          ))}
          {otherItems.map((i, idx) => (
            <Row2 key={idx} name={i.name} meta={i.meta} price={i.price} who={i.who} />
          ))}
        </div>
        <div className="space-y-1 text-sm mt-2">
          <div className="flex items-center justify-between">
            <span className="text-ink/60">Total da mesa</span>
            <span className="font-bold">{tableTotal.toFixed(2).replace(".", ",")} €</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-ink/60">A minha parte</span>
            <span className="font-bold font-hand text-accent text-lg">
              {myTotal.toFixed(2).replace(".", ",")} €
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button className="cta ghost flex-1 !py-3 !text-xs">Pedir conta</button>
          <Link to="/app/checkout" className="cta accent flex-1 !py-3 !text-xs text-center">
            Pagar minha parte
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row2({
  name,
  meta,
  price,
  who,
  mine,
}: {
  name: string;
  meta: string;
  price: number;
  who: string;
  mine?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-ink/10">
      <div className="img-ph w-10 h-10 rounded-lg" />
      <div className="flex-1">
        <div className="font-bold text-xs leading-tight">{name}</div>
        <div className="text-[10px] text-ink/60">{meta}</div>
        <div className={`text-[10px] ${mine ? "text-accent font-bold" : "text-ink/50"}`}>por {who}</div>
      </div>
      <div className="font-bold text-sm">{price.toFixed(2).replace(".", ",")} €</div>
    </div>
  );
}
