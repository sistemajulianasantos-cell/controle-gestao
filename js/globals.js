
// ─── DADOS DINÂMICOS (Firebase preenche isso) ─────────────────────────────────
const D={
  fornecedores:[],
  entradas:[],
  quebras:[],
  festas:[],
  contagens:[],   // ← NOVO: histórico de contagens semanais
  precos:{}       // ← NOVO: preços de custo e revenda por produto
};

function sv(k){if(window.svFirebase)window.svFirebase(k);}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fN(n){return Number(n||0).toLocaleString('pt-BR')}
function fR(n){return n?'R$ '+Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}
function td(){return new Date().toISOString().slice(0,10)}
function fd(d){return d?d.split('-').reverse().join('/'):'—'}

