// ─── ESTOQUE — LEITURA AO VIVO DO SISTEMA SEPARAÇÃO E FECHAMENTO ────────────
// A conexão com o projeto Firebase separado (login, leitura de "estoque")
// vive em index.html (script module: window.separacaoLogin/separacaoLogado/
// separacaoAuthReady/buscarEstoqueSeparacao). Este arquivo só cuida de:
// (1) casar cada insumo daqui com o item correspondente de lá por nome
// normalizado, e (2) a UI de conectar/mostrar o vínculo no Cadastro de
// Insumos. Nunca escreve no projeto secundário — só leitura.
//
// O casamento por nome é uma primeira aproximação (normaliza + remove
// sufixo de fornecimento tipo CONSIGNADO/ROMERO, igual o Sistema Separação
// já faz do lado dele). Ela pretende padronizar os nomes dos dois cadastros
// depois com uma lista própria — quando isso acontecer, esse matching por
// aproximação pode ser trocado por um vínculo explícito salvo por item.

var _estoqueSeparacaoCache = null; // null = ainda não carregado; [] = carregado e vazio
var _estoqueSeparacaoPorChave = {};

// Mesma lista usada em js/app.js do Sistema Separação (SUFIXOS_FORNECIMENTO).
var _SUFIXOS_FORNECIMENTO_SEP = ['consignado','cliente','romero','reserva','proprio','propria','terceiro','cortesia','gratis','gratuito','locacao','doacao','empresa'];

function _normalizarChaveEstoqueSep(nome) {
  var k = (nome || '')
    .normalize('NFD').replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  for (var i = 0; i < _SUFIXOS_FORNECIMENTO_SEP.length; i++) {
    var re = new RegExp('_?' + _SUFIXOS_FORNECIMENTO_SEP[i] + '$');
    if (re.test(k)) { k = k.replace(re, ''); break; }
  }
  return k;
}

async function _carregarEstoqueSeparacao() {
  if (typeof window.buscarEstoqueSeparacao !== 'function') return null;
  var lista = await window.buscarEstoqueSeparacao();
  if (!lista) return null;
  _estoqueSeparacaoCache = lista;
  _estoqueSeparacaoPorChave = {};
  lista.forEach(function(it) {
    var chave = _normalizarChaveEstoqueSep(it.nomeKey || it.nome);
    if (chave) _estoqueSeparacaoPorChave[chave] = it;
  });
  return lista;
}

// Tenta o nome do insumo e cada apelido, na ordem — primeiro que bater vale.
function _estoqueSeparacaoParaInsumo(insumo) {
  if (!_estoqueSeparacaoCache) return null;
  var candidatos = [insumo.nome].concat(insumo.aliases || []);
  for (var i = 0; i < candidatos.length; i++) {
    var chave = _normalizarChaveEstoqueSep(candidatos[i]);
    if (chave && _estoqueSeparacaoPorChave[chave]) return _estoqueSeparacaoPorChave[chave];
  }
  return null;
}

function abrirLoginEstoqueSeparacao() {
  var erroEl = document.getElementById('msep-erro');
  if (erroEl) { erroEl.style.display = 'none'; erroEl.textContent = ''; }
  var u = document.getElementById('msep-usuario'); if (u) u.value = '';
  var s = document.getElementById('msep-senha'); if (s) s.value = '';
  openM('msep-login');
  if (u) u.focus();
}

async function confirmarLoginSeparacao() {
  var usuario = (document.getElementById('msep-usuario')?.value || '').trim();
  var senha = document.getElementById('msep-senha')?.value || '';
  var erroEl = document.getElementById('msep-erro');
  var mostrarErro = function(msg) { if (erroEl) { erroEl.textContent = msg; erroEl.style.display = 'block'; } };
  if (!usuario || !senha) { mostrarErro('Preencha usuário e senha.'); return; }

  try {
    await window.separacaoLogin(usuario, senha);
    closeM('msep-login');
    await _carregarEstoqueSeparacao();
    _rEstoqueSeparacaoStatus();
    if (typeof rCadastroInsumos === 'function') rCadastroInsumos();
    alert2('Estoque do Sistema Separação conectado!');
  } catch (e) {
    var CODIGOS_CREDENCIAL_INVALIDA = ['auth/wrong-password','auth/user-not-found','auth/invalid-credential','auth/invalid-login-credentials'];
    if (e && CODIGOS_CREDENCIAL_INVALIDA.includes(e.code)) {
      mostrarErro('Usuário ou senha incorretos.');
    } else {
      mostrarErro('Não foi possível conectar (' + (e && e.message ? e.message : 'erro desconhecido') + ').');
    }
  }
}

async function _recarregarEstoqueSeparacao() {
  await _carregarEstoqueSeparacao();
  _rEstoqueSeparacaoStatus();
  if (typeof rCadastroInsumos === 'function') rCadastroInsumos();
}

function _rEstoqueSeparacaoStatus() {
  var cont = document.getElementById('cad-estoque-sep-status');
  if (!cont) return;
  var logado = typeof window.separacaoLogado === 'function' && window.separacaoLogado();
  if (!logado) {
    cont.innerHTML = '<button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2)" onclick="abrirLoginEstoqueSeparacao()">🔗 Conectar estoque do Sistema Separação</button>';
    return;
  }
  var qtdItens = _estoqueSeparacaoCache ? _estoqueSeparacaoCache.length : 0;
  cont.innerHTML =
    '<span style="font-size:11px;color:var(--green)">✅ Estoque do Sistema Separação conectado (' + qtdItens + ' iten' + (qtdItens === 1 ? '' : 's') + ')</span>' +
    ' <button class="btn-sm" style="background:var(--bg3);border:1px solid var(--border2);margin-left:8px" onclick="_recarregarEstoqueSeparacao()">🔄 Atualizar</button>';
}

// Se já havia sessão salva no navegador (login anterior), conecta sozinho
// sem pedir login de novo — só depois que o Firebase Auth confirma o estado
// (window.separacaoAuthReady). Chamado a partir de initCadastro() (não no
// carregamento da página) porque scripts type="module" só terminam de rodar
// DEPOIS de todo script clássico — se isso rodasse aqui direto no load do
// arquivo, window.separacaoAuthReady ainda nem existiria. Só tenta a
// reconexão automática uma vez por sessão de página; depois disso, quem
// atualiza é o botão "🔄 Atualizar".
// ─── VARREDURA: comparar Cadastro de Insumos (aqui) × Sistema Separação ────
// Só leitura dos dois lados. Cruza por nome normalizado (mesma chave usada
// pra puxar o estoque) e lista onde nome / categoria / unidade divergem, além
// do que existe só de um lado. Não altera nada em nenhum dos dois sistemas.

// Normalização "de comparação" — mantém o nome inteiro (só tira acento/caixa/
// espaço duplo), diferente de _normalizarChaveEstoqueSep que é pra casar.
function _normCompara(s) {
  return (s || '')
    .normalize('NFD').replace(/\p{Mn}/gu, '')
    .toUpperCase().trim()
    .replace(/\s+/g, ' ');
}

async function compararCadastrosSeparacao() {
  var cont = document.getElementById('cad-comparacao-sep');
  if (!cont) return;

  var logado = typeof window.separacaoLogado === 'function' && window.separacaoLogado();
  if (!logado) {
    cont.innerHTML = '<div style="background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:12px 14px;font-size:12px;color:var(--text3)">' +
      'Conecte o estoque do Sistema Separação primeiro (botão logo acima) e clique em "Comparar" de novo.</div>';
    return;
  }

  cont.innerHTML = '<div style="font-size:12px;color:var(--text3);padding:10px 4px">Lendo os dois cadastros…</div>';

  var estoque = (typeof window.buscarEstoqueSeparacao === 'function') ? await window.buscarEstoqueSeparacao() : null;
  var itemCfg = (typeof window.buscarItemConfigSeparacao === 'function') ? await window.buscarItemConfigSeparacao() : null;
  if (!estoque && !itemCfg) {
    cont.innerHTML = '<div style="background:rgba(240,90,90,.08);border:1px solid rgba(240,90,90,.35);border-radius:var(--radius);padding:12px 14px;font-size:12px;color:var(--red)">' +
      'Não consegui ler os dados do Sistema Separação. Tente reconectar (botão "🔄 Atualizar" acima).</div>';
    return;
  }

  // Lado Separação: chave normalizada → { nome, unidade, grupo }
  var sep = {};
  (itemCfg || []).forEach(function(ic) {
    var k = _normalizarChaveEstoqueSep(ic.nomeKey || ic.nome);
    if (!k) return;
    if (!sep[k]) sep[k] = {};
    if (ic.nome && !sep[k].nome) sep[k].nome = ic.nome;
    if (ic.grupo) sep[k].grupo = ic.grupo;
  });
  (estoque || []).forEach(function(e) {
    var k = _normalizarChaveEstoqueSep(e.nomeKey || e.nome);
    if (!k) return;
    if (!sep[k]) sep[k] = {};
    if (e.nome && !sep[k].nome) sep[k].nome = e.nome;
    if (e.unidade) sep[k].unidade = e.unidade;
  });

  var insumos = (D.insumos || []);
  var difNome = [], difCat = [], difUnid = [], soAqui = [];
  var chavesCasadas = {};

  insumos.forEach(function(i) {
    var candidatos = [i.nome].concat(i.aliases || []);
    var k = null;
    for (var c = 0; c < candidatos.length; c++) {
      var kk = _normalizarChaveEstoqueSep(candidatos[c]);
      if (kk && sep[kk]) { k = kk; break; }
    }
    if (!k) { soAqui.push(i.nome); return; }
    chavesCasadas[k] = true;
    var s = sep[k];
    if (s.nome && _normCompara(s.nome) !== _normCompara(i.nome)) {
      difNome.push({ id: i.id, aqui: i.nome, la: s.nome });
    }
    if (s.grupo && i.categoria && _normCompara(s.grupo) !== _normCompara(i.categoria)) {
      difCat.push({ id: i.id, nome: i.nome, aqui: i.categoria, la: s.grupo });
    }
    if (s.unidade && i.unidadeCompra && _normCompara(s.unidade) !== _normCompara(i.unidadeCompra)) {
      difUnid.push({ nome: i.nome, aqui: i.unidadeCompra, la: s.unidade });
    }
  });

  var soLa = Object.keys(sep).filter(function(k){ return !chavesCasadas[k]; })
    .map(function(k){ return sep[k].nome || k; })
    .sort(function(a, b){ return a.localeCompare(b); });

  cont.innerHTML = _compSepRenderHtml({
    nInsumos: insumos.length,
    nSep: Object.keys(sep).length,
    nCasados: Object.keys(chavesCasadas).length,
    difNome: difNome, difCat: difCat, difUnid: difUnid, soAqui: soAqui.sort(), soLa: soLa,
  });
}

function _compSepRenderHtml(d) {
  function bloco(titulo, cor, itens, linhaFn) {
    return '<div style="margin-top:12px">' +
      '<div style="font-size:11px;font-weight:700;color:' + cor + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">' +
        titulo + ' — ' + itens.length + '</div>' +
      (itens.length
        ? '<div style="display:grid;gap:4px">' + itens.map(linhaFn).join('') + '</div>'
        : '<div style="font-size:11px;color:var(--text3)">nenhum</div>') +
    '</div>';
  }
  var caixa = 'background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:5px 9px;font-size:11px';

  var html = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:6px">' +
      '<div style="font-size:12px;font-weight:700;color:var(--text2)">Comparação — Cadastro de Insumos (aqui) × Sistema Separação</div>' +
      '<div style="display:flex;gap:6px">' +
        '<button class="btn-sm" style="background:var(--bg3)" onclick="_compSepCopiar()">Copiar como texto</button>' +
        '<button class="btn-sm" style="background:var(--bg3)" onclick="document.getElementById(\'cad-comparacao-sep\').innerHTML=\'\'">Fechar</button>' +
      '</div>' +
    '</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:4px">' +
      d.nInsumos + ' insumos aqui · ' + d.nSep + ' itens no Sistema Separação · ' + d.nCasados + ' casaram por nome</div>' +
    '<div style="font-size:10px;color:var(--text3);font-style:italic;margin-bottom:4px">Categoria: os dois sistemas agrupam de formas diferentes (aqui = tipo de produto; lá = setor/grupo de separação), então diferença aqui pode ser normal.</div>' +

    _compSepBlocoNome(d.difNome, caixa) +
    _compSepBlocoCategoria(d.difCat, caixa) +
    bloco('Unidade diferente', 'var(--amber)', d.difUnid, function(x) {
      return '<div style="' + caixa + '"><strong>' + _fte(x.nome) + '</strong>: ' + _fte(x.aqui) + '<span style="color:var(--text3)"> (aqui)</span> &nbsp;≠&nbsp; ' + _fte(x.la) + '<span style="color:var(--text3)"> (Separação)</span></div>';
    }) +
    bloco('Só no Cadastro de Insumos (não achado na Separação)', 'var(--text3)', d.soAqui, function(n) {
      return '<div style="' + caixa + '">' + _fte(n) + '</div>';
    }) +
    bloco('Só no Sistema Separação (não achado aqui)', 'var(--text3)', d.soLa, function(n) {
      return '<div style="' + caixa + '">' + _fte(n) + '</div>';
    }) +
  '</div>';

  window._compSepUltimo = d; // pro botão "copiar"
  return html;
}

function _fte(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Bloco "Nome diferente" com seleção por linha — ela marca quais padronizar
// e ajusta o nome final (pré-preenchido com o do Sistema Separação).
function _compSepBlocoNome(lista, caixa) {
  var cabecalho = '<div style="margin-top:12px">' +
    '<div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Nome diferente (mesmo item) — ' + lista.length + '</div>';
  if (!lista.length) return cabecalho + '<div style="font-size:11px;color:var(--text3)">nenhum</div></div>';

  return cabecalho +
    '<div style="font-size:10px;color:var(--text3);margin-bottom:6px">Marque as linhas que quer padronizar e ajuste o nome final (vem preenchido com o do Sistema Separação — apague o "CONSIGNADO"/"(RESERVA)" se não fizer parte do nome). "Padronizar" renomeia o insumo <strong>aqui</strong>: o nome antigo vira apelido e as fichas/regras acompanham. O Sistema Separação não é alterado.</div>' +
    '<div style="display:grid;gap:4px">' +
    lista.map(function(x, idx) {
      var alvo = _fte(x.la).replace(/"/g, '&quot;');
      return '<div style="' + caixa + ';display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
        '<input type="checkbox" class="comp-nome-chk" data-id="' + _fte(x.id) + '" data-idx="' + idx + '" style="cursor:pointer">' +
        '<span style="color:var(--text3);text-decoration:line-through">' + _fte(x.aqui) + '</span>' +
        '<span style="color:var(--text3)">→</span>' +
        '<input class="inp comp-nome-alvo" data-idx="' + idx + '" type="text" value="' + alvo + '" style="flex:1;min-width:220px;font-size:11px;padding:3px 6px;text-transform:uppercase">' +
      '</div>';
    }).join('') +
    '</div>' +
    '<div style="margin-top:8px;display:flex;gap:6px">' +
      '<button class="btn-sm" style="background:var(--green)" onclick="_compSepPadronizarNomes()">Padronizar os marcados</button>' +
      '<button class="btn-sm" style="background:var(--bg3)" onclick="_compSepMarcar(\'comp-nome-chk\',true)">Marcar todos</button>' +
      '<button class="btn-sm" style="background:var(--bg3)" onclick="_compSepMarcar(\'comp-nome-chk\',false)">Desmarcar</button>' +
    '</div>' +
  '</div>';
}

function _compSepMarcar(classe, marcar) {
  var cont = document.getElementById('cad-comparacao-sep');
  if (!cont) return;
  cont.querySelectorAll('.' + classe).forEach(function(c) { c.checked = !!marcar; });
}

// Bloco "Categoria diferente" com seleção por linha + dropdown da categoria
// final (pré-selecionada com a do Sistema Separação).
function _compSepBlocoCategoria(lista, caixa) {
  var cab = '<div style="margin-top:12px">' +
    '<div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px">Categoria diferente — ' + lista.length + '</div>';
  if (!lista.length) return cab + '<div style="font-size:11px;color:var(--text3)">nenhum</div></div>';

  var cats = (typeof getCategorias === 'function') ? getCategorias().slice() : [];
  function opcoes(la, atual) {
    var laU = (la || '').trim().toUpperCase();
    var temLa = cats.some(function(c) { return c.toUpperCase() === laU; });
    var out = '';
    if (laU && !temLa) out += '<option value="' + _fte(la) + '" selected>' + _fte(la) + '  (criar categoria)</option>';
    cats.forEach(function(c) {
      var sel = temLa && c.toUpperCase() === laU;
      out += '<option value="' + _fte(c) + '"' + (sel ? ' selected' : '') + '>' + _fte(c) + '</option>';
    });
    return out;
  }

  return cab +
    '<div style="font-size:10px;color:var(--text3);margin-bottom:6px">A categoria vem pré-selecionada com a do Sistema Separação. Marque as linhas que quer mudar e clique em aplicar — muda só a categoria do insumo <strong>aqui</strong> (categoria nova é criada). Lembre: os dois sistemas agrupam diferente, nem toda diferença precisa ser igualada.</div>' +
    '<div style="display:grid;gap:4px">' +
    lista.map(function(x, idx) {
      return '<div style="' + caixa + ';display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
        '<input type="checkbox" class="comp-cat-chk" data-id="' + _fte(x.id) + '" data-idx="' + idx + '" style="cursor:pointer">' +
        '<strong>' + _fte(x.nome) + '</strong>' +
        '<span style="color:var(--text3);text-decoration:line-through">' + _fte(x.aqui) + '</span>' +
        '<span style="color:var(--text3)">→</span>' +
        '<select class="comp-cat-alvo" data-idx="' + idx + '" style="font-size:11px;padding:3px 6px;background:var(--bg);color:var(--text);border:1px solid var(--border2);border-radius:4px">' + opcoes(x.la, x.aqui) + '</select>' +
      '</div>';
    }).join('') +
    '</div>' +
    '<div style="margin-top:8px;display:flex;gap:6px">' +
      '<button class="btn-sm" style="background:var(--green)" onclick="_compSepPadronizarCategorias()">Aplicar categoria aos marcados</button>' +
      '<button class="btn-sm" style="background:var(--bg3)" onclick="_compSepMarcar(\'comp-cat-chk\',true)">Marcar todos</button>' +
      '<button class="btn-sm" style="background:var(--bg3)" onclick="_compSepMarcar(\'comp-cat-chk\',false)">Desmarcar</button>' +
    '</div>' +
  '</div>';
}

function _compSepPadronizarCategorias() {
  var cont = document.getElementById('cad-comparacao-sep');
  if (!cont) return;
  var mudancas = [];
  cont.querySelectorAll('.comp-cat-chk:checked').forEach(function(chk) {
    var alvo = cont.querySelector('.comp-cat-alvo[data-idx="' + chk.dataset.idx + '"]');
    var catNova = ((alvo && alvo.value) || '').trim().toUpperCase();
    if (chk.dataset.id && catNova) mudancas.push({ id: chk.dataset.id, cat: catNova });
  });
  if (!mudancas.length) { alert('Marque pelo menos uma linha.'); return; }

  var resumo = mudancas.map(function(m) {
    var ins = (D.insumos || []).find(function(i) { return i.id === m.id; });
    return '• ' + ((ins && ins.nome) || '?') + ':  ' + ((ins && ins.categoria) || '?') + '  →  ' + m.cat;
  }).join('\n');
  if (!confirm('Mudar a categoria de ' + mudancas.length + ' insumo(s):\n\n' + resumo + '\n\nContinuar?')) return;

  var n = 0, catsNovas = 0;
  var atuais = (typeof getCategorias === 'function') ? getCategorias().map(function(c){ return c.toUpperCase(); }) : [];
  mudancas.forEach(function(m) {
    var ins = (D.insumos || []).find(function(i) { return i.id === m.id; });
    if (!ins || (ins.categoria || '').toUpperCase() === m.cat) return;
    if (atuais.indexOf(m.cat) === -1) {
      if (!D.categorias) D.categorias = [];
      var ordemMax = D.categorias.reduce(function(mx, c) { return Math.max(mx, c.ordem || 0); }, 0);
      D.categorias.push({ id: 'CAT' + Date.now() + Math.random().toString(36).slice(2, 6), nome: m.cat, ordem: ordemMax + 1 });
      atuais.push(m.cat);
      catsNovas++;
    }
    ins.categoria = m.cat;
    n++;
  });
  if (catsNovas) sv('categorias');
  if (n) sv('insumos');
  alert(n + ' insumo(s) recategorizado(s)' + (catsNovas ? ' · ' + catsNovas + ' categoria(s) nova(s) criada(s)' : '') + '.');
  if (typeof rCadastroInsumos === 'function') rCadastroInsumos();
  if (typeof _atualizarFiltrosDeCategoria === 'function') _atualizarFiltrosDeCategoria();
  compararCadastrosSeparacao();
}

function _compSepPadronizarNomes() {
  var cont = document.getElementById('cad-comparacao-sep');
  if (!cont) return;
  var mudancas = [];
  cont.querySelectorAll('.comp-nome-chk:checked').forEach(function(chk) {
    var alvo = cont.querySelector('.comp-nome-alvo[data-idx="' + chk.dataset.idx + '"]');
    var nomeNovo = ((alvo && alvo.value) || '').trim().toUpperCase();
    if (chk.dataset.id && nomeNovo) mudancas.push({ id: chk.dataset.id, nomeNovo: nomeNovo });
  });
  if (!mudancas.length) { alert('Marque pelo menos uma linha.'); return; }

  var resumo = mudancas.map(function(m) {
    var ins = (D.insumos || []).find(function(i) { return i.id === m.id; });
    return '• ' + ((ins && ins.nome) || '?') + '  →  ' + m.nomeNovo;
  }).join('\n');
  if (!confirm('Renomear ' + mudancas.length + ' insumo(s):\n\n' + resumo +
    '\n\nO nome antigo vira apelido. Fichas e regras acompanham. Continuar?')) return;

  var n = 0;
  mudancas.forEach(function(m) {
    var ins = (D.insumos || []).find(function(i) { return i.id === m.id; });
    if (!ins) return;
    var antigo = (ins.nome || '').trim().toUpperCase();
    if (!antigo || antigo === m.nomeNovo) return;
    if (!ins.aliases) ins.aliases = [];
    if (ins.aliases.indexOf(antigo) === -1) ins.aliases.push(antigo);
    ins.nome = m.nomeNovo;
    if (typeof _propagarRenomeInsumo === 'function') _propagarRenomeInsumo(antigo, m.nomeNovo);
    n++;
  });
  if (n) sv('insumos');
  alert(n + ' insumo(s) renomeado(s). O nome antigo ficou como apelido.');
  if (typeof rCadastroInsumos === 'function') rCadastroInsumos();
  compararCadastrosSeparacao();
}

function _compSepCopiar() {
  var d = window._compSepUltimo;
  if (!d) return;
  var L = [];
  L.push('COMPARAÇÃO — Cadastro de Insumos (aqui) × Sistema Separação');
  L.push(d.nInsumos + ' insumos aqui · ' + d.nSep + ' itens na Separação · ' + d.nCasados + ' casaram');
  L.push('');
  L.push('== NOME DIFERENTE (' + d.difNome.length + ') ==');
  d.difNome.forEach(function(x){ L.push('  "' + x.aqui + '" (aqui)  !=  "' + x.la + '" (Separação)'); });
  L.push('');
  L.push('== CATEGORIA DIFERENTE (' + d.difCat.length + ') ==');
  d.difCat.forEach(function(x){ L.push('  ' + x.nome + ':  ' + x.aqui + ' (aqui)  !=  ' + x.la + ' (Separação)'); });
  L.push('');
  L.push('== UNIDADE DIFERENTE (' + d.difUnid.length + ') ==');
  d.difUnid.forEach(function(x){ L.push('  ' + x.nome + ':  ' + x.aqui + ' (aqui)  !=  ' + x.la + ' (Separação)'); });
  L.push('');
  L.push('== SÓ NO CADASTRO DE INSUMOS (' + d.soAqui.length + ') ==');
  d.soAqui.forEach(function(n){ L.push('  ' + n); });
  L.push('');
  L.push('== SÓ NO SISTEMA SEPARAÇÃO (' + d.soLa.length + ') ==');
  d.soLa.forEach(function(n){ L.push('  ' + n); });
  var txt = L.join('\n');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(txt).then(function(){ alert('Comparação copiada — cole onde quiser.'); },
      function(){ _compSepFallbackCopiar(txt); });
  } else {
    _compSepFallbackCopiar(txt);
  }
}

function _compSepFallbackCopiar(txt) {
  var ta = document.createElement('textarea');
  ta.value = txt;
  ta.style.cssText = 'position:fixed;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); alert('Comparação copiada.'); }
  catch (e) { alert('Não consegui copiar automático — o texto está no console (F12).'); console.log(txt); }
  document.body.removeChild(ta);
}

var _estoqueSeparacaoAutoTentado = false;
function _tentarAutoConectarEstoqueSeparacao() {
  if (_estoqueSeparacaoAutoTentado) { _rEstoqueSeparacaoStatus(); return; }
  _estoqueSeparacaoAutoTentado = true;
  if (typeof window.separacaoAuthReady === 'undefined') { _rEstoqueSeparacaoStatus(); return; }
  window.separacaoAuthReady.then(async function(logado) {
    if (logado) await _carregarEstoqueSeparacao();
    _rEstoqueSeparacaoStatus();
    if (logado && typeof rCadastroInsumos === 'function' && document.getElementById('cad-lista-body')) rCadastroInsumos();
  });
}
