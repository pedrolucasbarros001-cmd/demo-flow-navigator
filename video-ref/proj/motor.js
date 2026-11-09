// motor.js: tipografia gritada, palavra por palavra no tempo da fala.
// Um relógio só: render(t) escolhe a tela pelo tempo e desenha tudo a partir de t. Sem Math.random, Date.now ou timers.
(function () {
const S = STUDIO, W = 1080, H = 1920, M = 90;          // margem lateral
const R = window.ROTEIRO, T = window.TEMPOS;
const VERM = '#DF1904', CREME = '#F1EDE0', TINTA = '#0B0A0A', CHIP = '#160E0B', LINHA = '#5E4B42';
const seg = (t, a, d, e) => S.seg(t, a, d, e);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const NS = 'http://www.w3.org/2000/svg';
const palco = document.getElementById('palco'), fundo = document.getElementById('fundo'),
      fxL = document.getElementById('fx'), risco = document.getElementById('risco');

// ------------------------------------------------------------------ monta as telas
let gw = 0;
const telas = R.map((b, i) => {
  const [bg, txt, op = {}] = b;
  const el = document.createElement('div');
  el.className = 'tela abs ' + bg + (op.carimbo ? ' carimbo' : '');
  const bloco = document.createElement('div'); bloco.className = 'bloco'; bloco.style.display = 'inline-block';
  el.appendChild(bloco);
  const linhas = [], palavras = [];
  txt.split('|').forEach((ln, li) => {
    const l = document.createElement('div'); l.className = 'l';
    const inner = document.createElement('span'); l.appendChild(inner);
    const ws = ln.trim().split(/\s+/);
    ws.forEach((raw, wi) => {
      const m = raw.match(/^([*^!_]*)(.*)$/), marcas = m[1], tx = m[2];
      const s = document.createElement('span'); s.className = 'w'; s.textContent = tx;
      if (marcas.includes('*')) s.classList.add('dest');
      if (marcas.includes('^')) s.classList.add('larga');
      if (marcas.includes('!')) s.classList.add('soco');
      if (marcas.includes('_')) s.classList.add('contorno');
      if (wi < ws.length - 1) s.style.marginRight = '0.2em';
      inner.appendChild(s);
      palavras.push({ el: s, t: T[gw], li, soco: marcas.includes('!'), larga: marcas.includes('^'), g: gw });
      gw++;
    });
    bloco.appendChild(l); linhas.push({ el: l, inner, soco: /!/.test(ln), forte: /[*^]/.test(ln) });
  });
  if (!op.oculto) palco.appendChild(el);
  const temSoco = palavras.some(p => p.soco);
  const al = op.al || (temSoco ? 'c' : (i % 3 === 2 ? 'c' : 'l'));
  return { i, bg, op, el, bloco, linhas, palavras, al, ini: i === 0 ? 0 : palavras[0].t - 0.07 };
});
const DUR = S.D;
telas.forEach((tl, i) => { tl.fim = i < telas.length - 1 ? telas[i + 1].ini : DUR; });

// ------------------------------------------------------------------ medida (depois das fontes)
let medido = null;
function mede() {
  const pronto = document.fonts && document.fonts.status === 'loaded';
  if (medido === pronto) return; medido = pronto;
  telas.forEach(tl => {
    if (tl.op.oculto) return;
    tl.el.style.display = 'block';
    const fx = !!tl.op.fx && tl.op.fx !== 'final';
    const larguraMax = W - 2 * M - (tl.op.carimbo ? 104 : 0);
    tl.linhas.forEach(l => {
      l.el.style.fontSize = '100px';
      const nat = l.inner.getBoundingClientRect().width || 1;
      let cap = l.soco ? 340 : l.forte ? 260 : 200;
      if (fx) cap = l.soco ? 220 : l.forte ? 160 : 130;
      l.el.style.fontSize = Math.min(cap, 100 * larguraMax / nat) + 'px';
      l.el.style.textAlign = tl.al === 'c' ? 'center' : tl.al === 'r' ? 'right' : 'left';
    });
    tl.bloco.style.textAlign = tl.al === 'c' ? 'center' : 'left';
    const bw = tl.bloco.getBoundingClientRect().width, bh = tl.bloco.getBoundingClientRect().height;
    const x = tl.al === 'c' ? (W - bw) / 2 : tl.al === 'r' ? W - M - bw : M;
    const yc = (tl.op.y != null ? tl.op.y : 0.48) * H;
    const y = clamp(yc - bh / 2, 70, H - 70 - bh);
    tl.bloco.style.position = 'absolute'; tl.bloco.style.left = x + 'px'; tl.bloco.style.top = y + 'px';
    tl.cx = x + bw / 2; tl.cy = y + bh / 2;
    tl.palavras.forEach(p => { const r = p.el.getBoundingClientRect(); p.cy = r.top + r.height * 0.55; p.cx = r.left + r.width / 2; });
    tl.el.style.display = 'none';
  });
}

// ------------------------------------------------------------------ ajudantes de SVG
function el(tag, at, pai) {
  const e = document.createElementNS(NS, tag);
  for (const k in at) e.setAttribute(k, at[k]);
  (pai || fxL).appendChild(e); return e;
}
function texto(pai, s, at) { const e = el('text', Object.assign({ 'text-anchor': 'middle', 'dominant-baseline': 'central' }, at), pai); e.textContent = s; return e; }
// pílula com texto; a largura acompanha o texto medido
function pilula(pai, s, o) {
  const g = el('g', {}, pai);
  const r = el('rect', { rx: o.rx || 18, fill: o.fill || CHIP, stroke: o.stroke || LINHA, 'stroke-width': o.sw || 3 }, g);
  const t = texto(g, s, { fill: o.cor || CREME, 'font-size': o.fs || 64, style: o.fam ? `font-family:${o.fam}` : '' });
  g.ajusta = () => { const w = t.getComputedTextLength() + (o.pad || 70), h = o.h || (o.fs || 64) * 1.55; r.setAttribute('x', -w / 2); r.setAttribute('y', -h / 2); r.setAttribute('width', w); r.setAttribute('height', h); g.w = w; };
  g.ajusta(); return g;
}
const pos = (g, x, y, s = 1, op = 1) => { g.setAttribute('transform', `translate(${x},${y}) scale(${s})`); g.setAttribute('opacity', op); };
// tempo da palavra j da k-ésima tela da cena
function cena(nome, idx) {
  const bs = idx.map(i => telas[i]);
  return { nome, bs, ini: bs[0].ini, fim: bs[bs.length - 1].fim, w: (k, j) => bs[k].palavras[j].t };
}
const entra = (t, a, d = 0.24) => seg(t, a, d, 'expo.out');

// ------------------------------------------------------------------ cenas gráficas
const FX = {};

FX.canais = sc => {
  const g = el('g'); const itens = [
    ['INDICAÇÃO', 0, 0], ['ANÚNCIO', 0, 1], ['PROMOÇÃO', 0, 2], ['SITE', 0, 3],
    ['FORMULÁRIO', 1, 0], ['WHATSAPP AUTOMÁTICO', 1, 1], ['PREÇO TABELADO', 1, 3]];
  const ps = itens.map(([s]) => pilula(g, s, { fs: 96 }));
  const num = itens.map((_, i) => texto(g, String(i + 1).padStart(2, '0'), { fill: VERM, 'font-size': 34, style: "font-family:'Archivo Black'" }));
  return t => {
    ps.forEach((p, i) => {
      if (!p.w || p.w < 100) p.ajusta();
      const [, k, j] = itens[i], a = sc.w(k, j), q = entra(t, a);
      const k2 = Math.min(1, (W - 2 * M) / p.w), pw = p.w * k2;
      const esq = i % 2 === 0, x = esq ? M + pw / 2 : W - M - pw / 2, y = 330 + i * 200;
      pos(p, x + (1 - q) * (esq ? -140 : 140), y, k2, t >= a ? clamp((t - a) / 0.06, 0, 1) : 0);
      pos(num[i], (esq ? M + 22 : W - M - pw + 22) + (1 - q) * (esq ? -140 : 140), y - 108, 1, t >= a ? clamp((t - a) / 0.06, 0, 1) : 0);
    });
  };
};

function desenhaFunil(g, topo, larg, neckY) {
  const d = `M ${540 - larg / 2} ${topo} L ${540 - 70} ${neckY - 120} L ${540 - 70} ${neckY} M ${540 + larg / 2} ${topo} L ${540 + 70} ${neckY - 120} L ${540 + 70} ${neckY}`;
  const p = el('path', { d, fill: 'none', stroke: CREME, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
  const L = 2 * (Math.hypot(larg / 2 - 70, neckY - 120 - topo) + 120);
  p.setAttribute('stroke-dasharray', L);
  return q => p.setAttribute('stroke-dashoffset', L * (1 - q));
}

FX.funil = sc => {
  const g = el('g'); const traca = desenhaFunil(g, 640, 900, 1250);
  const nomes = ['INDICAÇÃO', 'ANÚNCIO', 'PROMOÇÃO', 'SITE', 'FORMULÁRIO', 'WHATSAPP', 'PREÇO'];
  const ps = nomes.map(s => pilula(g, s, { fs: 40, rx: 12, pad: 40 }));
  const caixa = el('g', {}, g);
  el('rect', { x: -380, y: -95, width: 760, height: 190, fill: VERM }, caixa);
  const ct = texto(caixa, 'ORÇAMENTO', { fill: CREME, 'font-size': 104, style: "font-family:'Archivo Black';letter-spacing:-3px" });
  const casa = [[230, 470], [480, 440], [760, 470], [330, 560], [620, 550], [860, 570], [170, 580]];
  return t => {
    traca(seg(t, sc.ini + 0.05, 0.7, 'power2.out'));
    const cai = sc.w(1, 2);                       // "LUGAR,"
    ps.forEach((p, i) => {
      if (!p.w || p.w < 60) p.ajusta();
      const a = sc.ini + 0.15 + i * 0.07, q = entra(t, a), [x0, y0] = casa[i];
      const c = seg(t, cai + i * 0.06, 0.55, 'power2.in');
      const x = S.mix(x0, 540, c), y = S.mix(y0 - (1 - q) * 60, 1260, c);
      pos(p, x, y, S.mix(1, 0.35, c), (t >= a ? clamp((t - a) / 0.08, 0, 1) : 0) * (1 - seg(t, cai + i * 0.06 + 0.4, 0.15)));
    });
    const a = sc.w(2, 1), q = seg(t, a, 0.28, 'expo.out');
    pos(caixa, 540, 1470, S.mix(1.4, 1, q), t >= a ? clamp((t - a) / 0.05, 0, 1) : 0);
    const cx = sc.w(2, 0); caixa.setAttribute('opacity', t >= cx ? (t >= a ? 1 : 0.25) : 0);
    ct.setAttribute('opacity', t >= a ? 1 : 0);
  };
};

FX.pessoas = sc => {
  const g = el('g'); const fig = [];
  for (let i = 0; i < 20; i++) {
    const f = el('g', {}, g);
    const cab = el('circle', { cx: 0, cy: -48, r: 34, 'stroke-width': 6 }, f);
    const corpo = el('path', { d: 'M -62 62 Q -62 -2 0 -2 Q 62 -2 62 62 Z', 'stroke-width': 6, 'stroke-linejoin': 'round' }, f);
    fig.push({ f, cab, corpo, x: 540 + ((i % 5) - 2) * 186, y: 820 + Math.floor(i / 5) * 240 });
  }
  const fecham = new Set([1, 4, 7, 10, 13, 16, 18]);
  return t => {
    const a20 = sc.w(1, 2), a7 = sc.w(3, 1), a13 = sc.w(4, 2), aNao = sc.w(5, 2);
    fig.forEach((o, i) => {
      const a = a20 + i * 0.025, q = entra(t, a, 0.3);
      let fill = 'none', stroke = CREME, op = t >= a ? clamp((t - a) / 0.08, 0, 1) : 0, dy = (1 - q) * 70;
      if (fecham.has(i) && t >= a7) { fill = CREME; }
      if (!fecham.has(i) && t >= a13) { stroke = VERM; }
      if (!fecham.has(i)) { const s = seg(t, aNao, 0.5, 'power2.out'); op *= 1 - 0.7 * s; dy += 26 * s; }
      let esc = S.mix(0.75, 1, q);
      if (fecham.has(i)) esc *= 1 + 0.12 * (1 - seg(t, a7 + (i % 3) * 0.04, 0.3, 'power2.out')) * (t >= a7 ? 1 : 0);
      [o.cab, o.corpo].forEach(e => { e.setAttribute('fill', fill); e.setAttribute('stroke', stroke); });
      pos(o.f, o.x, o.y + dy, esc, op);
    });
  };
};

FX.gasto = sc => {
  const g = el('g'); const traca = desenhaFunil(g, 600, 940, 1300);
  const rng = S.rng(7), n = 72, pts = [];
  for (let i = 0; i < n; i++) {
    const c = el('circle', { r: 11, fill: CREME }, g);
    pts.push({ c, x: 160 + rng() * 760, y: 640 + rng() * 260, d: rng() * 0.5, f: rng() * 6.28 });
  }
  const sai = [0, 1, 2, 3].map(() => el('circle', { r: 20, fill: VERM }, g));
  return t => {
    traca(seg(t, sc.ini + 0.05, 0.7, 'power2.out'));
    const chega = sc.w(0, 5), aperta = sc.w(3, 4), poucos = sc.w(4, 0);
    pts.forEach((p, i) => {
      const a = chega - 0.25 + p.d, q = seg(t, a, 0.5, 'power2.out');
      // dentro do funil a borda aperta conforme a altura
      const y0 = S.mix(-60, p.y, q);
      const meia = S.mix(470, 70, (y0 - 600) / 580);
      let x = 540 + clamp((p.x - 540), -meia + 20, meia - 20) + 6 * Math.sin(t * 2.2 + p.f);
      let y = y0 + 4 * Math.cos(t * 1.8 + p.f);
      const s = seg(t, aperta + p.d * 0.6, 0.6, 'power2.in');
      x = S.mix(x, 540, s); y = S.mix(y, 1220, s);
      p.c.setAttribute('cx', x); p.c.setAttribute('cy', y);
      p.c.setAttribute('opacity', (t >= a ? 1 : 0) * (1 - seg(t, aperta + p.d * 0.6 + 0.45, 0.2)));
    });
    sai.forEach((c, i) => {
      const a = poucos + i * 0.12, q = seg(t, a, 0.45, 'expo.out');
      c.setAttribute('cx', 540 + (i - 1.5) * 64 * q); c.setAttribute('cy', S.mix(1260, 1480, q));
      c.setAttribute('opacity', t >= a ? 1 : 0);
    });
  };
};

FX.sins = sc => {
  const g = el('g'); const objs = ['ANÚNCIO', 'ORÇAMENTO', 'PREÇO', 'SINAL', 'MARCAÇÃO'];
  const linhas = objs.map((s, k) => {
    const lg = el('g', {}, g);
    el('rect', { x: -60, y: -60, width: 120, height: 120, rx: 18, fill: 'none', stroke: TINTA, 'stroke-width': 8 }, lg);
    const ck = el('path', { d: 'M -32 2 L -8 28 L 38 -30', fill: 'none', stroke: VERM, 'stroke-width': 16, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': 120 }, lg);
    const sim = texto(lg, 'SIM', { x: 110, fill: TINTA, 'font-size': 96, 'text-anchor': 'start', style: "font-family:'Archivo Black';letter-spacing:-3px" });
    const pa = texto(lg, k === 4 ? 'PARA A' : 'PARA O', { x: 370, y: -52, fill: '#7A716A', 'font-size': 40, 'text-anchor': 'start' });
    const ob = texto(lg, s, { x: 370, y: 22, fill: TINTA, 'font-size': 104, 'text-anchor': 'start' });
    return { lg, ck, sim, pa, ob };
  });
  return t => {
    linhas.forEach((o, k) => {
      const a = sc.w(k, 0), q = entra(t, a), aP = sc.w(k, 1), aO = sc.w(k, 3);
      pos(o.lg, 150 + (1 - q) * -120, 470 + k * 245, 1, t >= a ? clamp((t - a) / 0.06, 0, 1) : 0);
      o.pa.setAttribute('opacity', t >= aP ? 1 : 0);
      const qo = entra(t, aO); o.ob.setAttribute('opacity', t >= aO ? 1 : 0);
      o.ob.setAttribute('transform', `translate(${(1 - qo) * 80},0)`);
      o.ck.setAttribute('stroke-dashoffset', 120 * (1 - seg(t, aO, 0.22, 'power2.out')));
    });
  };
};

FX.mundo = sc => {
  const g = el('g'); const C = [540, 1180];
  const raios = [150, 250, 345, 430, 500];
  const an = raios.map((r, i) => el('circle', { cx: C[0], cy: C[1], r, fill: 'none', stroke: i === 0 ? CREME : LINHA, 'stroke-width': i === 0 ? 5 : 4 }, g));
  const rng = S.rng(11);
  const gente = Array.from({ length: 16 }, (_, i) => ({ c: el('circle', { r: 10, fill: CREME }, g), r: raios[2 + (i % 3)], a: rng() * 6.28, v: 0.05 + rng() * 0.07 }));
  const nucleo = el('circle', { cx: C[0], cy: C[1], r: 150, fill: VERM, opacity: 0 }, g);
  const zona = texto(g, 'ZONA DE', { x: C[0], y: C[1] - 46, fill: CREME, 'font-size': 52, style: "font-family:'Archivo Black'", opacity: 0 });
  const lucro = texto(g, 'LUCRO', { x: C[0], y: C[1] + 28, fill: CREME, 'font-size': 92, style: "font-family:'Archivo Black';letter-spacing:-3px", opacity: 0 });
  const viajante = el('circle', { r: 16, fill: CREME, opacity: 0 }, g);
  const temCentro = sc.bs.some(b => b.palavras.some(p => /^CENTRO/.test(p.el.textContent)));
  const temZona = sc.bs[sc.bs.length - 1].op.oculto;
  return t => {
    const cresce = sc.w(0, sc.bs[0].palavras.length - 1);
    an.forEach((c, i) => {
      const a = sc.ini + 0.05 + i * 0.07, q = seg(t, a, 0.6, 'expo.out');
      const extra = temZona ? 0.06 * seg(t, cresce, 0.8, 'power2.out') : 0;
      c.setAttribute('r', raios[i] * (S.mix(0.8, 1, q) + extra)); c.setAttribute('opacity', t >= a ? clamp((t - a) / 0.1, 0, 1) : 0);
    });
    gente.forEach((p, i) => {
      const a = sc.ini + 0.4 + i * 0.03, ang = p.a + t * p.v;
      p.c.setAttribute('cx', C[0] + Math.cos(ang) * p.r); p.c.setAttribute('cy', C[1] + Math.sin(ang) * p.r);
      p.c.setAttribute('opacity', t >= a ? 0.85 : 0);
    });
    if (temCentro) {
      const k = sc.bs.findIndex(b => b.palavras.some(p => /^CENTRO/.test(p.el.textContent)));
      const a = sc.bs[k].palavras[2] ? sc.w(k, 2) : sc.w(k, sc.bs[k].palavras.length - 1);
      const q = seg(t, a - 0.25, 1.1, 'power3.inOut'), ang = -2.2 + q * 3.6, r = S.mix(500, 0, q);
      viajante.setAttribute('cx', C[0] + Math.cos(ang) * r); viajante.setAttribute('cy', C[1] + Math.sin(ang) * r);
      viajante.setAttribute('opacity', t >= a - 0.25 ? 1 : 0);
    }
    if (temZona) {
      const k = sc.bs.length - 1, aZ = sc.w(k, 0), aL = sc.w(k, 2), q = seg(t, aZ, 0.3, 'expo.out');
      nucleo.setAttribute('opacity', t >= aZ ? 1 : 0); nucleo.setAttribute('r', 150 * S.mix(1.25, 1, q));
      zona.setAttribute('opacity', t >= aZ ? 1 : 0);
      lucro.setAttribute('opacity', t >= aL ? 1 : 0);
      lucro.setAttribute('transform', `translate(${C[0]},${C[1] + 28}) scale(${S.mix(1.35, 1, entra(t, aL))}) translate(${-C[0]},${-C[1] - 28})`);
    }
  };
};

FX.teia = sc => {
  const g = el('g'), ga = el('g', {}, g), gn = el('g', {}, g);
  const N = {
    post: [250, 590, 'POST'], cont: [790, 590, 'CONTEÚDO'], dm: [790, 930, 'DM'], ofe: [540, 1270, 'OFERTA'],
    story: [230, 1000, 'STORY'], dest: [270, 1620, 'DESTAQUE'], link: [800, 1620, 'LINK NA BIO'] };
  const nos = {};
  for (const k in N) nos[k] = k === 'ofe'
    ? pilula(gn, N[k][2], { fs: 92, fill: VERM, stroke: VERM, fam: "'Archivo Black'", pad: 90 })
    : pilula(gn, N[k][2], { fs: 66 });
  const arestas = [['post', 'cont'], ['cont', 'dm'], ['dm', 'ofe'], ['story', 'ofe'], ['dest', 'ofe'], ['link', 'ofe']].map(([a, b]) => {
    const [x1, y1] = N[a], [x2, y2] = N[b], d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
    const c1 = b === 'ofe' ? 120 : 110, c2 = b === 'ofe' ? 130 : 100;
    const p1 = [x1 + ux * c1, y1 + uy * (a === 'cont' ? 70 : c1 * 0.6)], p2 = [x2 - ux * c2, y2 - uy * (b === 'dm' ? 70 : c2 * 0.7)];
    const L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const ln = el('line', { x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1], stroke: CREME, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-dasharray': L }, ga);
    const ang = Math.atan2(uy, ux) * 180 / Math.PI;
    const ponta = el('path', { d: 'M 0 0 L -26 -15 L -26 15 Z', fill: CREME }, ga);
    const sinal = el('circle', { r: 12, fill: VERM }, ga);
    return { ln, ponta, sinal, p1, p2, L, ang };
  });
  // quando cada coisa aparece: [tela, palavra]
  const quando = { post: [0, 1], cont: [0, 5], dm: [1, 5], ofe: [3, 3], story: [5, 3], dest: [7, 3], link: [9, 3] };
  const qa = [[0, 2], [1, 2], [2, 2], [6, 2], [8, 1], [10, 1]];
  return t => {
    for (const k in nos) {
      const p = nos[k]; if (!p.w || p.w < 80) p.ajusta();
      const a = sc.w(...quando[k]), q = seg(t, a, k === 'ofe' ? 0.3 : 0.24, 'expo.out');
      let s = S.mix(k === 'ofe' ? 1.45 : 0.8, 1, q);
      if (k === 'ofe') { const fim = sc.w(10, 4); s *= 1 + 0.1 * (t >= fim ? 1 - seg(t, fim, 0.4, 'power2.out') : 0); }
      pos(p, N[k][0], N[k][1] + (k === 'ofe' ? 0 : (1 - q) * 40), s, t >= a ? clamp((t - a) / 0.06, 0, 1) : 0);
    }
    arestas.forEach((e, i) => {
      const a = sc.w(...qa[i]), q = seg(t, a, 0.4, 'power2.out');
      e.ln.setAttribute('stroke-dashoffset', e.L * (1 - q)); e.ln.setAttribute('opacity', t >= a ? 1 : 0);
      const x = S.mix(e.p1[0], e.p2[0], q), y = S.mix(e.p1[1], e.p2[1], q);
      e.ponta.setAttribute('transform', `translate(${x},${y}) rotate(${e.ang})`); e.ponta.setAttribute('opacity', t >= a ? 1 : 0);
      // o sinal corre pela aresta depois de desenhada, e de novo no fecho
      const fim = sc.w(10, 4);
      const s1 = seg(t, a + 0.35, 0.5, 'power1.inOut'), s2 = seg(t, fim, 0.45, 'power1.inOut');
      const s = t >= fim ? s2 : s1, viva = (t >= a + 0.35 && t < a + 0.85) || (t >= fim && t < fim + 0.45);
      e.sinal.setAttribute('cx', S.mix(e.p1[0], e.p2[0], s)); e.sinal.setAttribute('cy', S.mix(e.p1[1], e.p2[1], s));
      e.sinal.setAttribute('opacity', viva ? 1 : 0);
    });
  };
};

function marca(linhas, y) {        // [[texto, cor, [tela, palavra]], ...] centralizado, cada linha ocupa a largura
  return sc => {
    const g = el('g'); const ts = linhas.map(([s, cor]) => texto(g, s, { fill: cor, 'font-size': 100, style: "font-family:'Archivo Black';letter-spacing:-4px" }));
    let tam = null;
    return t => {
      if (!tam || tam.some(x => !x)) tam = ts.map((e, i) => { const w = e.getComputedTextLength(); return w ? Math.min(linhas[i][3] || 240, 100 * 900 / w) : 0; });
      let yy = y;
      ts.forEach((e, i) => {
        const fs = tam[i] || 100, a = sc.w(...linhas[i][2]), q = seg(t, a, 0.3, 'expo.out');
        e.setAttribute('font-size', fs);
        yy += i ? fs * 0.92 : 0;
        const esc = S.mix(1.3, 1, q) * (1 + 0.03 * seg(t, a, 2.5, 'sine.out'));
        e.setAttribute('transform', `translate(540,${yy}) scale(${esc})`);
        e.setAttribute('opacity', t >= a ? clamp((t - a) / 0.05, 0, 1) : 0);
        e.setAttribute('filter', 'url(#brilho)');
      });
    };
  };
}
FX.marca = marca([['TATTOO', CREME, [0, 0], 210], ['BRAND.', VERM, [0, 0], 210]], 860);
FX.marca2 = marca([['O', CREME, [0, 0], 90], ['PROFILE', CREME, [0, 1], 220], ['FUNNEL', VERM, [0, 2], 220]], 760);
FX.final = sc => t => {};

// brilho vermelho (assinatura do estilo)
const defs = el('defs');
const f = el('filter', { id: 'brilho', x: '-30%', y: '-60%', width: '160%', height: '220%' }, defs);
el('feGaussianBlur', { in: 'SourceAlpha', stdDeviation: 22, result: 'b' }, f);
el('feFlood', { 'flood-color': VERM, 'flood-opacity': 0.8 }, f);
el('feComposite', { in2: 'b', operator: 'in', result: 'g' }, f);
const fm = el('feMerge', {}, f); el('feMergeNode', { in: 'g' }, fm); el('feMergeNode', { in: 'SourceGraphic' }, fm);

// agrupa telas seguidas com o mesmo fx numa cena
const cenas = []; telas.forEach((tl, i) => {
  const nome = tl.op.fx; if (!nome) return;
  const ult = cenas[cenas.length - 1];
  if (ult && ult.nome === nome && ult.idx[ult.idx.length - 1] === i - 1) ult.idx.push(i); else cenas.push({ nome, idx: [i] });
});
cenas.forEach(c => {
  const sc = cena(c.nome, c.idx), grupo = el('g', { opacity: 0 });
  const antes = fxL.lastChild; const desenha = FX[c.nome](sc);
  // move o que a cena criou para dentro do seu grupo
  let n = grupo.nextSibling; while (n) { const nx = n.nextSibling; grupo.appendChild(n); n = nx; }
  c.sc = sc; c.g = grupo; c.desenha = desenha;
  c.idx.forEach(i => { telas[i].cena = c; });
});

// palavras-soco: o risco de luz atravessa a tela
const socos = []; telas.forEach(tl => tl.palavras.forEach(p => { if (p.soco) socos.push({ tl, p }); }));
const marcasOcultas = telas.filter(tl => tl.op.fx === 'marca' || tl.op.fx === 'marca2' || (tl.op.oculto && /OR.AMENTO|LUCRO/.test(tl.palavras.map(p => p.el.textContent).join(' '))));

// ------------------------------------------------------------------ desenha o quadro
let atual = null;
function acha(t) { let lo = 0, hi = telas.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (telas[m].ini <= t) lo = m; else hi = m - 1; } return telas[lo]; }

function render(t) {
  mede();
  const tl = acha(t);
  if (atual !== tl) {
    if (atual) atual.el.style.display = 'none';
    if (!tl.op.oculto) tl.el.style.display = 'block';
    fundo.className = 'abs ' + tl.bg; atual = tl;
    cenas.forEach(c => c.g.setAttribute('opacity', c === tl.cena ? 1 : 0));
  }
  if (tl.cena) tl.cena.desenha(t);

  // câmera: empurra devagar durante a tela; tranco curto no soco
  let tremor = 0;
  tl.palavras.forEach(p => { if (p.soco && t >= p.t) tremor = Math.max(tremor, 1 - seg(t, p.t, 0.16, 'power2.out')); });
  const rnd = S.rng(Math.floor(t * 30) + 3);
  const jx = tremor * (rnd() - 0.5) * 22, jy = tremor * (rnd() - 0.5) * 22;
  const push = 1 + 0.035 * seg(t, tl.ini, Math.max(0.6, tl.fim - tl.ini), 'sine.out');
  if (!tl.op.oculto) {
    tl.el.style.transformOrigin = `${tl.cx || 540}px ${tl.cy || 960}px`;
    tl.el.style.transform = `translate(${jx}px,${jy}px) scale(${push})`;
  }
  fxL.style.transform = `translate(${jx * 0.6}px,${jy * 0.6}px)`;

  // carimbo bate no começo da tela
  if (tl.op.carimbo) {
    const q = seg(t, tl.palavras[0].t, 0.22, 'expo.out');
    tl.bloco.style.transform = `rotate(-4deg) scale(${S.mix(1.5, 1, q)})`;
    tl.bloco.style.opacity = t >= tl.palavras[0].t ? 1 : 0;
  }

  // cada palavra entra quando é dita
  tl.palavras.forEach((p, k) => {
    const a = p.t - 0.02;
    if (t < a) { p.el.style.opacity = 0; return; }
    if (p.soco) {
      const q = seg(t, a, 0.3, 'expo.out');
      p.el.style.opacity = clamp((t - a) / 0.05, 0, 1);
      p.el.style.transform = `scale(${S.mix(1.5, 1, q)})`;
      p.el.style.filter = q > 0.98 ? 'none' : `blur(${(1 - q) * 26}px)`;
    } else {
      const q = seg(t, a, 0.22, 'expo.out'), lado = p.li % 2 ? -1 : 1;
      const dx = p.larga ? 0 : lado * 90 * (1 - q), dy = p.larga ? 60 * (1 - q) : 0;
      p.el.style.opacity = clamp((t - a) / 0.06, 0, 1);
      p.el.style.transform = `translate(${dx}px,${dy}px)`;
      p.el.style.filter = q > 0.98 ? 'none' : `blur(${(1 - q) * 16}px)`;
    }
  });

  // risco de luz: nas palavras-soco e nos logos
  let rq = -1, ry = 960;
  const alvo = tl.palavras.filter(p => p.soco && t >= p.t).pop();
  if (alvo) { rq = t - alvo.t; ry = alvo.cy || 960; }
  if (marcasOcultas.includes(tl)) { const a = tl.palavras[tl.palavras.length - 1].t; if (t >= a) { rq = t - a; ry = tl.op.fx === 'marca2' ? 1050 : tl.op.fx === 'marca' ? 880 : (tl.cena && tl.cena.nome === 'mundo' ? 1200 : 1470); } }
  if (rq >= 0 && rq < 0.75) {
    const ab = seg(rq, 0, 0.2, 'expo.out'), some = seg(rq, 0.25, 0.5, 'power2.in');
    risco.style.opacity = 1 - some;
    risco.style.transform = `translate(0px,${ry}px) scaleX(${ab}) scaleY(${1 + 0.6 * (1 - ab)})`;
  } else risco.style.opacity = 0;
}

window.__mede = mede; window.__acha = acha; window.__render = render;
window.__timelines = window.__timelines || {};
window.__timelines.main = S.play(render, { loop: false });
})();
