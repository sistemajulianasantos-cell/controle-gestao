
// ─── DADOS DINÂMICOS (Firebase preenche isso) ─────────────────────────────────
const D={
  fornecedores:[],
  entradas:[],
  quebras:[],
  festas:[],
  contagens:[],        // histórico de contagens semanais
  precos:{},           // preços de custo e revenda por produto
  pagamentosEquipe:[]  // pagamentos autorizados da equipe por evento
};

function sv(k){if(window.svFirebase)window.svFirebase(k);}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fN(n){return Number(n||0).toLocaleString('pt-BR')}
function fR(n){return n?'R$ '+Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}
function td(){return new Date().toISOString().slice(0,10)}
function fd(d){return d?d.split('-').reverse().join('/'):'—'}

// Preenche um <select> com os últimos N meses fechados
function gerarMeses(selectId, n) {
  const el = document.getElementById(selectId);
  if (!el) return;
  const now = new Date();
  el.innerHTML = '<option value="">Mês fechado...</option>';
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    const label = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    el.innerHTML += '<option value="' + val + '">' + label.charAt(0).toUpperCase() + label.slice(1) + '</option>';
  }
}

// Aplica mês fechado preenchendo as datas de início e fim
function aplicarMesFechado(val, iniId, fimId, fn) {
  if (!val) return;
  const parts = val.split('-');
  const ano = Number(parts[0]), mes = Number(parts[1]);
  const ini = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0);
  document.getElementById(iniId).value = ini.toISOString().slice(0, 10);
  document.getElementById(fimId).value = fim.toISOString().slice(0, 10);
  if (typeof fn === 'function') fn();
}

