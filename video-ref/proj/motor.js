// motor.js v3: motion de venda, sério e limpo. Horizontal 1920 x 1200 (16:10, tela do MacBook 16").
// Fundo preto, cereja de destaque, branco às vezes. As palavras entram no tempo da fala, com calma.
// Um relógio só: render(t) desenha o quadro inteiro a partir de t. Sem Math.random, Date.now ou timers.
(function () {
const S = STUDIO, W = 1920, H = 1200;
const R = window.ROTEIRO, T = window.TEMPOS, P = window.PALAVRAS;
const BR = '#EDEAE4', CINZA = '#8C8781', PUB = '#9A958F', CER = '#C8102E', CER2 = '#E0274A';
const seg = (t, a, d, e) => S.seg(t, a, d, e), mix = S.mix;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const vis = (t, a, d = 0.12) => (t >= a ? clamp((t - a) / d, 0, 1) : 0);
const NS = 'http://www.w3.org/2000/svg';
const $ = id => document.getElementById(id);
const palco = $('palco'), lousa = $('lousa'), brilho = $('brilho');

// palavras de ligação ficam mais leves e em cinza (hierarquia sem gritar)
const CURTAS = new Set('E O A OS AS DE DO DA DOS DAS UM UMA QUE PRA PARA POR NO NA NOS NAS SE EM À AO TE EU ELE ELA É SÓ SEU SUA SEUS MAS COM SEM NÃO TU ISSO ESSE ESSA VOCÊ ONDE NÉ'.split(' '));
const chave = s => s.toUpperCase().replace(/[,.:?!“”"]/g, '');

// ------------------------------------------------------------------ telas de texto
let gw = 0;
const telas = R.map((b, i) => {
  const [, txt, op = {}] = b;
  const rng = S.rng(1000 + i);
  const lous = !!op.fx && op.fx !== 'final';
  const el = document.createElement('div'); el.className = 'tela abs';
  const bloco = document.createElement('div'); bloco.className = 'bloco'; el.appendChild(bloco);
  const linhas = [], palavras = [];
  txt.split('|').forEach((ln, li) => {
    const l = document.createElement('div'); l.className = 'l';
    const inner = document.createElement('span'); l.appendChild(inner);
    const ws = ln.trim().split(/\s+/);
    let temSoco = false, temForte = false;
    ws.forEach((raw, wi) => {
      const mk = raw.match(/^([*^!_]*)/)[1];
      const orig = (P[gw] || raw.replace(/^[*^!_]+/, '')).replace(/[“”"]/g, '');
      const s = document.createElement('span'); s.className = 'w';
      if (/^TATTOOBRAND/.test(orig)) s.innerHTML = `TATTOO<span class="b2">BRAND</span>${orig.slice(11)}`;
      else s.textContent = orig;
      const soco = mk.includes('!'), dest = mk.includes('*'), forte = mk.includes('^');
      if (dest) s.classList.add('dest');
      if (forte) s.classList.add('forte');
      if (soco) { s.classList.add('soco'); const u = document.createElement('i'); u.className = 'sub'; s.appendChild(u); }
      if (!mk && ws.length > 1 && CURTAS.has(chave(orig))) s.classList.add('leve');
      if (wi < ws.length - 1) s.style.marginRight = '0.24em';
      temSoco = temSoco || soco; temForte = temForte || dest || forte;
      inner.appendChild(s);
      palavras.push({ el: s, t: T[gw], li, soco, dest, sub: s.querySelector('.sub'), g: gw });
      gw++;
    });
    bloco.appendChild(l); linhas.push({ el: l, inner, soco: temSoco, forte: temForte });
  });
  if (!op.oculto) palco.appendChild(el);
  const socoTela = palavras.some(p => p.soco);
  if (socoTela && !lous) el.classList.add('alto');
  const al = lous ? 'l' : op.al || (socoTela ? 'c' : (i % 4 === 3 ? 'c' : 'l'));
  return { i, op, el, bloco, linhas, palavras, al, lous, rng, mov: Math.floor(rng() * 4), dir: rng() < 0.5 ? -1 : 1,
    ini: i === 0 ? 0 : palavras[0].t - 0.08 };
});
const DUR = S.D;
telas.forEach((tl, i) => { tl.fim = i < telas.length - 1 ? telas[i + 1].ini : DUR; });

let medido = null;
function mede() {
  const pronto = document.fonts && document.fonts.status === 'loaded';
  if (medido === pronto) return; medido = pronto;
  telas.forEach(tl => {
    if (tl.op.oculto) return;
    tl.el.style.display = 'block'; tl.el.style.transform = 'none';
    const fin = tl.op.fx === 'final';
    const larg = tl.lous ? 720 : 1560;
    tl.linhas.forEach(l => {
      l.el.style.fontSize = '100px';
      const nat = l.inner.getBoundingClientRect().width || 1;
      const cap = fin ? 320 : tl.lous ? (l.soco ? 140 : l.forte ? 124 : 108) : (l.soco ? 260 : l.forte ? 200 : 168);
      l.el.style.fontSize = Math.min(cap, 100 * larg / nat) + 'px';
      l.el.style.textAlign = tl.al === 'c' ? 'center' : 'left';
    });
    const r = tl.bloco.getBoundingClientRect();
    const x = tl.lous ? 130 : tl.al === 'c' ? (W - r.width) / 2 : 180;
    const y = H * 0.5 - r.height / 2 - 10;
    tl.bloco.style.left = x + 'px'; tl.bloco.style.top = y + 'px';
    tl.bloco.style.textAlign = tl.al === 'c' ? 'center' : 'left';
    tl.cx = x + r.width / 2; tl.cy = y + r.height / 2;
    tl.el.style.display = 'none';
  });
}

// ------------------------------------------------------------------ lousa: o traço do seu quadro, em branco sobre o preto
const rc = rough.svg(lousa);
const defs = document.createElementNS(NS, 'defs'); lousa.appendChild(defs);
const sym = document.createElementNS(NS, 'symbol'); sym.id = 'gente'; sym.setAttribute('viewBox', '0 0 20 44');
sym.innerHTML = '<circle cx="10" cy="5" r="4.6"/><path d="M4.6 11.2 H15.4 Q17.4 11.2 17.6 13.4 L18.6 24.2 Q18.7 25.6 17.3 25.6 Q16.2 25.6 16 24.4 L15 16.6 V42 Q15 43.6 13.4 43.6 Q11.8 43.6 11.8 42 V28.6 H8.2 V42 Q8.2 43.6 6.6 43.6 Q5 43.6 5 42 V16.6 L4 24.4 Q3.8 25.6 2.7 25.6 Q1.3 25.6 1.4 24.2 L2.4 13.4 Q2.6 11.2 4.6 11.2 Z"/>';
defs.appendChild(sym);
function el(tag, at, pai) { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (pai || lousa).appendChild(e); return e; }
function texto(pai, s, at) { const e = el('text', Object.assign({ 'text-anchor': 'middle' }, at), pai); e.textContent = s; return e; }
let semente = 1;
const O = o => Object.assign({ seed: semente++, roughness: 1.2, bowing: 1.1, stroke: BR, strokeWidth: 3.4 }, o);
function traco(g) {
  const ps = [...g.querySelectorAll('path')].map(p => { const L = p.getTotalLength() || 1; p.setAttribute('stroke-dasharray', `${L} ${L}`); p.setAttribute('stroke-dashoffset', L); return { p, L }; });
  const tot = ps.reduce((a, b) => a + b.L, 0) || 1;
  return { g, desenha(q) { let r = q * tot; ps.forEach(o => { const v = clamp(r, 0, o.L); o.p.setAttribute('stroke-dashoffset', o.L - v); r -= o.L; }); } };
}
const grupo = pai => el('g', {}, pai);
const add = (pai, n) => { pai.appendChild(n); return n; };

function funil(pai, x, y, w, h) {
  const g = grupo(pai), ry = w * 0.13, bw = w * 0.2, yc = y + h * 0.64, yb = y + h, meia = f => mix(w / 2, bw / 2, f);
  add(g, rc.ellipse(x, y, w, ry * 2, O({ fill: BR, fillStyle: 'hachure', hachureGap: Math.max(5, w / 50), hachureAngle: -40, fillWeight: Math.max(1, w / 330) })));
  add(g, rc.line(x - w / 2, y, x - bw / 2, yc, O())); add(g, rc.line(x + w / 2, y, x + bw / 2, yc, O()));
  add(g, rc.line(x - bw / 2, yc, x - bw / 2 * 0.92, yb, O())); add(g, rc.line(x + bw / 2, yc, x + bw / 2 * 0.92, yb, O()));
  add(g, rc.arc(x, yb, bw * 0.92, bw * 0.28, 0, Math.PI, false, O({ strokeWidth: 2.8 })));
  const fr = [0.17, 0.32, 0.46, 0.585];
  fr.forEach((f, i) => {
    const hw = meia(f / 0.64), yy = y + h * f;
    add(g, rc.arc(x, yy, hw * 2, ry * 2 * hw / (w / 2), 0, Math.PI, false, O({ strokeWidth: 3 })));
    const yr = y + h * (f + (fr[i + 1] ? fr[i + 1] - f : 0.06) * 0.62) - 3, ww = hw * 0.95, pts = [], rr = S.rng(semente * 7), n = 11;
    for (let k = 0; k <= n; k++) pts.push([x - ww / 2 + ww * k / n + (rr() - 0.5) * 5, yr + (k % 2 ? -1 : 1) * (5 + rr() * 5) * Math.min(1, w / 400)]);
    add(g, rc.curve(pts, O({ strokeWidth: Math.max(1.8, w / 190), roughness: 1.5 })));
  });
  return { g, tr: traco(g) };
}
function seta(pai, x1, y1, x2, y2, sw = 2.8) {
  const g = grupo(pai), a = Math.atan2(y2 - y1, x2 - x1), L = 38;
  for (let k = 0; k < 4; k++) add(g, rc.line(x1 + k * 3, y1 + (k - 1.5) * 3, x2, y2, O({ strokeWidth: sw, roughness: 1.7 })));
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) add(g, rc.line(x2, y2, x2 - L * Math.cos(a + s * (0.45 + k * 0.06)), y2 - L * Math.sin(a + s * (0.45 + k * 0.06)), O({ strokeWidth: sw, roughness: 1.5 })));
  return traco(g);
}
function circulo(pai, cx, cy, d, o) { const g = grupo(pai); add(g, rc.ellipse(cx, cy, d, d * 0.96, O(Object.assign({ strokeWidth: 5, roughness: 1.4 }, o)))); return traco(g); }
function multidao(n, dentro, cx, dmin, seed) {
  const r = S.rng(seed), out = []; let tent = 0;
  while (out.length < n && tent++ < n * 400) {
    const x = mix(cx[0], cx[2], r()), y = mix(cx[1], cx[3], r());
    if (!dentro(x, y) || out.some(p => Math.hypot(p.x - x, p.y - y) < dmin)) continue;
    out.push({ x, y, d: r(), r: r() });
  }
  return out.sort((a, b) => a.y - b.y);
}
function boneco(pai, x, y, alt, cor) {
  const u = el('use', { href: '#gente', width: alt * 20 / 44, height: alt, x: -alt * 10 / 44, y: -alt, fill: cor }, pai);
  return { x, y, pos(px, py, s = 1, op = 1, c) { u.setAttribute('transform', `translate(${px},${py}) scale(${s})`); u.setAttribute('opacity', op); if (c) u.setAttribute('fill', c); } };
}
const rotulo = (pai, s, x, y, fs = 30, extra) => texto(pai, s, Object.assign({ x, y, class: 'rotulo', 'font-size': fs * 1.15, fill: '#B3ADA6' }, extra));
function cena(nome, idx) { const bs = idx.map(i => telas[i]); return { nome, bs, ini: bs[0].ini, fim: bs[bs.length - 1].fim, w: (k, j) => bs[k].palavras[j < 0 ? bs[k].palavras.length + j : j].t }; }
const pousa = (t, a, d = 0.5) => seg(t, a, d, 'power3.out');
const FX = {};

// área da ilustração: metade direita (o texto fica à esquerda)
FX.funilmorto = sc => {
  const g = grupo(), f = funil(g, 1370, 330, 520, 620);
  const gente = multidao(44, () => true, [1150, 140, 1590, 318], 28, 3).map(p => ({ p, b: boneco(g, p.x, p.y, 48, PUB) }));
  const sai = boneco(g, 1370, 1080, 62, CER2);
  return t => {
    f.tr.desenha(seg(t, sc.ini + 0.05, 1.3, 'power2.inOut'));
    gente.forEach(({ p, b }) => { const a = sc.ini + 0.6 + p.d * 1.2; b.pos(p.x, mix(p.y - 60, p.y, pousa(t, a, 0.6)), 1, vis(t, a, 0.3)); });
    const a = sc.w(1, -1); sai.pos(1370, mix(1030, 1080, pousa(t, a, 0.6)), 1, vis(t, a, 0.3));
  };
};
FX.funis = sc => {
  const g = grupo(), itens = [['Indicação', 0, 0], ['Anúncio', 0, 1], ['Promoção', 0, 2], ['Site', 0, 3], ['Formulário', 1, 0], ['WhatsApp automático', 1, 1], ['Preço tabelado', 1, 3]];
  const pos = [[1010, 230], [1235, 230], [1460, 230], [1685, 230], [1120, 700], [1345, 700], [1570, 700]];
  const fs = itens.map((it, i) => {
    const [x, y] = pos[i], gg = grupo(g), f = funil(gg, x, y, 175, 210);
    const gente = multidao(8, () => true, [x - 70, y - 80, x + 70, y - 2], 22, 50 + i).map(p => ({ p, b: boneco(gg, p.x, p.y, 28, PUB) }));
    const sai = boneco(gg, x, y + 262, 32, CER2), lb = rotulo(gg, it[0], x, y + 318, it[0].length > 14 ? 26 : 30, { 'font-weight': 400 });
    return { f, gente, sai, lb };
  });
  return t => fs.forEach((o, i) => {
    const a = sc.w(itens[i][1], itens[i][2]);
    o.f.tr.desenha(seg(t, a - 0.05, 0.6, 'power2.out'));
    o.gente.forEach(({ p, b }) => { const aa = a + 0.2 + p.d * 0.4; b.pos(p.x, mix(p.y - 40, p.y, pousa(t, aa, 0.4)), 1, vis(t, aa, 0.2)); });
    o.lb.setAttribute('opacity', vis(t, a, 0.25));
    const ab = a + 0.8; o.sai.pos(o.sai.x, mix(o.sai.y - 26, o.sai.y, pousa(t, ab, 0.4)), 1, vis(t, ab, 0.2));
  });
};
FX.orcamento = sc => {
  const g = grupo(), xs = [1010, 1240, 1470, 1700];
  const fs = xs.map((x, i) => ({ f: funil(g, x, 230, 190, 300), gente: multidao(9, () => true, [x - 78, 130, x + 78, 226], 22, 80 + i).map(p => ({ p, b: boneco(g, p.x, p.y, 28, PUB) })) }));
  const cx = 980, cy = 760, cw = 760, ch = 220, caixa = grupo(g);
  const borda = traco(add(caixa, rc.rectangle(cx, cy, cw, ch, O({ strokeWidth: 4.5 }))));
  const tinta = traco(add(caixa, rc.rectangle(cx + 8, cy + 8, cw - 16, ch - 16, O({ stroke: 'none', fill: CER, fillStyle: 'hachure', hachureGap: 12, fillWeight: 3, hachureAngle: -35 }))));
  const lb = texto(caixa, 'Orçamento', { x: cx + cw / 2, y: cy + ch / 2 + 32, class: 'forte', 'font-size': 92, fill: BR, stroke: '#050505', 'stroke-width': 10, 'paint-order': 'stroke' });
  const caem = []; xs.forEach((x, i) => { for (let k = 0; k < 2; k++) caem.push({ b: boneco(g, x, 600, 34, CER2), x, alvo: [cx + 90 + (i * 2 + k) * 82, cy + ch - 26] }); });
  return t => {
    fs.forEach((o, i) => { o.f.tr.desenha(seg(t, sc.ini + i * 0.15, 0.9, 'power2.out')); o.gente.forEach(({ p, b }) => { const a = sc.ini + 0.4 + i * 0.1 + p.d * 0.5; b.pos(p.x, mix(p.y - 40, p.y, pousa(t, a, 0.4)), 1, vis(t, a, 0.2)); }); });
    borda.desenha(seg(t, sc.w(0, -1), 0.8, 'power2.inOut'));
    const desce = sc.w(1, -1);
    caem.forEach((c, j) => { const a = sc.w(0, 2) + j * 0.06, vai = seg(t, desce + j * 0.05, 0.8, 'power2.inOut'); c.b.pos(mix(c.x, c.alvo[0], vai), mix(mix(560, 600, pousa(t, a, 0.4)), c.alvo[1], vai), 1, vis(t, a, 0.2)); });
    const ao = sc.w(2, 1); tinta.desenha(seg(t, ao - 0.05, 0.5, 'power2.out')); lb.setAttribute('opacity', vis(t, ao, 0.3));
  };
};
FX.pessoas = sc => {
  const g = grupo(), fig = [];
  for (let i = 0; i < 20; i++) fig.push(boneco(g, 1370 + ((i % 5) - 2) * 150, 330 + Math.floor(i / 5) * 230, 190, PUB));
  const fecham = new Set([1, 4, 7, 10, 13, 16, 18]);
  return t => {
    const a20 = sc.w(1, 2), a7 = sc.w(3, 1), a13 = sc.w(4, 2), aNao = sc.w(5, -1);
    fig.forEach((b, i) => {
      const a = a20 + i * 0.035; let cor = PUB, op = vis(t, a, 0.25);
      if (fecham.has(i) && t >= a7 + (i % 3) * 0.05) cor = CER2;
      if (!fecham.has(i)) { if (t >= a13) cor = BR; op *= 1 - 0.75 * seg(t, aNao, 0.7, 'power2.out'); }
      b.pos(b.x, mix(b.y + 20, b.y, pousa(t, a, 0.5)), 1, op, cor);
    });
  };
};
FX.gasto = sc => {
  const g = grupo(), f = funil(g, 1370, 400, 560, 560);
  const ondas = [0, 1, 2].map(k => multidao(42, () => true, [1120, 130, 1620, 392], 26, 200 + k).map(p => ({ p, b: boneco(g, p.x + (k - 1) * 8, p.y - k * 14, 46, PUB) })));
  const st = seta(g, 1720, 880, 1440, 990);
  const sai = [boneco(g, 1335, 1110, 60, CER2), boneco(g, 1405, 1116, 60, CER2)];
  return t => {
    f.tr.desenha(seg(t, sc.ini, 1.0, 'power2.inOut'));
    const quando = [sc.w(0, -1), sc.w(1, -1), sc.w(2, -1)];
    ondas.forEach((o, k) => o.forEach(({ p, b }) => { const a = quando[k] - 0.2 + p.d * 0.7; b.pos(p.x + (k - 1) * 8, mix(p.y - 120, p.y - k * 14, pousa(t, a, 0.6)), 1, vis(t, a, 0.25)); }));
    st.desenha(seg(t, sc.w(3, -1), 0.6, 'power2.out'));
    sai.forEach((b, i) => { const a = sc.w(4, 0) + i * 0.3; b.pos(b.x, mix(b.y - 50, b.y, pousa(t, a, 0.6)), 1, vis(t, a, 0.25)); });
  };
};
FX.sins = sc => {
  const g = grupo(), objs = ['anúncio', 'orçamento', 'preço', 'sinal', 'marcação'];
  const ls = objs.map((s, k) => {
    const y = 210 + k * 195, lg = grupo(g);
    const cx = traco(add(lg, rc.rectangle(560, y - 52, 104, 104, O({ strokeWidth: 4.5 }))));
    const ck = traco(add(lg, rc.linearPath([[580, y - 2], [604, y + 26], [652, y - 42]], O({ stroke: CER2, strokeWidth: 11, roughness: 0.9 }))));
    const sim = texto(lg, 'Sim', { x: 712, y: y + 34, class: 'forte', 'font-size': 100, fill: BR, 'text-anchor': 'start' });
    const pa = rotulo(lg, k === 4 ? 'para a' : 'para o', 945, y + 30, 46, { 'text-anchor': 'start' });
    const ob = texto(lg, s, { x: 1080, y: y + 34, class: 'forte', 'font-size': 100, fill: CER2, 'text-anchor': 'start' });
    return { cx, ck, sim, pa, ob };
  });
  return t => ls.forEach((o, k) => {
    const a = sc.w(k, 0), aP = sc.w(k, 1), aO = sc.w(k, 3);
    o.cx.desenha(seg(t, a - 0.1, 0.4, 'power2.out'));
    o.sim.setAttribute('opacity', vis(t, a, 0.2)); o.pa.setAttribute('opacity', vis(t, aP, 0.2));
    o.ob.setAttribute('opacity', vis(t, aO, 0.2)); o.ob.setAttribute('transform', `translate(${(1 - pousa(t, aO, 0.4)) * 24},0)`);
    o.ck.desenha(seg(t, aO, 0.35, 'power2.out'));
  });
};
FX.troca = sc => {
  const g = grupo(), f = funil(g, 1000, 250, 230, 300);
  const gf = multidao(12, () => true, [910, 150, 1090, 246], 22, 300).map(p => ({ p, b: boneco(g, p.x, p.y, 28, PUB) }));
  const lf = rotulo(g, 'Funil tradicional', 1000, 620, 34);
  const st = seta(g, 1110, 420, 1180, 520);
  const C = [1480, 600], D = 720, circ = circulo(g, C[0], C[1], D);
  const gm = multidao(170, (x, y) => Math.hypot(x - C[0], (y - 20) - C[1]) < D / 2 - 34, [C[0] - D / 2, C[1] - D / 2, C[0] + D / 2, C[1] + D / 2 + 24], 30, 301).map(p => ({ p, b: boneco(g, p.x, p.y, 34, PUB) }));
  const lm = rotulo(g, 'seu mundo (marca pessoal)', C[0], C[1] + D / 2 + 64, 36);
  const rg = grupo(g); add(rg, rc.line(870, 160, 1130, 600, O({ stroke: CER2, strokeWidth: 7 }))); add(rg, rc.line(1130, 160, 870, 600, O({ stroke: CER2, strokeWidth: 7 })));
  const rq = traco(rg);
  return t => {
    f.tr.desenha(seg(t, sc.ini, 0.9, 'power2.inOut'));
    gf.forEach(({ p, b }) => { const a = sc.ini + 0.4 + p.d * 0.5; b.pos(p.x, mix(p.y - 40, p.y, pousa(t, a, 0.4)), 1, vis(t, a, 0.2)); });
    lf.setAttribute('opacity', vis(t, sc.ini + 0.6, 0.3));
    st.desenha(seg(t, sc.w(1, -1), 0.5, 'power2.out'));
    const am = sc.w(2, 2); circ.desenha(seg(t, am - 0.15, 0.8, 'power2.inOut'));
    gm.forEach(({ p, b }) => { const a = am + 0.2 + p.d * 1.0; b.pos(p.x, p.y, 1, vis(t, a, 0.3)); });
    lm.setAttribute('opacity', vis(t, am + 0.6, 0.3));
    rq.desenha(seg(t, sc.w(3, -1), 0.5, 'power2.out'));
  };
};
function alvo(g, C, D, seed) {
  const circ = circulo(g, C[0], C[1], D), c2 = circulo(g, C[0], C[1], D * 0.56, { strokeWidth: 3.6 }), c3 = circulo(g, C[0], C[1], D * 0.3, { strokeWidth: 3.2 });
  const gente = multidao(240, (x, y) => Math.hypot(x - C[0], (y - 18) - C[1]) < D / 2 - 28, [C[0] - D / 2, C[1] - D / 2, C[0] + D / 2, C[1] + D / 2 + 24], 26, seed)
    .map(p => { const d = Math.hypot(p.x - C[0], p.y - 18 - C[1]); return { p, d, b: boneco(g, p.x, p.y, 30, PUB) }; })
    .filter(o => Math.abs(o.d - D * 0.28) > 15 && Math.abs(o.d - D * 0.15) > 13);
  return { circ, c2, c3, gente };
}
FX.zona = sc => {
  const g = grupo(), C = [1370, 640], D = 820, A = alvo(g, C, D, 400);
  const caixa = traco(add(grupo(g), rc.rectangle(910, 60, 920, 1090, O({ strokeWidth: 2.6, strokeLineDash: [16, 12], roughness: 0.7, stroke: CINZA }))));
  const l1 = rotulo(g, 'tattoobrand', 1370, 130, 40, { 'font-weight': 400 });
  const l2 = rotulo(g, '(marca pessoal projetada para fazer dinheiro)', 1370, 176, 30, { 'font-style': 'italic' });
  const cf = grupo(g);
  add(cf, rc.curve([[1785, 270], [1715, 252], [1694, 286], [1764, 316], [1785, 350], [1715, 364], [1684, 342]], O({ stroke: CER2, strokeWidth: 5 })));
  add(cf, rc.line(1726, 226, 1732, 404, O({ stroke: CER2, strokeWidth: 4.5 }))); add(cf, rc.line(1750, 222, 1756, 400, O({ stroke: CER2, strokeWidth: 4.5 })));
  const cft = traco(cf);
  return t => {
    A.circ.desenha(seg(t, sc.ini, 0.9, 'power2.inOut'));
    const aLar = sc.w(1, -1), aCen = sc.w(3, -1), aZ = sc.w(5, 0), aL = sc.w(5, 2);
    A.c2.desenha(seg(t, aLar - 0.2, 0.7, 'power2.inOut')); A.c3.desenha(seg(t, aCen - 0.2, 0.6, 'power2.inOut'));
    A.gente.forEach(({ p, d, b }) => {
      let cor = PUB; if (d < D * 0.28 && t >= aLar + p.r * 0.5) cor = BR; if (d < D * 0.15 && t >= aCen + p.r * 0.4) cor = CER2;
      b.pos(p.x, p.y, 1, vis(t, sc.ini + 0.2 + p.d * 0.9, 0.3), cor);
    });
    caixa.desenha(seg(t, aZ - 0.1, 0.7, 'power2.out'));
    l1.setAttribute('opacity', vis(t, aZ, 0.3)); l2.setAttribute('opacity', vis(t, aZ + 0.2, 0.3));
    cft.desenha(seg(t, aL, 0.6, 'power2.out'));
  };
};
FX.zona2 = sc => {
  const g = grupo(), C = [1370, 620], D = 820, A = alvo(g, C, D, 401);
  const eu = boneco(g, 0, 0, 56, PUB), marca = circulo(g, 0, 0, 96, { stroke: CER2, strokeWidth: 4 });
  return t => {
    A.circ.desenha(seg(t, sc.ini, 0.5)); A.c2.desenha(seg(t, sc.ini + 0.1, 0.5)); A.c3.desenha(seg(t, sc.ini + 0.2, 0.5));
    A.gente.forEach(({ p, d, b }) => b.pos(p.x, p.y, 1, vis(t, sc.ini + p.d * 0.4, 0.2), d < D * 0.15 ? CER2 : d < D * 0.28 ? BR : PUB));
    const a = sc.w(0, 1), q = seg(t, a, sc.w(1, -1) - a + 0.4, 'power2.inOut');
    const ang = -2.4 + q * 2.2, r = mix(D * 0.42, 0, q), x = C[0] + Math.cos(ang) * r, y = C[1] + 18 + Math.sin(ang) * r;
    eu.pos(x, y, 1, vis(t, sc.ini + 0.2, 0.2), q > 0.75 ? CER2 : q > 0.4 ? BR : PUB);
    marca.g.setAttribute('transform', `translate(${x},${y - 28})`); marca.desenha(seg(t, sc.ini + 0.3, 0.5));
  };
};
FX.teia = sc => {
  const g = grupo(), ga = grupo(g), gn = grupo(g);
  const N = { post: [1010, 240, 'Post'], cont: [1600, 240, 'Conteúdo'], dm: [1600, 560, 'DM'], ofe: [1310, 830, 'Oferta'], story: [990, 600, 'Story'], dest: [1000, 1090, 'Destaque'], link: [1640, 1090, 'Link na bio'] };
  const nos = {};
  for (const k in N) {
    const [x, y, s] = N[k], ng = grupo(gn), of = k === 'ofe', w = of ? 340 : Math.max(200, s.length * 26 + 80), h = of ? 150 : 104;
    const tr = traco(add(ng, rc.ellipse(x, y, w, h, O(of ? { fill: CER, fillStyle: 'hachure', hachureGap: 10, fillWeight: 3, strokeWidth: 4.5 } : { strokeWidth: 3.6 }))));
    const lb = texto(ng, s, { x, y: y + (of ? 24 : 16), class: 'forte', 'font-size': of ? 70 : 46, fill: BR, stroke: of ? '#050505' : 'none', 'stroke-width': of ? 8 : 0, 'paint-order': 'stroke' });
    nos[k] = { tr, lb };
  }
  const ar = [['post', 'cont'], ['cont', 'dm'], ['dm', 'ofe'], ['story', 'ofe'], ['dest', 'ofe'], ['link', 'ofe']].map(([a, b]) => {
    const [x1, y1] = N[a], [x2, y2] = N[b], d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d, c1 = 120, c2 = b === 'ofe' ? 140 : 100;
    const p1 = [x1 + ux * c1, y1 + uy * c1 * 0.6], p2 = [x2 - ux * c2, y2 - uy * c2 * 0.62];
    return { s: seta(ga, p1[0], p1[1], p2[0], p2[1], 2.8), p1, p2, dot: el('circle', { r: 9, fill: CER2 }, ga) };
  });
  const quando = { post: [0, 1], cont: [0, 5], dm: [1, 5], ofe: [3, 3], story: [5, 3], dest: [7, 3], link: [9, 3] };
  const qa = [[0, 2], [1, 2], [2, 2], [6, 2], [8, 1], [10, 1]];
  return t => {
    const fim = sc.w(10, -1);
    for (const k in nos) { const a = sc.w(...quando[k]); nos[k].tr.desenha(seg(t, a - 0.05, 0.45, 'power2.out')); nos[k].lb.setAttribute('opacity', vis(t, a, 0.25)); }
    ar.forEach((e, i) => {
      const a = sc.w(...qa[i]); e.s.desenha(seg(t, a, 0.5, 'power2.out'));
      const s1 = seg(t, a + 0.5, 0.6, 'power1.inOut'), s2 = seg(t, fim, 0.6, 'power1.inOut'), s = t >= fim ? s2 : s1;
      e.dot.setAttribute('cx', mix(e.p1[0], e.p2[0], s)); e.dot.setAttribute('cy', mix(e.p1[1], e.p2[1], s));
      e.dot.setAttribute('opacity', (t >= a + 0.5 && t < a + 1.1) || (t >= fim && t < fim + 0.6) ? 1 : 0);
    });
  };
};
FX.final = () => { grupo(); return () => {}; };

const cenas = []; telas.forEach((tl, i) => {
  const nome = tl.op.fx; if (!nome) return;
  const u = cenas[cenas.length - 1];
  if (u && u.nome === nome && u.idx[u.idx.length - 1] === i - 1) u.idx.push(i); else cenas.push({ nome, idx: [i] });
});
cenas.forEach(c => { const sc = cena(c.nome, c.idx); c.desenha = FX[c.nome](sc); c.g = lousa.lastChild; c.g.setAttribute('opacity', 0); c.sc = sc; c.idx.forEach(i => { telas[i].cena = c; }); });

// ------------------------------------------------------------------ quadro
let atual = null;
function acha(t) { let lo = 0, hi = telas.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (telas[m].ini <= t) lo = m; else hi = m - 1; } return telas[lo]; }

function render(t) {
  mede();
  const tl = acha(t);
  if (atual !== tl) {
    if (atual) atual.el.style.display = 'none';
    if (!tl.op.oculto) tl.el.style.display = 'block';
    cenas.forEach(c => c.g.setAttribute('opacity', c === tl.cena ? 1 : 0));
    atual = tl;
  }
  if (tl.cena) tl.cena.desenha(t);
  const dur = Math.max(0.6, tl.fim - tl.ini), dv = seg(t, tl.ini, dur, 'sine.inOut'), ce = seg(t, tl.ini, Math.min(dur, 1.6), 'power3.out');

  // luz de fundo: discreta, atrás do que importa
  const alto = tl.el.classList.contains('alto');
  const bx = tl.lous && tl.cena ? 1370 : (tl.cx || 960), by = tl.lous ? 620 : (tl.cy || 600);
  brilho.style.opacity = alto ? 1 : tl.lous ? 0.35 : 0.6;
  brilho.style.transform = `translate(${bx + tl.dir * 40 * (dv - 0.5)}px,${by}px) scale(${0.92 + 0.12 * dv})`;

  // câmera: aproximação lenta e um leve ângulo que assenta
  if (!tl.op.oculto) {
    let rx = 0, ry = 0, x = 0, s = 1 + 0.035 * dv;
    if (!tl.lous) {
      if (tl.mov === 1) ry = mix(tl.dir * 7, 0, ce);
      if (tl.mov === 2) rx = mix(6, 0, ce);
      if (tl.mov === 3) x = tl.dir * mix(-18, 18, dv);
    }
    tl.el.style.transformOrigin = `${tl.cx || 960}px ${tl.cy || 600}px`;
    tl.el.style.transform = `translateX(${x}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
  }
  if (tl.lous && tl.cena) {
    const sc = tl.cena.sc, q = seg(t, sc.ini, Math.min(2.4, sc.fim - sc.ini), 'power3.out'), d2 = seg(t, sc.ini, sc.fim - sc.ini, 'sine.inOut');
    lousa.style.transformOrigin = '1370px 620px';
    lousa.style.transform = `perspective(2600px) rotateX(${mix(7, 1.5, q)}deg) rotateY(${mix(-6, 2, d2)}deg) scale(${mix(0.97, 1.02, d2)})`;
  }

  // palavras: sobem saindo do borrão, sem pressa
  tl.palavras.forEach(p => {
    const a = p.t - 0.04;
    if (t < a) { p.el.style.opacity = 0; return; }
    if (p.soco) {
      const q = seg(t, a, 0.7, 'expo.out');
      p.el.style.opacity = seg(t, a, 0.3, 'power1.out');
      p.el.style.transform = `scale(${mix(1.1, 1, q)}) translateY(${(1 - q) * 18}px)`;
      p.el.style.filter = q > 0.97 ? 'none' : `blur(${(1 - q) * 14}px)`;
      if (p.sub) p.sub.style.transform = `scaleX(${seg(t, a + 0.12, 0.45, 'power3.inOut')})`;
    } else {
      const q = seg(t, a, 0.5, 'power3.out');
      p.el.style.opacity = seg(t, a, 0.28, 'power1.out');
      p.el.style.transform = `translateY(${(1 - q) * 26}px)`;
      p.el.style.filter = q > 0.97 ? 'none' : `blur(${(1 - q) * 9}px)`;
    }
  });
}

window.__render = render;
window.__timelines = window.__timelines || {};
window.__timelines.main = S.play(render, { loop: false });
})();
