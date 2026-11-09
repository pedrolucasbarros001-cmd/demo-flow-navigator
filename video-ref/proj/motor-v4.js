// motor.js v4: a interface conta a história. Horizontal 1920 x 1200 (16:10, MacBook 16").
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
const palco = $('palco'), lousa = $('lousa'), uiL = $('ui'), brilho = $('brilho'), rotulo = $('rotulo'), rotTx = rotulo.querySelector('.tx'), capitulo = $('capitulo');

const CURTAS = new Set('E O A OS AS DE DO DA DOS DAS UM UMA QUE PRA PARA POR NO NA NOS NAS SE EM À AO TE EU ELE ELA É SÓ SEU SUA SEUS MAS COM SEM NÃO TU ISSO ESSE ESSA VOCÊ ONDE NÉ'.split(' '));
const chave = s => s.toUpperCase().replace(/[,.:?!“”"]/g, '');
const UI_CENAS = new Set(['canais', 'chat', 'confianca', 'pessoas', 'desculpas', 'busca', 'sins', 'perfil', 'conteudo', 'teia']);
// capítulos do texto: etiqueta no canto
const CAPS = [[0, '01 / 03', 'o funil do orçamento'], [60, '02 / 03', 'tattoobrand'], [117, '03 / 03', 'profile funnel']];
const RISCO = '<svg class="risco" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M2 13 C 20 7, 48 15, 70 10 S 92 7, 98 9" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="100" fill="none" stroke="#EB3B3B" stroke-width="4.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';

// ------------------------------------------------------------------ telas de texto
let gw = 0;
const telas = R.map((b, i) => {
  const [, txt, op = {}] = b;
  const rng = S.rng(1000 + i);
  const modo = op.fx === 'final' || !op.fx ? 'texto' : UI_CENAS.has(op.fx) ? 'ui' : 'lousa';
  const el = document.createElement('div'); el.className = 'tela abs';
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
  return { i, op, modo, el, bloco, linhas, palavras, al, rng, forteTela, cap, mov: Math.floor(rng() * 3), dir: rng() < 0.5 ? -1 : 1,
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
    const larg = tl.modo === 'lousa' ? 700 : tl.modo === 'ui' ? 1440 : 1540;
    tl.linhas.forEach(l => {
      l.el.style.fontSize = '100px';
      const nat = l.inner.getBoundingClientRect().width || 1;
      const cap = fin ? 230 : tl.modo === 'ui' ? (l.mao ? 70 : 62) : tl.modo === 'lousa' ? (l.mao ? 100 : 90) : (l.mao ? 150 : 132);
      l.el.style.fontSize = Math.min(cap, 100 * larg / nat) + 'px';
      l.el.style.textAlign = tl.al === 'c' ? 'center' : 'left';
    });
    const r = tl.bloco.getBoundingClientRect();
    const x = tl.modo === 'lousa' ? 130 : tl.al === 'c' ? (W - r.width) / 2 : 190;
    const y = tl.modo === 'ui' ? 200 - r.height / 2 : H * 0.52 - r.height / 2;
    tl.bloco.style.left = x + 'px'; tl.bloco.style.top = Math.max(140, y) + 'px';
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

// ------------------------------------------------------------------ 1 · os canais viram etiquetas que terminam no orçamento
FX.canais = (sc, raiz) => {
  const sv = linhaSvg(raiz);
  const itens = [['Indicação', 0, 0], ['Anúncio', 0, 1], ['Promoção', 0, 2], ['Site', 0, 3], ['Formulário', 1, 0], ['WhatsApp automático', 1, 1], ['Preço tabelado', 1, 3]];
  const Y0 = 360, DY = 102, XP = 300, CY = 670;
  const ps = itens.map(([s], i) => div('pill', `left:${XP}px;top:${Y0 + i * DY - 37}px`, raiz, `<i></i>${s}`));
  const voce = div('pill esc', `left:1500px;top:${CY - 37}px`, raiz, `<i></i>Você`);
  const orc = div('pill cer', `left:1010px;top:${CY - 44}px`, raiz, `<i></i>Orçamento`);
  let A = null, B = null, link = null;
  const dots = itens.map(() => ponto(raiz));
  return t => {
    if (!A) {
      const ws = ps.map(p => p.offsetWidth || 200);
      A = ps.map((p, i) => caminho(sv, curva(XP + ws[i], Y0 + i * DY, 1500, CY)));
      B = ps.map((p, i) => caminho(sv, curva(XP + ws[i], Y0 + i * DY, 1010, CY)));
      link = caminho(sv, `M ${1010 + (orc.offsetWidth || 300)} ${CY} L 1500 ${CY}`, '#8D8983', 3);
    }
    ps.forEach((p, i) => entra(p, t, sc.w(itens[i][1], itens[i][2]), { dx: -30, dy: 0 }));
    const aA = sc.w(2, 0), aB = sc.w(5, 0), aO = sc.w(6, -1);
    A.forEach((c, i) => { c.desenha(seg(t, aA + i * 0.08, 0.9, 'power2.inOut')); c.p.style.opacity = 1 - seg(t, aB, 0.5, 'power1.out'); });
    entra(voce, t, sc.w(3, -1), { s: 0.9, dy: 0 });
    B.forEach((c, i) => c.desenha(seg(t, aB + i * 0.07, 0.9, 'power2.inOut')));
    entra(orc, t, aO, { s: 0.85, dy: 0, d: 0.6 });
    link.desenha(seg(t, sc.w(7, 1), 0.6, 'power2.out'));
    dots.forEach((d, i) => {
      const fase = t < aB ? A[i] : B[i], ini = t < aB ? aA + 1.0 + i * 0.12 : aB + 1.0 + i * 0.12, per = 1.6;
      if (t < ini) { d.style.opacity = 0; return; }
      const q = ((t - ini) % per) / per, pt = fase.ponto(q);
      d.style.left = pt.x + 'px'; d.style.top = pt.y + 'px'; d.style.opacity = Math.sin(q * Math.PI) * (t < aB ? 1 - seg(t, aB - 0.3, 0.3) : 1);
    });
    const pulso = sc.w(7, 1); orc.style.boxShadow = `0 16px ${40 + 40 * (t >= pulso ? 1 - seg(t, pulso, 0.8) : 0)}px rgba(235,59,59,.45)`;
  };
};

// ------------------------------------------------------------------ 2 · conversa de WhatsApp
function conversa(raiz, nome, msgs) {
  const card = div('card', 'left:560px;top:300px;width:800px;height:850px;overflow:hidden', raiz);
  const topo = div('', 'position:absolute;left:0;top:0;right:0;height:104px;background:#F7F5F1;border-bottom:1px solid #E2DED7;display:flex;align-items:center;gap:20px;padding:0 30px', card,
    `<div class="ava" style="width:64px;height:64px">${AVA}</div><div><div style="font:600 30px Inter;color:#111">${nome}</div><div class="status" style="font:400 22px Inter;color:#6E7A6C">online</div></div>`);
  const corpo = div('', 'position:absolute;left:0;top:104px;right:0;bottom:0;background:#EFEAE2', card);
  const els = msgs.map(m => {
    const e = div('msg' + (m.lado === 'out' ? ' out' : ''), '', corpo, m.html + (m.lado === 'out' ? '<small>19:30 ✓✓</small>' : '<small>19:30</small>'));
    if (m.lado === 'out') e.style.right = '30px'; else e.style.left = '30px';
    return e;
  });
  const dig = div('msg', 'left:30px;opacity:0;padding:22px 26px;display:flex;gap:10px', corpo, '<b style="width:14px;height:14px;border-radius:50%;background:#9A9792"></b><b style="width:14px;height:14px;border-radius:50%;background:#9A9792"></b><b style="width:14px;height:14px;border-radius:50%;background:#9A9792"></b>');
  dig.pula = t => [...dig.children].forEach((b, k) => { b.style.transform = `translateY(${-9 * Math.max(0, Math.sin(t * 7 - k * 0.9))}px)`; });
  let posto = false;
  return { card, corpo, els, dig, status: topo.querySelector('.status'), arruma() {
    if (posto) return; let y = 30; els.forEach(e => { e.style.top = y + 'px'; y += (e.offsetHeight || 80) + 16; }); dig.style.top = y + 'px'; posto = !!els[0].offsetHeight;
  } };
}
FX.chat = (sc, raiz) => {
  const c = conversa(raiz, 'Cliente', [
    { lado: 'in', html: 'Oi! Quanto fica uma tattoo fina no antebraço?' },
    { lado: 'out', html: 'Oi! Segue nossa tabela de valores:' },
    { lado: 'out', html: '<b>Antebraço · traço fino</b><br>R$ 1.200 · sinal de 30%' },
  ]);
  const auto = div('tag', 'left:440px;opacity:0;background:#E2DED7;color:#55524E', c.corpo, 'Resposta automática');
  const selo = div('pill cer', 'left:1090px;top:270px;opacity:0', raiz, '<i></i>Orçamento');
  return t => {
    c.arruma();
    const q = [sc.w(0, 0), sc.w(2, 0), sc.w(2, 3)];
    c.els.forEach((e, i) => entra(e, t, q[i], { dy: 16, d: 0.4 }));
    const d0 = sc.w(3, 0); c.dig.style.opacity = t >= d0 ? 1 : 0; c.dig.pula(t);
    auto.style.top = (parseFloat(c.els[1].style.top || 0) - 46) + 'px'; entra(auto, t, sc.w(4, 1), { dy: 8 });
    c.els[2].style.outline = t >= sc.w(5, 1) ? `3px solid rgba(235,59,59,${seg(t, sc.w(5, 1), 0.4)})` : 'none';
    entra(selo, t, sc.w(7, 2), { s: 1.35, dy: 0, d: 0.45, extra: ' rotate(-5deg)' });
  };
};
FX.desculpas = (sc, raiz) => {
  const c = conversa(raiz, 'Cliente', [
    { lado: 'out', html: 'Consigo te encaixar dia 12. Fechamos?' },
    { lado: 'in', html: 'Tô me planejando ainda…' },
    { lado: 'in', html: 'Vou ver o cartão e te falo' },
    { lado: 'in', html: 'Vou pensar, tá?' },
    { lado: 'out', html: 'Oi! Conseguiu ver?' },
  ]);
  return t => {
    c.arruma();
    const q = [sc.ini + 0.15, sc.w(1, 0), sc.w(2, 0), sc.w(3, 0), sc.w(4, 0)];
    c.els.forEach((e, i) => entra(e, t, q[i], { dy: 16, d: 0.4 }));
    const so = sc.w(4, 1);
    c.status.textContent = t >= so ? 'visto por último às 19:42' : 'online';
    c.status.style.color = t >= so ? '#9A9792' : '#6E7A6C';
    c.dig.style.top = c.els[4].style.top; c.dig.style.opacity = t >= q[3] + 0.6 && t < q[4] - 0.1 ? 1 : 0; c.dig.pula(t);
  };
};

// ------------------------------------------------------------------ 3 · busca por outros tatuadores
FX.busca = (sc, raiz) => {
  const barra = div('card', 'left:460px;top:350px;width:1000px;height:96px;border-radius:48px;display:flex;align-items:center;gap:22px;padding:0 36px', raiz,
    '<svg width="34" height="34" viewBox="0 0 24 24"><circle cx="10" cy="10" r="7" stroke="#8E8C89" stroke-width="2.4" fill="none"/><path d="M15 15l6 6" stroke="#8E8C89" stroke-width="2.4"/></svg><span class="q" style="font:400 34px Inter;color:#111"></span><span class="cur" style="width:3px;height:40px;background:#EB3B3B"></span>');
  const q = barra.querySelector('.q'), cur = barra.querySelector('.cur'), frase = 'tatuador perto de mim';
  const nomes = [['Black Rose Tattoo', '4,9'], ['Atelier Traço Fino', '4,8'], ['Studio 13 Ink', '4,9']];
  const res = nomes.map(([n, nota], i) => div('card', `left:460px;top:${490 + i * 190}px;width:1000px;height:160px;border-radius:26px;display:flex;align-items:center;gap:28px;padding:0 34px`, raiz,
    `<div class="ava" style="width:96px;height:96px">${AVA}</div><div style="flex:1"><div style="font:600 32px Inter;color:#111">${n}</div><div style="font:400 24px Inter;color:#8E8C89;margin-top:8px">★ ${nota} · tatuagem · agenda aberta</div></div><div class="pill" style="position:static;height:58px;font-size:24px;box-shadow:none;background:#E2DED7">Ver perfil</div>`));
  return t => {
    entra(barra, t, sc.ini, { dy: 0, s: 0.96 });
    const a = sc.w(0, 1), b = sc.w(0, -1) + 0.2, n = Math.floor(frase.length * seg(t, a, b - a, 'none'));
    q.textContent = frase.slice(0, n); cur.style.opacity = Math.floor(t * 2.2) % 2 ? 0.2 : 1;
    res.forEach((r, i) => entra(r, t, sc.w(0, 4) + i * 0.12, { dy: 30 }));
  };
};

// ------------------------------------------------------------------ 4 · a confiança que não sobe
FX.confianca = (sc, raiz) => {
  const pill = div('card esc', 'left:560px;top:400px;width:800px;height:180px;border-radius:90px;display:flex;align-items:center;padding-left:200px', raiz,
    `<div><div class="pc" style="font:700 72px 'Inter Tight';color:#EFECE5;letter-spacing:-0.03em">0%</div><div style="font:500 20px 'JetBrains Mono';letter-spacing:.16em;text-transform:uppercase;color:#8D8983;margin-top:4px">confiança do cliente</div></div>`);
  const a = anel(pill, 34, 22, 62, '#EB3B3B', '#262626');
  const pc = pill.querySelector('.pc');
  const chips = [['Pagar sinal'], ['Marcar data']].map(([s], i) => div('pill esc', `left:${640 + i * 340}px;top:660px;color:#8D8983;box-shadow:none`, raiz, `${CADEADO}${s}`));
  const marcos = [[1, 2, 8], [4, 2, 22], [5, 0, 37], [6, 0, 49], [7, 2, 58]];
  return t => {
    entra(pill, t, sc.ini + 0.1, { dy: 30, s: 0.96 });
    let v = 0; marcos.forEach(([k, j, alvo], i) => { const ant = i ? marcos[i - 1][2] : 0, s = seg(t, sc.w(k, j), 0.9, 'power2.inOut'); if (t >= sc.w(k, j)) v = mix(ant, alvo, s); });
    const fim = sc.w(8, -1), trava = t >= fim ? Math.sin((t - fim) * 18) * 1.4 * (1 - seg(t, fim, 1.2)) : 0;
    a.set((v + trava) / 100); pc.textContent = Math.round(v) + '%';
    chips.forEach((c, i) => entra(c, t, sc.w(i + 2, 3), { dy: 18 }));
  };
};

// ------------------------------------------------------------------ 5 · de cada 20, 7 fecham
FX.pessoas = (sc, raiz) => {
  const card = div('card', 'left:460px;top:310px;width:1000px;height:740px', raiz);
  const fecham = new Set([1, 4, 7, 10, 13, 16, 18]);
  const avs = []; for (let i = 0; i < 20; i++) {
    const x = 110 + (i % 5) * 180, y = 60 + Math.floor(i / 5) * 150;
    const a = div('ava', `position:absolute;left:${x}px;top:${y}px;width:110px;height:110px`, card, AVA);
    const ck = div('', `position:absolute;left:${x + 78}px;top:${y + 78}px;width:38px;height:38px;border-radius:50%;background:#EB3B3B;border:4px solid #EFECE5;opacity:0;display:flex;align-items:center;justify-content:center`, card, CHECK);
    avs.push({ a, ck, f: fecham.has(i) });
  }
  const cont = div('pill esc', 'left:760px;top:990px;height:96px;font-size:34px;padding:0 40px 0 26px', raiz, '<i></i>7 de 20 fecham');
  return t => {
    entra(card, t, sc.ini + 0.05, { dy: 30, s: 0.97 });
    const a20 = sc.w(1, 2), a7 = sc.w(3, 1), a13 = sc.w(4, 2), aNao = sc.w(5, -1);
    avs.forEach((o, i) => {
      entra(o.a, t, a20 + i * 0.03, { dy: 0, s: 0.7, d: 0.4 });
      if (o.f) { const q = seg(t, a7 + (i % 3) * 0.05, 0.35, 'back.out(2)'); o.ck.style.opacity = vis(t, a7 + (i % 3) * 0.05, 0.1); o.ck.style.transform = `scale(${mix(0.4, 1, q)})`; o.a.style.background = t >= a7 ? '#F6D0D0' : ''; o.a.querySelector('svg').style.fill = t >= a7 ? '#EB3B3B' : ''; }
      else { const op = (t >= a13 ? 0.55 : 1) * (1 - 0.5 * seg(t, aNao, 0.7)); o.a.style.opacity = Math.min(parseFloat(o.a.style.opacity || 1), op); }
    });
    entra(cont, t, a7 + 0.3, { dy: 20 });
  };
};

// ------------------------------------------------------------------ 6 · cinco vezes sim
FX.sins = (sc, raiz) => {
  const card = div('card', 'left:510px;top:200px;width:900px;height:820px', raiz);
  const objs = ['anúncio', 'orçamento', 'preço', 'sinal', 'marcação'];
  const rows = objs.map((o, k) => {
    const r = div('', `position:absolute;left:0;right:0;top:${30 + k * 155}px;height:155px;display:flex;align-items:center;gap:34px;padding:0 60px;${k < 4 ? 'border-bottom:1px solid #DDD9D2' : ''}`, card,
      `<div class="ck" style="width:64px;height:64px;border-radius:50%;border:3px solid #C9C5BE;display:flex;align-items:center;justify-content:center;flex:none">${CHECK.replace('18', '30').replace('18', '30')}</div><div style="font:600 48px 'Inter Tight';letter-spacing:-0.03em;color:#141414">Sim <span style="color:#8D8983">${k === 4 ? 'para a' : 'para o'}</span> <b class="ob" style="font:400 62px 'Indie Flower';letter-spacing:0;color:#C9C5BE">${o}</b></div>`);
    return { r, ck: r.querySelector('.ck'), ob: r.querySelector('.ob') };
  });
  return t => {
    entra(card, t, sc.ini, { dy: 30, s: 0.97 });
    rows.forEach((o, k) => {
      entra(o.r, t, sc.w(k, 0), { dy: 14, d: 0.4 });
      const aO = sc.w(k, 3), q = seg(t, aO, 0.3, 'back.out(2)');
      o.ck.style.background = t >= aO ? '#EB3B3B' : 'transparent'; o.ck.style.borderColor = t >= aO ? '#EB3B3B' : '#C9C5BE'; o.ck.style.transform = `scale(${t >= aO ? mix(0.7, 1, q) : 1})`;
      o.ob.style.color = t >= aO ? '#EB3B3B' : '#C9C5BE';
    });
  };
};

// ------------------------------------------------------------------ 7 · o perfil projetado para vender
FX.perfil = (sc, raiz) => {
  const card = div('card esc', 'left:610px;top:300px;width:700px;height:860px;overflow:hidden', raiz);
  const ava = div('', 'position:absolute;left:50px;top:46px;width:150px;height:150px;border-radius:50%;padding:6px;background:conic-gradient(#EB3B3B,#F07A5A,#8A1414,#EB3B3B)', card,
    `<div class="ava" style="width:100%;height:100%;border:5px solid #161616;background:#2A2A2A">${AVA.replace('<svg', '<svg style="fill:#5E5B57"')}</div>`);
  const stats = div('', 'position:absolute;left:240px;top:70px;right:40px;display:flex;justify-content:space-between;text-align:center;color:#EFECE5', card,
    ['248|posts', '12,4 mil|seguidores', '312|seguindo'].map(s => { const [a, b] = s.split('|'); return `<div><div style="font:700 34px 'Inter Tight'">${a}</div><div style="font:400 22px Inter;color:#8D8983">${b}</div></div>`; }).join(''));
  const nome = div('', 'position:absolute;left:50px;top:220px;font:600 30px Inter;color:#EFECE5', card, 'seu.estudio');
  const bio = div('', 'position:absolute;left:50px;top:268px;width:460px', card, '<div class="barra" style="width:92%"></div><div class="barra" style="width:70%;margin-top:12px"></div><div style="font:400 30px \'Indie Flower\';color:#EB3B3B;margin-top:10px">link na bio</div>');
  const bts = div('', 'position:absolute;left:50px;right:50px;top:385px;display:flex;gap:16px', card,
    '<div style="flex:1;height:64px;border-radius:14px;background:#2A2A2A;color:#EFECE5;font:600 24px Inter;display:flex;align-items:center;justify-content:center">Seguir</div><div class="b2" style="flex:1;height:64px;border-radius:14px;background:#2A2A2A;color:#EFECE5;font:600 24px Inter;display:flex;align-items:center;justify-content:center">Agendar</div>');
  const agendar = bts.querySelector('.b2');
  const dest = div('', 'position:absolute;left:50px;right:50px;top:480px;display:flex;justify-content:space-between', card,
    ['Portfólio', 'Preços', 'Agenda', 'Cuidados'].map(s => `<div style="text-align:center"><div style="width:96px;height:96px;border-radius:50%;border:2px solid #3A3A3A;background:#1E1E1E"></div><div style="font:400 20px Inter;color:#B7B3AD;margin-top:8px">${s}</div></div>`).join(''));
  const grade = div('', 'position:absolute;left:0;right:0;top:640px;display:grid;grid-template-columns:repeat(3,1fr);gap:4px', card,
    Array.from({ length: 6 }, (_, i) => `<div style="height:232px;background:linear-gradient(${135 + i * 20}deg,#2A2A2A,#1A1A1A 60%,${i % 3 === 1 ? '#3A1010' : '#222'})"></div>`).join(''));
  const toast = div('', 'position:absolute;left:640px;top:220px;width:640px;height:110px;border-radius:24px;background:#EFECE5;display:flex;align-items:center;gap:22px;padding:0 28px;box-shadow:0 30px 70px rgba(0,0,0,.6);opacity:0', raiz,
    `<div style="width:60px;height:60px;border-radius:16px;background:#EB3B3B;display:flex;align-items:center;justify-content:center">${CHECK.replace('18', '30').replace('18', '30')}</div><div><div style="font:600 28px Inter;color:#111">Novo agendamento</div><div style="font:400 22px Inter;color:#6B6863">Sinal pago · 14 de junho</div></div>`);
  const partes = [ava, stats, nome, bio, bts, dest, grade];
  return t => {
    entra(card, t, sc.ini, { dy: 40, s: 0.96, d: 0.7 });
    partes.forEach((p, i) => entra(p, t, sc.ini + 0.2 + i * 0.08, { dy: 14 }));
    const aC = sc.w(3, -1), q = seg(t, aC, 0.4, 'back.out(2)');
    agendar.style.background = t >= aC ? '#EB3B3B' : '#2A2A2A'; agendar.style.transform = `scale(${t >= aC ? mix(1.08, 1, q) : 1})`;
    entra(toast, t, sc.w(4, -1), { dy: -40, d: 0.55 });
  };
};

// ------------------------------------------------------------------ 8 · post de atenção e StoryAds
FX.conteudo = (sc, raiz) => {
  const post = div('card esc', 'left:520px;top:320px;width:560px;height:700px;overflow:hidden', raiz,
    `<div style="height:96px;display:flex;align-items:center;gap:16px;padding:0 26px"><div class="ava" style="width:56px;height:56px;background:#2A2A2A">${AVA}</div><div style="font:600 24px Inter;color:#EFECE5">seu.estudio</div></div>
     <div style="height:500px;background:radial-gradient(circle at 30% 30%,#3A1010,#141414 70%);position:relative"><div style="position:absolute;left:44px;bottom:40px;right:44px;font:700 52px/1.0 'Inter Tight';letter-spacing:-0.04em;color:#EFECE5">Post de <span style="font:400 66px 'Indie Flower';letter-spacing:0;color:#EB3B3B">atenção</span></div></div>
     <div style="padding:22px 26px"><div class="barra" style="width:80%"></div><div class="barra" style="width:55%;margin-top:12px"></div></div>`);
  const story = div('card esc', 'left:1140px;top:270px;width:440px;height:780px;overflow:hidden;background:linear-gradient(170deg,#5A1010,#141414 70%)', raiz,
    `<div style="margin:22px 22px 0;height:6px;border-radius:3px;background:rgba(255,255,255,.25)"><div class="prog" style="height:100%;width:0;border-radius:3px;background:#fff"></div></div>
     <div style="display:flex;align-items:center;gap:12px;padding:20px 22px"><div class="ava" style="width:46px;height:46px;background:#2A2A2A">${AVA}</div><div><div style="font:600 21px Inter;color:#fff">seu.estudio</div><div style="font:400 17px Inter;color:rgba(255,255,255,.7)">Patrocinado</div></div></div>
     <div style="position:absolute;left:30px;right:30px;top:300px;font:700 58px/1 'Inter Tight';letter-spacing:-0.04em;color:#EFECE5">Story<span style="font:400 72px 'Indie Flower';letter-spacing:0;color:#EB3B3B">Ads</span></div>
     <div style="position:absolute;left:30px;right:30px;bottom:40px;height:72px;border-radius:36px;background:#EFECE5;color:#111;font:600 26px Inter;display:flex;align-items:center;justify-content:center">Saiba mais</div>`);
  const prog = story.querySelector('.prog');
  const qual = div('pill cer', 'left:740px;top:1070px;height:76px;font-size:28px', raiz, '<i></i>Público qualificado');
  const vir = div('pill esc', 'left:1110px;top:1070px;height:76px;font-size:28px;color:#8D8983;box-shadow:none', raiz, '<i></i>Viralizar<b class="risca" style="position:absolute;left:20px;right:20px;top:36px;height:3px;background:#EB3B3B;transform-origin:0 50%;transform:scaleX(0)"></b>');
  const risca = vir.querySelector('.risca');
  return t => {
    entra(post, t, sc.w(2, 0), { dy: 40, s: 0.96, d: 0.6 });
    entra(story, t, sc.w(2, 4), { dy: 40, s: 0.96, d: 0.6 });
    prog.style.width = (100 * seg(t, sc.w(2, 4), 5, 'none')) + '%';
    entra(qual, t, sc.w(3, -1), { dy: 18 });
    entra(vir, t, sc.w(4, -1), { dy: 18 });
    risca.style.transform = `scaleX(${seg(t, sc.w(5, 0), 0.4, 'power2.out')})`;
  };
};

// ------------------------------------------------------------------ 9 · a teia de conteúdo e ofertas
FX.teia = (sc, raiz) => {
  const sv = linhaSvg(raiz);
  const N = { post: [520, 400, 'Post'], cont: [960, 400, 'Conteúdo'], dm: [1400, 400, 'DM'], ofe: [1400, 820, 'Oferta'], story: [520, 650, 'Story'], dest: [520, 860, 'Destaque'], link: [520, 1070, 'Link na bio'] };
  const nos = {}; for (const k in N) nos[k] = div(k === 'ofe' ? 'pill cer' : 'pill', 'left:0;top:0', raiz, `<i></i>${N[k][2]}`);
  const ar = [['post', 'cont'], ['cont', 'dm'], ['dm', 'ofe'], ['story', 'ofe'], ['dest', 'ofe'], ['link', 'ofe']];
  let cs = null;
  const dots = ar.map(() => ponto(raiz));
  const quando = { post: [0, 1], cont: [0, 5], dm: [1, 5], ofe: [3, 3], story: [5, 3], dest: [7, 3], link: [9, 3] };
  const qa = [[0, 2], [1, 2], [2, 2], [6, 2], [8, 1], [10, 1]];
  return t => {
    if (!cs) {
      for (const k in nos) { const e = nos[k], w = e.offsetWidth || 200, h = e.offsetHeight || 74; e.style.left = (N[k][0] - w / 2) + 'px'; e.style.top = (N[k][1] - h / 2) + 'px'; e.style.transformOrigin = '50% 50%'; }
      cs = ar.map(([a, b]) => { const [x1, y1] = N[a], [x2, y2] = N[b]; return caminho(sv, b === 'ofe' && a !== 'dm' ? curva(x1, y1, x2, y2) : `M ${x1} ${y1} L ${x2} ${y2}`, '#5E5B57', 3); });
    }
    const fim = sc.w(10, -1);
    for (const k in nos) { const a = sc.w(...quando[k]); entra(nos[k], t, a, { dy: 0, s: k === 'ofe' ? 0.8 : 0.9, d: 0.45 }); }
    nos.ofe.style.boxShadow = `0 16px ${40 + 50 * (t >= fim ? 1 - seg(t, fim, 0.9) : 0)}px rgba(235,59,59,.5)`;
    cs.forEach((c, i) => {
      const a = sc.w(...qa[i]); c.desenha(seg(t, a, 0.6, 'power2.inOut'));
      const s1 = seg(t, a + 0.6, 0.7, 'power1.inOut'), s2 = seg(t, fim, 0.7, 'power1.inOut'), s = t >= fim ? s2 : s1;
      const pt = c.ponto(s); dots[i].style.left = pt.x + 'px'; dots[i].style.top = pt.y + 'px';
      dots[i].style.opacity = (t >= a + 0.6 && t < a + 1.3) || (t >= fim && t < fim + 0.7) ? 1 : 0;
    });
  };
};

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
      r.style.transform = `rotateX(${mix(10, 1, q)}deg) rotateY(${mix(-4, 4, ld)}deg) scale(${0.93 * mix(0.95, 1, q) * (1 + 0.1 * ld)}) translate(${mix(-60, 60, ld)}px,${mix(30, -10, ld)}px)`;
      r.style.filter = bl > 0.02 ? `blur(${bl * 10}px)` : 'none';
    } else {
      lousa.style.transformOrigin = '1370px 620px';
      const ld2 = seg(t, sc.ini, sc.fim - sc.ini, 'none');
      lousa.style.transform = `perspective(2600px) rotateX(${mix(8, 1, q)}deg) rotateY(${mix(-9, 6, ld2)}deg) scale(${mix(0.95, 1.08, ld2)}) translateX(${mix(30, -30, ld2)}px)`;
    }
  }
  if (!tl.op.oculto) {
    let ry = 0, x = 0;
    const lin = seg(t, tl.ini, dur, 'none'), s = 1 + (tl.modo === 'texto' ? 0.08 : 0.02) * lin;
    if (tl.modo === 'texto') { ry = tl.mov === 1 ? mix(tl.dir * 8, -tl.dir * 2, lin) : tl.dir * mix(-2, 2, lin); x = tl.dir * mix(-30, 30, lin); }
    tl.el.style.transformOrigin = `${tl.cx || 960}px ${tl.cy || 600}px`;
    tl.el.style.transform = `perspective(2400px) translateX(${x}px) rotateY(${ry}deg) scale(${s})`;
  }

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
  });
}

window.__render = render;
window.__timelines = window.__timelines || {};
window.__timelines.main = S.play(render, { loop: false });
})();
