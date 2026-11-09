// motor.js v2: tipografia gritada (letra gigante, volume 3D, chicote com borrão, faíscas) + ilustrações de lousa.
// Um relógio só: render(t) desenha o quadro inteiro a partir de t. Sem Math.random, Date.now ou timers.
(function () {
const S = STUDIO, W = 1080, H = 1920, M = 60;
const R = window.ROTEIRO, T = window.TEMPOS;
const VERM = '#DF1904', CREME = '#F3F0E8', TINTA = '#121010', AZUL = '#2AA7E0', LARANJA = '#EFA24A', VERDE = '#1F8A3B', CINZA = '#5B5753';
const seg = (t, a, d, e) => S.seg(t, a, d, e), mix = S.mix;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const vis = (t, a, d = 0.05) => (t >= a ? clamp((t - a) / d, 0, 1) : 0);
const NS = 'http://www.w3.org/2000/svg';
const $ = id => document.getElementById(id);
const palco = $('palco'), fundo = $('fundo'), luz = $('luz'), faixas = $('faixas'), vinheta = $('vinheta'),
      lousa = $('lousa'), risco = $('risco'), visor = $('visor'), tc = $('tc'), rec = $('rec'), cv = $('faisca'), cx2 = cv.getContext('2d');

// filtros de borrão só na horizontal (o chicote da referência)
const filtros = $('filtros');
for (let k = 1; k <= 10; k++) {
  const f = document.createElementNS(NS, 'filter'); f.id = 'bx' + k;
  f.setAttribute('x', '-50%'); f.setAttribute('width', '200%'); f.setAttribute('y', '-10%'); f.setAttribute('height', '120%');
  const g = document.createElementNS(NS, 'feGaussianBlur'); g.setAttribute('stdDeviation', `${k * 7} ${k * 0.6}`);
  f.appendChild(g); filtros.appendChild(f);
}
const borrao = q => { const k = Math.round(clamp(q, 0, 1) * 10); return k ? `url(#bx${k})` : 'none'; };

// palavras curtas viram a fonte larga pequena (as "amarrações" da referência: E TU PODE PEDIR)
const CURTAS = new Set('E O A OS AS DE DO DA DOS DAS UM UMA QUE PRA PARA POR NO NA NOS NAS SE EM À AO TE EU ELE ELA É SÓ SEU SUA SEUS MAS COM SEM NÃO TU ISSO ESSE ESSA'.split(' '));
const limpa = s => s.replace(/[,.:?]/g, '');

// volume 3D: camadas de sombra dura + brilho
function volume(cor, n, brilho) {
  const c = []; for (let i = 1; i <= n; i++) c.push(`${i * 1.4}px ${i * 1.6}px 0 ${cor}`);
  if (brilho) c.push(brilho); return c.join(',');
}
const VOL = {
  k: volume('#5E0B05', 8, '0 0 50px rgba(223,25,4,.55)'), kd: volume('#3E0603', 8, '0 0 50px rgba(223,25,4,.6)'),
  c: volume('#C8BFB1', 6), cd: volume('#8E1205', 6),
  r: volume('#7E0A03', 8, '0 0 40px rgba(60,0,0,.35)'), rd: volume('#4A0402', 6),
  lousa: volume('#CFC7B9', 4),
};

// ------------------------------------------------------------------ telas de texto
let gw = 0;
const telas = R.map((b, i) => {
  const [bg, txt, op = {}] = b;
  const rng = S.rng(1000 + i);
  const el = document.createElement('div'); el.className = 'tela abs ' + bg + (op.carimbo ? ' carimbo' : '');
  const bloco = document.createElement('div'); bloco.className = 'bloco'; el.appendChild(bloco);
  const linhas = [], palavras = [];
  const nLinhas = txt.split('|').length;
  txt.split('|').forEach((ln, li) => {
    const l = document.createElement('div'); l.className = 'l';
    const inner = document.createElement('span'); l.appendChild(inner);
    const ws = ln.trim().split(/\s+/);
    ws.forEach((raw, wi) => {
      const m = raw.match(/^([*^!_]*)(.*)$/), mk = m[1], tx = m[2];
      const s = document.createElement('span'); s.className = 'w';
      if (tx.includes('/')) { const [a, b2] = tx.split('/'); s.innerHTML = ws.length === 1 && mk.includes('!') ? `${a}<br><span class="b2">${b2}</span>` : `${a}<span class="b2">${b2}</span>`; } else s.textContent = tx;
      const soco = mk.includes('!'), dest = mk.includes('*');
      if (dest) s.classList.add('dest');
      if (mk.includes('^')) s.classList.add('larga');
      if (soco) s.classList.add('soco');
      if (soco && !tx.includes('/')) { s.textContent = ''; [...tx].forEach(ch => { const c = document.createElement('span'); c.className = 'ch'; c.textContent = ch; s.appendChild(c); }); }
      if (mk.includes('_')) s.classList.add('contorno');
      // amarração: palavra curta numa linha com mais palavras vira larga e pequena
      if (!mk && ws.length > 1 && CURTAS.has(limpa(tx))) s.classList.add('larga', 'mini');
      if (wi < ws.length - 1) s.style.marginRight = '0.16em';
      inner.appendChild(s);
      palavras.push({ el: s, t: T[gw], li, soco, dest, g: gw });
      gw++;
    });
    bloco.appendChild(l); linhas.push({ el: l, inner, soco: /!/.test(ln), so1: ws.length === 1 });
  });
  if (!op.oculto) palco.appendChild(el);
  const temSoco = palavras.some(p => p.soco);
  const al = op.al || (temSoco || op.fx ? 'c' : ['l', 'c', 'r'][Math.floor(rng() * 3)]);
  const dir = rng() < 0.5 ? -1 : 1;
  const mov = op.fx && op.fx !== 'final' ? -1 : Math.floor(rng() * 6);
  return { i, bg, op, el, bloco, linhas, palavras, al, dir, rng, mov,
    rotY: (rng() - 0.5) * 22, rotX: (rng() - 0.5) * 12, rotZ: (rng() - 0.5) * 5,
    ini: i === 0 ? 0 : palavras[0].t - 0.06 };
});
const DUR = S.D;
telas.forEach((tl, i) => { tl.fim = i < telas.length - 1 ? telas[i + 1].ini : DUR; });

let medido = null;
function mede() {
  const pronto = document.fonts && document.fonts.status === 'loaded';
  if (medido === pronto) return; medido = pronto;
  telas.forEach(tl => {
    if (tl.op.oculto) return;
    const lous = !!tl.op.fx && tl.op.fx !== 'final';
    tl.el.style.display = 'block'; tl.el.style.transform = 'none';
    const larg = W - 2 * M - (tl.op.carimbo ? 116 : 0);
    tl.linhas.forEach(l => {
      l.el.style.fontSize = '100px';
      const nat = l.inner.getBoundingClientRect().width || 1;
      let alvo = larg, cap = 430;
      if (l.so1 && l.soco && !lous && l.inner.textContent.length <= 7) alvo = W * 1.04;          // palavra-soco sozinha estoura a tela
      if (lous) cap = 160;
      if (tl.op.carimbo) cap = 200;
      l.el.style.fontSize = Math.min(cap, 100 * alvo / nat) + 'px';
      l.el.style.textAlign = tl.al === 'c' ? 'center' : tl.al === 'r' ? 'right' : 'left';
    });
    const r = tl.bloco.getBoundingClientRect();
    const x = tl.al === 'c' ? (W - r.width) / 2 : tl.al === 'r' ? W - M - r.width : M;
    const yc = (tl.op.y != null ? tl.op.y : 0.5) * H;
    const y = lous ? Math.max(90, yc - r.height / 2) : yc - r.height / 2;
    tl.bloco.style.left = x + 'px'; tl.bloco.style.top = y + 'px';
    tl.cx = x + r.width / 2; tl.cy = y + r.height / 2;
    tl.palavras.forEach(p => { const q = p.el.getBoundingClientRect(); p.cx = q.left + q.width / 2; p.cy = q.top + q.height * 0.5; });
    montaCenario(tl);
    tl.el.style.display = 'none';
  });
}

// ------------------------------------------------------------------ cenário em profundidade (atrás do texto)
const CODIGO = [
  [['k', 'const '], ['t', 'perfil'], ['p', ' = '], ['k', 'novo '], ['t', 'Funil'], ['p', '({']],
  [['p', '  conteudo: '], ['s', "'intencional'"], ['p', ',']],
  [['p', '  teia: ['], ['s', "'post'"], ['p', ', '], ['s', "'story'"], ['p', ', '], ['s', "'dm'"], ['p', '],']],
  [['p', '  oferta: '], ['k', 'true'], ['p', ',']],
  [['p', '  zona: '], ['s', "'lucro'"]],
  [['p', '});']],
  [['c', '// sem orçamento no meio']],
  [['t', 'perfil'], ['p', '.'], ['k', 'vender'], ['p', '('], ['t', 'audiencia'], ['p', ');']],
];
const COR_COD = { k: '#FF4A2E', t: '#F3F0E8', p: '#B9AFA6', s: '#EFA24A', c: '#6E625B' };
function montaCenario(tl) {
  if (tl.cen) { tl.cen.remove(); tl.cen = null; tl.camadas = null; }
  if (tl.op.oculto || (tl.op.fx && tl.op.fx !== 'final')) return;
  const r = S.rng(7000 + tl.i), cen = document.createElement('div'); cen.className = 'cen abs';
  tl.el.insertBefore(cen, tl.bloco); tl.cen = cen; tl.camadas = [];
  const cx = tl.cx, cy = tl.cy, bg = tl.bg;
  const add = (html, z, extra, fn) => { const d = document.createElement('div'); d.className = 'cam'; d.innerHTML = html; Object.assign(d.style, extra); cen.appendChild(d); tl.camadas.push({ d, z, fn }); return d; };
  // poeira com paralaxe em todo fundo escuro
  if (bg !== 'c') for (let i = 0; i < 26; i++) {
    const sz = 3 + r() * 10, x = -200 + r() * 1480, y = -200 + r() * 2320, z = -900 + r() * 1100, v = 10 + r() * 40;
    add('', z, { left: x + 'px', top: y + 'px', width: sz + 'px', height: sz + 'px', borderRadius: '50%', background: bg === 'r' ? 'rgba(255,220,200,.5)' : 'rgba(255,110,80,.75)', boxShadow: `0 0 ${sz * 2}px rgba(255,60,30,.8)`, filter: z < -500 ? 'blur(3px)' : 'none' }, (d, t) => `translateY(${-v * t}px)`);
  }
  const palavra = tl.palavras.map(p => p.el.textContent).sort((a, b) => b.length - a.length)[0] || '';
  const tipos = bg === 'r' ? ['eco', 'forma', 'raios', 'eco'] : bg === 'c' ? ['eco', 'codigo', 'forma', 'grade'] : ['eco', 'raios', 'grade', 'forma', 'codigo'];
  const escolha = [tipos[Math.floor(r() * tipos.length)]];
  if (r() < 0.5) { const o = tipos[Math.floor(r() * tipos.length)]; if (o !== escolha[0]) escolha.push(o); }
  escolha.forEach(tp => {
    if (tp === 'eco') {
      const cor = bg === 'c' ? 'rgba(18,16,16,.16)' : bg === 'r' ? 'rgba(255,235,225,.28)' : 'rgba(223,25,4,.5)';
      add(`<span style="font:400 560px/0.9 Anton;-webkit-text-stroke:3px ${cor};color:transparent;white-space:nowrap">${palavra}</span>`, -900,
        { left: '0', top: (cy - 260) + 'px', width: '1080px', textAlign: 'center', filter: 'blur(2px)' }, (d, t) => `translateX(${tl.dir * -60 * seg(t, tl.ini, 3, 'none')}px) scale(1.7)`);
    }
    if (tp === 'raios') {
      let ln = ''; for (let i = 0; i < 34; i++) { const a = r() * Math.PI * 2, r0 = 260 + r() * 160, r1 = r0 + 300 + r() * 900; ln += `<line x1="${cx + Math.cos(a) * r0}" y1="${cy + Math.sin(a) * r0}" x2="${cx + Math.cos(a) * r1}" y2="${cy + Math.sin(a) * r1}" stroke="${bg === 'r' ? 'rgba(255,230,220,.35)' : 'rgba(223,25,4,.55)'}" stroke-width="${1 + r() * 2}"/>`; }
      add(`<svg width="1080" height="1920" viewBox="0 0 1080 1920">${ln}</svg>`, -350, { left: 0, top: 0 }, (d, t) => `rotate(${tl.dir * 6 * seg(t, tl.ini, 4, 'none')}deg)`).style.transformOrigin = `${cx}px ${cy}px`;
    }
    if (tp === 'grade') {
      const cor = bg === 'c' ? 'rgba(18,16,16,.18)' : 'rgba(223,25,4,.45)';
      add('', -150, { left: '-700px', top: (cy + 120) + 'px', width: '2480px', height: '2400px', transformOrigin: '50% 0', backgroundImage: `linear-gradient(${cor} 2px, transparent 2px), linear-gradient(90deg, ${cor} 2px, transparent 2px)`, backgroundSize: '90px 90px', WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0) 60%)' },
        (d, t) => { d.style.backgroundPosition = `0 ${-120 * seg(t, tl.ini, 4, 'none')}px`; return 'rotateX(76deg)'; });
    }
    if (tp === 'forma') {
      const d0 = 640 + r() * 420, ox = (r() < 0.5 ? -1 : 1) * (240 + r() * 200), oy = (r() - 0.5) * 500;
      add('', -420, { left: (cx + ox - d0 / 2) + 'px', top: (cy + oy - d0 / 2) + 'px', width: d0 + 'px', height: d0 + 'px', borderRadius: '50%', background: bg === 'r' ? 'rgba(40,0,0,.28)' : '#DF1904', boxShadow: bg === 'k' ? '0 0 160px rgba(223,25,4,.6)' : 'none' },
        (d, t) => `scale(${mix(0.75, 1, seg(t, tl.ini, 0.5, 'expo.out'))})`);
    }
    if (tp === 'codigo') {
      const html = `<div style="width:640px;padding:26px 30px 30px;background:#141010;border:1px solid #3A2C26;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.45);font:500 25px/1.55 'JetBrains Mono',monospace;white-space:pre">`
        + `<div style="display:flex;gap:10px;margin-bottom:18px"><i style="width:14px;height:14px;border-radius:50%;background:#DF1904"></i><i style="width:14px;height:14px;border-radius:50%;background:#5E4B42"></i><i style="width:14px;height:14px;border-radius:50%;background:#5E4B42"></i><span style="margin-left:14px;color:#6E625B;font-size:20px">tattoobrand.js</span></div>`
        + CODIGO.map(l => '<div>' + l.map(([c, x]) => `<span style="color:${COR_COD[c]}">${x.replace(/</g, '&lt;')}</span>`).join('') + '</div>').join('') + '</div>';
      const acima = cy > 960;
      add(html, -520, { left: (r() < 0.5 ? 40 : 400) + 'px', top: (acima ? cy - 820 : cy + 330) + 'px', filter: 'blur(1.5px)' }, (d, t) => `rotateY(${tl.dir * 22}deg) translateY(${-40 * seg(t, tl.ini, 3, 'none')}px)`);
    }
  });
  tl.visor = bg !== 'c' && r() < 0.28;
}

// ------------------------------------------------------------------ lousa (ilustrações no traço de marcador)
const rc = rough.svg(lousa);
const defs = document.createElementNS(NS, 'defs'); lousa.appendChild(defs);
// o bonequinho do quadro
const sym = document.createElementNS(NS, 'symbol'); sym.id = 'gente'; sym.setAttribute('viewBox', '0 0 20 44');
sym.innerHTML = '<circle cx="10" cy="5" r="4.6"/><path d="M4.6 11.2 H15.4 Q17.4 11.2 17.6 13.4 L18.6 24.2 Q18.7 25.6 17.3 25.6 Q16.2 25.6 16 24.4 L15 16.6 V42 Q15 43.6 13.4 43.6 Q11.8 43.6 11.8 42 V28.6 H8.2 V42 Q8.2 43.6 6.6 43.6 Q5 43.6 5 42 V16.6 L4 24.4 Q3.8 25.6 2.7 25.6 Q1.3 25.6 1.4 24.2 L2.4 13.4 Q2.6 11.2 4.6 11.2 Z"/>';
defs.appendChild(sym);

function el(tag, at, pai) { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); (pai || lousa).appendChild(e); return e; }
function texto(pai, s, at) { const e = el('text', Object.assign({ 'text-anchor': 'middle' }, at), pai); e.textContent = s; return e; }
let semente = 1;
const O = o => Object.assign({ seed: semente++, roughness: 1.3, bowing: 1.2, stroke: '#141414', strokeWidth: 4.5 }, o);
// um traço que se desenha: guarda os paths e o comprimento de cada um
function traco(g) {
  const ps = [...g.querySelectorAll('path')].map(p => { const L = p.getTotalLength() || 1; p.setAttribute('stroke-dasharray', `${L} ${L}`); p.setAttribute('stroke-dashoffset', L); return { p, L }; });
  const tot = ps.reduce((a, b) => a + b.L, 0);
  return { g, ps, tot, desenha(q) { let r = q * tot; ps.forEach(o => { const v = clamp(r, 0, o.L); o.p.setAttribute('stroke-dashoffset', o.L - v); r -= o.L; }); } };
}
function grupo(pai) { return el('g', {}, pai); }
function add(pai, node) { pai.appendChild(node); return node; }

// funil: boca hachurada, faixas com rabisco, bico
function funil(pai, x, y, w, h) {
  const g = grupo(pai), ry = w * 0.13, bw = w * 0.2, yc = y + h * 0.64, yb = y + h;
  const meia = f => mix(w / 2, bw / 2, f);
  add(g, rc.ellipse(x, y, w, ry * 2, O({ fill: '#1A1A1A', fillStyle: 'hachure', hachureGap: Math.max(5, w / 48), hachureAngle: -40, fillWeight: Math.max(1.4, w / 260) })));
  add(g, rc.line(x - w / 2, y, x - bw / 2, yc, O())); add(g, rc.line(x + w / 2, y, x + bw / 2, yc, O()));
  add(g, rc.line(x - bw / 2, yc, x - bw / 2 * 0.92, yb, O())); add(g, rc.line(x + bw / 2, yc, x + bw / 2 * 0.92, yb, O()));
  add(g, rc.arc(x, yb, bw * 0.92, bw * 0.28, 0, Math.PI, false, O({ strokeWidth: 3.5 })));
  const fr = [0.17, 0.32, 0.46, 0.585];
  fr.forEach((f, i) => {
    const hw = meia(f / 0.64), yy = y + h * f;
    add(g, rc.arc(x, yy, hw * 2, ry * 2 * hw / (w / 2), 0, Math.PI, false, O({ strokeWidth: 4 })));
    // rabisco dentro da faixa
    const yr = y + h * (f + (fr[i + 1] ? fr[i + 1] - f : 0.06) * 0.62) - 4, ww = hw * 0.95, pts = [];
    const rr = S.rng(semente * 7); const n = 11;
    for (let k = 0; k <= n; k++) pts.push([x - ww / 2 + ww * k / n + (rr() - 0.5) * 6, yr + (k % 2 ? -1 : 1) * (6 + rr() * 6) * Math.min(1, w / 400)]);
    add(g, rc.curve(pts, O({ strokeWidth: Math.max(2.4, w / 150), roughness: 1.6 })));
  });
  return { g, tr: traco(g), boca: { x, y, w, ry }, bico: { x, y: yb } };
}
// seta rabiscada (vários traços)
function seta(pai, x1, y1, x2, y2, sw = 3.4) {
  const g = grupo(pai), a = Math.atan2(y2 - y1, x2 - x1), L = 46;
  for (let k = 0; k < 4; k++) add(g, rc.line(x1 + k * 3, y1 + (k - 1.5) * 4, x2, y2, O({ strokeWidth: sw, roughness: 1.8 })));
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) add(g, rc.line(x2, y2, x2 - L * Math.cos(a + s * (0.45 + k * 0.06)), y2 - L * Math.sin(a + s * (0.45 + k * 0.06)), O({ strokeWidth: sw, roughness: 1.6 })));
  return traco(g);
}
function circulo(pai, cx, cy, d, o) { const g = grupo(pai); add(g, rc.ellipse(cx, cy, d, d * 0.96, O(Object.assign({ strokeWidth: 7, roughness: 1.5 }, o)))); return traco(g); }
// gente: pontos sem encostar, dentro de uma área
function multidao(n, dentro, caixa, dmin, seed) {
  const r = S.rng(seed), out = []; let tent = 0;
  while (out.length < n && tent++ < n * 400) {
    const x = mix(caixa[0], caixa[2], r()), y = mix(caixa[1], caixa[3], r());
    if (!dentro(x, y)) continue;
    if (out.some(p => Math.hypot(p.x - x, p.y - y) < dmin)) continue;
    out.push({ x, y, d: r(), r: r() });
  }
  return out.sort((a, b) => a.y - b.y);
}
function boneco(pai, x, y, alt, cor) {
  const u = el('use', { href: '#gente', width: alt * 20 / 44, height: alt, x: -alt * 10 / 44, y: -alt, fill: cor }, pai);
  return { u, x, y, alt, cor, pos(px, py, s = 1, op = 1, c) { u.setAttribute('transform', `translate(${px},${py}) scale(${s})`); u.setAttribute('opacity', op); if (c) u.setAttribute('fill', c); } };
}
function rotulo(pai, s, x, y, fs = 42, extra) { return texto(pai, s, Object.assign({ x, y, class: 'rotulo', 'font-size': fs }, extra)); }

function cena(nome, idx) { const bs = idx.map(i => telas[i]); return { nome, bs, ini: bs[0].ini, fim: bs[bs.length - 1].fim, w: (k, j) => bs[k].palavras[j < 0 ? bs[k].palavras.length + j : j].t }; }
const FX = {};

// 1 · o funil convencional, e só uma pessoa sai
FX.funilmorto = sc => {
  const g = grupo(), f = funil(g, 540, 1010, 600, 720);
  const gente = multidao(46, (x, y) => true, [290, 760, 790, 975], 34, 3).map(p => ({ p, b: boneco(g, p.x, p.y, 62, AZUL) }));
  const sai = boneco(g, 540, 1860, 78, VERM);
  return t => {
    f.tr.desenha(seg(t, sc.ini + 0.05, 1.1, 'power2.inOut'));
    gente.forEach(({ p, b }, i) => { const a = sc.ini + 0.5 + p.d * 1.1, q = seg(t, a, 0.45, 'bounce.out'); b.pos(p.x, mix(p.y - 260, p.y, q), 1, vis(t, a)); });
    const a = sc.w(1, -1), q = seg(t, a, 0.5, 'power2.out'); sai.pos(540, mix(1760, 1860, q), mix(1.5, 1, q), vis(t, a));
  };
};

// 2 · cada canal é um funil
FX.funis = sc => {
  const g = grupo(), itens = [['Indicação', 0, 0], ['Anúncio', 0, 1], ['Promoção', 0, 2], ['Site', 0, 3], ['Formulário', 1, 0], ['WhatsApp automático', 1, 1], ['Preço tabelado', 1, 3]];
  const pos = [[200, 560], [540, 560], [880, 560], [200, 1050], [540, 1050], [880, 1050], [540, 1520]];
  const fs = itens.map((it, i) => {
    const [x, y] = pos[i], gg = grupo(g), f = funil(gg, x, y, 250, 230);
    const gente = multidao(9, () => true, [x - 100, y - 95, x + 100, y + 2], 26, 50 + i).map(p => ({ p, b: boneco(gg, p.x, p.y, 34, AZUL) }));
    const sai = boneco(gg, x, y + 290, 40, VERM);
    const lb = rotulo(gg, it[0], x, y + 345, it[0].length > 14 ? 40 : 48, { 'font-weight': 400 });
    return { f, gente, sai, lb, gg };
  });
  return t => {
    fs.forEach((o, i) => {
      const a = sc.w(itens[i][1], itens[i][2]);
      o.f.tr.desenha(seg(t, a - 0.05, 0.5, 'power2.out'));
      o.gente.forEach(({ p, b }) => { const aa = a + 0.15 + p.d * 0.35, q = seg(t, aa, 0.35, 'power3.out'); b.pos(p.x, mix(p.y - 90, p.y, q), 1, vis(t, aa)); });
      o.lb.setAttribute('opacity', vis(t, a)); o.lb.setAttribute('transform', `translate(0,${(1 - seg(t, a, 0.25, 'expo.out')) * 30})`);
      const ab = a + 0.7; o.sai.pos(o.sai.x, mix(o.sai.y - 40, o.sai.y, seg(t, ab, 0.35, 'power2.out')), 1, vis(t, ab));
    });
  };
};

// 3 · todos terminam no orçamento
FX.orcamento = sc => {
  const g = grupo(), xs = [170, 400, 630, 860];
  const fs = xs.map((x, i) => {
    const f = funil(g, x, 640, 230, 380);
    const gente = multidao(10, () => true, [x - 95, 520, x + 95, 636], 25, 80 + i).map(p => ({ p, b: boneco(g, p.x, p.y, 32, AZUL) }));
    return { f, gente };
  });
  const caixa = grupo(g), cx = 140, cy = 1300, cw = 800, ch = 300;
  const borda = traco(add(caixa, rc.rectangle(cx, cy, cw, ch, O({ strokeWidth: 6 }))));
  const tinta = traco(add(caixa, rc.rectangle(cx + 8, cy + 8, cw - 16, ch - 16, O({ stroke: 'none', fill: VERM, fillStyle: 'hachure', hachureGap: 13, fillWeight: 4, hachureAngle: -35 }))));
  const lb = texto(caixa, 'ORÇAMENTO', { x: 540, y: cy + ch / 2 + 46, class: 'forte', 'font-size': 150, fill: TINTA, stroke: CREME, 'stroke-width': 14, 'paint-order': 'stroke' });
  const caem = [];
  xs.forEach((x, i) => { for (let k = 0; k < 2; k++) caem.push({ b: boneco(g, x, 1100, 40, VERM), x, k, alvo: [cx + 120 + (i * 2 + k) * 80, cy + ch - 30] }); });
  return t => {
    fs.forEach((o, i) => {
      o.f.tr.desenha(seg(t, sc.ini + i * 0.12, 0.8, 'power2.out'));
      o.gente.forEach(({ p, b }) => { const a = sc.ini + 0.3 + i * 0.1 + p.d * 0.5; b.pos(p.x, mix(p.y - 120, p.y, seg(t, a, 0.35, 'power3.out')), 1, vis(t, a)); });
    });
    borda.desenha(seg(t, sc.w(0, -1), 0.7, 'power2.inOut'));
    const desce = sc.w(1, -1);
    caem.forEach((c, j) => {
      const a = sc.w(0, 2) + j * 0.06, sai = seg(t, a, 0.3, 'power2.out'), vai = seg(t, desce + j * 0.05, 0.6, 'power2.inOut');
      c.b.pos(mix(c.x, c.alvo[0], vai), mix(mix(1060, 1110, sai), c.alvo[1], vai), 1, vis(t, a));
    });
    const ao = sc.w(2, 1), q = seg(t, ao, 0.3, 'expo.out');
    tinta.desenha(seg(t, ao - 0.05, 0.35, 'power2.out'));
    lb.setAttribute('opacity', vis(t, ao)); lb.setAttribute('transform', `translate(540,${cy + ch / 2}) scale(${mix(1.5, 1, q)}) translate(-540,${-cy - ch / 2})`);
  };
};

// 4 · de cada 20, 7 fecham
FX.pessoas = sc => {
  const g = grupo(), fig = [];
  for (let i = 0; i < 20; i++) fig.push(boneco(g, 540 + ((i % 5) - 2) * 190, 840 + Math.floor(i / 5) * 290, 250, AZUL));
  const fecham = new Set([1, 4, 7, 10, 13, 16, 18]);
  return t => {
    const a20 = sc.w(1, 2), a7 = sc.w(3, 1), a13 = sc.w(4, 2), aNao = sc.w(5, -1);
    fig.forEach((b, i) => {
      const a = a20 + i * 0.03, q = seg(t, a, 0.4, 'back.out(2)');
      let cor = AZUL, op = vis(t, a), s = mix(0.6, 1, q), dy = 0;
      if (fecham.has(i) && t >= a7) { cor = VERM; s *= 1 + 0.15 * (1 - seg(t, a7 + (i % 3) * 0.05, 0.35, 'power2.out')); }
      if (!fecham.has(i)) {
        if (t >= a13) s *= 1 + 0.1 * (1 - seg(t, a13 + (i % 4) * 0.04, 0.35, 'power2.out'));
        const sm = seg(t, aNao, 0.6, 'power2.out'); op *= 1 - 0.75 * sm; dy = 30 * sm;
      }
      b.pos(b.x, b.y + dy, s, op, cor);
    });
  };
};

// 5 · muita gente entra, pouca sai
FX.gasto = sc => {
  const g = grupo(), f = funil(g, 540, 940, 660, 720);
  const ondas = [0, 1, 2].map(k => multidao(44, () => true, [230, 560 + (2 - k) * 0, 850, 935], 30, 200 + k).map(p => ({ p, b: boneco(g, p.x + (k - 1) * 9, p.y - k * 18, 60, AZUL) })));
  const st = seta(g, 960, 1500, 640, 1640);
  const sai = [boneco(g, 500, 1820, 78, VERM), boneco(g, 590, 1830, 78, VERM)];
  return t => {
    f.tr.desenha(seg(t, sc.ini, 0.9, 'power2.inOut'));
    const quando = [sc.w(0, -1), sc.w(1, -1), sc.w(2, -1)];
    ondas.forEach((o, k) => o.forEach(({ p, b }) => { const a = quando[k] - 0.2 + p.d * 0.6, q = seg(t, a, 0.45, 'bounce.out'); b.pos(p.x + (k - 1) * 9, mix(p.y - 300, p.y - k * 18, q), 1, vis(t, a)); }));
    st.desenha(seg(t, sc.w(3, -1), 0.45, 'power2.out'));
    sai.forEach((b, i) => { const a = sc.w(4, 0) + i * 0.25, q = seg(t, a, 0.45, 'power2.out'); b.pos(b.x, mix(b.y - 110, b.y, q), mix(1.4, 1, q), vis(t, a)); });
  };
};

// 6 · cinco vezes sim
FX.sins = sc => {
  const g = grupo(), objs = ['anúncio', 'orçamento', 'preço', 'sinal', 'marcação'];
  const ls = objs.map((s, k) => {
    const y = 420 + k * 290, lg = grupo(g);
    const cx = traco(add(lg, rc.rectangle(90, y - 70, 140, 140, O({ strokeWidth: 6 }))));
    const ck = traco(add(lg, rc.linearPath([[118, y - 4], [150, y + 34], [212, y - 56]], O({ stroke: VERM, strokeWidth: 15, roughness: 1 }))));
    const sim = texto(lg, 'SIM', { x: 270, y: y + 40, class: 'forte', 'font-size': 150, fill: TINTA, 'text-anchor': 'start' });
    const pa = rotulo(lg, k === 4 ? 'para a' : 'para o', 500, y - 30, 44, { 'text-anchor': 'start' });
    const ob = texto(lg, s.toUpperCase(), { x: 500, y: y + 52, class: 'forte', 'font-size': 92, fill: VERM, 'text-anchor': 'start' });
    return { cx, ck, sim, pa, ob };
  });
  return t => ls.forEach((o, k) => {
    const a = sc.w(k, 0), aP = sc.w(k, 1), aO = sc.w(k, 3);
    o.cx.desenha(seg(t, a - 0.1, 0.3, 'power2.out'));
    o.sim.setAttribute('opacity', vis(t, a)); o.sim.setAttribute('transform', `translate(${(1 - seg(t, a, 0.25, 'expo.out')) * -80},0)`);
    o.pa.setAttribute('opacity', vis(t, aP));
    o.ob.setAttribute('opacity', vis(t, aO)); o.ob.setAttribute('transform', `translate(${(1 - seg(t, aO, 0.25, 'expo.out')) * 80},0)`);
    o.ck.desenha(seg(t, aO, 0.25, 'power2.out'));
  });
};

// 7 · do funil para o seu mundo
FX.troca = sc => {
  const g = grupo(), f = funil(g, 260, 640, 300, 380);
  const gf = multidao(14, () => true, [140, 520, 380, 636], 26, 300).map(p => ({ p, b: boneco(g, p.x, p.y, 34, AZUL) }));
  const lf = rotulo(g, 'Funil tradicional', 260, 1110, 46);
  const st = seta(g, 400, 760, 560, 990);
  const C = [600, 1390], D = 760, circ = circulo(g, C[0], C[1], D);
  const gm = multidao(190, (x, y) => Math.hypot(x - C[0], (y - 26) - C[1]) < D / 2 - 40, [C[0] - D / 2, C[1] - D / 2, C[0] + D / 2, C[1] + D / 2 + 30], 33, 301).map(p => ({ p, b: boneco(g, p.x, p.y, 40, AZUL) }));
  const lm = rotulo(g, 'seu mundo (marca pessoal)', C[0], C[1] + D / 2 + 90, 48);
  const risca = traco(grupo(g)); // trocado logo abaixo
  const rg = grupo(g); add(rg, rc.line(110, 560, 420, 1080, O({ stroke: VERM, strokeWidth: 10 }))); add(rg, rc.line(420, 560, 110, 1080, O({ stroke: VERM, strokeWidth: 10 })));
  const rq = traco(rg);
  return t => {
    f.tr.desenha(seg(t, sc.ini, 0.8, 'power2.inOut'));
    gf.forEach(({ p, b }) => { const a = sc.ini + 0.3 + p.d * 0.5; b.pos(p.x, mix(p.y - 100, p.y, seg(t, a, 0.35, 'power3.out')), 1, vis(t, a)); });
    lf.setAttribute('opacity', vis(t, sc.ini + 0.5, 0.2));
    st.desenha(seg(t, sc.w(1, -1), 0.4, 'power2.out'));
    const am = sc.w(2, 2);
    circ.desenha(seg(t, am - 0.15, 0.6, 'power2.inOut'));
    gm.forEach(({ p, b }) => { const a = am + 0.1 + p.d * 0.9, q = seg(t, a, 0.3, 'back.out(2)'); b.pos(p.x, p.y, mix(0.3, 1, q), vis(t, a)); });
    lm.setAttribute('opacity', vis(t, am + 0.5, 0.2));
    rq.desenha(seg(t, sc.w(3, -1), 0.4, 'power2.out'));
  };
};

// 8 · o mundo com centro: zona de lucro (mesmo desenho do seu quadro)
function alvo(g, C, D, seed) {
  const circ = circulo(g, C[0], C[1], D), c2 = circulo(g, C[0], C[1], D * 0.56, { strokeWidth: 4.5 }), c3 = circulo(g, C[0], C[1], D * 0.3, { strokeWidth: 4 });
  const gente = multidao(250, (x, y) => Math.hypot(x - C[0], (y - 22) - C[1]) < D / 2 - 34, [C[0] - D / 2, C[1] - D / 2, C[0] + D / 2, C[1] + D / 2 + 30], 31, seed)
    .map(p => { const d = Math.hypot(p.x - C[0], p.y - 22 - C[1]); return { p, d, b: boneco(g, p.x, p.y, 38, AZUL) }; })
    .filter(o => Math.abs(o.d - D * 0.28) > 18 && Math.abs(o.d - D * 0.15) > 16);
  return { circ, c2, c3, gente };
}
FX.zona = sc => {
  const g = grupo(), C = [540, 1260], D = 840, A = alvo(g, C, D, 400);
  const caixa = traco(add(grupo(g), rc.rectangle(50, 560, 980, 1260, O({ strokeWidth: 3.5, strokeLineDash: [18, 14], roughness: 0.8 }))));
  const l1 = rotulo(g, 'tattoobrand', 540, 645, 54, { 'font-weight': 400 });
  const l2 = rotulo(g, '(marca pessoal projetada para fazer dinheiro)', 540, 705, 40, { 'font-style': 'italic' });
  const cifrao = grupo(g);
  add(cifrao, rc.curve([[985, 850], [905, 830], [880, 870], [960, 905], [985, 945], [905, 960], [870, 935]], O({ stroke: VERDE, strokeWidth: 7 })));
  add(cifrao, rc.line(918, 800, 925, 1005, O({ stroke: VERDE, strokeWidth: 6 }))); add(cifrao, rc.line(945, 795, 952, 1000, O({ stroke: VERDE, strokeWidth: 6 })));
  add(cifrao, rc.line(870, 890, 1000, 870, O({ stroke: VERDE, strokeWidth: 5 })));
  const cf = traco(cifrao);
  return t => {
    const a0 = sc.ini, cresce = sc.w(0, -1);
    A.circ.desenha(seg(t, a0, 0.7, 'power2.inOut'));
    const k = 1 + 0.05 * seg(t, cresce, 0.9, 'power2.out');
    g.setAttribute('transform', `translate(${C[0]},${C[1]}) scale(${k}) translate(${-C[0]},${-C[1]})`);
    const aLar = sc.w(1, -1), aCen = sc.w(3, -1), aZ = sc.w(5, 0), aL = sc.w(5, 2);
    A.c2.desenha(seg(t, aLar - 0.2, 0.6, 'power2.inOut')); A.c3.desenha(seg(t, aCen - 0.2, 0.5, 'power2.inOut'));
    A.gente.forEach(({ p, d, b }) => {
      const a = a0 + 0.15 + p.d * 0.8; let cor = AZUL, s = mix(0.3, 1, seg(t, a, 0.3, 'back.out(2)'));
      if (d < D * 0.28 && t >= aLar + p.r * 0.4) cor = LARANJA;
      if (d < D * 0.15 && t >= aCen + p.r * 0.3) cor = VERM;
      b.pos(p.x, p.y, s, vis(t, a), cor);
    });
    caixa.desenha(seg(t, aZ - 0.1, 0.5, 'power2.out'));
    l1.setAttribute('opacity', vis(t, aZ, 0.15)); l2.setAttribute('opacity', vis(t, aZ + 0.15, 0.15));
    cf.desenha(seg(t, aL, 0.45, 'power2.out'));
  };
};
// 9 · mover uma pessoa até o centro
FX.zona2 = sc => {
  const g = grupo(), C = [540, 1180], D = 900, A = alvo(g, C, D, 401);
  const eu = boneco(g, 0, 0, 70, AZUL), marca = circulo(g, 0, 0, 120, { stroke: VERM, strokeWidth: 5 });
  return t => {
    A.circ.desenha(seg(t, sc.ini, 0.35)); A.c2.desenha(seg(t, sc.ini + 0.1, 0.35)); A.c3.desenha(seg(t, sc.ini + 0.2, 0.35));
    A.gente.forEach(({ p, d, b }) => b.pos(p.x, p.y, 1, vis(t, sc.ini + p.d * 0.3), d < D * 0.15 ? VERM : d < D * 0.28 ? LARANJA : AZUL));
    const a = sc.w(0, 1), q = seg(t, a, sc.w(1, -1) - a + 0.2, 'power2.inOut');
    const ang = -2.4 + q * 2.2, r = mix(D * 0.42, 0, q), x = C[0] + Math.cos(ang) * r, y = C[1] + 20 + Math.sin(ang) * r;
    eu.pos(x, y, 1, vis(t, sc.ini + 0.2), q > 0.75 ? VERM : q > 0.4 ? LARANJA : AZUL);
    marca.g.setAttribute('transform', `translate(${x},${y - 34})`); marca.desenha(seg(t, sc.ini + 0.3, 0.4));
  };
};

// 10 · a teia de conteúdo e ofertas
FX.teia = sc => {
  const g = grupo(), ga = grupo(g), gn = grupo(g);
  const N = { post: [230, 620, 'POST'], cont: [800, 620, 'CONTEÚDO'], dm: [800, 960, 'DM'], ofe: [540, 1290, 'OFERTA'], story: [220, 1020, 'STORY'], dest: [250, 1640, 'DESTAQUE'], link: [810, 1640, 'LINK NA BIO'] };
  const nos = {};
  for (const k in N) {
    const [x, y, s] = N[k], ng = grupo(gn), oferta = k === 'ofe', w = oferta ? 420 : Math.max(220, s.length * 34 + 70), h = oferta ? 190 : 130;
    const tr = traco(add(ng, rc.ellipse(x, y, w, h, O(oferta ? { fill: VERM, fillStyle: 'hachure', hachureGap: 11, fillWeight: 3.5, strokeWidth: 6 } : { strokeWidth: 5 }))));
    const lb = texto(ng, s, { x, y: y + (oferta ? 34 : 24), class: 'forte', 'font-size': oferta ? 96 : 66, fill: TINTA, stroke: oferta ? CREME : 'none', 'stroke-width': oferta ? 12 : 0, 'paint-order': 'stroke' });
    nos[k] = { tr, lb, x, y };
  }
  const ar = [['post', 'cont'], ['cont', 'dm'], ['dm', 'ofe'], ['story', 'ofe'], ['dest', 'ofe'], ['link', 'ofe']].map(([a, b]) => {
    const [x1, y1] = N[a], [x2, y2] = N[b], d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d;
    const c1 = a === 'post' ? 150 : 95, c2 = b === 'ofe' ? 160 : 110;
    return { s: seta(ga, x1 + ux * c1, y1 + uy * c1 * 0.75, x2 - ux * c2, y2 - uy * c2 * 0.75, 3.6), p1: [x1 + ux * c1, y1 + uy * c1 * 0.75], p2: [x2 - ux * c2, y2 - uy * c2 * 0.75], dot: el('circle', { r: 13, fill: VERM }, ga) };
  });
  const quando = { post: [0, 1], cont: [0, 5], dm: [1, 5], ofe: [3, 3], story: [5, 3], dest: [7, 3], link: [9, 3] };
  const qa = [[0, 2], [1, 2], [2, 2], [6, 2], [8, 1], [10, 1]];
  return t => {
    const fim = sc.w(10, -1);
    for (const k in nos) {
      const o = nos[k], a = sc.w(...quando[k]);
      o.tr.desenha(seg(t, a - 0.05, k === 'ofe' ? 0.45 : 0.3, 'power2.out'));
      const q = seg(t, a, 0.3, 'expo.out');
      let s = mix(k === 'ofe' ? 1.5 : 1.25, 1, q); if (k === 'ofe' && t >= fim) s *= 1 + 0.12 * (1 - seg(t, fim, 0.45, 'power2.out'));
      o.lb.setAttribute('opacity', vis(t, a)); o.lb.setAttribute('transform', `translate(${o.x},${o.y}) scale(${s}) translate(${-o.x},${-o.y})`);
    }
    ar.forEach((e, i) => {
      const a = sc.w(...qa[i]); e.s.desenha(seg(t, a, 0.4, 'power2.out'));
      const s1 = seg(t, a + 0.4, 0.5, 'power1.inOut'), s2 = seg(t, fim, 0.5, 'power1.inOut'), s = t >= fim ? s2 : s1;
      e.dot.setAttribute('cx', mix(e.p1[0], e.p2[0], s)); e.dot.setAttribute('cy', mix(e.p1[1], e.p2[1], s));
      e.dot.setAttribute('opacity', (t >= a + 0.4 && t < a + 0.9) || (t >= fim && t < fim + 0.5) ? 1 : 0);
    });
  };
};
FX.final = () => { grupo(); return () => {}; };

// cenas: telas seguidas com o mesmo fx
const cenas = []; telas.forEach((tl, i) => {
  const nome = tl.op.fx; if (!nome) return;
  const u = cenas[cenas.length - 1];
  if (u && u.nome === nome && u.idx[u.idx.length - 1] === i - 1) u.idx.push(i); else cenas.push({ nome, idx: [i] });
});
cenas.forEach(c => {
  const sc = cena(c.nome, c.idx), antes = lousa.childNodes.length;
  c.desenha = FX[c.nome](sc);
  c.g = lousa.lastChild; c.g.setAttribute('opacity', 0); c.sc = sc;
  c.idx.forEach(i => { telas[i].cena = c; });
});

// ------------------------------------------------------------------ faíscas das palavras-soco
const socos = []; telas.forEach(tl => tl.palavras.forEach(p => { if (p.soco) socos.push({ tl, p }); }));
function faiscas(t, tl) {
  cx2.clearRect(0, 0, W, H);
  tl.palavras.forEach((p, k) => {
    if (!p.soco) return; const d = t - p.t; if (d < 0 || d > 0.9) return;
    const r = S.rng(p.g * 13 + 5);
    for (let i = 0; i < 64; i++) {
      const lado = r() < 0.5 ? -1 : 1, ang = (r() - 0.5) * 0.9 + (lado < 0 ? Math.PI : 0), v = 700 + r() * 1700, dec = 2.6;
      const dist = v * (1 - Math.exp(-dec * d)) / dec, x = p.cx + (r() - 0.5) * 300 + Math.cos(ang) * dist, y = p.cy + (r() - 0.5) * 120 + Math.sin(ang) * dist + 60 * d * d;
      const vv = v * Math.exp(-dec * d) * 0.035, a = (1 - d / 0.9) * (0.5 + r() * 0.5);
      cx2.strokeStyle = r() < 0.3 ? `rgba(255,226,214,${a})` : `rgba(255,${60 + r() * 60 | 0},30,${a})`;
      cx2.lineWidth = 1.5 + r() * 2.5; cx2.beginPath(); cx2.moveTo(x, y); cx2.lineTo(x - Math.cos(ang) * vv, y - Math.sin(ang) * vv); cx2.stroke();
    }
  });
}

// ------------------------------------------------------------------ quadro
let atual = null;
function acha(t) { let lo = 0, hi = telas.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (telas[m].ini <= t) lo = m; else hi = m - 1; } return telas[lo]; }

function render(t) {
  mede();
  const tl = acha(t), lous = !!tl.cena && tl.op.fx !== 'final';
  if (atual !== tl) {
    if (atual) atual.el.style.display = 'none';
    if (!tl.op.oculto) tl.el.style.display = 'block';
    fundo.className = 'abs cheio ' + tl.bg; vinheta.className = 'abs cheio ' + tl.bg;
    cenas.forEach(c => c.g.setAttribute('opacity', c === tl.cena ? 1 : 0));
    atual = tl;
  }
  if (tl.cena) tl.cena.desenha(t);

  // luz e faixas do fundo
  const dur = Math.max(0.5, tl.fim - tl.ini), pp = seg(t, tl.ini, dur, 'none');
  luz.style.opacity = tl.bg === 'k' ? 1 : 0;
  luz.style.transform = `translate(${(tl.cx || 540) + tl.dir * 120 * (pp - 0.5)}px,${(tl.cy || 960)}px) scale(${0.9 + 0.2 * pp})`;
  faixas.style.opacity = tl.bg === 'r' ? 1 : 0;
  if (tl.bg === 'r') [...faixas.children].forEach((f, k) => { f.style.transform = `translate(${tl.dir * 200 * pp}px, ${300 + k * 900 + (tl.rng ? 0 : 0)}px) rotate(${-24 + k * 6}deg)`; });

  // câmera: chicote na entrada, deriva 3D, tranco no soco
  let tremor = 0;
  tl.palavras.forEach(p => { if (p.soco && t >= p.t) tremor = Math.max(tremor, 1 - seg(t, p.t, 0.18, 'power2.out')); });
  const rnd = S.rng(Math.floor(t * 30) + 3), jx = tremor * (rnd() - 0.5) * 34, jy = tremor * (rnd() - 0.5) * 34;
  if (!tl.op.oculto) {
    const wq = seg(t, tl.ini, 0.22, 'expo.out'), ce = seg(t, tl.ini, Math.min(dur, 1.4), 'power3.out'), dv = seg(t, tl.ini, dur, 'sine.inOut');
    let x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0;
    const d = tl.dir;
    switch (tl.mov) {
      case 0: ry = mix(d * 40, d * 6, ce); z = mix(-150, 160, dv); x = d * 520 * (1 - wq); break;            // órbita
      case 1: rx = mix(34, 10, ce); z = mix(-250, 140, dv); y = mix(120, 0, ce); break;                    // de baixo
      case 2: z = mix(-1500, 0, seg(t, tl.ini, 0.38, 'expo.out')) + 120 * dv; rz = d * 3 * (1 - ce); break; // aproximação brusca
      case 3: rz = mix(d * -11, d * -4, ce); ry = mix(d * 18, 0, ce); z = mix(0, 220, dv); x = d * 420 * (1 - wq); break; // holandês
      case 4: rx = mix(-30, -8, ce); z = mix(150, 260, dv); y = mix(-140, 0, ce); break;                   // de cima
      case 5: x = mix(d * -260, d * 120, dv) + d * 520 * (1 - wq); ry = mix(d * -14, d * 8, dv); z = 80 * dv; break; // lateral
      default: z = lous ? 30 * pp : 0;
    }
    tl.el.style.transformOrigin = `${tl.cx || 540}px ${tl.cy || 960}px`;
    tl.el.style.transform = `translate3d(${x + jx}px,${y + jy}px,${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
    tl.el.style.filter = lous || tl.mov === 2 ? 'none' : borrao((1 - wq) * 1.2);
    if (tl.camadas) tl.camadas.forEach(c => { const extra = c.fn ? c.fn(c.d, t) : ''; c.d.style.transform = `translateZ(${c.z}px) ${extra}`; });
  }
  // a lousa também tem câmera: plano inclinado que assenta devagar
  if (lous && tl.cena) {
    const sc = tl.cena.sc, q = seg(t, sc.ini, Math.min(2.2, sc.fim - sc.ini), 'power3.out'), dv = seg(t, sc.ini, sc.fim - sc.ini, 'sine.inOut');
    lousa.style.transform = `perspective(1700px) translate3d(${jx * 0.5}px,${jy * 0.5}px,${mix(-220, 60, dv)}px) rotateX(${mix(16, 3, q)}deg) rotateY(${mix(-12, 4, dv)}deg) rotateZ(${mix(-2, 0, q)}deg)`;
  }
  visor.style.display = tl.visor ? 'block' : 'none';
  if (tl.visor) { const f = Math.floor(t * 30), ss = Math.floor(t) % 60, mm = Math.floor(t / 60); tc.textContent = `00:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`; rec.style.opacity = Math.floor(t * 2) % 2 ? 0.25 : 1; }

  if (tl.op.carimbo) {
    const q = seg(t, tl.palavras[0].t, 0.22, 'expo.out');
    tl.bloco.style.transform = `rotate(-5deg) scale(${mix(1.8, 1, q)})`; tl.bloco.style.opacity = vis(t, tl.palavras[0].t, 0.03);
  }

  // palavras
  const bgk = lous ? 'lousa' : tl.bg;
  tl.palavras.forEach((p, k) => {
    const a = p.t - 0.02;
    if (t < a) { p.el.style.opacity = 0; return; }
    const vol = lous ? VOL.lousa : (p.dest || (p.soco && tl.bg === 'c')) ? VOL[tl.bg + 'd'] : VOL[tl.bg];
    if (p.soco && !lous) {
      const q = seg(t, a, 0.32, 'expo.out'), ab = 1 - seg(t, a, 0.35, 'power2.out');
      p.el.style.opacity = vis(t, a, 0.04);
      p.el.style.transform = `scale(${mix(1.9, 1, q)})`;
      [...p.el.querySelectorAll('.ch')].forEach((c, j) => { const qc = seg(t, a + j * 0.028, 0.34, 'back.out(1.6)'); c.style.transform = `translateY(${(1 - qc) * -70}%) rotateX(${(1 - qc) * -85}deg)`; c.style.opacity = vis(t, a + j * 0.028, 0.04); });
      p.el.style.filter = borrao((1 - q) * 0.9);
      p.el.style.textShadow = ab > 0.02 ? `${-10 * ab}px 0 0 rgba(0,240,255,${0.7 * ab}), ${10 * ab}px 0 0 rgba(255,20,40,${0.8 * ab}),` + vol : vol;
    } else {
      const q = seg(t, a, 0.24, 'expo.out'), lado = (p.li + k) % 2 ? -tl.dir : tl.dir;
      p.el.style.opacity = vis(t, a, 0.05);
      p.el.style.transform = lous ? `translateY(${(1 - q) * 60}px)` : `translateX(${lado * 300 * (1 - q)}px) rotateY(${lado * -55 * (1 - q)}deg)`;
      p.el.style.filter = lous ? (q > 0.98 ? 'none' : `blur(${(1 - q) * 12}px)`) : borrao(1 - q);
      p.el.style.textShadow = vol;
    }
  });
  faiscas(t, tl);

  // risco de luz no soco
  const alvoS = tl.palavras.filter(p => p.soco && t >= p.t).pop();
  const rq = alvoS ? t - alvoS.t : -1;
  if (rq >= 0 && rq < 0.8 && !lous) {
    const ab = seg(rq, 0, 0.18, 'expo.out'), some = seg(rq, 0.3, 0.5, 'power2.in');
    risco.style.opacity = 1 - some;
    risco.style.transform = `translate(0px,${(alvoS.cy || 960) + 10}px) rotate(${tl.rotZ * 0.6}deg) scaleX(${ab}) scaleY(${1 + 0.8 * (1 - ab)})`;
  } else risco.style.opacity = 0;
}

window.__render = render;
window.__timelines = window.__timelines || {};
window.__timelines.main = S.play(render, { loop: false });
})();
