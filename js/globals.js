
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

// Preenche um <select> de ano com os últimos N anos
function gerarAnos(selectId, n) {
  const el = document.getElementById(selectId);
  if (!el) return;
  const anoAtual = new Date().getFullYear();
  el.innerHTML = '<option value="">Ano...</option>';
  for (let i = 0; i < n; i++) {
    const a = anoAtual - i;
    el.innerHTML += '<option value="' + a + '">' + a + '</option>';
  }
}

// Aplica mês fechado lendo os selects de ano e mês separados
function aplicarMesFechado(anoId, mesId, iniId, fimId, fn) {
  const ano = Number(document.getElementById(anoId).value);
  const mes = Number(document.getElementById(mesId).value);
  if (!ano || !mes) return;
  const ini = new Date(ano, mes - 1, 1);
  const fim = new Date(ano, mes, 0);
  document.getElementById(iniId).value = ini.toISOString().slice(0, 10);
  document.getElementById(fimId).value = fim.toISOString().slice(0, 10);
  if (typeof fn === 'function') fn();
}

