// motor.js v5: texto e ilustrações do quadro, sem telas de app. Horizontal 1920 x 1200 (16:10, MacBook 16").
// Tipografia: grotesca forte e fechada + palavras de destaque escritas à mão em vermelho (como iPad com Pencil)
// + etiquetas em letra de máquina. Telas de app em cartões creme; ilustrações em traço de Pencil branco.
// Um relógio só: render(t) desenha o quadro inteiro a partir de t. Sem Math.random, Date.now ou timers.
(function () {
const S = STUDIO, W = 1920, H = 1200;
const R = window.ROTEIRO, T = window.TEMPOS, P = window.PALAVRAS;
const CREME = '#EFECE5', AZUL = '#2AA7E0', LAR = '#EFA24A', VERM = '#EB3B3B', CINZA = '#8D8983';
const seg = (t, a, d, e) => S.seg(t, a, d, e), mix = S.mix;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const vis = (t, a, d = 0.15) => (t >= a ? clamp((t - a) / d, 0, 1) : 0);
const NS = 'http://www.w3.org/2000/svg';
const $ = id => document.getElementById(id);
const palco = $('palco'), fundo = $('fundo'), eco = $('eco'), bokeh = $('bokeh'), lousa = $('lousa'), uiL = $('ui'), brilho = $('brilho'), rotulo = $('rotulo'), rotTx = rotulo.querySelector('.tx'), capitulo = $('capitulo');

const CURTAS = new Set('E O A OS AS DE DO DA DOS DAS UM UMA QUE PRA PARA POR NO NA NOS NAS SE EM À AO TE EU ELE ELA É SÓ SEU SUA SEUS MAS COM SEM NÃO TU ISSO ESSE ESSA VOCÊ ONDE NÉ'.split(' '));
const chave = s => s.toUpperCase().replace(/[,.:?!“”"]/g, '');
const UI_CENAS = new Set();
// capítulos do texto: etiqueta no canto
const CAPS = [[0, '01 / 03', 'o funil do orçamento'], [60, '02 / 03', 'tattoobrand'], [117, '03 / 03', 'profile funnel']];
const RISCO = '<svg class="risco" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M2 13 C 20 7, 48 15, 70 10 S 92 7, 98 9" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="100" fill="none" stroke="#EB3B3B" stroke-width="2.2" stroke-linecap="round"/></svg>';

// ------------------------------------------------------------------ telas de texto
let gw = 0;
const telas = R.map((b, i) => {
  const [bg0, txt, op = {}] = b;
  const rng = S.rng(1000 + i);
  const modo = op.fx === 'final' || !op.fx ? 'texto' : UI_CENAS.has(op.fx) ? 'ui' : 'lousa';
  const bg = bg0 === 'r' && !op.fx ? 'r' : 'k';
  const el = document.createElement('div'); el.className = 'tela abs ' + bg;
  const bloco = document.createElement('div'); bloco.className = 'bloco'; el.appendChild(bloco);
  const linhas = [], palavras = [];
  txt.split('|').forEach((ln, li) => {
    const l = document.createElement('div'); l.className = 'l';
    const inner = document.createElement('span'); l.appendChild(inner);
    const ws = ln.trim().split(/\s+/);
    let temMao = false;
    ws.forEach((raw, wi) => {
      const mk = raw.match(/^([*^!_]*)/)[1];
      const orig = (P[gw] || raw.replace(/^[*^!_]+/, '')).replace(/[“”"]/g, '');
      const s = document.createElement('span'); s.className = 'w';
      const soco = mk.includes('!'), dest = mk.includes('*'), forte = mk.includes('^');
      const logo = /^TATTOOBRAND/.test(orig);
      if (logo) s.innerHTML = `Tattoo<span class="b2">Brand</span>${orig.slice(11)}`;
      else s.textContent = orig;
      const mao = (soco || dest) && !logo;
      if (mao) s.classList.add('mao');
      else if (forte || logo) s.classList.add('forte');
      if (soco && !logo) s.insertAdjacentHTML('beforeend', RISCO);
      if (!mk && ws.length > 1 && CURTAS.has(chave(orig))) s.classList.add('leve');
      if (wi < ws.length - 1) s.style.marginRight = mao ? '0.18em' : '0.24em';
      temMao = temMao || mao;
      inner.appendChild(s);
      palavras.push({ el: s, t: T[gw], li, mao, soco, risco: s.querySelector('svg.risco path'), g: gw });
      gw++;
    });
    bloco.appendChild(l); linhas.push({ el: l, inner, mao: temMao });
  });
  if (!op.oculto) palco.appendChild(el);
  const forteTela = palavras.some(p => p.mao);
  const al = modo === 'ui' ? 'c' : modo === 'lousa' ? 'l' : op.al || (i % 3 === 2 ? 'c' : 'l');
  const cap = [...CAPS].reverse().find(c => i >= c[0]);
  return { i, bg, op, modo, el, bloco, linhas, palavras, al, rng, forteTela, cap, mov: Math.floor(rng() * 3), dir: rng() < 0.5 ? -1 : 1,
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
    const larg = tl.modo === 'lousa' ? 700 : tl.modo === 'ui' ? 1500 : 1540;
    tl.linhas.forEach(l => {
      l.el.style.fontSize = '100px';
      const nat = l.inner.getBoundingClientRect().width || 1;
      const cap = fin ? 230 : tl.modo === 'ui' ? (l.mao ? 124 : 108) : tl.modo === 'lousa' ? (l.mao ? 100 : 90) : (l.mao ? 150 : 132);
      l.el.style.fontSize = Math.min(cap, 100 * larg / nat) + 'px';
      l.el.style.textAlign = tl.al === 'c' ? 'center' : 'left';
    });
    const r = tl.bloco.getBoundingClientRect();
    const x = tl.modo === 'lousa' ? 130 : tl.al === 'c' ? (W - r.width) / 2 : 190;
    const y = tl.modo === 'ui' ? H * 0.5 - r.height / 2 : H * 0.52 - r.height / 2;
    tl.bloco.style.left = x + 'px'; tl.bloco.style.top = Math.max(140, y) + 'px';
    if (tl.modo === 'ui') tl.el.classList.add('sobre');
    tl.bloco.style.textAlign = tl.al === 'c' ? 'center' : 'left';
    tl.cx = x + r.width / 2; tl.cy = y + r.height / 2;
    tl.el.style.display = 'none';
  });
}

// ------------------------------------------------------------------ ajudantes de interface
function div(cls, css, pai, html) { const d = document.createElement('div'); if (cls) d.className = cls; if (css) d.style.cssText = css; if (html != null) d.innerHTML = html; pai.appendChild(d); return d; }
const AVA = '<svg viewBox="0 0 20 22"><circle cx="10" cy="6" r="5"/><path d="M0 22 Q0 12 10 12 Q20 12 20 22Z"/></svg>';
const CADEADO = '<svg viewBox="0 0 20 22" width="22" height="24" style="flex:none"><rect x="2" y="9" width="16" height="12" rx="3" fill="#5E5B57"/><path d="M6 9V6a4 4 0 0 1 8 0v3" stroke="#5E5B57" stroke-width="2.4" fill="none"/></svg>';
const CHECK = '<svg width="18" height="18" viewBox="0 0 20 20"><path d="M4 10l4 4 8-9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
function entra(e, t, a, o = {}) {
  const d = o.d || 0.5, q = seg(t, a, d, o.ease || 'power3.out');
  e.style.opacity = t < a ? 0 : seg(t, a, d * 0.6, 'power1.out');
  const dx = (o.dx || 0) * (1 - q), dy = (o.dy == null ? 22 : o.dy) * (1 - q), s = o.s ? mix(o.s, 1, q) : 1;
  e.style.transform = `translate(${dx}px,${dy}px) scale(${s})` + (o.extra || '');
  e.style.filter = q > 0.97 ? 'none' : `blur(${(1 - q) * (o.blur || 8)}px)`;
}
function anel(pai, x, y, r, cor, fundoCor) {
  const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('width', r * 2 + 12); sv.setAttribute('height', r * 2 + 12);
  sv.style.cssText = `position:absolute;left:${x}px;top:${y}px;transform:rotate(-90deg)`;
  const L = 2 * Math.PI * r;
  sv.innerHTML = `<circle cx="${r + 6}" cy="${r + 6}" r="${r}" fill="none" stroke="${fundoCor}" stroke-width="10"/><circle cx="${r + 6}" cy="${r + 6}" r="${r}" fill="none" stroke="${cor}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L}"/>`;
  pai.appendChild(sv); const arco = sv.lastChild;
  return { set(p) { arco.setAttribute('stroke-dashoffset', L * (1 - clamp(p, 0, 1))); } };
}
function linhaSvg(pai) { const sv = document.createElementNS(NS, 'svg'); sv.setAttribute('width', W); sv.setAttribute('height', H); sv.style.cssText = 'position:absolute;left:0;top:0;overflow:visible'; pai.appendChild(sv); return sv; }
function caminho(sv, d, cor = '#5E5B57', w = 3) {
  const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', 'none'); p.setAttribute('stroke', cor); p.setAttribute('stroke-width', w); p.setAttribute('stroke-linecap', 'round');
  sv.appendChild(p); const L = p.getTotalLength() || 1; p.setAttribute('stroke-dasharray', `${L} ${L}`); p.setAttribute('stroke-dashoffset', L);
  return { p, L, desenha(q) { p.setAttribute('stroke-dashoffset', L * (1 - clamp(q, 0, 1))); }, ponto(q) { return p.getPointAtLength(L * clamp(q, 0, 1)); } };
}
const curva = (x1, y1, x2, y2) => `M ${x1} ${y1} C ${x1 + (x2 - x1) * 0.45} ${y1}, ${x2 - (x2 - x1) * 0.45} ${y2}, ${x2} ${y2}`;
function cena(nome, idx) { const bs = idx.map(i => telas[i]); return { nome, bs, ini: bs[0].ini, fim: bs[bs.length - 1].fim, w: (k, j) => bs[k].palavras[j < 0 ? bs[k].palavras.length + j : j].t }; }
const ponto = raiz => div('', 'position:absolute;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#EB3B3B;opacity:0;box-shadow:0 0 14px rgba(235,59,59,.8)', raiz);
const FX = {};

// ------------------------------------------------------------------ lousa: traço de Pencil (liso, grosso, branco) + a gente azul do seu quadro
const rc = rough.svg(lousa);
const defs = document.createElementNS(NS, 'defs'); lousa.appendChild(defs);
const sym = document.createElementNS(NS, 'symbol'); sym.id = 'gente'; sym.setAttribute('viewBox', '0 0 20 44');
sym.innerHTML = '<circle cx="10" cy="5" r="4.6"/><path d="M4.6 11.2 H15.4 Q17.4 11.2 17.6 13.4 L18.6 24.2 Q18.7 25.6 17.3 25.6 Q16.2 25.6 16 24.4 L15 16.6 V42 Q15 43.6 13.4 43.6 Q11.8 43.6 11.8 42 V28.6 H8.2 V42 Q8.2 43.6 6.6 43.6 Q5 43.6 5 42 V16.6 L4 24.4 Q3.8 25.6 2.7 25.6 Q1.3 25.6 1.4 24.2 L2.4 13.4 Q2.6 11.2 4.6 11.2 Z"/>';
defs.appendChild(sym);
function el(tag, at, pai) { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (pai || lousa).appendChild(e); return e; }
function texto(pai, s, at) { const e = el('text', Object.assign({ 'text-anchor': 'middle' }, at), pai); e.textContent = s; return e; }
let semente = 1;
const O = o => Object.assign({ seed: semente++, roughness: 0.55, bowing: 0.7, disableMultiStroke: true, stroke: CREME, strokeWidth: 6, preserveVertices: true }, o);
function traco(g) {
  const ps = [...g.querySelectorAll('path')].map(p => { p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); const L = p.getTotalLength() || 1; p.setAttribute('stroke-dasharray', `${L} ${L}`); p.setAttribute('stroke-dashoffset', L); return { p, L }; });
  const tot = ps.reduce((a, b) => a + b.L, 0) || 1;
  return { g, desenha(q) { let r = q * tot; ps.forEach(o => { const v = clamp(r, 0, o.L); o.p.setAttribute('stroke-dashoffset', o.L - v); r -= o.L; }); } };
}
const grupo = pai => el('g', {}, pai);
const add = (pai, n) => { pai.appendChild(n); return n; };
function funil(pai, x, y, w, h) {
  const g = grupo(pai), ry = w * 0.13, bw = w * 0.2, yc = y + h * 0.64, yb = y + h, meia = f => mix(w / 2, bw / 2, f);
  add(g, rc.ellipse(x, y, w, ry * 2, O({ fill: CREME, fillStyle: 'hachure', hachureGap: Math.max(9, w / 34), hachureAngle: -40, fillWeight: 3 })));
  add(g, rc.line(x - w / 2, y, x - bw / 2, yc, O())); add(g, rc.line(x + w / 2, y, x + bw / 2, yc, O()));
  add(g, rc.line(x - bw / 2, yc, x - bw / 2 * 0.92, yb, O())); add(g, rc.line(x + bw / 2, yc, x + bw / 2 * 0.92, yb, O()));
  add(g, rc.arc(x, yb, bw * 0.92, bw * 0.28, 0, Math.PI, false, O({ strokeWidth: 5 })));
  const fr = [0.17, 0.32, 0.46, 0.585];
  fr.forEach((f, i) => {
    const hw = meia(f / 0.64), yy = y + h * f;
    add(g, rc.arc(x, yy, hw * 2, ry * 2 * hw / (w / 2), 0, Math.PI, false, O({ strokeWidth: 5 })));
    const yr = y + h * (f + (fr[i + 1] ? fr[i + 1] - f : 0.06) * 0.62) - 3, ww = hw * 0.85, pts = [], rr = S.rng(semente * 7), n = 9;
    for (let k = 0; k <= n; k++) pts.push([x - ww / 2 + ww * k / n + (rr() - 0.5) * 4, yr + (k % 2 ? -1 : 1) * (5 + rr() * 4) * Math.min(1, w / 400)]);
    add(g, rc.curve(pts, O({ strokeWidth: Math.max(3, w / 130), roughness: 0.8 })));
  });
  return { g, tr: traco(g) };
}
function seta(pai, x1, y1, x2, y2, sw = 6) {
  const g = grupo(pai), a = Math.atan2(y2 - y1, x2 - x1), L = 40;
  add(g, rc.curve([[x1, y1], [mix(x1, x2, 0.5) + (y2 - y1) * 0.08, mix(y1, y2, 0.5) - (x2 - x1) * 0.08], [x2, y2]], O({ strokeWidth: sw })));
  add(g, rc.linearPath([[x2 - L * Math.cos(a - 0.5), y2 - L * Math.sin(a - 0.5)], [x2, y2], [x2 - L * Math.cos(a + 0.5), y2 - L * Math.sin(a + 0.5)]], O({ strokeWidth: sw })));
  return traco(g);
}
function circulo(pai, cx, cy, d, o) { const g = grupo(pai); add(g, rc.ellipse(cx, cy, d, d * 0.96, O(Object.assign({ strokeWidth: 7 }, o)))); return traco(g); }
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
const rotuloMao = (pai, s, x, y, fs = 44, extra) => texto(pai, s, Object.assign({ x, y, class: 'mao', 'font-size': fs, fill: CINZA }, extra));
const pousa = (t, a, d = 0.5) => seg(t, a, d, 'power3.out');

FX.funilmorto = sc => {
  const g = grupo(), f = funil(g, 1370, 330, 520, 620);
  const gente = multidao(44, () => true, [1150, 140, 1590, 318], 28, 3).map(p => ({ p, b: boneco(g, p.x, p.y, 48, AZUL) }));
  const sai = boneco(g, 1370, 1080, 62, VERM);
  return t => {
    f.tr.desenha(seg(t, sc.ini + 0.05, 1.3, 'power2.inOut'));
    gente.forEach(({ p, b }) => { const a = sc.ini + 0.6 + p.d * 1.2; b.pos(p.x, mix(p.y - 60, p.y, pousa(t, a, 0.6)), 1, vis(t, a, 0.3)); });
    const a = sc.w(1, -1); sai.pos(1370, mix(1030, 1080, pousa(t, a, 0.6)), 1, vis(t, a, 0.3));
  };
};
FX.gasto = sc => {
  const g = grupo(), f = funil(g, 1370, 400, 560, 560);
  const ondas = [0, 1, 2].map(k => multidao(42, () => true, [1120, 130, 1620, 392], 26, 200 + k).map(p => ({ p, b: boneco(g, p.x + (k - 1) * 8, p.y - k * 14, 46, AZUL) })));
  const st = seta(g, 1730, 880, 1450, 1000);
  const sai = [boneco(g, 1335, 1110, 60, VERM), boneco(g, 1405, 1116, 60, VERM)];
  const nota = rotuloMao(g, 'poucos clientes', 1690, 1100, 46, { fill: VERM });
  return t => {
    f.tr.desenha(seg(t, sc.ini, 1.0, 'power2.inOut'));
    const quando = [sc.w(0, -1), sc.w(1, -1), sc.w(2, -1)];
    ondas.forEach((o, k) => o.forEach(({ p, b }) => { const a = quando[k] - 0.2 + p.d * 0.7; b.pos(p.x + (k - 1) * 8, mix(p.y - 120, p.y - k * 14, pousa(t, a, 0.6)), 1, vis(t, a, 0.25)); }));
    st.desenha(seg(t, sc.w(3, -1), 0.6, 'power2.out'));
    sai.forEach((b, i) => { const a = sc.w(4, 0) + i * 0.3; b.pos(b.x, mix(b.y - 50, b.y, pousa(t, a, 0.6)), 1, vis(t, a, 0.25)); });
    nota.setAttribute('opacity', vis(t, sc.w(4, 1), 0.3));
  };
};
FX.troca = sc => {
  const g = grupo(), f = funil(g, 1000, 250, 230, 300);
  const gf = multidao(12, () => true, [910, 150, 1090, 246], 22, 300).map(p => ({ p, b: boneco(g, p.x, p.y, 28, AZUL) }));
  const lf = rotuloMao(g, 'funil tradicional', 1000, 630);
  const st = seta(g, 1100, 420, 1190, 540);
  const C = [1480, 600], D = 720, circ = circulo(g, C[0], C[1], D);
  const gm = multidao(170, (x, y) => Math.hypot(x - C[0], (y - 20) - C[1]) < D / 2 - 34, [C[0] - D / 2, C[1] - D / 2, C[0] + D / 2, C[1] + D / 2 + 24], 30, 301).map(p => ({ p, b: boneco(g, p.x, p.y, 34, AZUL) }));
  const lm = rotuloMao(g, 'seu mundo (marca pessoal)', C[0], C[1] + D / 2 + 70, 46);
  const rg = grupo(g); add(rg, rc.line(870, 160, 1130, 600, O({ stroke: VERM, strokeWidth: 8 }))); add(rg, rc.line(1130, 160, 870, 600, O({ stroke: VERM, strokeWidth: 8 })));
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
  const circ = circulo(g, C[0], C[1], D), c2 = circulo(g, C[0], C[1], D * 0.56, { strokeWidth: 5 }), c3 = circulo(g, C[0], C[1], D * 0.3, { strokeWidth: 5 });
  const gente = multidao(240, (x, y) => Math.hypot(x - C[0], (y - 18) - C[1]) < D / 2 - 30, [C[0] - D / 2, C[1] - D / 2, C[0] + D / 2, C[1] + D / 2 + 24], 26, seed)
    .map(p => { const d = Math.hypot(p.x - C[0], p.y - 18 - C[1]); return { p, d, b: boneco(g, p.x, p.y, 30, AZUL) }; })
    .filter(o => Math.abs(o.d - D * 0.28) > 17 && Math.abs(o.d - D * 0.15) > 15);
  return { circ, c2, c3, gente };
}
FX.zona = sc => {
  const g = grupo(), C = [1370, 650], D = 820, A = alvo(g, C, D, 400);
  const l1 = rotuloMao(g, 'zona de lucro', 1370, 165, 60, { fill: VERM });
  const st = seta(g, 1250, 190, 1345, 560, 5);
  const cf = grupo(g);
  add(cf, rc.curve([[1785, 270], [1715, 252], [1694, 286], [1764, 316], [1785, 350], [1715, 364], [1684, 342]], O({ stroke: '#3FBF6A', strokeWidth: 6 })));
  add(cf, rc.line(1730, 226, 1734, 404, O({ stroke: '#3FBF6A', strokeWidth: 6 })));
  const cft = traco(cf);
  return t => {
    A.circ.desenha(seg(t, sc.ini, 0.9, 'power2.inOut'));
    const aLar = sc.w(1, -1), aCen = sc.w(3, -1), aZ = sc.w(5, 0), aL = sc.w(5, 2);
    A.c2.desenha(seg(t, aLar - 0.2, 0.7, 'power2.inOut')); A.c3.desenha(seg(t, aCen - 0.2, 0.6, 'power2.inOut'));
    A.gente.forEach(({ p, d, b }) => {
      let cor = AZUL; if (d < D * 0.28 && t >= aLar + p.r * 0.5) cor = LAR; if (d < D * 0.15 && t >= aCen + p.r * 0.4) cor = VERM;
      b.pos(p.x, p.y, 1, vis(t, sc.ini + 0.2 + p.d * 0.9, 0.3), cor);
    });
    l1.setAttribute('opacity', vis(t, aZ, 0.3)); st.desenha(seg(t, aZ + 0.1, 0.5, 'power2.out'));
    cft.desenha(seg(t, aL, 0.6, 'power2.out'));
  };
};
FX.zona2 = sc => {
  const g = grupo(), C = [1370, 620], D = 820, A = alvo(g, C, D, 401);
  const eu = boneco(g, 0, 0, 56, AZUL), marca = circulo(g, 0, 0, 100, { stroke: VERM, strokeWidth: 5 });
  return t => {
    A.circ.desenha(seg(t, sc.ini, 0.5)); A.c2.desenha(seg(t, sc.ini + 0.1, 0.5)); A.c3.desenha(seg(t, sc.ini + 0.2, 0.5));
    A.gente.forEach(({ p, d, b }) => b.pos(p.x, p.y, 1, vis(t, sc.ini + p.d * 0.4, 0.2), d < D * 0.15 ? VERM : d < D * 0.28 ? LAR : AZUL));
    const a = sc.w(0, 1), q = seg(t, a, sc.w(1, -1) - a + 0.4, 'power2.inOut');
    const ang = -2.4 + q * 2.2, r = mix(D * 0.42, 0, q), x = C[0] + Math.cos(ang) * r, y = C[1] + 18 + Math.sin(ang) * r;
    eu.pos(x, y, 1, vis(t, sc.ini + 0.2, 0.2), q > 0.75 ? VERM : q > 0.4 ? LAR : AZUL);
    marca.g.setAttribute('transform', `translate(${x},${y - 28})`); marca.desenha(seg(t, sc.ini + 0.3, 0.5));
  };
};


// cada canal é um funil
FX.funis = sc => {
  const g = grupo(), itens = [['indicação', 0, 0], ['anúncio', 0, 1], ['promoção', 0, 2], ['site', 0, 3], ['formulário', 1, 0], ['whatsapp automático', 1, 1], ['preço tabelado', 1, 3]];
  const pos = [[1010, 220], [1240, 220], [1470, 220], [1700, 220], [1070, 680], [1370, 680], [1690, 680]];
  const fs = itens.map((it, i) => {
    const [x, y] = pos[i], gg = grupo(g), f = funil(gg, x, y, 170, 210);
    const gente = multidao(8, () => true, [x - 66, y - 80, x + 66, y - 4], 22, 50 + i).map(p => ({ p, b: boneco(gg, p.x, p.y, 28, AZUL) }));
    const sai = boneco(gg, x, y + 266, 32, VERM), lb = rotuloMao(gg, it[0], x, y + 328, it[0].length > 14 ? 34 : 40);
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
// todos terminam no orçamento
FX.orcamento = sc => {
  const g = grupo(), xs = [1010, 1240, 1470, 1700];
  const fs = xs.map((x, i) => ({ f: funil(g, x, 230, 190, 300), gente: multidao(9, () => true, [x - 74, 130, x + 74, 226], 22, 80 + i).map(p => ({ p, b: boneco(g, p.x, p.y, 28, AZUL) })) }));
  const cx = 980, cy = 760, cw = 760, ch = 220, caixa = grupo(g);
  const borda = traco(add(caixa, rc.rectangle(cx, cy, cw, ch, O({ strokeWidth: 6 }))));
  const tinta = traco(add(caixa, rc.rectangle(cx + 10, cy + 10, cw - 20, ch - 20, O({ stroke: 'none', fill: VERM, fillStyle: 'hachure', hachureGap: 14, fillWeight: 4, hachureAngle: -35 }))));
  const lb = texto(caixa, 'orçamento', { x: cx + cw / 2, y: cy + ch / 2 + 34, class: 'mao', 'font-size': 120, fill: CREME, stroke: '#0B0B0B', 'stroke-width': 10, 'paint-order': 'stroke' });
  const caem = []; xs.forEach((x, i) => { for (let k = 0; k < 2; k++) caem.push({ b: boneco(g, x, 600, 34, VERM), x, alvo: [cx + 90 + (i * 2 + k) * 82, cy + ch - 26] }); });
  return t => {
    fs.forEach((o, i) => { o.f.tr.desenha(seg(t, sc.ini + i * 0.15, 0.9, 'power2.out')); o.gente.forEach(({ p, b }) => { const a = sc.ini + 0.4 + i * 0.1 + p.d * 0.5; b.pos(p.x, mix(p.y - 40, p.y, pousa(t, a, 0.4)), 1, vis(t, a, 0.2)); }); });
    borda.desenha(seg(t, sc.w(0, -1), 0.8, 'power2.inOut'));
    const desce = sc.w(1, -1);
    caem.forEach((c, j) => { const a = sc.w(0, 2) + j * 0.06, vai = seg(t, desce + j * 0.05, 0.8, 'power2.inOut'); c.b.pos(mix(c.x, c.alvo[0], vai), mix(mix(560, 600, pousa(t, a, 0.4)), c.alvo[1], vai), 1, vis(t, a, 0.2)); });
    const ao = sc.w(2, -1); tinta.desenha(seg(t, ao - 0.05, 0.5, 'power2.out')); lb.setAttribute('opacity', vis(t, ao, 0.3));
  };
};
// de cada 20, 7 fecham
FX.pessoas = sc => {
  const g = grupo(), fig = [];
  for (let i = 0; i < 20; i++) fig.push(boneco(g, 1370 + ((i % 5) - 2) * 150, 330 + Math.floor(i / 5) * 230, 190, AZUL));
  const fecham = new Set([1, 4, 7, 10, 13, 16, 18]);
  return t => {
    const a20 = sc.w(1, 2), a7 = sc.w(3, 1), a13 = sc.w(4, 2), aNao = sc.w(5, -1);
    fig.forEach((b, i) => {
      const a = a20 + i * 0.035; let cor = AZUL, op = vis(t, a, 0.25);
      if (fecham.has(i) && t >= a7 + (i % 3) * 0.05) cor = VERM;
      if (!fecham.has(i)) op *= 1 - 0.75 * seg(t, aNao, 0.7, 'power2.out');
      b.pos(b.x, mix(b.y + 20, b.y, pousa(t, a, 0.5)), 1, op, cor);
    });
  };
};
// cinco vezes sim
FX.sins = sc => {
  const g = grupo(), objs = ['anúncio', 'orçamento', 'preço', 'sinal', 'marcação'];
  const ls = objs.map((s, k) => {
    const y = 210 + k * 195, lg = grupo(g);
    const cx = traco(add(lg, rc.rectangle(560, y - 52, 104, 104, O({ strokeWidth: 6 }))));
    const ck = traco(add(lg, rc.linearPath([[580, y - 2], [604, y + 26], [652, y - 42]], O({ stroke: VERM, strokeWidth: 12 }))));
    const sim = texto(lg, 'Sim', { x: 712, y: y + 36, 'font-size': 100, fill: CREME, 'text-anchor': 'start', style: "font-family:'Inter Tight';font-weight:800;letter-spacing:-4px" });
    const pa = texto(lg, k === 4 ? 'para a' : 'para o', { x: 925, y: y + 34, 'font-size': 56, fill: CINZA, 'text-anchor': 'start', style: "font-family:'Inter Tight';font-weight:600;letter-spacing:-2px" });
    const ob = texto(lg, s, { x: 1100, y: y + 36, class: 'mao', 'font-size': 120, fill: VERM, 'text-anchor': 'start' });
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
// a teia de conteúdo e ofertas
FX.teia = sc => {
  const g = grupo(), ga = grupo(g), gn = grupo(g);
  const N = { post: [1010, 240, 'post'], cont: [1600, 240, 'conteúdo'], dm: [1600, 560, 'DM'], ofe: [1310, 830, 'oferta'], story: [990, 600, 'story'], dest: [1000, 1080, 'destaque'], link: [1640, 1080, 'link na bio'] };
  const nos = {};
  for (const k in N) {
    const [x, y, s] = N[k], ng = grupo(gn), of = k === 'ofe', w = of ? 360 : Math.max(220, s.length * 26 + 90), h = of ? 160 : 110;
    const tr = traco(add(ng, rc.ellipse(x, y, w, h, O(of ? { fill: VERM, fillStyle: 'hachure', hachureGap: 11, fillWeight: 3.5, strokeWidth: 6 } : { strokeWidth: 5 }))));
    const lb = texto(ng, s, { x, y: y + (of ? 30 : 20), class: 'mao', 'font-size': of ? 92 : 60, fill: CREME, stroke: of ? '#0B0B0B' : 'none', 'stroke-width': of ? 8 : 0, 'paint-order': 'stroke' });
    nos[k] = { tr, lb };
  }
  const ar = [['post', 'cont'], ['cont', 'dm'], ['dm', 'ofe'], ['story', 'ofe'], ['dest', 'ofe'], ['link', 'ofe']].map(([a, b]) => {
    const [x1, y1] = N[a], [x2, y2] = N[b], d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d, c1 = 130, c2 = b === 'ofe' ? 150 : 110;
    const p1 = [x1 + ux * c1, y1 + uy * c1 * 0.6], p2 = [x2 - ux * c2, y2 - uy * c2 * 0.62];
    return { s: seta(ga, p1[0], p1[1], p2[0], p2[1], 5), p1, p2, dot: el('circle', { r: 10, fill: VERM }, ga) };
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

// ------------------------------------------------------------------ monta as cenas
const cenas = []; telas.forEach((tl, i) => {
  const nome = tl.op.fx; if (!nome || nome === 'final') return;
  const u = cenas[cenas.length - 1];
  if (u && u.nome === nome && u.idx[u.idx.length - 1] === i - 1) u.idx.push(i); else cenas.push({ nome, idx: [i] });
});
cenas.forEach(c => {
  const sc = cena(c.nome, c.idx);
  if (UI_CENAS.has(c.nome)) { c.tipo = 'ui'; c.raiz = div('cena-ui', '', uiL); c.desenha = FX[c.nome](sc, c.raiz); }
  else { c.tipo = 'svg'; c.desenha = FX[c.nome](sc); c.raiz = lousa.lastChild; c.raiz.setAttribute('opacity', 0); }
  c.sc = sc; c.idx.forEach(i => { telas[i].cena = c; });
});
// início de cada capítulo (para a etiqueta digitar)
const iniCap = CAPS.map(c => telas[c[0]].ini);

// ------------------------------------------------------------------ partículas desfocadas em camadas (profundidade)
const BK = (() => { const r = S.rng(77); return Array.from({ length: 24 }, () => {
  const z = r(), sz = 6 + z * 46, e = document.createElement('i');
  e.style.width = e.style.height = sz + 'px'; e.style.filter = `blur(${2 + z * 14}px)`;
  e.style.background = r() < 0.7 ? `rgba(235,59,59,${0.25 + 0.3 * (1 - z)})` : `rgba(239,236,229,${0.12 + 0.2 * (1 - z)})`;
  bokeh.appendChild(e); return { e, x: r() * 2100 - 90, y: r() * 1300 - 50, z, v: 2 + z * 8, f: r() * 6.28 };
}); })();

// ------------------------------------------------------------------ quadro
let atual = null;
function acha(t) { let lo = 0, hi = telas.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (telas[m].ini <= t) lo = m; else hi = m - 1; } return telas[lo]; }

function render(t) {
  mede();
  const tl = acha(t);
  if (atual !== tl) {
    if (atual) atual.el.style.display = 'none';
    if (!tl.op.oculto) tl.el.style.display = 'block';
    cenas.forEach(c => { const on = c === tl.cena; if (c.tipo === 'ui') c.raiz.style.display = on ? 'block' : 'none'; else c.raiz.setAttribute('opacity', on ? 1 : 0); });
    atual = tl;
  }
  if (tl.cena) tl.cena.desenha(t);
  fundo.className = 'abs cheio ' + tl.bg;
  // partículas: sobem devagar, as de perto correm mais (paralaxe)
  BK.forEach(p => { const y = ((p.y - p.v * t) % 1300 + 1300) % 1300 - 50, x = p.x + Math.sin(t * 0.15 + p.f) * 10 * p.z; p.e.style.transform = `translate(${x}px,${y}px)`; });
  bokeh.style.opacity = tl.bg === 'r' ? 0.35 : tl.cena ? 0.45 : 0.9;
  // eco: a palavra escrita à mão, enorme e desfocada lá no fundo
  const pm = tl.modo === 'texto' && tl.palavras.find(p => p.mao);
  if (pm && t >= pm.t) { eco.textContent = pm.el.textContent; eco.style.top = ((tl.cy || 600) - 330) + 'px'; eco.style.opacity = seg(t, pm.t, 0.8, 'power2.out') * (tl.bg === 'r' ? 0.6 : 1); eco.style.color = tl.bg === 'r' ? 'rgba(255,230,220,.10)' : ''; eco.style.transform = `translateX(${tl.dir * mix(40, -40, seg(t, pm.t, 4, 'none'))}px) scale(${mix(1.1, 1.0, seg(t, pm.t, 1.2, 'power3.out'))})`; }
  else eco.style.opacity = 0;
  const dur = Math.max(0.6, tl.fim - tl.ini), dv = seg(t, tl.ini, dur, 'sine.inOut'), ce = seg(t, tl.ini, Math.min(dur, 1.6), 'power3.out');

  // etiqueta do capítulo, digitada no começo de cada parte
  const ci = CAPS.indexOf(tl.cap), a0 = iniCap[ci], txt = tl.cap[2];
  rotTx.textContent = txt.slice(0, Math.floor(txt.length * seg(t, a0 + 0.2, 0.9, 'none')));
  rotulo.style.opacity = tl.op.fx === 'final' ? 1 - seg(t, tl.ini, 0.4) : seg(t, a0, 0.4);
  capitulo.textContent = tl.cap[1]; capitulo.style.opacity = rotulo.style.opacity;

  brilho.style.opacity = !tl.cena ? (tl.forteTela ? 1 : 0.55) : 0;
  brilho.style.transform = `translate(${(tl.cx || 960) + tl.dir * 40 * (dv - 0.5)}px,${tl.cy || 600}px) scale(${0.92 + 0.12 * dv})`;

  if (tl.cena) {
    const sc = tl.cena.sc, q = seg(t, sc.ini, 1.4, 'power3.out'), d2 = seg(t, sc.ini, sc.fim - sc.ini, 'sine.inOut'), bl = 1 - seg(t, sc.ini, 0.45, 'power2.out');
    if (tl.cena.tipo === 'ui') {
      const r = tl.cena.raiz; r.style.transformOrigin = '960px 1185px';
      const ld = seg(t, sc.ini, sc.fim - sc.ini, 'none');
      r.style.transform = `rotateX(${mix(10, 1, q)}deg) rotateY(${mix(-4, 4, ld)}deg) scale(${0.9 * mix(0.95, 1, q) * (1 + 0.06 * ld)}) translate(${mix(-60, 60, ld)}px,${mix(30, -10, ld)}px)`;
      r.style.filter = `blur(${1.8 + bl * 10}px) brightness(.78)`;
    } else {
      lousa.style.transformOrigin = '1370px 620px';
      const ld2 = seg(t, sc.ini, sc.fim - sc.ini, 'none');
      lousa.style.transform = `perspective(2600px) rotateX(${mix(8, 1.5, q)}deg) rotateY(${mix(-7, 3, d2)}deg) scale(${mix(0.96, 1.03, d2)})`;
    }
  }
  if (!tl.op.oculto) {
    let ry = 0, x = 0;
    const lin = seg(t, tl.ini, dur, 'sine.out'), s = 1 + (tl.modo === 'texto' ? 0.04 : 0.015) * lin;
    if (tl.modo === 'texto') { ry = tl.mov === 1 ? mix(tl.dir * 7, 0, lin) : tl.dir * mix(-1.5, 1.5, lin); x = tl.dir * mix(-12, 12, lin); }
    tl.el.style.transformOrigin = `${tl.cx || 960}px ${tl.cy || 600}px`;
    const ent = seg(t, tl.ini, 0.7, 'power3.out'), z = tl.modo === 'texto' ? mix(-160, 0, ent) : 0, rx = tl.modo === 'texto' ? mix(tl.mov === 0 ? 7 : -5, 0, ent) : 0;
    tl.el.style.transform = `perspective(2400px) translateX(${x}px) translateZ(${z}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;
  }

  const sai = tl.modo === 'texto' && !tl.op.fx ? seg(t, tl.fim - 0.24, 0.24, 'power2.in') : 0;
  tl.palavras.forEach(p => {
    const a = p.t - 0.04;
    if (t < a) { p.el.style.opacity = 0; return; }
    if (p.mao) {
      // escrita à mão: a palavra aparece da esquerda para a direita, como se estivesse sendo escrita
      const q = seg(t, a, 0.62, 'power2.inOut');
      p.el.style.opacity = 1; p.el.style.filter = 'none'; p.el.style.transform = 'none';
      p.el.style.clipPath = q > 0.995 ? 'none' : `inset(-30% ${(1 - q) * 100}% -40% -5%)`;
      if (p.risco) p.risco.setAttribute('stroke-dashoffset', 100 * (1 - seg(t, a + 0.5, 0.45, 'power2.inOut')));
    } else {
      const q = seg(t, a, 0.5, 'power3.out');
      p.el.style.opacity = seg(t, a, 0.28, 'power1.out');
      p.el.style.transform = `translateY(${(1 - q) * 22}px)`;
      p.el.style.filter = q > 0.97 ? 'none' : `blur(${(1 - q) * 8}px)`;
    }
    if (sai > 0) { p.el.style.opacity = Math.min(+p.el.style.opacity, 1 - sai); p.el.style.filter = `blur(${sai * 12}px)`; p.el.style.transform += ` translateY(${-sai * 18}px)`; }
  });
}

window.__render = render;
window.__timelines = window.__timelines || {};
window.__timelines.main = S.play(render, { loop: false });
})();
