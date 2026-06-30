# Plano — Repaginação visual do comaqui

Manter toda a estrutura, rotas e funcionalidades já construídas (App Cliente, Admin, KDS, store em sessionStorage, fluxos de pedido, MB WAY simulado, tracking, kanban, timers). **Só muda a camada visual.**

## Nova identidade

**Paleta** (verde opaco, sem saturação alta):
- `--sage` (verde principal, opaco/sálvia): `#6b8a6b` aprox.
- `--sage-deep` (hover/acentos): `#4f6b52`
- `--beige` (fundo papel): `#f1ece1`
- `--beige-2` (cartões/superfícies): `#e7e0d0`
- `--white`: `#ffffff` (cartões principais, campos)
- `--ink`: `#111111` (tipografia tradicional, preta)
- Estados: `--ok` verde-sálvia, `--warn` mostarda suave `#b58a3a`, `--bad` terracota suave `#a14a3a`

**Tipografia tradicional preta**:
- Headings: **Playfair Display** (serif clássica) — títulos, números KPI, preços
- Corpo/UI: **Inter** (sans neutra, preta) — labels, botões, tabelas
- Remover Caveat (handwritten) e Space Grotesk
- Tudo em `--ink` preto, sem rosa nem acentos manuscritos

**Estilo geral**:
- Sair do neo-brutalist agressivo (bordas 2.5px + sombras sólidas grandes)
- Ir para um visual **calmo, editorial, tipo café/bistro**: bordas finas 1px em `--ink`/transparente, sombras suaves (`0 1px 2px rgba(0,0,0,.06)`), cantos `10–14px`
- Botão primário: fundo `--sage`, texto branco, hover `--sage-deep`
- Botão secundário: branco com borda fina preta
- Chips/pills: bege com texto preto, sem maiúsculas forçadas
- Frame do telemóvel mais sóbrio: borda 1.5px preta, sombra suave (não sombra sólida deslocada)

## O que muda em código

1. **`src/styles.css`** — reescrever tokens e utilitárias:
   - Substituir paleta (`--paper`, `--ink`, `--accent`, `--accent-soft`, `--ok`, etc.) pelos valores acima
   - Trocar `--font-sans` para Inter, adicionar `--font-display` Playfair, remover `--font-hand`
   - Refazer `.brutal-card`, `.brutal-shadow*`, `.cta`, `.pill-chip`, `.iconbtn`, `.phone-frame`, `.phone-tabbar`, `.banner`, `.field`, `.qty-btn` com bordas finas + sombras suaves + paleta nova
   - Manter mesmos nomes de classes para não tocar nos componentes

2. **`src/routes/__root.tsx`** — trocar `<link>` Google Fonts: Playfair Display + Inter (remover Caveat + Space Grotesk)

3. **Substituições pontuais nos componentes** (busca/substituição):
   - `font-hand` → remover (vira `font-display` italic onde fazia sentido como assinatura, ou simplesmente removido)
   - Tons hard-coded `bg-accent`/`text-accent` mantêm-se (agora viram verde-sálvia via token), mas reviso telas-chave para garantir contraste: `index.tsx` (launcher), `app/home.tsx`, `app/onboarding.tsx`, `app/login.tsx`, `admin/index.tsx`, `kds/index.tsx`
   - Logo "c" do launcher e do AdminShell: bolinha sálvia com "c" branco em Playfair

4. **Nenhuma mudança** em: store, rotas, fluxos, mock-data, lógica de carrinho/checkout/tracking/kanban/KDS.

## Resultado visual

Aparência de menu de bistro/café moderno — verde-sálvia opaco, papel bege quente, cartões brancos, texto preto sério em serifa para títulos e sans neutra para UI. Calmo, profissional, "comida de verdade", sem energia pop/brutalist.

## Validação

Após implementar, abro Playwright e capturo screenshots de: launcher `/`, `/app/home`, `/app/checkout`, `/admin`, `/admin/orders`, `/kds` — confirmo paleta aplicada em todas e que nada quebrou.
