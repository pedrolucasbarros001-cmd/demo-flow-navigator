// imprime um instante "pousado" de cada tela pedida: depois da última palavra, antes do corte
const fs=require('fs'),vm=require('vm'),p=process.argv[2];const c={window:{}};vm.createContext(c);
vm.runInContext(fs.readFileSync(p+'/roteiro.js','utf8'),c);vm.runInContext(fs.readFileSync(p+'/tempos.js','utf8'),c);
const R=c.window.ROTEIRO,T=c.window.TEMPOS;let g=0;const fim=[],ini=[];
R.forEach(b=>{const n=b[1].split(/\s+/).filter(w=>w&&w!=='|').length;ini.push(T[g]);g+=n;fim.push(T[g-1]);});
const want=process.argv.slice(3).map(Number);
console.log(want.map(i=>Math.min(fim[i]+0.5,(ini[i+1]??fim[i]+2)-0.1).toFixed(2)).join(','));
