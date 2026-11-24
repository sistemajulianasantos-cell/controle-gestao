
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


// Nome de arquivo no padrão dela (11-17): "1126-050 _ HUMBERTO TEODORO _ 18.12.2026.docx"
// — código _ nome em maiúsculas _ data do evento (AAAA-MM-DD ou DD/MM/AAAA)
// com pontos. Parte vazia some; caractere proibido no Windows vira "-".
function nomeArquivoPadrao(codigo, nome, data, ext) {
  var s = String(data || '');
  var iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s), br = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
  var dataTxt = iso ? iso[3] + '.' + iso[2] + '.' + iso[1] : (br ? br[1] + '.' + br[2] + '.' + br[3] : '');
  // Nº digitado com complemento ("1126-067 OPÇÃO 2") — o complemento vai
  // depois da data, igual aos arquivos dela ("... _ 31.07.2027 POS DEGUST"),
  // pra não mexer no padrão Nº _ NOME _ DATA (11-24).
  var extra = '';
  var mc = /^\s*(\d{4}-\d{3})\s*[-_]?\s*(.+)$/.exec(String(codigo || ''));
  if (mc) { codigo = mc[1]; extra = mc[2]; }
  var limpa = function(p) { return String(p || '').replace(/[\\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim(); };
  var partes = [codigo, String(nome || '').toUpperCase(), dataTxt].map(limpa).filter(Boolean);
  extra = limpa(extra).toUpperCase();
  return ((partes.join(' _ ') || 'Documento') + (extra ? ' ' + extra : '')) + (ext || '.docx');
}

// Data "AAAA-MM-DD" que existe de verdade e com ano entre 1900 e 2099.
// 11-24: orçamento salvo com "20227-09-11" (ano de 5 dígitos) quebrava o nome
// do arquivo da proposta e os filtros por mês.
function dataValidaISO(s) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!m) return false;
  var a = +m[1], me = +m[2], d = +m[3];
  if (a < 1900 || a > 2099) return false;
  var dt = new Date(a, me - 1, d);
  return dt.getFullYear() === a && dt.getMonth() === me - 1 && dt.getDate() === d;
}

// Trava de data em TODO campo de data do sistema: limita o ano a 4 dígitos
// (min/max) e, se mesmo assim vier data inválida, volta o valor anterior e
// não deixa o onchange da tela gravar (captura roda antes do handler do campo).
(function() {
  document.addEventListener('focusin', function(e) {
    var t = e.target;
    if (!t || t.type !== 'date') return;
    if (!t.min) t.min = '1900-01-01';
    if (!t.max) t.max = '2099-12-31';
    t.dataset.valorAnterior = dataValidaISO(t.value) ? t.value : '';
  }, true);
  document.addEventListener('change', function(e) {
    var t = e.target;
    if (!t || t.type !== 'date' || !t.value) return;
    if (dataValidaISO(t.value)) { t.dataset.valorAnterior = t.value; return; }
    e.stopImmediatePropagation();
    t.value = t.dataset.valorAnterior || '';
    if (typeof alert2 === 'function') alert2('Data inválida — confira o ano (4 dígitos, ex: 2027). Nada foi salvo.', 'error');
  }, true);
})();

// Valor em reais digitado do jeito brasileiro → número. "1.200,00" → 1200,
// "1200" → 1200, "5,5" → 5.5, "1.200" → 1200 (ponto de milhar). Campo
// type="number" lia "1.200,00" como 1,2 (pedido dela 10-15).
function parseValorBR(v) {
  var s = String(v == null ? '' : v).replace(/[R$\s]/g, '');
  if (!s) return 0;
  if (s.indexOf(',') >= 0) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  return parseFloat(s) || 0;
}
// Número → "1.200,00" (sem R$), pra valor de campo de texto.
function fmtValorBR(n) {
  return (Number(n) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
