import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/app-store";
import { CATEGORIES, PRODUCTS, RESTAURANT } from "@/lib/mock-data";
import { CartBadge, PhoneTabbar } from "@/components/phone/PhoneFrame";

export const Route = createFileRoute("/app/home")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { mode, table, credits, restaurantOpen, unavailableProducts, setMode, setTable } =
    useAppStore();
  const [catIdx, setCatIdx] = useState(1); // burgers
  const [prodIdx, setProdIdx] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [modeSheet, setModeSheet] = useState(false);
  const [arc, setArc] = useState(false);

  const cat = CATEGORIES[catIdx];
  const products = useMemo(
    () => PRODUCTS.filter((p) => p.category === cat.id),
    [cat.id],
  );
  const product = products[prodIdx % products.length];
  const productUnavailable =
    !!product && (product.unavailable || unavailableProducts.includes(product.id));

  const nextCat = () => {
    setCatIdx((i) => (i + 1) % CATEGORIES.length);
    setProdIdx(0);
  };
  const prevCat = () => {
    setCatIdx((i) => (i - 1 + CATEGORIES.length) % CATEGORIES.length);
    setProdIdx(0);
  };

  const flyToCart = () => {
    setArc(true);
    setTimeout(() => setArc(false), 700);
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="phone-frame">
        {/* top bar */}
        <div className="flex items-center justify-between mt-2">
          <div className="leading-tight">
            <div className="text-[9px] uppercase tracking-wider text-ink/50">
              {table ? `Mesa ${table} · ` : ""}Unidade
            </div>
            <button
              onClick={() => setModeSheet(true)}
              className="text-sm font-bold flex items-center gap-1"
            >
              {table ? RESTAURANT.name : mode === "entrega" ? "Avenida" : "Balcão"} ▾
            </button>
          </div>
          <div className="flex items-center gap-2">
            {!table && (
              <span
                className="pill-chip text-[9px] text-white border-ink"
                style={{ background: restaurantOpen ? "var(--ok)" : "var(--warn)" }}
              >
                {restaurantOpen ? "25 min" : "abre 18:00"}
              </span>
            )}
            <span className="pill-chip text-[9px] bg-accent-soft">💰 {credits.toFixed(2).replace(".", ",")} €</span>
            <CartBadge />
          </div>
        </div>

        {/* pill header / category nav */}
        <div className="flex items-center gap-1 mt-3 relative">
          <button
            onClick={() => navigate({ to: "/app/account" })}
            className="iconbtn"
            aria-label="Conta"
          >
            👤
          </button>
          <div className="flex items-center gap-1 flex-1 justify-center">
            <button onClick={prevCat} className="iconbtn !w-8 !h-8 !text-xs">‹</button>
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="brutal-border bg-white rounded-full px-3 py-1.5 flex-1 max-w-[180px]"
            >
              <div className="text-[8px] uppercase tracking-wider text-ink/50 leading-none">
                Categoria
              </div>
              <div className="text-[12px] font-bold leading-tight mt-0.5 flex items-center justify-center gap-1">
                {cat.name} <span className="text-[9px]">▾</span>
              </div>
            </button>
            <button onClick={nextCat} className="iconbtn !w-8 !h-8 !text-xs">›</button>
          </div>
          <button onClick={() => navigate({ to: "/app/qr" })} className="iconbtn ink" aria-label="QR">📷</button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute top-full mt-2 left-10 right-10 brutal-card bg-white p-2 z-30"
              >
                {CATEGORIES.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCatIdx(i);
                      setProdIdx(0);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      i === catIdx ? "bg-accent text-white font-bold" : "hover:bg-paper-2"
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-xs opacity-60">{c.count}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* contextual banners */}
        {!restaurantOpen && !table && (
          <div className="banner warn mt-3 text-[11px]">⏰ Fechado — podes agendar para 18:00</div>
        )}
        {table && (
          <div className="banner ok mt-3 text-[11px]">🍽️ A pedir directamente para a Mesa {table}</div>
        )}

        {/* product carousel */}
        <div className="flex-1 flex flex-col items-center justify-center mt-2 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${cat.id}-${product?.id}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.4}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -60) setProdIdx((i) => (i + 1) % products.length);
                    else if (info.offset.x > 60)
                      setProdIdx((i) => (i - 1 + products.length) % products.length);
                  }}
                  className={`w-44 h-44 rounded-full img-ph soft flex items-center justify-center text-7xl cursor-grab active:cursor-grabbing ${
                    productUnavailable ? "opacity-40" : ""
                  }`}
                >
                  {product?.emoji}
                </motion.div>
                {productUnavailable && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-ink text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider">
                    ESGOTADO HOJE
                  </div>
                )}
                <AnimatePresence>
                  {arc && (
                    <motion.div
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{ x: 110, y: -180, opacity: 0, scale: 0.4 }}
                      transition={{ duration: 0.6 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl pointer-events-none"
                    >
                      {product?.emoji}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="text-xl font-bold text-center mt-3">{product?.name}</div>
              <div className="text-xs text-ink/60 text-center mt-1 px-4">{product?.meta}</div>
              <div className="font-hand text-3xl text-accent mt-2">{product?.price.toFixed(2).replace(".", ",")} €</div>
            </motion.div>
          </AnimatePresence>

          {/* dots */}
          <div className="flex items-center gap-1.5 mt-4">
            {products.map((_, i) => (
              <div key={i} className={`tab-dot ${i === prodIdx ? "on" : ""}`} />
            ))}
          </div>

          {/* sheet handle */}
          <button
            onClick={() => setSheetOpen(true)}
            className="flex flex-col items-center gap-0.5 mt-3 hover:scale-105 transition"
          >
            <div className="w-10 h-1 bg-ink rounded-full opacity-60" />
            <div className="text-[10px] text-ink/60">↑ extras &amp; quantidade</div>
          </button>
        </div>

        <button
          onClick={() => {
            if (productUnavailable) return;
            setSheetOpen(true);
          }}
          className={`cta ${productUnavailable ? "disabled" : ""}`}
          disabled={productUnavailable}
        >
          {productUnavailable
            ? "Indisponível"
            : table
            ? `Adicionar à mesa — ${product?.price.toFixed(2).replace(".", ",")} €`
            : `Adicionar ao carrinho — ${product?.price.toFixed(2).replace(".", ",")} €`}
        </button>

        <PhoneTabbar />

        {/* extras sheet */}
        <AnimatePresence>
          {sheetOpen && product && (
            <ExtrasSheet
              product={product}
              table={table}
              onClose={() => setSheetOpen(false)}
              onAdd={() => {
                setSheetOpen(false);
                flyToCart();
              }}
            />
          )}
        </AnimatePresence>

        {/* mode sheet */}
        <AnimatePresence>
          {modeSheet && (
            <ModeSheet
              currentMode={mode}
              currentTable={table}
              onClose={() => setModeSheet(false)}
              onChoose={(m) => {
                if (m === "mesa") {
                  setModeSheet(false);
                  navigate({ to: "/app/qr" });
                } else {
                  setMode(m);
                  setTable(null);
                  setModeSheet(false);
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ExtrasSheet({
  product,
  table,
  onClose,
  onAdd,
}: {
  product: { id: string; name: string; price: number; emoji: string; meta: string };
  table: number | null;
  onClose: () => void;
  onAdd: () => void;
}) {
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(0); // 0 single, 1 duplo +3.50, 2 triplo +5
  const [extras, setExtras] = useState<string[]>(["Maionese de alho"]);
  const addToCart = useAppStore((s) => s.addToCart);

  const sizes = [
    { name: "Single", extra: 0 },
    { name: "Duplo", extra: 3.5 },
    { name: "Triplo", extra: 5 },
  ];
  const extraItems = [
    { name: "Maionese de alho", price: 0 },
    { name: "Ketchup picante", price: 0 },
    { name: "Molho da casa", price: 0.8 },
  ];
  const extrasTotal = extras.reduce(
    (s, e) => s + (extraItems.find((x) => x.name === e)?.price ?? 0),
    0,
  );
  const unit = product.price + sizes[size].extra + extrasTotal;
  const total = unit * qty;

  const toggleExtra = (n: string) =>
    setExtras((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));

  const submit = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      meta: `${sizes[size].name.toLowerCase()}${extras.length ? " · " + extras.join(", ") : ""}`,
      price: unit,
      qty,
      emoji: product.emoji,
    });
    onAdd();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.4 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) onClose();
        }}
        className="absolute left-0 right-0 bottom-0 bg-white border-t-[2.5px] border-ink rounded-t-[24px] shadow-[0_-4px_0_var(--ink)] p-4 z-50 max-h-[85%] overflow-y-auto scrollbar-hide"
      >
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 bg-ink rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <div className="img-ph soft w-12 h-12 rounded-full flex items-center justify-center text-2xl">
            {product.emoji}
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm">{product.name}</div>
            <div className="font-hand text-accent">{product.price.toFixed(2).replace(".", ",")} € · base</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="qty-btn">−</button>
            <span className="w-5 text-center font-bold">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="qty-btn accent">+</button>
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-wider text-bad font-bold mt-4">★ Tamanho · obrigatório</div>
        <div className="flex gap-2 mt-2">
          {sizes.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setSize(i)}
              className={`pill-chip flex-1 justify-center !text-[10px] ${
                i === size ? "bg-ink text-white" : ""
              }`}
            >
              {s.name}{s.extra > 0 ? ` +${s.extra.toFixed(2).replace(".", ",")}€` : ""}
            </button>
          ))}
        </div>

        <div className="text-[10px] uppercase tracking-wider text-ink/60 font-bold mt-4">
          Molhos · até 2 grátis
        </div>
        <div className="space-y-1 mt-1">
          {extraItems.map((e) => {
            const on = extras.includes(e.name);
            return (
              <div key={e.name} className="flex items-center gap-2 py-1.5 border-b border-ink/10">
                <div className="flex-1 text-sm font-semibold">{e.name}</div>
                <div className="text-xs text-ink/60">
                  {e.price === 0 ? "grátis" : `+${e.price.toFixed(2).replace(".", ",")}€`}
                </div>
                <button
                  onClick={() => toggleExtra(e.name)}
                  className={`qty-btn ${on ? "ink" : "accent"}`}
                >
                  {on ? "×" : "+"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-ok mt-3">+ ganhas ~{(total * 0.02).toFixed(2).replace(".", ",")} € em créditos</div>

        <div className="mt-4">
          <button onClick={submit} className="cta accent">
            {table ? `Adicionar à mesa — ${total.toFixed(2).replace(".", ",")} €` : `Adicionar — ${total.toFixed(2).replace(".", ",")} €`}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function ModeSheet({
  currentMode,
  currentTable,
  onClose,
  onChoose,
}: {
  currentMode: "entrega" | "recolha" | "mesa";
  currentTable: number | null;
  onClose: () => void;
  onChoose: (m: "entrega" | "recolha" | "mesa") => void;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="absolute left-0 right-0 bottom-0 bg-white border-t-[2.5px] border-ink rounded-t-[24px] shadow-[0_-4px_0_var(--ink)] p-4 z-50"
      >
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 bg-ink rounded-full" />
        </div>
        <div className="text-lg font-bold text-center">Como queres receber?</div>
        <div className="text-xs text-ink/60 text-center mt-1">Podes mudar mais tarde no checkout.</div>
        <div className="space-y-3 mt-4">
          {[
            { m: "entrega" as const, e: "🛵", t: "Entrega ao domicílio", s: "~25 min · 1,99 € de taxa" },
            { m: "recolha" as const, e: "🏪", t: "Recolha no balcão", s: "~20 min · sem taxa" },
            { m: "mesa" as const, e: "📷", t: "Comer aqui · ler QR", s: "Aponta o QR da mesa" },
          ].map((o) => {
            const active =
              (o.m === "mesa" && currentTable) ||
              (o.m !== "mesa" && currentMode === o.m && !currentTable);
            return (
              <button
                key={o.m}
                onClick={() => onChoose(o.m)}
                className={`w-full rounded-xl border-2 border-ink p-3 flex items-center gap-3 ${
                  active ? "bg-accent-soft" : "bg-white"
                }`}
              >
                <div className="text-2xl">{o.e}</div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-sm">{o.t}</div>
                  <div className="text-[11px] text-ink/70">{o.s}</div>
                </div>
                {active && <span className="pill-chip text-[9px] bg-ok text-white">Atual</span>}
              </button>
            );
          })}
        </div>
        <Link to="/app/cart" className="text-xs text-center text-ink/50 block mt-4">Ver carrinho ›</Link>
      </motion.div>
    </>
  );
}
