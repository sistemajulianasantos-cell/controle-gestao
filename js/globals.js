
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

function sv(k) {
  if (!window.svFirebase) return;
  var p = window.svFirebase(k);
  if (p && typeof p.catch === 'function') {
    p.catch(function(e) { if (window._logErro) _logErro('Firebase', 'sv/' + k, e); });
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fN(n){return Number(n||0).toLocaleString('pt-BR')}
function fR(n){return n?'R$ '+Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}):'—'}
function td(){return new Date().toISOString().slice(0,10)}
function fd(d){return d?d.split('-').reverse().join('/'):'—'}

// Preenche select de ano com os anos encontrados nas datas do array fornecido
function gerarAnosFromData(selectId, datas) {
  const el = document.getElementById(selectId);
  if (!el) return;
  const anos = [...new Set(
    (datas || []).filter(Boolean).map(d => d.slice(0, 4)).filter(Boolean)
  )].sort((a, b) => b.localeCompare(a));
  const anoAtual = String(new Date().getFullYear());
  const prev = el.value || (anos.includes(anoAtual) ? anoAtual : (anos[0] || ''));
  el.innerHTML = '<option value="">Ano...</option>';
  anos.forEach(function(a) {
    el.innerHTML += '<option value="' + a + '"' + (a === prev ? ' selected' : '') + '>' + a + '</option>';
  });
}

// Aplica filtro de mês/ano nos campos de data
function aplicarMesFechado(anoId, mesId, iniId, fimId, fn) {
  const ano = Number(document.getElementById(anoId).value);
  const mes = Number(document.getElementById(mesId).value);
  if (!ano) return; // sem ano não filtra
  const anoEfetivo = ano;
  const ini = mes ? new Date(anoEfetivo, mes - 1, 1) : new Date(anoEfetivo, 0, 1);
  const fim = mes ? new Date(anoEfetivo, mes, 0)     : new Date(anoEfetivo, 11, 31);
  document.getElementById(iniId).value = ini.toISOString().slice(0, 10);
  document.getElementById(fimId).value = fim.toISOString().slice(0, 10);
  if (typeof fn === 'function') fn();
}

