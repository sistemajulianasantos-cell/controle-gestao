// ─── SEPARAÇÃO ─────────────────────────────────────────

function initSeparacao() {
  if (!D.separacoes) D.separacoes = [];
  if (!D.sepCalculos) D.sepCalculos = [];
  if (typeof migrarRegrasBaseCalculo === 'function') migrarRegrasBaseCalculo();
  if (typeof migrarInsumosDoKitBase === 'function') migrarInsumosDoKitBase();
  setSepView('lista');
}

function setSepView(v) {
  ['lista','nova','calculos'].forEach(function(x) {
    var el = document.getElementById('sep-view-'+x);
    if (el) el.style.display = x===v ? '' : 'none';
    var btn = document.getElementById('sep-tab-'+x);
    if (btn) btn.classList.toggle('active', x===v);
  });
  if (v==='lista')    rSeparacoes();
  if (v==='nova')     rSepNova();
  if (v==='calculos') rSepCalculos();
}

function rSeparacoes() {
  var cont = document.getElementById('sep-lista-body');
  if (!cont) return;
  var lista = (D.separacoes||[]).slice().sort(function(a,b){return (b.data||'').localeCompare(a.data||'');});
  if (!lista.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhuma folha gerada. Clique em "+ Nova Folha".</div>';
    return;
  }
  cont.innerHTML = lista.map(function(s) {
    return '<div class="sec" style="margin-bottom:10px">' +
      '<div class="sec-head" style="display:flex;align-items:center;gap:10px">' +
        '<span class="sec-title">📋 ' + (s.evento||'—') + '</span>' +
        '<span style="color:var(--text3);font-size:12px">' + (fd(s.data)||'') + '</span>' +
        '<span style="color:var(--text3);font-size:11px">' + (s.convidados||'—') + ' convidados</span>' +
        '<div style="margin-left:auto;display:flex;gap:6px">' +
          '<button class="btn-sm" style="background:var(--blue)" onclick="editarSeparacao(\'' + s.id + '\')">✏️ Ver / Editar</button>' +
          '<button class="btn-sm" style="background:#6C63FF" onclick="imprimirSeparacao(\'' + s.id + '\')">🖨️ Separação</button>' +
          '<button class="btn-sm" style="background:#6C63FF" onclick="imprimirFichaTecnica(\'' + s.id + '\')">🖨️ Ficha Técnica</button>' +
          '<button class="btn-sm btn-red" onclick="excluirSeparacao(\'' + s.id + '\')">Excluir</button>' +
        '</div>' +
      '</div>' +
      '<div style="padding:6px 16px;font-size:11px;color:var(--text3)">' + (s.local||'') + ' · Equipe: ' + (s.totalEquipe||'—') + ' · Bartenders: ' + (s.bartenders||'—') + '</div>' +
    '</div>';
  }).join('');
}

function _sepHojeStr() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function rSepNova() {
  var cont = document.getElementById('sep-nova-body');
  if (!cont) return;
  var hoje = _sepHojeStr();
  // Só eventos de hoje em diante (ou sem data) — evento passado não precisa
  // de folha nova. Editar uma folha antiga ainda funciona (editarSeparacao
  // injeta a opção).
  var producoes = (D.producoes||[])
    .filter(function(p){ return !p.data || p.data >= hoje; })
    .sort(function(a,b){ return (a.data||'').localeCompare(b.data||''); });
  var opts = producoes.map(function(p){
    return '<option value="' + p.id + '">' + (p.evento||p.cliente||'—') + ' · ' + (fd(p.data)||'') + '</option>';
  }).join('');
  cont.innerHTML = '<div style="padding:16px">' +
    '<label class="lbl" style="display:block;margin-bottom:6px">Selecionar evento *</label>' +
    '<select id="sep-prod-sel" class="inp" onchange="sepCarregarProducao(this.value)" style="width:100%;max-width:480px">' +
      '<option value="">— Selecione o evento —</option>' + opts +
    '</select>' +
    '<div style="font-size:10px;color:var(--text3);margin-top:4px">Mostra só eventos de hoje em diante.</div>' +
    '<div id="sep-form-campos" style="display:none;margin-top:16px"></div>' +
  '</div>';
}

// Ver categoriaAtualDoInsumo (js/insumos.js) — resolve a categoria atual do
// Cadastro de Insumos por nome, em vez da guardada na ficha.
function catAtualFichaItem(item) {
  return (typeof categoriaAtualDoInsumo === 'function') ? categoriaAtualDoInsumo(item.nome, item.cat) : item.cat;
}

// Casa dois nomes de item: iguais, o mesmo insumo no Cadastro (apelido / nome
// renomeado), ou um nome contido no outro como pedaço inteiro (ex: a ficha
// tem "ESPUMANTE LE BLANC" e o insumo hoje é "ESPUMANTE LE BLANC - 660ML").
// Usado pra cruzar regra de Cálculo × item de ficha sem depender de a
// categoria — nem o texto exato — baterem.
function _sepMesmoItem(a, b) {
  var A = (a || '').trim().toUpperCase(), B = (b || '').trim().toUpperCase();
  if (!A || !B) return false;
  if (A === B) return true;

  var ia = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(a) : null;
  var ib = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(b) : null;
  if (ia && ib) return ia.id === ib.id;   // ambos conhecidos: decide pelo id

  // No máximo um dos dois é insumo conhecido: aceita se um nome contém o
  // outro inteiro, com fronteira de espaço/traço/parêntese (evita casar
  // "GIN" com tudo — por isso o mínimo de 8 caracteres).
  var curto = A.length <= B.length ? A : B;
  var longo = A.length <= B.length ? B : A;
  if (curto.length >= 8) {
    var p = longo.indexOf(curto);
    if (p !== -1) {
      var antesOk = p === 0 || /[\s\-–—(]/.test(longo.charAt(p - 1));
      var fim = p + curto.length;
      var depoisOk = fim === longo.length || /[\s\-–—)]/.test(longo.charAt(fim));
      if (antesOk && depoisOk) return true;
    }
  }
  return false;
}

// Entrada {count, coqueteis} do itensCardapio pra um nome, em qualquer
// categoria. A categoria da regra e a categoria atual do insumo podem
// divergir — e essa divergência não pode fazer a regra "não achar" o
// coquetel e a quantidade final zerar.
function _sepEntradaCardapio(itensCardapio, nome) {
  var achou = null;
  Object.keys(itensCardapio || {}).forEach(function(c) {
    Object.keys(itensCardapio[c]).forEach(function(n) {
      if (_sepMesmoItem(n, nome)) achou = itensCardapio[c][n];
    });
  });
  return achou;
}

// Linha já montada em todosItens pra um nome, em qualquer categoria.
function _sepLinhaMontada(todosItens, nome) {
  var achou = null;
  Object.keys(todosItens || {}).forEach(function(c) {
    (todosItens[c] || []).forEach(function(x) {
      if (_sepMesmoItem(x.item, nome)) achou = x;
    });
  });
  return achou;
}

// Célula de quantidade de um item na folha. Item normal = input editável.
// Item travado (acessório de uma associação) = valor só-leitura que segue o
// principal, com um input escondido pra ser salvo por salvarSeparacao().
function _sepQtdCell(it, catAttr, itemAttr, valor, corTexto) {
  if (it.travado) {
    return '<div style="text-align:right" data-assoc-principal="' + (it.associadoA || '').replace(/"/g, '') + '" ' +
      'data-assoc-quantos="' + (it.assocQuantos || 1) + '" data-assoc-acada="' + (it.assocACada || 1) + '" data-assoc-min="' + (it.assocMin || 0) + '">' +
      '<span class="assoc-val" style="font-family:var(--mono);font-size:12px;font-weight:600;color:' + (corTexto || 'var(--text)') + '">' + valor + '</span>' +
      '<input type="hidden" data-item="' + itemAttr + '" data-cat="' + catAttr + '" value="' + valor + '">' +
    '</div>';
  }
  return '<input type="number" value="' + valor + '" min="0" data-item="' + itemAttr + '" data-cat="' + catAttr + '" ' +
    'style="font-size:12px;font-weight:600;padding:4px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:' + (corTexto || 'var(--text)') + ';text-align:center;font-family:var(--mono)">';
}

function _sepBadgeAssoc(it) {
  return it.associadoA
    ? '<span style="font-size:9px;background:var(--bg4);color:var(--text3);border:1px solid var(--border2);padding:1px 6px;border-radius:10px;margin-left:6px">segue ' + it.associadoA + '</span>'
    : '';
}

// Recalcula, ao vivo, os acessórios quando a quantidade do principal muda na
// tela (a Juliana pediu que o acessório acompanhe na hora). Roda 2x pra
// cobrir uma associação que aponte pra outro acessório.
function _sepRecalcAssociacoes() {
  var wrap = document.getElementById('sep-form-campos');
  if (!wrap) return;
  function valorDoItem(nome) {
    var alvo = (nome || '').toUpperCase();
    var achou = null;
    wrap.querySelectorAll('[data-item]').forEach(function(el) {
      if ((el.dataset.item || '').toUpperCase() === alvo) {
        achou = parseFloat(el.value != null ? el.value : el.textContent) || 0;
      }
    });
    return achou;
  }
  for (var passo = 0; passo < 2; passo++) {
    wrap.querySelectorAll('[data-assoc-principal]').forEach(function(box) {
      var quantos = parseFloat(box.dataset.assocQuantos) || 1;
      var aCada = parseFloat(box.dataset.assocAcada) || 1;
      var min = parseFloat(box.dataset.assocMin) || 0;
      var qp = valorDoItem(box.dataset.assocPrincipal);
      var qtd = Math.max(min, qp == null ? 0 : Math.ceil(qp * quantos / aCada));
      var span = box.querySelector('.assoc-val');
      var hidden = box.querySelector('input[type="hidden"]');
      if (span) span.textContent = qtd;
      if (hidden) hidden.value = qtd;
    });
  }
}

function sepCarregarProducao(prodId) {
  if (!prodId) return;
  var p = (D.producoes||[]).find(function(x){return x.id===prodId;});
  if (!p) return;

  var conv = parseInt(p.convidados)||0;
  var equipe = p.equipe||[];
  var bartenders = equipe.filter(function(e){return (e.cargo||'').toLowerCase().includes('bartender');})
    .reduce(function(s,e){return s+(parseInt(e.qtd)||0);},0) || Math.max(1,Math.ceil(conv/30));
  var equipeTotal = equipe.reduce(function(s,e){return s+(parseInt(e.qtd)||0);},0) || bartenders;
  var cargoCounts = equipe.length ? _sepCargoCounts(equipe) : null;

  // Se já existe uma folha gerada pra este evento, editar reabre essa mesma
  // tela (não uma tela separada só de leitura) — os valores salvos por ela
  // (quantidades ajustadas manualmente) têm prioridade sobre o cálculo
  // automático, via qtdSalva() abaixo.
  var sepExistente = (D.separacoes||[]).find(function(s){return s.producaoId===prodId;});
  function qtdSalva(cat, item) {
    if (sepExistente && sepExistente.itens && sepExistente.itens[cat] && sepExistente.itens[cat][item] != null) {
      return sepExistente.itens[cat][item];
    }
    return null;
  }
  function fornecedorSalvo(cat, item) {
    if (sepExistente && sepExistente.fornecedores && sepExistente.fornecedores[cat] && sepExistente.fornecedores[cat][item] != null) {
      return sepExistente.fornecedores[cat][item];
    }
    return '';
  }

  // Coquetéis deste evento: ela escolhe direto da lista de Fichas cadastradas
  // — não tenta mais adivinhar a partir do texto do cardápio (nome parecido
  // gerava falso positivo, como "Mix Frutas Vermelhas" entrando num evento
  // que não usa nenhum coquetel com esse ingrediente). Seleção fica em
  // memória (window._sepCoqueteisMap) até "Gerar Folha", quando é salva na
  // separação; reabrir uma separação já gerada recupera a seleção anterior.
  if (!window._sepCoqueteisMap) window._sepCoqueteisMap = {};
  if (!window._sepCoqueteisMap[prodId]) {
    window._sepCoqueteisMap[prodId] = (sepExistente && sepExistente.coqueteisIds) ? sepExistente.coqueteisIds.slice() : [];
  }
  var coqueteisSelecionadosIds = window._sepCoqueteisMap[prodId];
  var coqueteisCardapio = coqueteisSelecionadosIds
    .map(function(fid){ return (D.fichas||[]).find(function(f){return f.id===fid;}); })
    .filter(Boolean)
    .map(function(ficha){ return { nome: ficha.nome, ficha: ficha }; });

  // Monta itensCardapio (cat -> item -> {count, coqueteis}) direto das
  // fichas selecionadas, sem depender de casamento de texto.
  var itensCardapio = {};
  coqueteisCardapio.forEach(function(coq) {
    var vistos = new Set();
    (coq.ficha.itens||[]).forEach(function(item) {
      var cat = catAtualFichaItem(item);
      var key = cat + '|' + item.nome;
      if (vistos.has(key)) return;
      vistos.add(key);
      if (!itensCardapio[cat]) itensCardapio[cat] = {};
      if (!itensCardapio[cat][item.nome]) itensCardapio[cat][item.nome] = { count: 0, coqueteis: [] };
      itensCardapio[cat][item.nome].count++;
      if (itensCardapio[cat][item.nome].coqueteis.indexOf(coq.ficha.nome) === -1) {
        itensCardapio[cat][item.nome].coqueteis.push(coq.ficha.nome);
      }
    });
  });

  var regras = getRegrasItens();
  var cont = document.getElementById('sep-form-campos');
  if (!cont) return;
  cont.style.display = '';

  // Classificar categorias por seção
  var CATS_KIT_BASE = ['MATERIAL','DESCARTÁVEIS','ESPECIARIAS','KIT BARTENDER'];
  var CATS_CONFERENCIA = ['BEBIDAS ALCOÓLICAS','BEBIDAS SEM ÁLCOOL','GELO','COPOS E TAÇAS','PRODUÇÃO','XAROPES'];

  // Calcular todos os itens
  var todosItens = {}; // cat -> [item]
  regras.forEach(function(r) {
    // Itens opcionais não entram sozinhos — só quando ela marca, na seção
    // "Opcionais" abaixo, que o cliente incluiu neste evento.
    if (r.opcional) return;
    // "Segue outro item": a linha é criada só por aplicarAssociacoesSeparacao,
    // e só quando o item principal está de fato no evento. Sem esse return, o
    // acessório caía direto no Kit Base com a quantidade mínima, mesmo sem o
    // principal (ex: bico da angostura aparecendo sem nenhum coquetel usar
    // angostura).
    if (r.base === 'associado') return;
    // Casa por nome em qualquer categoria: antes exigia que r.cat fosse
    // idêntico à categoria atual do insumo na ficha — quando divergiam, a
    // regra "não via" o coquetel, e (com "só c/ coquetel") a quantidade
    // final vinha 0 mesmo com o coquetel na folha (ex: 12 Beefeater/100
    // convidados retornando 0).
    var entradaCardapio = _sepEntradaCardapio(itensCardapio, r.item);
    var itensDoCardapio = !!entradaCardapio;
    var coquetelDoItem = entradaCardapio ? entradaCardapio.coqueteis : [];
    // "Só se cardápio" precisa valer de verdade: antes, um item com mínimo >
    // 0 aparecia sempre (com aviso ⚠️), mesmo sem estar em nenhum coquetel
    // do cardápio deste evento — ex: Mix Frutas Vermelhas somando quantidade
    // num evento que não usa nenhum coquetel com esse ingrediente (08-26).
    if (r.soSeCardapio && !itensDoCardapio) return;
    if (!todosItens[r.cat]) todosItens[r.cat] = [];
    var qtd = calcQtdItem(r, conv, bartenders, equipeTotal, cargoCounts);
    todosItens[r.cat].push({
      item: r.item, qtd: qtd,
      doCardapio: !!itensDoCardapio,
      coqueteis: coquetelDoItem || [],
      soSeCardapio: r.soSeCardapio, obs: r.obs||'',
      semFicha: false
    });
  });

  // Garante uma linha agregada única por item de ficha, mesmo sem regra de
  // proporção nem entrada em Cálculos (ex: Mix Penicillin, exclusivo de um
  // coquetel). Sem isso, um item usado por dois coquetéis (ex: Pink Mandarim
  // e Gin Tônica no mesmo copo, ou dois coquetéis com Gin) apareceria como
  // campo editável separado em cada um, e a soma dava quantidade maior do
  // que ela realmente precisa levar pra festa toda (pedido 08-26). Precisa
  // rodar ANTES do merge de Cálculos abaixo, pra esse merge só atualizar
  // item que já está de fato associado a um coquetel deste evento.
  coqueteisCardapio.forEach(function(coq) {
    (coq.ficha.itens||[]).forEach(function(item) {
      // Procura a linha já montada pelo NOME (em qualquer categoria) — assim
      // a linha da regra de Cálculo, mesmo numa categoria diferente da que o
      // insumo tem hoje, recebe o coquetel e mantém a quantidade calculada,
      // em vez de nascer uma segunda linha zerada.
      var existente = _sepLinhaMontada(todosItens, item.nome);
      if (existente) {
        if (existente.coqueteis.indexOf(coq.nome) === -1) existente.coqueteis.push(coq.nome);
        existente.doCardapio = true;
      } else {
        var cat = catAtualFichaItem(item);
        if (!todosItens[cat]) todosItens[cat] = [];
        todosItens[cat].push({
          item: item.nome, qtd: 0,
          doCardapio: true,
          coqueteis: [coq.nome],
          soSeCardapio: false, obs: '',
          semFicha: false
        });
      }
    });
  });

  // Acessórios com base "Segue outro item" — roda por último, quando a
  // quantidade dos itens principais já está resolvida.
  if (typeof aplicarAssociacoesSeparacao === 'function') aplicarAssociacoesSeparacao(todosItens);

  var equipeHtml = equipe.length
    ? equipe.map(function(e){return '<span style="margin-right:10px">'+e.qtd+' '+e.cargo+'</span>';}).join('')
    : (p.equipeTexto||'—');

  // ── Cabeçalho do evento
  var html = '<div style="background:var(--bg3);border-radius:var(--radius);padding:10px 14px;margin-bottom:14px;border:1px solid var(--border);font-size:12px">' +
    '<strong>' + (p.evento||p.cliente||'—') + '</strong> · ' + (fd(p.data)||'—') + ' · ' + (p.hrInicio||'—') + '–' + (p.hrFim||'—') + '<br>' +
    '<span style="color:var(--text3)">' + conv + ' convidados · ' + (p.local||'—') + '</span><br>' +
    '<span style="color:var(--text3)">Equipe: ' + equipeHtml + '</span>' +
  '</div>';

  html += '<div style="display:grid;gap:16px">';

  // ══════════════════════════════════════════════════════
  // SELEÇÃO DE COQUETÉIS — ela escolhe, não é automático
  // ══════════════════════════════════════════════════════
  var fichasOrdenadas = (D.fichas||[]).slice().sort(function(a,b){return a.nome.localeCompare(b.nome,'pt-BR');});
  html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">' +
    '<div style="padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
      '<span style="font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.8px">Coquetéis deste evento</span>' +
      '<span style="font-size:11px;color:var(--text3)">Marque os coquetéis do cardápio — a separação calcula só a partir do que estiver marcado aqui</span>' +
      '<a href="#" onclick="irParaCadastroFicha();return false" style="font-size:11px;color:var(--blue);margin-left:auto;white-space:nowrap">+ Cadastrar nova ficha</a>' +
    '</div>' +
    '<div style="padding:10px 14px">' +
      '<input class="inp" id="sep-coq-busca" type="text" placeholder="Buscar coquetel..." oninput="filtrarCoqueteisSeparacao(this.value)" style="width:100%;max-width:280px;margin-bottom:10px">' +
      '<div id="sep-coq-lista" style="display:flex;flex-wrap:wrap;gap:6px">' +
        (fichasOrdenadas.length ? fichasOrdenadas.map(function(f) {
          var marcado = coqueteisSelecionadosIds.indexOf(f.id) !== -1;
          return '<label class="sep-coq-item" data-busca="' + f.nome.toLowerCase() + '" style="display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;background:' + (marcado?'var(--green-bg)':'var(--bg3)') + ';padding:4px 10px;border-radius:var(--radius);border:1px solid ' + (marcado?'var(--green-dim)':'var(--border)') + '">' +
            '<input type="checkbox" ' + (marcado?'checked':'') + ' data-fichaid="' + f.id + '" data-prodid="' + prodId + '" onchange="sepToggleCoquetel(this.dataset.prodid,this.dataset.fichaid,this.checked)"> ' + f.nome + '</label>';
        }).join('') : '<span style="font-size:11px;color:var(--text3)">Nenhuma ficha cadastrada ainda.</span>') +
      '</div>' +
    '</div>' +
  '</div>';

  // ── Copos da Ficha Técnica (troca por evento) ──────────────────────────
  // Seleção fica em window._sepCoposOverrideMap[prodId] até "Gerar Folha"
  // (mesmo padrão dos coquetéis) pra não perder a troca a cada re-render.
  if (!window._sepCoposOverrideMap) window._sepCoposOverrideMap = {};
  if (!window._sepCoposOverrideMap[prodId]) {
    window._sepCoposOverrideMap[prodId] = Object.assign({}, (sepExistente && sepExistente.coposOverride) || {});
  }
  if (coqueteisCardapio.length) {
    var _coposLib = (typeof getCopos === 'function') ? getCopos().slice().sort(function(a,b){return (a.nome||'').localeCompare(b.nome||'');}) : [];
    var _ovSalvo = window._sepCoposOverrideMap[prodId];
    html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">' +
      '<div style="padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border)">' +
        '<span style="font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.8px">Copos da Ficha Técnica</span>' +
        '<span style="font-size:11px;color:var(--text3);margin-left:8px">Vem o copo padrão de cada ficha — troque aqui se este evento usa outro. Vale só pra este evento.</span>' +
      '</div>' +
      '<div style="padding:8px 14px;display:grid;gap:6px">' +
      coqueteisCardapio.map(function(coq){
        var fid = coq.ficha.id;
        // Override guarda o NOME do copo (insumo COPOS E TAÇAS), não mais id.
        var atualNome = _ovSalvo[fid] || '';
        var padraoNome = (typeof nomeCopoDaFicha === 'function') ? nomeCopoDaFicha(coq.ficha) : (coq.ficha.copo || '');
        return '<div style="display:grid;grid-template-columns:1fr 220px;gap:8px;align-items:center">' +
          '<span style="font-size:12px;color:var(--text)">' + coq.ficha.nome + (padraoNome ? ' <span style="font-size:10px;color:var(--text3)">(padrão: ' + padraoNome + ')</span>' : '') + '</span>' +
          '<select data-copo-override="' + fid + '" onchange="sepSetCopoOverride(\'' + prodId + '\',\'' + fid + '\',this.value)" style="font-size:11px;padding:4px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
            '<option value="">— copo padrão da ficha —</option>' +
            _coposLib.map(function(c){ var n = (c.nome||'').replace(/"/g,'&quot;'); return '<option value="' + n + '"' + (atualNome===c.nome?' selected':'') + '>' + c.nome + '</option>'; }).join('') +
          '</select>' +
        '</div>';
      }).join('') +
      '</div>' +
    '</div>';
  }

  // ══════════════════════════════════════════════════════
  // SEÇÃO 1 — COQUETÉIS
  // ══════════════════════════════════════════════════════
  html += '<div style="background:var(--bg2);border:2px solid var(--blue-dim);border-radius:var(--radius-lg);overflow:hidden">' +
    '<div style="padding:10px 14px;background:var(--blue-bg);border-bottom:1px solid var(--blue-dim);display:flex;align-items:center;gap:8px">' +
      '<span style="font-size:12px;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:.8px">🍹 Coquetéis</span>' +
      '<span style="font-size:11px;color:var(--text3)">Confira quais itens cada coquetel usa — a quantidade final (somada pra festa toda) fica em Conferência / Kit Base</span>' +
    '</div>';

  if (coqueteisCardapio.length === 0) {
    html += '<div style="padding:14px;font-size:12px;color:var(--text3)">Nenhum coquetel marcado ainda — selecione acima.</div>';
  } else {
    coqueteisCardapio.forEach(function(coq) {
      html += '<div style="border-bottom:1px solid var(--border);padding:0">';
      html += '<div style="padding:8px 14px;background:var(--green-bg);border-left:3px solid var(--green-dim)">' +
        '<span style="font-size:12px;font-weight:600;color:var(--green)">' + coq.nome + '</span>' +
      '</div>';

      var itensCoquetel = coq.ficha.itens || [];
      if (itensCoquetel.length) {
        html += '<div style="padding:6px 0">';
        itensCoquetel.forEach(function(item) {
          // Só leitura — a quantidade é sempre a soma agregada pra festa
          // toda (calculada/editada em Conferência ou Kit Base), nunca por
          // coquetel isolado. Sem isso, um item usado por 2+ coquetéis (ex:
          // mesmo copo do Pink Mandarim e do Gin Tônica, ou Gin em dois
          // drinks) virava campo editável separado em cada um, e a soma
          // dava quantidade maior do que ela realmente precisa levar
          // (pedido 08-26).
          var catItem = catAtualFichaItem(item);
          var found = _sepLinhaMontada(todosItens, item.nome);
          var qtdAgregada = found ? found.qtd : 0;
          var salvoAgg = qtdSalva(catItem, item.nome);
          if (salvoAgg != null) qtdAgregada = salvoAgg;
          html += '<div style="display:grid;grid-template-columns:1fr 100px;gap:8px;align-items:center;padding:4px 14px;border-bottom:1px solid var(--border)">' +
            '<div style="font-size:12px;color:var(--text3)">' +
              '<span style="font-size:10px;margin-right:6px">' + catItem + '</span>' + item.nome +
            '</div>' +
            '<span style="display:block;font-size:12px;font-weight:600;padding:4px 8px;text-align:center;font-family:var(--mono);color:var(--text3)">' + qtdAgregada + '</span>' +
          '</div>';
        });
        html += '</div>';
      } else {
        html += '<div style="padding:8px 14px;font-size:11px;color:var(--text3)">Ficha sem itens cadastrados.</div>';
      }

      html += '</div>';
    });
  }

  html += '</div>'; // fim seção coquetéis

  // ══════════════════════════════════════════════════════
  // SEÇÃO 2 — CONFERÊNCIA
  // ══════════════════════════════════════════════════════
  html += '<div style="background:var(--bg2);border:2px solid var(--border2);border-radius:var(--radius-lg);overflow:hidden">' +
    '<div style="padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border2);display:flex;align-items:center;gap:8px">' +
      '<span style="font-size:12px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:.8px">📋 Conferência</span>' +
      '<span style="font-size:11px;color:var(--text3)">Bebidas, gelo, copos, produção, equipe</span>' +
    '</div>';

  // Equipe
  html += '<div style="border-bottom:1px solid var(--border)">' +
    '<div style="padding:6px 14px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;background:var(--bg3)">EQUIPE</div>';
  equipe.forEach(function(e) {
    var qtdEquipe = e.qtd;
    var salvoEquipe = qtdSalva('EQUIPE', e.cargo);
    if (salvoEquipe != null) qtdEquipe = salvoEquipe;
    html += '<div style="display:grid;grid-template-columns:1fr 100px;gap:8px;align-items:center;padding:4px 14px;border-bottom:1px solid var(--border)">' +
      '<span style="font-size:12px;color:var(--text)">' + e.cargo + '</span>' +
      '<input type="number" value="' + qtdEquipe + '" min="0" data-item="' + e.cargo + '" data-cat="EQUIPE" ' +
        'style="font-size:12px;font-weight:600;padding:4px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center;font-family:var(--mono)">' +
    '</div>';
  });
  html += '</div>';

  // Categorias de conferência calculadas
  var FORN_OPCOES = [['', 'Fornecedor…'], ['romero', 'Romero'], ['consignado', 'Consignado'], ['cliente', 'Cliente']];

  // Nenhum item de ficha pode sumir por ter uma categoria fora das listas
  // fixas acima (ex: insumo cadastrado como "OUTROS" ou "MIX ARTESANAL" no
  // Cadastro de Insumos) — categoria não prevista cai aqui, dentro de
  // Conferência, em vez de nunca aparecer em lugar nenhum (pedido 08-26).
  var catsConhecidas = CATS_KIT_BASE.concat(CATS_CONFERENCIA);
  var catsExtras = Object.keys(todosItens).filter(function(c){ return c !== 'EQUIPE' && catsConhecidas.indexOf(c) === -1; });

  // Item de Kit Base (ex: ESPECIARIAS) que veio de um coquetel deste evento —
  // como Sal de Páprica ou Angostura usados numa receita — fica visível aqui
  // em Conferência em vez de só dentro do Kit Base colapsado ("▼ Ver itens"):
  // é ingrediente de receita, ela precisa ver sem precisar abrir nada
  // (pedido 08-26: pareciam não aparecer). Kit Base continua só com o que
  // não está ligado a nenhum coquetel selecionado.
  var catsKitBaseComCardapio = CATS_KIT_BASE.filter(function(cat) {
    return (todosItens[cat]||[]).some(function(it){ return it.doCardapio; });
  });

  CATS_CONFERENCIA.concat(catsExtras).concat(catsKitBaseComCardapio).forEach(function(cat) {
    var todos = todosItens[cat];
    if (!todos || !todos.length) return;
    var itens = catsKitBaseComCardapio.indexOf(cat) !== -1 ? todos.filter(function(it){ return it.doCardapio; }) : todos;
    if (!itens.length) return;
    var isAlcoolica = cat === 'BEBIDAS ALCOÓLICAS';
    var cols = isAlcoolica ? '1fr 130px 100px' : '1fr 100px';
    html += '<div style="border-bottom:1px solid var(--border)">' +
      '<div style="padding:6px 14px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;background:var(--bg3)">' + cat + '</div>';
    itens.forEach(function(it) {
      var badge = it.doCardapio
        ? '<span style="font-size:9px;background:var(--green-bg);color:var(--green);border:1px solid var(--green-dim);padding:1px 6px;border-radius:10px;margin-left:6px">' + it.coqueteis.join(', ') + '</span>'
        : it.semFicha ? '<span style="font-size:9px;background:var(--amber-bg);color:var(--amber);border:1px solid var(--amber-dim);padding:1px 6px;border-radius:10px;margin-left:6px">⚠️</span>' : '';
      var qtdConf = it.qtd;
      var salvoConf = qtdSalva(cat, it.item);
      if (salvoConf != null && !it.travado) qtdConf = salvoConf;
      var itemAttr = it.item.replace(/"/g,'');
      var catAttr = cat.replace(/"/g,'');
      var fornHtml = '';
      if (isAlcoolica) {
        var fornAtual = fornecedorSalvo(cat, it.item);
        fornHtml = '<select data-forn-item="' + itemAttr + '" data-forn-cat="' + catAttr + '" ' +
          'style="font-size:11px;font-weight:600;padding:4px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
          FORN_OPCOES.map(function(o){ return '<option value="' + o[0] + '"' + (fornAtual===o[0]?' selected':'') + '>' + o[1] + '</option>'; }).join('') +
        '</select>';
      }
      html += '<div style="display:grid;grid-template-columns:' + cols + ';gap:8px;align-items:center;padding:4px 14px;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:12px;color:var(--text)">' + it.item + badge + _sepBadgeAssoc(it) +
          (it.obs ? '<span style="font-size:10px;color:var(--text3);margin-left:6px">' + it.obs + '</span>' : '') +
        '</div>' +
        fornHtml +
        _sepQtdCell(it, catAttr, itemAttr, qtdConf, 'var(--text)') +
      '</div>';
    });
    html += '</div>';
  });

  html += '</div>'; // fim seção conferência

  // ══════════════════════════════════════════════════════
  // SEÇÃO 3 — KIT BASE
  // ══════════════════════════════════════════════════════
  html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">' +
    '<div style="padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">' +
      '<div>' +
        '<span style="font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.8px">🔧 Kit Base</span>' +
        '<span style="font-size:11px;color:var(--text3);margin-left:8px">Calculado automaticamente — menos conferência</span>' +
      '</div>' +
      '<button onclick="toggleKitBase(this)" style="font-size:10px;background:none;border:1px solid var(--border2);color:var(--text3);padding:3px 8px;border-radius:4px;cursor:pointer">▼ Ver itens</button>' +
    '</div>' +
    '<div id="sep-kit-base" style="display:none">';

  CATS_KIT_BASE.forEach(function(cat) {
    // O que já foi mostrado em Conferência (por vir de um coquetel) não se
    // repete aqui — ver comentário em catsKitBaseComCardapio acima.
    var itens = (todosItens[cat]||[]).filter(function(it){ return !it.doCardapio; });
    if (!itens.length) return;
    html += '<div style="border-bottom:1px solid var(--border)">' +
      '<div style="padding:6px 14px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;background:var(--bg3)">' + cat + '</div>';
    itens.forEach(function(it) {
      var qtdKit = it.qtd;
      var salvoKit = qtdSalva(cat, it.item);
      if (salvoKit != null && !it.travado) qtdKit = salvoKit;
      html += '<div style="display:grid;grid-template-columns:1fr 100px;gap:8px;align-items:center;padding:4px 14px;border-bottom:1px solid var(--border)">' +
        '<span style="font-size:12px;color:var(--text2)">' + it.item + _sepBadgeAssoc(it) +
          (it.obs ? '<span style="font-size:10px;color:var(--text3);margin-left:6px">' + it.obs + '</span>' : '') +
        '</span>' +
        _sepQtdCell(it, cat.replace(/"/g,''), it.item.replace(/"/g,''), qtdKit, 'var(--text2)') +
      '</div>';
    });
    html += '</div>';
  });

  html += '</div></div>'; // fim kit base

  // ══════════════════════════════════════════════════════
  // SEÇÃO 4 — OPCIONAIS (só entram se o cliente pediu)
  // ══════════════════════════════════════════════════════
  var regrasOpcionais = regras.filter(function(r){ return r.opcional; });
  if (regrasOpcionais.length) {
    if (!window._sepOpcionaisMap) window._sepOpcionaisMap = {};
    if (!window._sepOpcionaisMap[prodId]) {
      window._sepOpcionaisMap[prodId] = (sepExistente && sepExistente.opcionais) ? sepExistente.opcionais.slice() : [];
    }
    var opcOn = window._sepOpcionaisMap[prodId];
    html += '<div style="background:var(--bg2);border:2px dashed var(--border2);border-radius:var(--radius-lg);overflow:hidden">' +
      '<div style="padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border2)">' +
        '<span style="font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.8px">➕ Opcionais</span>' +
        '<span style="font-size:11px;color:var(--text3);margin-left:8px">Marque o que o cliente incluiu neste evento — só o que estiver marcado entra na folha</span>' +
      '</div>';
    regrasOpcionais.forEach(function(r) {
      var marcado = opcOn.indexOf(r.id) !== -1;
      var qtdOpc = calcQtdItem(r, conv, bartenders, equipeTotal, cargoCounts);
      var salvoOpc = qtdSalva(r.cat, r.item);
      if (marcado && salvoOpc != null) qtdOpc = salvoOpc;
      html += '<div style="display:grid;grid-template-columns:1fr 100px;gap:8px;align-items:center;padding:5px 14px;border-bottom:1px solid var(--border)">' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--text);cursor:pointer">' +
          '<input type="checkbox" ' + (marcado?'checked':'') + ' onchange="sepToggleOpcional(\'' + prodId + '\',\'' + r.id + '\',this.checked)"> ' +
          r.item + ' <span style="font-size:10px;color:var(--text3)">' + r.cat + '</span>' +
        '</label>' +
        (marcado
          ? '<input type="number" value="' + qtdOpc + '" min="0" data-item="' + r.item.replace(/"/g,'') + '" data-cat="' + r.cat.replace(/"/g,'') + '" ' +
            'style="font-size:12px;font-weight:600;padding:4px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center;font-family:var(--mono)">'
          : '<span style="font-size:11px;color:var(--text3);text-align:center">—</span>') +
      '</div>';
    });
    html += '</div>';
  }

  // Coquetéis (campo oculto para impressão) — vem dos coquetéis marcados
  // acima, não mais do texto bruto do cardápio.
  var textoCoqueteis = coqueteisCardapio.map(function(c){ return c.nome; }).join('\n');
  html += '<input type="hidden" id="sep-coqueteis" value="' + textoCoqueteis.replace(/"/g,'&quot;') + '">';

  // Campos ocultos
  html += '<input type="hidden" id="sep-prod-id" value="' + prodId + '">' +
    '<input type="hidden" id="sep-conv" value="' + conv + '">' +
    '<input type="hidden" id="sep-bt" value="' + bartenders + '">' +
    '<input type="hidden" id="sep-total-equipe" value="' + equipeTotal + '">';

  html += '</div>'; // fim grid

  html += '<div style="display:flex;gap:8px;margin-top:14px">' +
    '<button class="btn" onclick="salvarSeparacao()" style="background:var(--green)">💾 Gerar Folha</button>' +
    '<button class="btn" onclick="setSepView(\'lista\')" style="background:var(--bg3);color:var(--text)">Cancelar</button>' +
  '</div>';

  cont.innerHTML = html;

  // Acessórios (associações) seguem o principal ao vivo: qualquer mudança
  // numa quantidade recalcula os campos travados. O listener fica no
  // container (que persiste entre recargas), registrado uma vez só.
  if (!cont._assocListener) {
    cont._assocListener = true;
    cont.addEventListener('input', function(e) {
      if (e.target && e.target.matches && e.target.matches('[data-item]')) _sepRecalcAssociacoes();
    });
  }
  _sepRecalcAssociacoes();
}


function sepSetCopoOverride(prodId, fichaId, copoId) {
  if (!window._sepCoposOverrideMap) window._sepCoposOverrideMap = {};
  if (!window._sepCoposOverrideMap[prodId]) window._sepCoposOverrideMap[prodId] = {};
  if (copoId) window._sepCoposOverrideMap[prodId][fichaId] = copoId;
  else delete window._sepCoposOverrideMap[prodId][fichaId];
}

function sepToggleCoquetel(prodId, fichaId, marcado) {
  if (!window._sepCoqueteisMap) window._sepCoqueteisMap = {};
  if (!window._sepCoqueteisMap[prodId]) window._sepCoqueteisMap[prodId] = [];
  var lst = window._sepCoqueteisMap[prodId];
  var idx = lst.indexOf(fichaId);
  if (marcado && idx === -1) lst.push(fichaId);
  if (!marcado && idx !== -1) lst.splice(idx, 1);
  sepCarregarProducao(prodId);
}

function sepToggleOpcional(prodId, regraId, marcado) {
  if (!window._sepOpcionaisMap) window._sepOpcionaisMap = {};
  if (!window._sepOpcionaisMap[prodId]) window._sepOpcionaisMap[prodId] = [];
  var lst = window._sepOpcionaisMap[prodId];
  var idx = lst.indexOf(regraId);
  if (marcado && idx === -1) lst.push(regraId);
  if (!marcado && idx !== -1) lst.splice(idx, 1);
  sepCarregarProducao(prodId);
}

function filtrarCoqueteisSeparacao(v) {
  var termo = (v||'').trim().toLowerCase();
  document.querySelectorAll('#sep-coq-lista .sep-coq-item').forEach(function(label) {
    label.style.display = (!termo || label.dataset.busca.indexOf(termo) !== -1) ? '' : 'none';
  });
}

function irParaCadastroFicha() {
  setSepView('lista');
  setTimeout(function(){ go('regras'); setRegrasView('nova-ficha'); }, 100);
}

function toggleKitBase(btn) {
  var el = document.getElementById('sep-kit-base');
  if (!el) return;
  if (el.style.display === 'none') {
    el.style.display = '';
    btn.textContent = '▲ Ocultar itens';
  } else {
    el.style.display = 'none';
    btn.textContent = '▼ Ver itens';
  }
}


function salvarSeparacao() {
  var prodId = document.getElementById('sep-prod-id')?.value;
  if (!prodId) { alert('Selecione um evento primeiro.'); return; }
  var p = (D.producoes||[]).find(function(x){return x.id===prodId;});
  if (!p) return;

  var conv = parseInt(document.getElementById('sep-conv')?.value)||0;
  var bt   = parseInt(document.getElementById('sep-bt')?.value)||0;
  var teq  = parseInt(document.getElementById('sep-total-equipe')?.value)||0;

  // Coletar todos os itens com quantidades editadas
  var itensFinais = {};
  document.querySelectorAll('[data-item][data-cat]').forEach(function(input) {
    var cat = input.dataset.cat;
    var item = input.dataset.item;
    var qtd = parseInt(input.value)||0;
    if (!itensFinais[cat]) itensFinais[cat] = {};
    itensFinais[cat][item] = qtd;
  });

  // Fornecedor por item (hoje só existe o seletor em Bebidas Alcoólicas)
  var fornecedoresFinais = {};
  document.querySelectorAll('[data-forn-item][data-forn-cat]').forEach(function(sel) {
    if (!sel.value) return;
    var cat = sel.dataset.fornCat;
    var item = sel.dataset.fornItem;
    if (!fornecedoresFinais[cat]) fornecedoresFinais[cat] = {};
    fornecedoresFinais[cat][item] = sel.value;
  });

  // Troca de copo por evento (Ficha Técnica) — só guarda quem foi trocado.
  var coposOverride = Object.assign({}, (window._sepCoposOverrideMap && window._sepCoposOverrideMap[prodId]) || {});
  document.querySelectorAll('[data-copo-override]').forEach(function(sel) {
    if (sel.value) coposOverride[sel.dataset.copoOverride] = sel.value;
    else delete coposOverride[sel.dataset.copoOverride];
  });

  var sep = {
    id: 'SEP'+Date.now(),
    producaoId: prodId,
    evento: p.evento||p.cliente||'',
    cliente: p.cliente||'',
    data: p.data||'',
    convidados: conv,
    local: p.local||'',
    hrInicio: p.hrInicio||'',
    hrFim: p.hrFim||'',
    equipe: p.equipe||[],
    equipeTexto: p.equipeTexto||'',
    bartenders: bt,
    totalEquipe: teq,
    itens: itensFinais,
    fornecedores: fornecedoresFinais,
    coqueteis: document.getElementById('sep-coqueteis')?.value||'',
    coqueteisIds: (window._sepCoqueteisMap && window._sepCoqueteisMap[prodId]) ? window._sepCoqueteisMap[prodId].slice() : [],
    opcionais: (window._sepOpcionaisMap && window._sepOpcionaisMap[prodId]) ? window._sepOpcionaisMap[prodId].slice() : [],
    coposOverride: coposOverride,
    criadoEm: new Date().toISOString()
  };

  if (!D.separacoes) D.separacoes = [];
  var idx = D.separacoes.findIndex(function(s){return s.producaoId===prodId;});
  if (idx>=0) {
    if (!confirm('Já existe folha para este evento. Substituir?')) return;
    D.separacoes[idx] = sep;
  } else {
    D.separacoes.push(sep);
  }
  sv('separacoes');
  alert('Folha de separação gerada!');
  setSepView('lista');
}

function editarSeparacao(id) {
  var s = (D.separacoes||[]).find(function(x){return x.id===id;});
  if (!s) return;
  setSepView('nova');
  setTimeout(function(){
    var sel = document.getElementById('sep-prod-sel');
    if (sel) {
      // rSepNova só lista eventos futuros — se esta folha é de um evento
      // passado, injeta a opção pra ela conseguir abrir/editar.
      var temOpcao = Array.prototype.some.call(sel.options, function(o){ return o.value === s.producaoId; });
      if (s.producaoId && !temOpcao) {
        var p = (D.producoes||[]).find(function(x){ return x.id === s.producaoId; });
        var op = document.createElement('option');
        op.value = s.producaoId;
        op.textContent = ((p && (p.evento||p.cliente)) || s.evento || '—') + ' · ' + ((typeof fd === 'function' && fd((p && p.data) || s.data)) || '') + ' (passado)';
        sel.appendChild(op);
      }
      sel.value = s.producaoId;
    }
    sepCarregarProducao(s.producaoId);
  }, 50);
}

function imprimirSeparacao(id) {
  var s = (D.separacoes||[]).find(function(x){return x.id===id;});
  if (!s) return;
  var dataFmt = s.data ? s.data.split('-').reverse().join('/') : '—';
  var col = '<colgroup><col style="width:55%"><col style="width:15%"><col style="width:15%"><col style="width:15%"></colgroup>';
  var thead = '<thead><tr><th>Item</th><th>Qtd</th><th>Saída</th><th>Volta</th></tr></thead>';
  var w = window.open('','_blank');
  var body = '';

  var FORN_LABEL = { romero: 'Romero', consignado: 'Consignado', cliente: 'Cliente' };
  if (s.itens) {
    Object.entries(s.itens).forEach(function(entry) {
      var cat = entry[0]; var itens = entry[1];
      var linhas = Object.entries(itens).filter(function(e){return e[1]>0;});
      if (!linhas.length) return;
      var fornMap = (s.fornecedores && s.fornecedores[cat]) || {};
      body += '<div class="st">' + cat + '</div>' +
        '<table>' + col + thead + '<tbody>' +
        linhas.map(function(e){
          var nomeItem = e[0];
          var forn = fornMap[nomeItem];
          if (forn) nomeItem += ' <span style="color:#888;font-size:9px">(' + (FORN_LABEL[forn]||forn) + ')</span>';
          return '<tr><td>'+nomeItem+'</td><td>'+e[1]+' UN</td><td></td><td></td></tr>';
        }).join('') +
        '</tbody></table>';
    });
  }

  if (s.bebidasAlc) {
    body += '<div class="st">BEBIDAS ALCOÓLICAS</div>' +
      '<table>' + col + thead + '<tbody>' +
      s.bebidasAlc.split('\n').filter(Boolean).map(function(l){return '<tr><td colspan="2">'+l+'</td><td></td><td></td></tr>';}).join('') +
      '</tbody></table>';
  }

  if (s.coqueteis) {
    body += '<div class="st">COQUETÉIS</div><div style="white-space:pre-wrap;font-size:11px;padding:4px 0">' + s.coqueteis + '</div>';
  }

  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Separação — '+s.evento+'</title>' +
    '<style>body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#111}h2{font-size:14px;margin:0 0 2px}.sub{font-size:11px;color:#555;margin-bottom:10px}table{width:100%;border-collapse:collapse;margin-bottom:12px;table-layout:fixed}th{background:#111;color:#fff;padding:5px 8px;text-align:left;font-size:10px;text-transform:uppercase}td{padding:4px 8px;border-bottom:1px solid #e0e0e0;word-break:break-word}tr:nth-child(even)td{background:#f9f9f9}.st{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#333;margin:8px 0 4px;border-bottom:1px solid #ccc;padding-bottom:3px}@media print{body{margin:10px}}</style>' +
    '</head><body>' +
    '<h2>FOLHA DE SEPARAÇÃO — ' + (s.evento||'').toUpperCase() + '</h2>' +
    '<div class="sub">Data: ' + dataFmt + ' | Local: ' + (s.local||'—') + ' | Horário: ' + (s.hrInicio||'—') + ' às ' + (s.hrFim||'—') + '<br>' +
    'Convidados: ' + s.convidados + ' | Equipe: ' + s.totalEquipe + ' | Bartenders: ' + s.bartenders + '</div>' +
    body +
    '<div style="margin-top:20px;font-size:10px;color:#888">Quebras no transporte: ___________________________________</div>' +
    '<div style="font-size:10px;color:#888;margin-top:6px">Impresso em: ' + new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR') + '</div>' +
    '<script>window.onload=function(){window.print()};<\/script></body></html>');
  w.document.close();
}

function excluirSeparacao(id) {
  if (!confirm('Excluir esta folha?')) return;
  D.separacoes = (D.separacoes||[]).filter(function(s){return s.id!==id;});
  sv('separacoes'); rSeparacoes();
}

// ─── CÁLCULOS — tabela única de regras de cada item (não é por evento) ─────
// Junta o que antes eram 3 telas: Proporções (Kit Base), Associações e a
// "tabela de estimativa". Cada item tem UMA linha com a base de cálculo:
// Fixo · Por convidado · Por equipe · Por cargo · Segue outro item.
function rSepCalculos() {
  var cont = document.getElementById('sep-calc-body');
  if (!cont) return;

  var html = '<div style="padding:12px 16px 0">' +
    _sepAlertaInsumosPendentes() +
    '<div id="sep-kitbase-body"></div>' +
  '</div>';

  cont.innerHTML = html;
  rRegrasKitBase('sep-kitbase-body', 'separacao');
}

function _sepAlertaInsumosPendentes() {
  var pend = (typeof kitBaseInsumosPendentes === 'function') ? kitBaseInsumosPendentes() : [];
  if (!pend.length) return '';
  var nomes = pend.map(function(i){ return i.nome; }).sort();
  return '<div style="background:rgba(247,195,90,.10);border:1px solid rgba(247,195,90,.4);border-radius:var(--radius);padding:10px 14px;margin-bottom:12px">' +
    '<div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' +
      pend.length + ' item(ns) do Kit Base sem categoria</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:6px">Foram criados no Cadastro de Insumos e precisam de uma categoria pra aparecerem certinho nas listas: <strong>' + nomes.join(', ') + '</strong></div>' +
    '<a href="#" onclick="go(\'cadastro\');return false" style="font-size:11px;color:var(--blue)">Abrir Cadastro de Insumos</a>' +
  '</div>';
}

// Conta as pessoas da equipe do evento por cargo do Cadastro Central → Cargos.
function _sepCargoCounts(equipe) {
  var counts = {};
  var cargosCad = (typeof getCargos === 'function') ? getCargos() : [];
  (equipe || []).forEach(function(e) {
    var nome = (e.cargo || '').trim().toLowerCase();
    var q = parseInt(e.qtd) || 0;
    if (!nome || !q) return;
    var match = cargosCad.find(function(c) {
      var cn = (c.nome || '').toLowerCase();
      return cn && (cn === nome || nome.indexOf(cn) === 0);
    });
    var key = match ? match.key : ('x_' + nome.replace(/\s+/g, '_'));
    counts[key] = (counts[key] || 0) + q;
  });
  return counts;
}

// (A antiga "tabela de estimativa" — D.sepCalculos, funções sepCalc* — foi
// absorvida pela tabela única de Cálculo em 2026-08-28. Ver
// migrarRegrasBaseCalculo em js/regras.js.)
