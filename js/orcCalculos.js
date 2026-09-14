// ─── CÁLCULOS DO ORÇAMENTO ──────────────────────────────────────────────────
// Tela própria pra dizer QUANTO CONSIDERAR de cada insumo no Orçamento — a
// média real de uso, não a quantidade "de levar" (com folga) que fica em
// Folha de Separação → Cálculos. Mesmo formato de regra (base de cálculo:
// fixo/convidado/equipe/cargo/segue outro item), mas com um jogo de valores
// PRÓPRIO POR TIPO DE EVENTO (D.calculosOrcamento[tipoEventoId]) — um
// aniversário de 15 anos usa uma quantidade de bebida bem diferente de um
// de 60 anos, por exemplo, então cada subgrupo de Tipo de Evento (ver
// Cadastro → Tipos de Evento) tem sua própria tabela, independente da de
// Separação e independente uma da outra.
//
// Ponto de partida: ela associa quais Coquetéis (Fichas) entram nesse Tipo
// de Evento (D.calculosOrcamento._meta.coqueteis[tipoId]) — só os
// ingredientes desses coquetéis aparecem na lista pra preencher, em vez de
// todo insumo de toda Ficha do sistema. Não é conta automática por ml de
// receita (o Cadastro de Insumos não tem "capacidade da garrafa" pra isso,
// e ela decidiu não criar esse campo agora): ela mesma digita quantas
// garrafas por convidado de cada insumo, só que numa lista bem menor e
// relevante em vez de ter que garimpar entre todos os insumos do sistema.
//
// 2026-09-14: criada. Ainda não conectada ao Orçamento (isso é a Fase 3,
// que vai substituir a Estimativa de Bebidas como fonte de quantidade do
// Cardápio) — por enquanto só a tela de configuração em si.

var _ocoTipoAtual = '';

function initOrcCalculos() {
  if (!D.calculosOrcamento) D.calculosOrcamento = {};
  if (!_ocoTipoAtual) {
    var tipos = getTiposEvento();
    _ocoTipoAtual = tipos.length ? tipos[0].id : '';
  }
  rOrcCalculos();
}

// Coquetéis associados a um Tipo de Evento — só esses entram na conta dos
// itens desse subgrupo (em vez de toda Ficha de Coquetel do sistema). Sem
// associação nenhuma ainda, a lista vem vazia (ela associa antes de ver
// item aparecer), não com tudo que existe.
function _ocoCoqueteisDoTipo(tipoId) {
  return (D.calculosOrcamento._meta && D.calculosOrcamento._meta.coqueteis && D.calculosOrcamento._meta.coqueteis[tipoId]) || [];
}

function ocoToggleCoquetel(fichaId, checked) {
  if (!D.calculosOrcamento._meta) D.calculosOrcamento._meta = {};
  if (!D.calculosOrcamento._meta.coqueteis) D.calculosOrcamento._meta.coqueteis = {};
  var lst = D.calculosOrcamento._meta.coqueteis[_ocoTipoAtual] || (D.calculosOrcamento._meta.coqueteis[_ocoTipoAtual] = []);
  var idx = lst.indexOf(fichaId);
  if (checked && idx === -1) lst.push(fichaId);
  else if (!checked && idx !== -1) lst.splice(idx, 1);
  // Só adiciona (nunca remove) os ingredientes do coquetel recém-marcado —
  // desmarcar um coquetel não some com os itens já na lista, pra não
  // apagar um ajuste manual que ela já tenha feito nesse insumo.
  if (checked) _ocoSincronizarDeFichas(_ocoTipoAtual, true);
  else sv('calculosOrcamento');
  rOrcCalculos();
}

function ocoFiltrarCoqueteis(v) {
  var termo = (v || '').trim().toLowerCase();
  document.querySelectorAll('#oco-coq-lista .oco-coq-item').forEach(function(label) {
    var mostra = label.dataset.marcado === '1' || (!!termo && label.dataset.busca.indexOf(termo) !== -1);
    label.style.display = mostra ? 'flex' : 'none';
  });
  var vazio = document.getElementById('oco-coq-vazio');
  if (vazio) vazio.style.display = termo ? 'none' : '';
}

// Todo item das Fichas de Coquetel ASSOCIADAS a este Tipo de Evento,
// deduplicado pelo nome (uma ficha pode repetir o mesmo insumo, e duas
// fichas podem compartilhar um ingrediente) — a categoria vem do próprio
// item da ficha (que por sua vez veio do Cadastro de Insumos quando a
// ficha foi montada).
function _ocoItensDeFichas(tipoId) {
  var idsAssociados = _ocoCoqueteisDoTipo(tipoId);
  var vistos = {};
  var itens = [];
  (D.fichas || []).filter(function(f) { return idsAssociados.indexOf(f.id) !== -1; }).forEach(function(f) {
    (f.itens || []).forEach(function(it) {
      var nome = (it.nome || '').trim();
      if (!nome) return;
      var chave = nome.toUpperCase();
      if (vistos[chave]) return;
      vistos[chave] = true;
      itens.push({ nome: nome, cat: it.cat || 'OUTROS' });
    });
  });
  return itens;
}

// Controle de "já populei automaticamente esse Tipo de Evento" — guardado
// à parte (não no array em si: uma propriedade solta num array não
// sobrevive ao Firestore, que só grava os índices numéricos). Sem isso,
// "Limpar tudo" seria inútil: no próximo render, a sincronização automática
// ia achar a lista vazia e repopular tudo de novo sozinha.
function _ocoJaSincronizado(tipoId) {
  return !!(D.calculosOrcamento._meta && D.calculosOrcamento._meta.sincronizado && D.calculosOrcamento._meta.sincronizado[tipoId]);
}
function _ocoMarcarSincronizado(tipoId) {
  if (!D.calculosOrcamento._meta) D.calculosOrcamento._meta = {};
  if (!D.calculosOrcamento._meta.sincronizado) D.calculosOrcamento._meta.sincronizado = {};
  D.calculosOrcamento._meta.sincronizado[tipoId] = true;
}

// Adiciona (nunca remove) uma linha zerada, base "Por convidado", pra cada
// item de ficha que ainda não tem regra própria nesse Tipo de Evento, e
// atualiza a categoria de quem já existe (caso o insumo tenha sido
// reclassificado depois). Roda sozinha só na PRIMEIRA vez que a tela abre
// pra esse tipo — depois disso é sob pedido (botão "Trazer itens novos"),
// pra não brigar com quem limpou tudo de propósito.
function _ocoSincronizarDeFichas(tipoId, forcar) {
  if (!tipoId) return;
  if (!forcar && _ocoJaSincronizado(tipoId)) return;
  if (!D.calculosOrcamento[tipoId]) D.calculosOrcamento[tipoId] = [];
  var lista = D.calculosOrcamento[tipoId];
  var porNome = {};
  lista.forEach(function(r) { porNome[(r.item || '').toUpperCase()] = r; });

  var adicionados = 0;
  _ocoItensDeFichas(tipoId).forEach(function(it) {
    var existente = porNome[it.nome.toUpperCase()];
    if (existente) {
      existente.cat = it.cat;
    } else {
      lista.push({
        id: _gerarId('OC'), item: it.nome, cat: it.cat,
        base: 'convidado', valor: 0, ref: 1, min: 0, cargos: [], principal: '',
      });
      adicionados++;
    }
  });
  _ocoMarcarSincronizado(tipoId);
  sv('calculosOrcamento'); // sempre grava — ao menos a flag de sincronizado mudou
  return adicionados;
}

// Botão "🔄 Trazer itens novos das Fichas" — igual à sincronização automática
// da primeira vez, mas chamável quando ela quiser (ex: depois de cadastrar
// uma ficha nova, ou depois de ter limpado tudo e querer repopular).
function ocoSincronizarDeFichas() {
  var n = _ocoSincronizarDeFichas(_ocoTipoAtual, true);
  if (!n) alert('Nenhum item novo — todo ingrediente dos coquetéis marcados já está nesta lista.');
  rOrcCalculos();
}

function _ocoRegras(tipoId) {
  return (D.calculosOrcamento && D.calculosOrcamento[tipoId]) || [];
}

// API pública pra Fase 3 (Orçamento passa a ler daqui em vez da Estimativa
// de Bebidas). 'associado' (segue outro item) é resolvido aqui mesmo, em
// duas passadas, porque calcQtdItem() sozinho só devolve o mínimo pra essa
// base — a resolução de verdade (Separação) mora numa função própria da
// Folha de Separação que não se aplica aqui.
function calcQtdItemOrcamento(tipoId, nomeItem, conv, bartenders, equipeTotal, cargoCounts) {
  var lista = _ocoRegras(tipoId);
  var regra = lista.find(function(r) { return (r.item || '').toUpperCase() === (nomeItem || '').toUpperCase(); });
  if (!regra) return null;
  var ef = _regraBaseEfetiva(regra);
  if (ef.base !== 'associado') {
    return calcQtdItem(regra, conv, bartenders, equipeTotal, cargoCounts);
  }
  var principal = lista.find(function(r) { return r.item === ef.principal; });
  if (!principal) return parseFloat(regra.min) || 0;
  var qtdPrincipal = calcQtdItemOrcamento(tipoId, principal.item, conv, bartenders, equipeTotal, cargoCounts) || 0;
  var min = parseFloat(regra.min) || 0;
  return Math.max(min, Math.ceil((ef.valor || 1) * qtdPrincipal / (ef.ref || 1)));
}

function ocoSetTipo(tipoId) {
  _ocoTipoAtual = tipoId;
  rOrcCalculos();
}

function ocoDuplicar() {
  var origemId = document.getElementById('oco-duplicar-origem') && document.getElementById('oco-duplicar-origem').value;
  if (!origemId) { alert('Escolha de qual Tipo de Evento copiar.'); return; }
  if (origemId === _ocoTipoAtual) { alert('Escolha um Tipo de Evento diferente do atual.'); return; }
  var origem = buscarTipoEventoPorId(origemId);
  var atual  = buscarTipoEventoPorId(_ocoTipoAtual);
  var atualTemDados = _ocoRegras(_ocoTipoAtual).some(function(r) { return (parseFloat(r.valor) || 0) > 0; });
  var msg = 'Copiar os valores de "' + (origem ? origem.nome : origemId) + '" para "' + (atual ? atual.nome : _ocoTipoAtual) + '"?';
  if (atualTemDados) msg += '\n\nIsso substitui os valores que já existem aqui — o que você já preencheu pra este Tipo de Evento será perdido.';
  if (!confirm(msg)) return;

  var origemRegras = _ocoRegras(origemId);
  D.calculosOrcamento[_ocoTipoAtual] = origemRegras.map(function(r) {
    return Object.assign({}, r, { id: _gerarId('OC'), cargos: (r.cargos || []).slice() });
  });
  // Coquetéis associados também são copiados — geralmente subgrupos
  // parecidos (ex: Aniversário 10 e 15 anos) servem o mesmo cardápio.
  if (!D.calculosOrcamento._meta) D.calculosOrcamento._meta = {};
  if (!D.calculosOrcamento._meta.coqueteis) D.calculosOrcamento._meta.coqueteis = {};
  D.calculosOrcamento._meta.coqueteis[_ocoTipoAtual] = _ocoCoqueteisDoTipo(origemId).slice();
  _ocoMarcarSincronizado(_ocoTipoAtual);
  sv('calculosOrcamento');
  rOrcCalculos();
}

function ocoRegraSet(id, campo, valorRaw) {
  var r = _ocoRegras(_ocoTipoAtual).find(function(x) { return x.id === id; });
  if (!r) return;
  if (campo === 'base') r.base = valorRaw;
  else if (campo === 'principal') r.principal = valorRaw;
  else if (campo === 'valor' || campo === 'ref' || campo === 'min') r[campo] = parseFloat(valorRaw) || 0;
  sv('calculosOrcamento');
  rOrcCalculos();
}

function ocoToggleCargo(id, cargoKey, checked) {
  var r = _ocoRegras(_ocoTipoAtual).find(function(x) { return x.id === id; });
  if (!r) return;
  if (!r.cargos) r.cargos = [];
  var i = r.cargos.indexOf(cargoKey);
  if (checked && i === -1) r.cargos.push(cargoKey);
  else if (!checked && i !== -1) r.cargos.splice(i, 1);
  sv('calculosOrcamento');
}

function ocoAdicionarItem() {
  var sel = document.getElementById('oco-item-add');
  var nome = sel && sel.value;
  if (!nome) { alert('Escolha um item.'); return; }
  var opt = sel.options[sel.selectedIndex];
  var cat = opt ? opt.getAttribute('data-cat') : 'OUTROS';
  var lista = _ocoRegras(_ocoTipoAtual);
  if (lista.some(function(r) { return (r.item || '').toUpperCase() === nome.toUpperCase(); })) {
    alert('Esse item já está na lista.');
    return;
  }
  lista.push({ id: _gerarId('OC'), item: nome, cat: cat || 'OUTROS', base: 'convidado', valor: 0, ref: 1, min: 0, cargos: [], principal: '' });
  D.calculosOrcamento[_ocoTipoAtual] = lista;
  sv('calculosOrcamento');
  rOrcCalculos();
}

function ocoRemoverItem(id) {
  if (!confirm('Remover este item dos Cálculos do Orçamento (só deste Tipo de Evento)?')) return;
  D.calculosOrcamento[_ocoTipoAtual] = _ocoRegras(_ocoTipoAtual).filter(function(r) { return r.id !== id; });
  sv('calculosOrcamento');
  rOrcCalculos();
}

function ocoZerarTipo() {
  var atual = buscarTipoEventoPorId(_ocoTipoAtual);
  if (!confirm('Zerar todas as quantidades de "' + (atual ? atual.nome : _ocoTipoAtual) + '"? Os itens continuam na lista, só voltam pra 0.')) return;
  _ocoRegras(_ocoTipoAtual).forEach(function(r) { r.valor = 0; });
  sv('calculosOrcamento');
  rOrcCalculos();
}

// Esvazia a lista inteira (diferente de ocoZerarTipo, que só zera o valor
// mas mantém todo item de ficha na tela) — pra quem prefere montar do zero,
// item por item, em vez de editar uma lista já cheia com tudo que existe em
// alguma Ficha de Coquetel. Marca como sincronizado pra _ocoSincronizarDeFichas
// não repopular sozinha no próximo render — só volta com o botão manual
// "🔄 Trazer itens novos das Fichas".
function ocoLimparTudo() {
  var atual = buscarTipoEventoPorId(_ocoTipoAtual);
  if (!confirm('Apagar TODOS os itens de "' + (atual ? atual.nome : _ocoTipoAtual) + '" desta tela e começar do zero?\n\nIsso não mexe na Folha de Separação nem em nenhuma Ficha de Coquetel — só na lista deste Tipo de Evento aqui.')) return;
  D.calculosOrcamento[_ocoTipoAtual] = [];
  _ocoMarcarSincronizado(_ocoTipoAtual);
  sv('calculosOrcamento');
  rOrcCalculos();
}

var OCO_BASE_OPCOES = [
  ['fixo', 'Fixo (por evento)'],
  ['convidado', 'Por convidado'],
  ['equipe', 'Por equipe'],
  ['cargo', 'Por cargo'],
  ['associado', 'Segue outro item'],
];

function rOrcCalculos() {
  var cont = document.getElementById('orcCalculos-content');
  if (!cont) return;
  if (!D.calculosOrcamento) D.calculosOrcamento = {};

  var tipos = getTiposEvento();
  if (!tipos.length) {
    cont.innerHTML = '<div style="padding:24px;text-align:center;color:var(--text3)">Cadastre ao menos um Tipo de Evento primeiro (Cadastro → Tipos de Evento).</div>';
    return;
  }
  if (!_ocoTipoAtual || !tipos.some(function(t) { return t.id === _ocoTipoAtual; })) _ocoTipoAtual = tipos[0].id;

  _ocoSincronizarDeFichas(_ocoTipoAtual);
  var regras = _ocoRegras(_ocoTipoAtual);
  var cargos = _cargosDisponiveis();
  var coqueteisAssociados = _ocoCoqueteisDoTipo(_ocoTipoAtual);
  var fichasOrdenadas = (D.fichas || []).slice().sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || '', 'pt-BR'); });

  var porCat = {};
  regras.forEach(function(r) { (porCat[r.cat] = porCat[r.cat] || []).push(r); });
  var ordemCats = (typeof getCategorias === 'function' ? getCategorias() : []).filter(function(c) { return porCat[c]; });
  Object.keys(porCat).forEach(function(c) { if (ordemCats.indexOf(c) === -1) ordemCats.push(c); });

  var _bibFlat = [];
  var _bib = getBiblioteca();
  Object.keys(_bib).sort().forEach(function(c) { (_bib[c] || []).forEach(function(it) { _bibFlat.push(it); }); });

  var itensExistentes = {};
  regras.forEach(function(r) { itensExistentes[(r.item || '').toUpperCase()] = true; });

  var html = '<div style="padding:20px 24px;max-width:1100px">';

  html += '<div style="margin-bottom:16px">' +
    '<div style="font-size:18px;font-weight:700;color:var(--text)">Cálculos do Orçamento</div>' +
    '<div style="font-size:12px;color:var(--text3);margin-top:2px">Quanto considerar de cada insumo na Calculadora do Orçamento — a média real de uso por Tipo de Evento, não a quantidade de levar (essa fica em Folha de Separação → Cálculos).</div>' +
  '</div>';

  html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-bottom:18px;display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">' +
    '<div>' +
      '<label class="lbl">Tipo de evento</label>' +
      '<select onchange="ocoSetTipo(this.value)" style="min-width:240px;padding:7px 10px;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:13px">' +
        tiposEventoOptionsHtml(_ocoTipoAtual) +
      '</select>' +
    '</div>' +
    '<div style="display:flex;gap:8px;align-items:flex-end">' +
      '<div>' +
        '<label class="lbl">Duplicar valores de...</label>' +
        '<select id="oco-duplicar-origem" style="min-width:200px;padding:7px 10px;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:13px">' +
          '<option value="">— escolher —</option>' +
          tipos.filter(function(t) { return t.id !== _ocoTipoAtual; }).map(function(t) { return '<option value="' + t.id + '">' + t.nome + '</option>'; }).join('') +
        '</select>' +
      '</div>' +
      '<button class="btn" style="background:var(--blue)" onclick="ocoDuplicar()">📋 Duplicar pra cá</button>' +
    '</div>' +
    '<div style="display:flex;gap:8px;margin-left:auto">' +
      '<button class="btn" onclick="ocoSincronizarDeFichas()" title="Traz ingredientes de coquetel associado que ainda não estão na lista (ex: depois de editar uma ficha)">🔄 Trazer itens novos</button>' +
      '<button class="btn" style="color:var(--amber);border-color:var(--amber)" onclick="ocoZerarTipo()">↺ Zerar quantidades</button>' +
      '<button class="btn" style="color:var(--red);border-color:var(--red)" onclick="ocoLimparTudo()">🗑️ Limpar tudo e começar do zero</button>' +
    '</div>' +
  '</div>';

  html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:18px;overflow:hidden">' +
    '<div style="padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border)">' +
      '<span style="font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.8px">🍹 Coquetéis deste Tipo de Evento</span>' +
      '<span style="font-size:11px;color:var(--text3);margin-left:8px">Marque os coquetéis servidos aqui — só os ingredientes deles entram na lista de quantidades abaixo</span>' +
    '</div>' +
    '<div style="padding:10px 14px">' +
      '<input class="inp" id="oco-coq-busca" type="text" placeholder="Digite o nome do coquetel para buscar..." oninput="ocoFiltrarCoqueteis(this.value)" style="width:100%;max-width:280px;margin-bottom:10px">' +
      '<div id="oco-coq-lista" style="display:flex;flex-wrap:wrap;gap:6px">' +
        (fichasOrdenadas.length ? fichasOrdenadas.map(function(f) {
          var marcado = coqueteisAssociados.indexOf(f.id) !== -1;
          return '<label class="oco-coq-item" data-busca="' + f.nome.toLowerCase().replace(/"/g, '&quot;') + '" data-marcado="' + (marcado ? '1' : '0') + '" style="display:' + (marcado ? 'flex' : 'none') + ';align-items:center;gap:5px;font-size:11px;cursor:pointer;background:' + (marcado ? 'var(--green-bg)' : 'var(--bg3)') + ';padding:4px 10px;border-radius:var(--radius);border:1px solid ' + (marcado ? 'var(--green-dim)' : 'var(--border)') + '">' +
            '<input type="checkbox" ' + (marcado ? 'checked' : '') + ' onchange="ocoToggleCoquetel(\'' + f.id + '\',this.checked)"> ' + f.nome + '</label>';
        }).join('') : '<span style="font-size:11px;color:var(--text3)">Nenhuma ficha cadastrada ainda.</span>') +
        '<span id="oco-coq-vazio" style="font-size:11px;color:var(--text3)">' + (coqueteisAssociados.length ? 'Digite acima para adicionar mais coquetéis.' : 'Nenhum coquetel marcado ainda — digite acima para buscar.') + '</span>' +
      '</div>' +
    '</div>' +
  '</div>';

  if (!regras.length) {
    html += '<div style="text-align:center;color:var(--text3);padding:32px">' +
      (coqueteisAssociados.length
        ? 'Nenhum ingrediente encontrado nos coquetéis marcados acima — adicione um item manualmente lá embaixo.'
        : 'Marque acima quais coquetéis são servidos neste Tipo de Evento — os ingredientes deles aparecem aqui pra você preencher a quantidade.') +
      '</div>';
  }

  ordemCats.forEach(function(cat) {
    var itens = porCat[cat];
    if (!itens || !itens.length) return;
    html += '<div style="margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:2px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:grid;gap:6px">';

    itens.forEach(function(r) {
      var ef = _regraBaseEfetiva(r);
      var cols = 'minmax(160px,1fr) 140px 70px 110px 70px 40px';

      html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;font-size:11px">' +
        '<div style="display:grid;grid-template-columns:' + cols + ';gap:8px;align-items:end">' +

        '<div style="color:var(--text);font-weight:500">' + r.item + '</div>' +

        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">BASE</div>' +
          '<select onchange="ocoRegraSet(\'' + r.id + '\',\'base\',this.value)" style="width:100%;font-size:10px;padding:3px 4px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
            OCO_BASE_OPCOES.map(function(o) { return '<option value="' + o[0] + '"' + (ef.base === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
          '</select>' +
        '</div>' +

        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">' + (ef.base === 'associado' ? 'QUANTOS' : 'QTD') + '</div>' +
          '<input type="number" value="' + ef.valor + '" min="0" step="0.1" onchange="ocoRegraSet(\'' + r.id + '\',\'valor\',this.value)" style="width:100%;font-size:11px;padding:3px 5px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center">' +
        '</div>' +

        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">' + (ef.base === 'fixo' ? '—' : 'A CADA') + '</div>' +
          '<input type="number" value="' + ef.ref + '" min="1" ' + (ef.base === 'fixo' ? 'disabled' : '') + ' onchange="ocoRegraSet(\'' + r.id + '\',\'ref\',this.value)" style="width:100%;font-size:11px;padding:3px 5px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center' + (ef.base === 'fixo' ? ';opacity:.4' : '') + '">' +
        '</div>' +

        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">MÍN.</div>' +
          '<input type="number" value="' + (r.min || 0) + '" min="0" onchange="ocoRegraSet(\'' + r.id + '\',\'min\',this.value)" style="width:100%;font-size:11px;padding:3px 5px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center">' +
        '</div>' +

        '<div style="text-align:center"><button class="btn-sm btn-red" onclick="ocoRemoverItem(\'' + r.id + '\')" style="padding:2px 6px">×</button></div>' +

        '</div>' +

        (ef.base === 'cargo'
          ? '<div style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border2);display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
              '<span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Cargos:</span>' +
              (cargos.length ? cargos.map(function(c) {
                var m = (r.cargos || []).indexOf(c.key) !== -1;
                return '<label style="display:flex;align-items:center;gap:4px;font-size:10px;cursor:pointer;background:' + (m ? 'var(--green-bg)' : 'var(--bg)') + ';border:1px solid ' + (m ? 'var(--green-dim)' : 'var(--border2)') + ';padding:2px 8px;border-radius:12px">' +
                  '<input type="checkbox" ' + (m ? 'checked' : '') + ' onchange="ocoToggleCargo(\'' + r.id + '\',\'' + c.key + '\',this.checked)"> ' + c.nome + '</label>';
              }).join('') : '<span style="font-size:10px;color:var(--amber)">Nenhum cargo no Cadastro Central → Cargos</span>') +
            '</div>'
          : '') +

        (ef.base === 'associado'
          ? '<div style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border2);display:flex;flex-wrap:wrap;gap:6px;align-items:center">' +
              '<span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Segue o item:</span>' +
              '<select onchange="ocoRegraSet(\'' + r.id + '\',\'principal\',this.value)" style="font-size:10px;padding:2px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);max-width:240px">' +
                '<option value="">— escolher —</option>' +
                regras.filter(function(x) { return x.id !== r.id; }).map(function(x) { return '<option value="' + x.item.replace(/"/g, '&quot;') + '"' + (ef.principal === x.item ? ' selected' : '') + '>' + x.item + '</option>'; }).join('') +
              '</select>' +
              '<span style="font-size:9px;color:var(--text3)">— ' + ef.valor + ' a cada ' + ef.ref + ' do principal</span>' +
              (!ef.principal ? '<span style="font-size:9px;color:var(--amber)">⚠️ escolha o item principal</span>' : '') +
            '</div>'
          : '') +

      '</div>';
    });

    html += '</div></div>';
  });

  var disponiveis = _bibFlat.filter(function(it) { return !itensExistentes[it.toUpperCase()]; });
  html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;margin-top:8px">' +
    '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">+ Adicionar item (só neste Tipo de Evento)</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">' +
      '<div style="flex:1;min-width:240px"><label class="lbl">Item</label>' +
        '<select id="oco-item-add" class="inp" style="width:100%">' +
          Object.keys(_bib).sort().map(function(cat) {
            var opts = (_bib[cat] || []).filter(function(it) { return !itensExistentes[it.toUpperCase()]; });
            if (!opts.length) return '';
            return '<optgroup label="' + cat.replace(/"/g, '&quot;') + '">' +
              opts.map(function(it) { return '<option value="' + it.replace(/"/g, '&quot;') + '" data-cat="' + cat.replace(/"/g, '&quot;') + '">' + it + '</option>'; }).join('') +
              '</optgroup>';
          }).join('') +
        '</select></div>' +
      '<button class="btn" onclick="ocoAdicionarItem()" style="background:var(--blue);white-space:nowrap">+ Adicionar</button>' +
    '</div>' +
    (disponiveis.length ? '' : '<div style="font-size:10px;color:var(--text3);margin-top:6px">Todos os itens da Biblioteca já estão na lista deste Tipo de Evento.</div>') +
  '</div>';

  html += '</div>';
  cont.innerHTML = html;
}
