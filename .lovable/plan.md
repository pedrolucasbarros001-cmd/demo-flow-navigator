
# comaqui — App demo navegável

App de demonstração para usar em prospeções, fiel ao wireframe v2 que enviaste. Tudo client-side (sem backend, sem base de dados) — todos os fluxos e botões são funcionais para navegação e simulação.

## Identidade

- **Nome:** comaqui
- **Tagline:** "pede onde estiveres — entrega, recolha ou mesa"
- **Estética (do wireframe):** paper neo-brutalist
  - Cores: ink `#1a1a1a`, paper `#f4f1ea`, accent rosa `#ff5a7a`, accent-soft `#ffd5de`, ok `#2aaa6e`, warn `#f0a020`
  - Bordas pretas 2-2.5px, sombras sólidas (offset 4-6px sem blur)
  - Tipografia: **Space Grotesk** (UI) + **Caveat** (anotações handwritten)
  - Componentes: chips pill, iconbtns redondos, tabbar de 4 dots, dropdown pill, sheet "puxa para cima"

## Estrutura — 3 produtos, 3 áreas

### 1. App Cliente (mobile, "phone frame" 360×740)
Acessível em `/`. Navegação dentro de uma moldura phone que vive no centro do ecrã, com botão "Ver Admin" / "Ver Cozinha" no rodapé desktop.

**Fluxo:**
1. Splash → Onboarding (3 slides: menu / modos entrega-recolha-QR / créditos) → Login opcional (input telemóvel ou "Saltar")
2. **Home carrossel** (ecrã principal): pill header de categorias (Hambúrgueres, Pratos, Bebidas, Sobremesas), produto central grande, swipe horizontal entre produtos, dots, sheet "puxar p/ cima" para extras + quantidade, animação "arc-to-cart"
3. Estados da home: aberto/fechado (banner agendar), produto esgotado, modo Mesa (banner verde "Mesa 7"), dropdown de categorias
4. **Modo QR**: ecrã scanner (frame escuro) → confirmação "Mesa 7" → home em modo mesa
5. **Carrinho**: vazio / normal / mesa partilhada (com nomes "Marta/Tiago" e split)
6. **Checkout**: Entrega (com morada) / Recolha / com créditos aplicados / agendar / fora da zona
7. **Pagamento**: a aguardar MB WAY (spinner animado, 3s simulado) → confirmação ✓
8. **Tracking**: mapa estilizado + steps + código grande (modo recolha)
9. **Pós**: avaliação 5★ → histórico, carteira/créditos, notificações, perfil

**Tabbar (4 abas):** Menu · Carteira · Histórico · Conta

### 2. Admin Restaurante (desktop, sidebar + content)
Acessível em `/admin`. Layout 1140×680 ish.
- **Hoje · Dashboard:** KPIs (pedidos, receita, ticket médio, mesas ocupadas) + gráfico simples
- **Pedidos · Kanban:** colunas Novo / A preparar / Pronto / Entregue, drag visual (clique avança)
- **Detalhe de pedido:** itens, cliente, timeline, botões de estado
- **Menu & disponibilidade:** lista de pratos, toggle disponível, edit
- **Mesas & QR:** grelha de mesas, gerar QR (mostra QR estilizado)
- **Clientes:** tabela com nível, pedidos, créditos
- **Créditos & promoções:** regras configuráveis
- **Relatórios** + **Definições**

### 3. KDS Cozinha (desktop tablet, 3 colunas)
Acessível em `/kds`. Vista cheia, alto contraste.
- 3 colunas: A receber / Em preparação / Pronto
- Cartões com: nº pedido, mesa/entrega, itens com modificadores, timer (incrementa em real-time), botões avançar/atrás
- Anatomia de cartão usada: header colorido, lista, footer com tempo

## Interatividade simulada (sem backend)

Tudo em React state via Zustand store global (`useAppStore`):
- Carrinho persistido em sessão (zustand persist → sessionStorage)
- Modo (entrega/recolha/mesa) persistido
- Créditos do utilizador (começa em 2,40€, aumenta após pedido)
- Histórico mock de pedidos
- Pedidos do KDS/Admin pré-populados + qualquer novo pedido do cliente aparece lá
- Timers reais (setInterval) para tracking e KDS
- "MB WAY" simula 3s de espera depois confirma

## Animações

- Framer Motion para transições entre ecrãs (slide horizontal nos onboardings, fade-up nos sheets, scale nos botões)
- "Arc to cart": item voa em curva até ao ícone do carrinho
- Sheet de extras: drag handle com gesto de subir (ou tap)
- Carrossel produtos: swipe horizontal com snap
- KDS: pulse no cartão novo
- Splash: fade auto-redirect 1.5s

## Rotas (TanStack Start)

```
/                          → Demo launcher (escolher produto: Cliente/Admin/KDS)
/app                       → Cliente — Splash
/app/onboarding            → 3 slides
/app/login                 → Login opcional
/app/home                  → Home carrossel
/app/qr                    → Scanner
/app/qr/confirm            → Confirmar mesa
/app/cart                  → Carrinho
/app/checkout              → Checkout
/app/pay                   → MB WAY
/app/tracking              → Acompanhamento
/app/rate                  → Avaliação
/app/wallet                → Créditos
/app/history               → Histórico
/app/account               → Perfil
/app/notifications         → Notificações
/admin                     → Dashboard
/admin/orders              → Kanban
/admin/orders/$id          → Detalhe
/admin/menu                → Menu
/admin/tables              → Mesas/QR
/admin/customers           → Clientes
/admin/promos              → Promoções
/admin/reports             → Relatórios
/admin/settings            → Definições
/kds                       → Cozinha
```

## Detalhes técnicos

- **Stack:** TanStack Start (já configurado), TailwindCSS v4, Framer Motion, Zustand, lucide-react para alguns ícones (mas mantendo emojis do wireframe)
- **Tokens em `src/styles.css`:** adiciono variáveis `--paper`, `--ink`, `--accent`, `--accent-soft`, `--ok`, `--warn`, `--bad` em oklch + classes utilitárias `.paper-card`, `.brutal-shadow`, `.brutal-border`, `.handwritten`
- **Mock data:** `src/lib/mock-data.ts` com produtos, categorias, mesas, pedidos seed
- **Estado:** `src/store/app-store.ts` (cliente) e `src/store/ops-store.ts` (admin/kds, partilhado)
- **Sem auth real, sem chamadas server**

## Aviso de scope

São **~30 ecrãs** distintos. Vou construir tudo em paralelo numa única passagem. Cada ecrã será fiel ao wireframe (composição, ordem de elementos, copy em PT-PT, banners contextuais), mas com refinamento visual: cantos suavizados onde faz sentido, hover states, transições. O launcher inicial (`/`) explica o produto e dá entrada nos 3 modos para que possas demonstrar facilmente.

Pronto para implementar quando aprovares.
