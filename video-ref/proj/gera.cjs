// gera.js: confere o roteiro contra o texto e calcula o tempo de cada palavra.
// uso: node gera.cjs            (tempo estimado de fala)
//      node gera.cjs narracao.json   (tempos reais: [{"palavra": "...", "inicio": s}, ...] na ordem do texto)
// Escreve tempos.js e acerta o data-duration do index.html.
const fs = require('fs'), path = require('path'), vm = require('vm');
const aqui = __dirname;
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(aqui, 'roteiro.js'), 'utf8'), ctx);
const R = ctx.window.ROTEIRO;

const limpa = w => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const palavras = [];   // {txt, b (batida)}
R.forEach((b, i) => b[1].split(/\s+/).filter(w => w && w !== '|').forEach(w => palavras.push({ txt: w.replace(/^[*^!_]+/, ''), b: i })));

// confere com o texto original
const texto = fs.readFileSync(path.join(aqui, '..', 'roteiro', 'texto.txt'), 'utf8').split(/\s+/).map(limpa).filter(Boolean);
const nossas = palavras.map(p => limpa(p.txt)).filter(Boolean);
for (let i = 0; i < Math.max(texto.length, nossas.length); i++) {
  if (texto[i] !== nossas[i]) {
    console.error(`DIFERENÇA na palavra ${i}: texto "${texto.slice(i - 3, i + 3).join(' ')}" | roteiro "${nossas.slice(i - 3, i + 3).join(' ')}"`);
    process.exit(1);
  }
}

let ini = [];
const arq = process.argv[2];
if (arq) {
  const n = JSON.parse(fs.readFileSync(arq, 'utf8'));
  if (n.length !== palavras.length) { console.error(`narração tem ${n.length} palavras, o roteiro tem ${palavras.length}`); process.exit(1); }
  ini = n.map(x => x.inicio);
} else {
  // fala estimada: ~2,7 palavras por segundo, com respiro na pontuação
  let t = 0.35;
  palavras.forEach((p, i) => {
    ini.push(+t.toFixed(3));
    const letras = limpa(p.txt).length;
    let d = Math.min(0.58, Math.max(0.2, 0.12 + 0.04 * letras));
    if (/[,]$/.test(p.txt)) d += 0.16;
    if (/[.:?]$/.test(p.txt)) d += 0.34;
    const fimBatida = !palavras[i + 1] || palavras[i + 1].b !== p.b;
    if (fimBatida) d += 0.06;
    if (R[p.b][1].includes('!' + p.txt)) d += 0.22;
    t += d;
  });
}
const FIM = 3.2;   // segura o fecho
const dur = +(ini[ini.length - 1] + 0.5 + FIM).toFixed(2);
fs.writeFileSync(path.join(aqui, 'tempos.js'),
  `// gerado por gera.cjs: início de cada palavra (s), na ordem do roteiro\nwindow.TEMPOS = ${JSON.stringify(ini)};\nwindow.DURACAO = ${dur};\n`);
const idx = path.join(aqui, 'index.html');
fs.writeFileSync(idx, fs.readFileSync(idx, 'utf8').replace(/data-duration="[0-9.]+"/, `data-duration="${dur}"`));
console.log(`ok: ${palavras.length} palavras, ${R.length} telas, ${dur} s`);
