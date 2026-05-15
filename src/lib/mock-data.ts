export type Category = {
  id: string;
  name: string;
  count: number;
};

export type Product = {
  id: string;
  name: string;
  meta: string;
  price: number;
  category: string;
  emoji: string;
  unavailable?: boolean;
};

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  meta: string;
  price: number;
  qty: number;
  who?: string; // for table mode
  emoji: string;
};

export type OrderStatus =
  | "novo"
  | "preparando"
  | "pronto"
  | "entregue"
  | "cancelado";

export type Order = {
  id: string;
  shortCode: string;
  mode: "entrega" | "recolha" | "mesa";
  table?: number;
  customerName: string;
  customerPhone?: string;
  address?: string;
  items: CartItem[];
  total: number;
  createdAt: number;
  status: OrderStatus;
  paymentMethod: "mbway" | "cartao" | "balcao";
};

export const CATEGORIES: Category[] = [
  { id: "menus", name: "Menus combo", count: 6 },
  { id: "burgers", name: "Hambúrgueres", count: 12 },
  { id: "principais", name: "Pratos principais", count: 8 },
  { id: "acomp", name: "Acompanhamentos", count: 5 },
  { id: "bebidas", name: "Bebidas", count: 14 },
  { id: "sobremesas", name: "Sobremesas", count: 7 },
];

export const PRODUCTS: Product[] = [
  // Hambúrgueres
  { id: "p1", name: "Burger Smash", meta: "200g · pão brioche · pickles", price: 9.5, category: "burgers", emoji: "🍔" },
  { id: "p2", name: "Cheese Lover", meta: "180g · cheddar · cebola caramelizada", price: 10.5, category: "burgers", emoji: "🧀" },
  { id: "p3", name: "BBQ Bacon", meta: "200g · bacon estaladiço · molho BBQ", price: 11.0, category: "burgers", emoji: "🥓" },
  { id: "p4", name: "Veggie Garden", meta: "burger de grão · rúcula · tomate", price: 9.0, category: "burgers", emoji: "🥬", unavailable: true },
  // Menus
  { id: "p5", name: "Menu Smash", meta: "burger + batatas + bebida", price: 13.5, category: "menus", emoji: "🍟" },
  { id: "p6", name: "Menu Família", meta: "4 burgers + 2 batatas + 4 bebidas", price: 38.0, category: "menus", emoji: "👨‍👩‍👧" },
  // Principais
  { id: "p7", name: "Bitoque do Chef", meta: "vaca · ovo estrelado · arroz", price: 12.5, category: "principais", emoji: "🍳" },
  { id: "p8", name: "Bacalhau à Brás", meta: "tradicional · 350g", price: 13.9, category: "principais", emoji: "🐟" },
  // Acomp
  { id: "p9", name: "Batatas rústicas", meta: "com pele · molho da casa", price: 3.5, category: "acomp", emoji: "🥔" },
  { id: "p10", name: "Salada Cesar", meta: "frango · parmesão · croutons", price: 7.5, category: "acomp", emoji: "🥗" },
  // Bebidas
  { id: "p11", name: "Coca-Cola 33cl", meta: "lata · gelada", price: 2.2, category: "bebidas", emoji: "🥤" },
  { id: "p12", name: "Sumo natural laranja", meta: "300ml · feito na hora", price: 3.0, category: "bebidas", emoji: "🍊" },
  { id: "p13", name: "Cerveja Super Bock", meta: "33cl · bem fresca", price: 2.5, category: "bebidas", emoji: "🍺" },
  // Sobremesas
  { id: "p14", name: "Brownie + gelado", meta: "chocolate quente · baunilha", price: 5.5, category: "sobremesas", emoji: "🍫" },
  { id: "p15", name: "Pastel de nata", meta: "tradicional · canela", price: 1.5, category: "sobremesas", emoji: "🥮" },
];

export const RESTAURANT = {
  name: "Pizzaria do Bairro",
  address: "Av. da Liberdade, 144 · Lisboa",
  open: true,
  closeAt: "23:00",
  reopenAt: "18:00",
  zone: "Lisboa centro",
  deliveryFee: 1.99,
  minOrder: 8,
};

export const TABLES = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  active: i + 1 <= 8,
  occupied: [3, 5, 7].includes(i + 1),
}));

export const SEED_ORDERS: Order[] = [
  {
    id: "o-101",
    shortCode: "A23",
    mode: "entrega",
    customerName: "Marta S.",
    customerPhone: "+351 912 345 678",
    address: "R. das Flores, 23, 2D",
    items: [
      { id: "ci-1", productId: "p1", name: "Burger Smash", meta: "duplo", price: 12.5, qty: 1, emoji: "🍔" },
      { id: "ci-2", productId: "p11", name: "Coca-Cola 33cl", meta: "sem gelo", price: 2.2, qty: 1, emoji: "🥤" },
    ],
    total: 14.7 + 1.99,
    createdAt: Date.now() - 6 * 60 * 1000,
    status: "preparando",
    paymentMethod: "mbway",
  },
  {
    id: "o-102",
    shortCode: "B71",
    mode: "mesa",
    table: 5,
    customerName: "Mesa 5",
    items: [
      { id: "ci-3", productId: "p7", name: "Bitoque do Chef", meta: "mal-passado", price: 12.5, qty: 2, emoji: "🍳" },
      { id: "ci-4", productId: "p13", name: "Cerveja Super Bock", meta: "", price: 2.5, qty: 2, emoji: "🍺" },
    ],
    total: 30.0,
    createdAt: Date.now() - 11 * 60 * 1000,
    status: "novo",
    paymentMethod: "balcao",
  },
  {
    id: "o-103",
    shortCode: "C09",
    mode: "recolha",
    customerName: "Tiago F.",
    customerPhone: "+351 933 222 111",
    items: [
      { id: "ci-5", productId: "p5", name: "Menu Smash", meta: "extra batatas", price: 13.5, qty: 1, emoji: "🍟" },
    ],
    total: 13.5,
    createdAt: Date.now() - 18 * 60 * 1000,
    status: "pronto",
    paymentMethod: "mbway",
  },
];

export const HISTORY = [
  { id: "h1", date: "Há 2 dias", title: "Burger Smash + Coca", total: 11.7, status: "Entregue" },
  { id: "h2", date: "Semana passada", title: "Menu Família", total: 38.0, status: "Entregue" },
  { id: "h3", date: "Há 3 semanas", title: "Bacalhau à Brás", total: 13.9, status: "Entregue" },
];

export const NOTIFICATIONS = [
  { id: "n1", icon: "🛵", title: "O teu pedido saiu!", sub: "Marco vai a caminho · 12 min", time: "agora" },
  { id: "n2", icon: "💰", title: "Ganhaste 0,40 € em créditos", sub: "Por causa do último pedido", time: "ontem" },
  { id: "n3", icon: "🍕", title: "Nova promoção: 2x1 às 3ªf", sub: "Burgers + bebidas", time: "Há 3 dias" },
];
