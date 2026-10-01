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
// 'ordem' = Regras do Orçamento (tela principal, 10-01) | 'overview'/'detalhe' (Tipos de Evento) | 'precos'.
// 'todos' e 'catalogo' (abas removidas a pedido dela) caem em 'ordem'.
var _ocoView      = 'ordem';

// Lista ÚNICA de itens automáticos, que vale pra todo evento (2026-09-29) —
// gelo, seguro quebra, lanche, uniforme... cada um com base/qtd/a cada/mín,
// preço do Cadastro de Insumos. Entra sozinha em todo orçamento
// (_sincronizarItensAutoGlobais, js/orcamento.js). Ela preferiu nivelar as
// quantidades numa lista só antes de separar por Tipo de Evento. Mora em
// D.calculosOrcamento junto das listas por tipo (chave com "_" na frente,
// que nenhum id de Tipo de Evento usa, igual a "_meta").
var OCO_LISTA_TODOS = '_todos';

// Lista que as funções de edição (ocoRegraSet, ocoAdicionarItem...) alteram:
// a global quando a aba "Itens automáticos" está aberta, senão a do Tipo de
// Evento aberto no detalhe.
function _ocoListaId() {
  // 'ordem': as regras editadas dentro das categorias são as da lista única
  return (_ocoView === 'todos' || _ocoView === 'ordem') ? OCO_LISTA_TODOS : _ocoTipoAtual;
}
var _ocoSoAvisos  = false;         // aba Catálogo: true = mostra só item com grafia duplicada/sem cadastro

function ocoToggleSoAvisos() {
  _ocoSoAvisos = !_ocoSoAvisos;
  rOrcCalculos();
}

// Normalização usada em toda comparação/dedupe de nome de item: tira
// acento/caixa (_sepNormNome, de js/separacao.js) e também colapsa hífen/
// barra em espaço — sem isso "VODKA ABSOLUT - 1000ML" e "VODKA ABSOLUT
// 1000ML" (mesma garrafa, só um traço de diferença) continuavam batendo
// como itens diferentes mesmo depois de tirar o acento.
function _ocoNorm(s) {
  var base = (typeof _sepNormNome === 'function') ? _sepNormNome(s) : (s || '').toUpperCase();
  return base.replace(/[-–—/]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Nome "oficial" de um item de ficha: se existir um insumo no Cadastro cujo
// nome bate ignorando acento/maiúscula (_sepNormNome, de js/separacao.js),
// usa a grafia DELE — o Cadastro é a fonte de verdade. Sem isso, duas
// fichas gravando o mesmo ingrediente com acento diferente (ex: "LIMÃO
// DESIDRATADO" numa e "LIMAO DESIDRATADO" noutra) viravam dois itens
// separados aqui, sem bater com nenhum insumo cadastrado de verdade.
function _ocoNomeCanonico(nomeFicha) {
  var norm = _ocoNorm;
  var chave = norm(nomeFicha);
  var insumo = (D.insumos || []).find(function(i) { return norm(i.nome) === chave; });
  return insumo ? insumo.nome : nomeFicha;
}

// Catálogo de referência: TODO insumo que aparece em QUALQUER Ficha de
// Coquetel do sistema, com a lista de coquetéis onde ele aparece — não
// filtrado pelos coquetéis associados ao Tipo de Evento atual (essa
// filtragem só vale na aba "Quantidades"). Serve pra ela ver de cara tudo
// que existe antes de decidir o que associar/preencher, em vez de garimpar
// ficha por ficha. Agrupa por nome normalizado (sem acento/caixa) e guarda
// as grafias exatas encontradas — se houver mais de uma, é sinal de
// ingrediente digitado diferente em fichas diferentes, mostrado como aviso
// na tela pra ela saber em qual ficha corrigir.
function _ocoTodosItensDeFichas() {
  var norm = _ocoNorm;
  var porChave = {};
  (D.fichas || []).forEach(function(f) {
    (f.itens || []).forEach(function(it) {
      var nomeRaw = (it.nome || '').trim();
      if (!nomeRaw) return;
      var nome  = _ocoNomeCanonico(nomeRaw);
      var chave = norm(nome);
      if (!porChave[chave]) porChave[chave] = { nome: nome, cat: it.cat || 'OUTROS', fichas: [], grafias: {} };
      var g = porChave[chave];
      if (g.fichas.indexOf(f.nome) === -1) g.fichas.push(f.nome);
      if (!g.grafias[nomeRaw]) g.grafias[nomeRaw] = [];
      if (g.grafias[nomeRaw].indexOf(f.nome) === -1) g.grafias[nomeRaw].push(f.nome);
    });
  });
  return Object.keys(porChave).map(function(k) { return porChave[k]; })
    .sort(function(a, b) { return a.nome.localeCompare(b.nome, 'pt-BR'); });
}

// "+" da aba Catálogo — adiciona direto no Tipo de Evento atual, sem passar
// pelo select de "+ Adicionar item" (o nome/categoria já vêm da ficha).
function ocoAdicionarItemDireto(nome, cat) {
  var norm = _ocoNorm;
  var lista = _ocoRegras(_ocoTipoAtual);
  if (lista.some(function(r) { return norm(r.item) === norm(nome); })) return;
  lista.push({ id: _gerarId('OC'), item: nome, cat: cat || 'OUTROS', base: 'convidado', valor: 0, ref: 1, min: 0, cargos: [], principal: '' });
  D.calculosOrcamento[_ocoTipoAtual] = lista;
  rOrcCalculos();
}

function initOrcCalculos() {
  if (!D.calculosOrcamento) D.calculosOrcamento = {};
  if (!_ocoTipoAtual) {
    var tipos = getTiposEvento();
    _ocoTipoAtual = tipos.length ? tipos[0].id : '';
  }
  _ocoView = 'todos'; // toda vez que entra na página, começa pelos Itens automáticos
  rOrcCalculos();
}

// Abre o detalhe (quantidades) de um Tipo de Evento — clicado a partir da
// visão geral.
function ocoAbrirDetalhe(tipoId) {
  _ocoTipoAtual = tipoId;
  _ocoView = 'detalhe';
  rOrcCalculos();
}

function ocoVoltarOverview() {
  _ocoView = 'overview';
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
  var norm = _ocoNorm;
  var idsAssociados = _ocoCoqueteisDoTipo(tipoId);
  var vistos = {};
  var itens = [];
  (D.fichas || []).filter(function(f) { return idsAssociados.indexOf(f.id) !== -1; }).forEach(function(f) {
    (f.itens || []).forEach(function(it) {
      var nomeRaw = (it.nome || '').trim();
      if (!nomeRaw) return;
      var nome  = _ocoNomeCanonico(nomeRaw);
      var chave = norm(nome);
      if (vistos[chave]) return;
      vistos[chave] = true;
      itens.push({ nome: nome, cat: it.cat || 'OUTROS' });
    });
  });
  return itens;
}

// Linhas já salvas que NÃO pertencem a nenhum coquetel associado hoje —
// sobra de quando o item foi adicionado (coquetel que depois foi
// desmarcado, item cadastrado antes de existir a associação por coquetel,
// ou item manual que não corresponde a nada nas fichas atuais). Não é
// removido sozinho (a sincronização só adiciona, nunca remove, pra não
// apagar ajuste manual sem querer) — aparece com aviso pra ela decidir.
function _ocoItensOrfaos(tipoId) {
  var norm = _ocoNorm;
  var validos = {};
  _ocoItensDeFichas(tipoId).forEach(function(it) { validos[norm(it.nome)] = true; });
  return _ocoRegras(tipoId).filter(function(r) { return !validos[norm(r.item)]; });
}

function ocoLimparOrfaos() {
  var orfaos = _ocoItensOrfaos(_ocoTipoAtual);
  if (!orfaos.length) return;
  var nomes = orfaos.map(function(r) { return r.item; }).join(', ');
  if (!confirm('Remover ' + orfaos.length + ' item(ns) que não pertence(m) a nenhum coquetel associado atualmente?\n\n' + nomes)) return;
  var idsOrfaos = orfaos.map(function(r) { return r.id; });
  D.calculosOrcamento[_ocoTipoAtual] = _ocoRegras(_ocoTipoAtual).filter(function(r) { return idsOrfaos.indexOf(r.id) === -1; });
  rOrcCalculos();
}

// Mescla linhas já salvas em D.calculosOrcamento[tipoId] que representam o
// mesmo insumo com grafia diferente (ex: uma regra criada quando a ficha
// ainda usava "LIMAO DESIDRATADO" sem acento, e outra pra "LIMÃO
// DESIDRATADO") — problema de dado anterior a essa normalização entrar em
// _ocoItensDeFichas. Mantém a primeira ocorrência, mas herda o valor
// preenchido da duplicata se a mantida ainda estiver zerada (não perde o
// que ela já tinha digitado do lado errado), e corrige o nome pra bater
// com o Cadastro de Insumos quando possível. Devolve true se mudou algo.
function _ocoMesclarDuplicatas(tipoId) {
  var norm = _ocoNorm;
  var lista = D.calculosOrcamento[tipoId] || [];
  var porChave = {};
  var nova = [];
  var mudou = false;
  lista.forEach(function(r) {
    var chave = norm(r.item || '');
    var existente = porChave[chave];
    if (!existente) {
      var nomeCanon = _ocoNomeCanonico(r.item);
      if (nomeCanon !== r.item) { r.item = nomeCanon; mudou = true; }
      porChave[chave] = r;
      nova.push(r);
    } else {
      if ((parseFloat(existente.valor) || 0) === 0 && (parseFloat(r.valor) || 0) > 0) {
        existente.base = r.base; existente.valor = r.valor; existente.ref = r.ref;
        existente.min = r.min; existente.cargos = (r.cargos || []).slice(); existente.principal = r.principal;
      }
      mudou = true;
    }
  });
  if (mudou) D.calculosOrcamento[tipoId] = nova;
  return mudou;
}

// Nada aqui grava no Firestore direto — só mexe em D.calculosOrcamento em
// memória. A gravação de verdade é só no botão "💾 Salvar" (ocoSalvar),
// igual ao padrão já usado em Separação → Cálculos (salvarRegrasItens):
// ela edita à vontade, base/valor/coquetéis, e só grava quando decide.
//
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
  if (!D.calculosOrcamento[tipoId]) D.calculosOrcamento[tipoId] = [];
  // Mescla duplicatas SEMPRE, mesmo quando esse tipo já foi sincronizado
  // antes — sem isso, um tipo já visitado antes da correção de acento/
  // hífen nunca mais rodava essa limpeza (o "return" logo abaixo pulava
  // ela também), e a duplicata salva continuava aparecendo pra sempre.
  _ocoMesclarDuplicatas(tipoId);
  if (!forcar && _ocoJaSincronizado(tipoId)) return;
  var norm = _ocoNorm;
  var lista = D.calculosOrcamento[tipoId];
  var porNome = {};
  lista.forEach(function(r) { porNome[norm(r.item)] = r; });

  var adicionados = 0;
  _ocoItensDeFichas(tipoId).forEach(function(it) {
    var existente = porNome[norm(it.nome)];
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
// 2026-09-29: a lista ÚNICA de Itens automáticos (OCO_LISTA_TODOS) vem
// primeiro — ela quer nivelar as quantidades por item, sem Tipo de Evento
// nem coquetel. A lista do Tipo de Evento só é usada pra item que não está
// na lista única (quando ela for separar por evento, é aqui que inverte).
function calcQtdItemOrcamento(tipoId, nomeItem, conv, bartenders, equipeTotal, cargoCounts) {
  var norm = _ocoNorm;
  // Regra "pendente" (criada pela categoria Fixa, sem quantidade definida) não vale ainda
  var achar = function(l) { return l.find(function(r) { return !r.pendente && norm(r.item) === norm(nomeItem); }); };
  var lista = _ocoRegras(OCO_LISTA_TODOS);
  var regra = achar(lista);
  if (!regra) { lista = _ocoRegras(tipoId); regra = achar(lista); }
  if (!regra) return null;
  var ef = _regraBaseEfetiva(regra);
  if (ef.base !== 'associado') {
    return calcQtdItem(regra, conv, bartenders, equipeTotal, cargoCounts);
  }
  var principal = lista.find(function(r) { return norm(r.item) === norm(ef.principal); });
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
  rOrcCalculos();
}

function ocoRegraSet(id, campo, valorRaw) {
  var r = _ocoRegras(_ocoListaId()).find(function(x) { return x.id === id; });
  if (!r) return;
  if (campo === 'base') r.base = valorRaw;
  else if (campo === 'principal') r.principal = valorRaw;
  else if (campo === 'valor' || campo === 'ref' || campo === 'min') r[campo] = parseFloat(valorRaw) || 0;
  delete r.pendente; // mexeu na quantidade → regra passa a valer
  rOrcCalculos();
}

// "Incluir" do alerta de item sem Cadastro: reaponta a linha pra um insumo
// que já existe (nome renomeado/apelido) — mesmo padrão de regraKitRevincular
// em Separação → Cálculos (js/regras.js).
function ocoRevincular(id, novoNome) {
  if (!novoNome) return;
  var r = _ocoRegras(_ocoListaId()).find(function(x) { return x.id === id; });
  if (!r) return;
  r.item = novoNome;
  r.cat = (typeof categoriaAtualDoInsumo === 'function') ? categoriaAtualDoInsumo(novoNome, r.cat) : r.cat;
  rOrcCalculos();
}

function ocoToggleCargo(id, cargoKey, checked) {
  var r = _ocoRegras(_ocoListaId()).find(function(x) { return x.id === id; });
  if (!r) return;
  if (!r.cargos) r.cargos = [];
  var i = r.cargos.indexOf(cargoKey);
  if (checked && i === -1) r.cargos.push(cargoKey);
  else if (!checked && i !== -1) r.cargos.splice(i, 1);
}

// Campo de busca do "+ Adicionar item": digita e só aparece o que contém o
// texto (sem acento/maiúscula). O item escolhido fica no hidden
// #oco-item-add (data-cat = categoria) — digitar de novo limpa a escolha,
// então só entra item clicado na lista.
function _ocoBuscaItemHtml(opcoes) {
  window._ocoItemAddOpcoes = opcoes.slice().sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || '', 'pt-BR'); });
  return '<input type="hidden" id="oco-item-add" value="" data-cat="">' +
    '<div style="position:relative">' +
      '<input id="oco-item-busca" class="inp" type="text" autocomplete="off" placeholder="Digite pra buscar o item..." style="width:100%" ' +
        'oninput="ocoFiltrarItemAdd(this.value,true)" onfocus="ocoFiltrarItemAdd(this.value)" ' +
        'onblur="setTimeout(function(){var d=document.getElementById(\'oco-item-add-dd\');if(d)d.style.display=\'none\';},150)">' +
      '<div id="oco-item-add-dd" style="display:none;position:absolute;top:100%;left:0;right:0;margin-top:2px;max-height:260px;overflow-y:auto;background:var(--bg2);border:1px solid var(--border2);border-radius:var(--radius);z-index:500;box-shadow:0 6px 24px rgba(0,0,0,.55)"></div>' +
    '</div>';
}

function ocoFiltrarItemAdd(busca, digitou) {
  var dd = document.getElementById('oco-item-add-dd');
  if (!dd) return;
  if (digitou) { var h = document.getElementById('oco-item-add'); if (h) { h.value = ''; h.dataset.cat = ''; } }
  var b = _ocoNorm(busca);
  var esc = function(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var lista = (window._ocoItemAddOpcoes || []).filter(function(o) { return !b || _ocoNorm(o.nome).indexOf(b) !== -1; });
  dd.innerHTML = lista.length ? lista.map(function(o) {
    return '<div data-nome="' + esc(o.nome) + '" data-cat="' + esc(o.cat) + '" onmousedown="ocoEscolherItemAdd(this.dataset.nome,this.dataset.cat)" ' +
      'style="padding:7px 12px;cursor:pointer;font-size:12px;color:var(--text);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:8px" ' +
      'onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'\'">' +
      '<span>' + esc(o.nome) + '</span><span style="color:var(--text3);font-size:10px">' + esc(o.cat) + '</span></div>';
  }).join('') : '<div style="padding:8px 12px;color:var(--text3);font-size:12px">Nenhum item com esse nome.</div>';
  dd.style.display = 'block';
}

function ocoEscolherItemAdd(nome, cat) {
  var h = document.getElementById('oco-item-add');
  var busca = document.getElementById('oco-item-busca');
  if (h) { h.value = nome; h.dataset.cat = cat || ''; }
  if (busca) busca.value = nome;
  var dd = document.getElementById('oco-item-add-dd');
  if (dd) dd.style.display = 'none';
}

function ocoAdicionarItem() {
  var sel = document.getElementById('oco-item-add');
  var nome = sel && sel.value;
  if (!nome) { alert('Digite e escolha um item da lista.'); return; }
  var cat = (sel.dataset && sel.dataset.cat) || 'OUTROS';
  var norm = _ocoNorm;
  var lista = _ocoRegras(_ocoListaId());
  if (lista.some(function(r) { return norm(r.item) === norm(nome); })) {
    alert('Esse item já está na lista.');
    return;
  }
  var nova = { id: _gerarId('OC'), item: nome, cat: cat || 'OUTROS', base: 'convidado', valor: 0, ref: 1, min: 0, cargos: [], principal: '' };
  if (_ocoView === 'todos') nova.soSeCardapio = _ocoItemEmAlgumaFicha(nome);
  lista.push(nova);
  D.calculosOrcamento[_ocoListaId()] = lista;
  rOrcCalculos();
}

function ocoRemoverItem(id) {
  if (!confirm(_ocoListaId() === OCO_LISTA_TODOS
    ? 'Remover este item dos Itens automáticos? Ele deixa de entrar sozinho nos orçamentos.'
    : 'Remover este item dos Cálculos do Orçamento (só deste Tipo de Evento)?')) return;
  D.calculosOrcamento[_ocoListaId()] = _ocoRegras(_ocoListaId()).filter(function(r) { return r.id !== id; });
  rOrcCalculos();
}

function ocoZerarTipo() {
  var atual = buscarTipoEventoPorId(_ocoTipoAtual);
  if (!confirm('Zerar todas as quantidades de "' + (atual ? atual.nome : _ocoTipoAtual) + '"? Os itens continuam na lista, só voltam pra 0.')) return;
  _ocoRegras(_ocoTipoAtual).forEach(function(r) { r.valor = 0; });
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
  rOrcCalculos();
}

// Botão "💾 Salvar" — só aqui grava de fato no Firestore. Tudo antes disso
// (marcar coquetel, mudar base/qtd, duplicar, limpar) mexe só em memória.
function ocoSalvar() {
  sv('calculosOrcamento');
  alert('💾 Cálculos do Orçamento salvos!');
}

var OCO_BASE_OPCOES = [
  ['fixo', 'Fixo (por evento)'],
  ['convidado', 'Por convidado'],
  ['equipe', 'Por equipe'],
  ['cargo', 'Por cargo'],
  ['associado', 'Segue outro item'],
];

// Abre o insumo no Cadastro de Insumos; ao salvar/cancelar volta pra cá
// (window._cadVoltarPara, tratado em setCadastroView de js/insumos.js).
function ocoAbrirCadastroInsumo(nome) {
  var ins = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(nome) : null;
  go('cadastro');
  setTimeout(function() {
    window._cadVoltarPara = 'orcCalculos';
    if (ins && typeof editarInsumo === 'function') editarInsumo(ins.id);
    else if (typeof setCadastroView === 'function') {
      // Insumo novo: abre o formulário vazio
      var listaEl = document.getElementById('cad-view-lista'), formEl = document.getElementById('cad-view-form');
      if (listaEl) listaEl.style.display = 'none';
      if (formEl) formEl.style.display = '';
      if (typeof rFormInsumo === 'function') rFormInsumo();
    }
  }, 80);
}

function ocoSetView(v) {
  _ocoView = v;
  rOrcCalculos();
}

// Abas de nível mais alto: "Tipos de Evento" (visão geral + detalhe) e
// "Catálogo de Insumos" (referência de TODAS as fichas, sem ligação com
// nenhum Tipo de Evento específico) — o catálogo é ajuda pra não ter que
// preencher tudo de novo em cada Tipo de Evento quando um item ainda não
// estiver associado em lugar nenhum, por isso vive fora do grupo de
// Tipos de Evento, não dentro do detalhe de um deles.
function _ocoTopTabsHtml() {
  var emTipos = (_ocoView === 'overview' || _ocoView === 'detalhe');
  return '<div style="display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap">' +
    '<button class="sort-btn ' + (_ocoView === 'ordem' ? 'active' : '') + '" onclick="ocoSetView(\'ordem\')">Regras do Orçamento</button>' +
    '<button class="sort-btn ' + (emTipos ? 'active' : '') + '" onclick="ocoSetView(\'overview\')">📊 Tipos de Evento</button>' +
    '<button class="sort-btn ' + (_ocoView === 'precos' ? 'active' : '') + '" onclick="ocoSetView(\'precos\')">💰 Preços, Equipe e Taxas</button>' +
  '</div>';
}

// Dispatcher: visão geral (todos os Tipos de Evento + coquetéis associados,
// tela de entrada), detalhe (quantidades de UM Tipo de Evento, aberto
// clicando nele na visão geral), ou catálogo (referência global, fora dos
// Tipos de Evento).
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

  // Preços, Equipe e Taxas: a tela que antes ficava em Regras e Cálculos →
  // Preços do Orçamento (rPrecosOrcamento, js/regras.js) — tudo que entra
  // sozinho no orçamento fica configurado aqui, num lugar só.
  if (_ocoView === 'precos') {
    cont.innerHTML = _ocoTopTabsHtml() + '<div id="oco-precos-view"></div>';
    if (typeof rPrecosOrcamento === 'function') rPrecosOrcamento();
    return;
  }
  if (_ocoView === 'ordem' || _ocoView === 'todos' || _ocoView === 'catalogo') { _ocoView = 'ordem'; _ocoRenderOrdem(cont); return; }
  if (_ocoView === 'todos') _ocoRenderTodos(cont);
  else if (_ocoView === 'catalogo') _ocoRenderCatalogo(cont);
  else if (_ocoView === 'detalhe') _ocoRenderDetalhe(cont, tipos);
  else _ocoRenderOverview(cont, tipos);
}

// ─── ORDEM NA CALCULADORA ───────────────────────────────────────────────────
// Ordem dos blocos da Calculadora do orçamento (categorias de insumo +
// Equipe/Logística/... + categorias de preço com bloco próprio). Guardada em
// D.orcPrecos.ordemCalculadora (lida por _orcOrdenarBlocos, js/orcCalc.js).
function _ocoBlocosCalculadora() {
  var blocos = [];
  var vistos = {};
  var add = function(k, nome, tipo, cat) { if (vistos[k]) return; vistos[k] = true; blocos.push({ k: k, nome: nome, tipo: tipo, cat: cat }); };
  var cats = (typeof getCategorias === 'function' ? getCategorias() : []).slice();
  if (cats.indexOf('ITENS AUTOMÁTICOS') === -1) cats.push('ITENS AUTOMÁTICOS');
  if (typeof _orcOrdenarCats === 'function') cats = _orcOrdenarCats(cats);
  // Tipo bem explícito: "GELO" de insumo (Cardápio/Itens automáticos) e
  // "Gelo" de categoria de preço são blocos diferentes na Calculadora.
  cats.forEach(function(c) { add(_orcChaveCat(c), c, 'Categoria de insumos', c); });
  _orcSecoesCalc().forEach(function(s) { add('sec:' + s.id, s.label.replace(/^[^\wÀ-ÿ]+\s*/, ''), s.proprio ? 'Categoria de preço (Preços, Equipe e Taxas)' : 'Seção da Calculadora'); });
  var ordenadas = _orcOrdenarBlocos(blocos.map(function(b) { return b.k; }));
  return ordenadas.map(function(k) { return blocos.find(function(b) { return b.k === k; }); });
}

function ocoMoverBloco(k, dir) {
  var ordem = _ocoBlocosCalculadora().map(function(b) { return b.k; });
  var i = ordem.indexOf(k), j = i + dir;
  if (i === -1 || j < 0 || j >= ordem.length) return;
  var tmp = ordem[i]; ordem[i] = ordem[j]; ordem[j] = tmp;
  var p = (typeof _ensureOrcPrecos === 'function') ? _ensureOrcPrecos() : (D.orcPrecos = D.orcPrecos || {});
  p.ordemCalculadora = ordem;
  sv('orcPrecos');
  rOrcCalculos();
}

// Embaixo de cada seção fixa: as categorias de preço que caem dentro dela;
// as criadas por ela ganham link pra virar bloco próprio.
function _ocoFatoresDaSecaoHtml(k) {
  if (k.indexOf('sec:') !== 0) return '';
  var secId = k.slice(4);
  var fatores = getOrcFatores().filter(function(f) { return !f.pausado && (f.secao || 'custos') === secId && f.secao !== f.id; });
  if (!fatores.length) return '';
  return '<span style="display:block;font-size:10px;font-weight:400;color:var(--text3);margin-top:2px">inclui: ' +
    fatores.map(function(f) {
      var nome = f.nome.replace(/\s*\([^)]*\)\s*$/, '');
      return f.builtin ? nome : nome + ' (<a href="#" onclick="ocoSepararFator(\'' + f.id + '\');return false" style="color:var(--blue)">separar em bloco próprio</a>)';
    }).join(', ') + '</span>';
}

function ocoSepararFator(id) {
  if (typeof setSecaoOrcFator === 'function') setSecaoOrcFator(id, '_proprio');
  rOrcCalculos();
}

// Categorias abertas (clicou pra ver os itens) — sobrevive ao re-render.
window._ocoCatsAbertas = window._ocoCatsAbertas || {};
function ocoToggleCatOrdem(k) {
  window._ocoCatsAbertas[k] = !window._ocoCatsAbertas[k];
  rOrcCalculos();
}

// Como a categoria entra no orçamento (ver _orcCfgCat em orcamento.js).
// Trocar entre "cardápio" e "sempre entra" acerta o "só com cardápio" das
// regras dos itens dela.
function ocoSetModoCat(cat, modo) {
  var p = (typeof _ensureOrcPrecos === 'function') ? _ensureOrcPrecos() : (D.orcPrecos = D.orcPrecos || {});
  if (!p.modoCategorias) p.modoCategorias = {};
  var n = _orcNormNome(cat);
  p.modoCategorias[n] = Object.assign({}, p.modoCategorias[n] || {}, { modo: modo });
  sv('orcPrecos');
  if (modo === 'fixo' || modo === 'cardapio') {
    var mudou = false;
    _ocoRegras(OCO_LISTA_TODOS).forEach(function(r) {
      var ins = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(r.item) : null;
      if (ins && _orcNormNome(ins.categoria) === n) { r.soSeCardapio = (modo === 'cardapio'); mudou = true; }
    });
    if (mudou) sv('calculosOrcamento');
  }
  rOrcCalculos();
}

function ocoSetFatorTetoCat(cat, fatorId) {
  var p = (typeof _ensureOrcPrecos === 'function') ? _ensureOrcPrecos() : (D.orcPrecos = D.orcPrecos || {});
  if (!p.modoCategorias) p.modoCategorias = {};
  var n = _orcNormNome(cat);
  p.modoCategorias[n] = Object.assign({}, p.modoCategorias[n] || {}, { fator: fatorId });
  sv('orcPrecos');
  rOrcCalculos();
}

// Cria a regra de quantidade de um item da categoria (vai pra lista única,
// a mesma de Itens automáticos). "Só com cardápio" segue o modo da categoria.
function ocoCriarRegraItem(nome, cat) {
  var lista = _ocoRegras(OCO_LISTA_TODOS);
  if (lista.some(function(r) { return _ocoNorm(r.item) === _ocoNorm(nome); })) return;
  lista.push({ id: _gerarId('OC'), item: nome, cat: cat || 'OUTROS', base: 'convidado', valor: 1, ref: 10, min: 0, cargos: [], principal: '',
    soSeCardapio: _orcModoCat(cat) !== 'fixo' });
  D.calculosOrcamento[OCO_LISTA_TODOS] = lista;
  sv('calculosOrcamento');
  rOrcCalculos();
}

function _ocoCatConteudoHtml(cat, ctx) {
  var cfg = _orcCfgCat(cat);
  var n = _orcNormNome(cat);
  var esc = function(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var moeda = function(v) { return (typeof fR === 'function') ? fR(v) : 'R$ ' + Number(v || 0).toFixed(2); };
  var itens = (typeof getInsumos === 'function' ? getInsumos() : (D.insumos || []))
    .filter(function(i) { return _orcNormNome(i.categoria) === n; })
    .sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || '', 'pt-BR'); });
  var regras = _ocoRegras(OCO_LISTA_TODOS);
  var selStyle = 'font-size:11px;padding:4px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)';

  var html = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
    '<span style="font-size:10px;color:var(--text3);text-transform:uppercase">Como entra no orçamento</span>' +
    '<select data-cat="' + esc(cat) + '" onchange="ocoSetModoCat(this.dataset.cat,this.value)" style="' + selStyle + '">' +
      [['cardapio', 'Conforme o cardápio (só os itens dos coquetéis escolhidos)'], ['fixo', 'Sempre entra (independe do cardápio)'], ['teto', 'Valor teto (itens só pra consulta)']]
        .map(function(o) { return '<option value="' + o[0] + '"' + (cfg.modo === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') +
    '</select>';
  if (cfg.modo === 'teto') {
    html += '<span style="font-size:10px;color:var(--text3);text-transform:uppercase">Valor vem de</span>' +
      '<select data-cat="' + esc(cat) + '" onchange="ocoSetFatorTetoCat(this.dataset.cat,this.value)" style="' + selStyle + '">' +
        '<option value="">— nenhuma categoria de preço —</option>' +
        getOrcFatores().map(function(f) { return '<option value="' + f.id + '"' + (cfg.fator === f.id ? ' selected' : '') + '>' + esc(f.nome) + '</option>'; }).join('') +
      '</select>';
  }
  html += '</div>';

  if (!itens.length) return html + '<div style="font-size:11px;color:var(--text3)">Nenhum produto cadastrado nessa categoria no Cadastro de Insumos.</div>';

  if (cfg.modo === 'teto') {
    // Só consulta: o que tem dentro e quanto custa cada um
    return html + '<div style="display:grid;gap:3px">' + itens.map(function(i) {
      var custo = (typeof precoEfetivoInsumo === 'function') ? precoEfetivoInsumo(i) : Number(i.custoReposicao || 0);
      return '<div style="display:flex;justify-content:space-between;gap:10px;font-size:11px;padding:4px 10px;background:var(--bg);border:1px solid var(--border);border-radius:4px">' +
        '<span style="color:var(--text)">' + esc(i.nome) + '</span><span style="font-family:var(--mono);color:var(--text3)">' + (custo ? moeda(custo) : '—') + '</span></div>';
    }).join('') + '</div>';
  }

  return html + '<div style="display:grid;gap:6px">' + itens.map(function(i) {
    var r = regras.find(function(x) { return _ocoNorm(x.item) === _ocoNorm(i.nome); });
    if (r) return _ocoLinhaRegraHtml(r, ctx);
    return '<div style="display:flex;align-items:center;gap:10px;font-size:11px;padding:8px 12px;background:var(--bg3);border:1px dashed var(--border2);border-radius:var(--radius)">' +
      '<span style="flex:1;color:var(--text);font-weight:500">' + esc(i.nome) + '</span>' +
      '<span style="color:var(--text3)">sem quantidade definida</span>' +
      '<button class="btn-sm" style="background:var(--blue);color:#fff" data-nome="' + esc(i.nome) + '" data-cat="' + esc(cat) + '" onclick="ocoCriarRegraItem(this.dataset.nome,this.dataset.cat)">Definir quantidade</button>' +
    '</div>';
  }).join('') + '</div>';
}

// Regras de quantidade cujo produto não cai em nenhuma categoria da lista
// (não está no Cadastro, ou está sem categoria) — com a aba Itens
// automáticos removida, é aqui que elas continuam visíveis pra ajustar/excluir.
function _ocoRegrasSemCategoriaHtml(blocos, ctx) {
  var catsLista = {};
  blocos.forEach(function(b) { if (b.cat) catsLista[_orcNormNome(b.cat)] = true; });
  var soltas = _ocoRegras(OCO_LISTA_TODOS).filter(function(r) {
    var ins = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(r.item) : null;
    return !ins || !ins.categoria || !catsLista[_orcNormNome(ins.categoria)];
  });
  if (!soltas.length) return '';
  return '<div style="margin-top:16px;background:var(--bg2);border:1px dashed var(--amber-dim,var(--amber));border-radius:var(--radius);padding:10px 12px;overflow-x:auto">' +
    '<div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;margin-bottom:4px">Itens sem categoria (' + soltas.length + ')</div>' +
    '<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Têm regra de quantidade mas o produto não está no Cadastro de Insumos ou está sem categoria. Continuam entrando no orçamento — vincule/cadastre o produto ou exclua a regra.</div>' +
    '<div style="display:grid;gap:6px">' + soltas.map(function(r) { return _ocoLinhaRegraHtml(r, ctx); }).join('') + '</div>' +
  '</div>';
}

function _ocoRenderOrdem(cont) {
  var blocos = _ocoBlocosCalculadora();
  var ctx = _ocoCtxTodos();
  var btn = function(k, dir, off) {
    return '<button class="btn-sm" style="padding:0 7px;line-height:1.5;background:var(--bg2)" ' + (off ? 'disabled' : '') + ' onclick="event.stopPropagation();ocoMoverBloco(\'' + k.replace(/'/g, "\\'") + '\',' + dir + ')" title="' + (dir < 0 ? 'Subir' : 'Descer') + '">' + (dir < 0 ? '▲' : '▼') + '</button>';
  };
  var modoTxt = { cardapio: 'conforme o cardápio', fixo: 'sempre entra', teto: 'valor teto' };
  cont.innerHTML = '<div style="padding:20px 24px;max-width:1100px">' +
    '<div style="margin-bottom:16px">' +
      '<div style="font-size:18px;font-weight:700;color:var(--text)">Cálculos do Orçamento</div>' +
      '<div style="font-size:12px;color:var(--text3);margin-top:2px">Regras do Orçamento: ordem dos blocos na Calculadora, como cada categoria entra e a quantidade de cada produto. Clique numa categoria de insumos pra ver os produtos dela.</div>' +
    '</div>' +
    _ocoTopTabsHtml() +
    '<div style="position:sticky;top:0;z-index:30;display:flex;justify-content:flex-end;margin-bottom:8px">' +
      '<button class="btn" style="background:var(--green);font-weight:700" onclick="ocoSalvar()">Salvar</button>' +
    '</div>' +
    '<div style="display:grid;gap:4px">' +
    blocos.map(function(b, i) {
      var aberta = b.cat && window._ocoCatsAbertas[b.k];
      var resumoCat = '';
      if (b.cat) {
        var n = _orcNormNome(b.cat);
        var qtdItens = (D.insumos || []).filter(function(x) { return _orcNormNome(x.categoria) === n; }).length;
        resumoCat = '<span style="font-size:10px;font-weight:400;color:var(--text3);margin-left:8px">' + qtdItens + ' produto(s) · ' + modoTxt[_orcModoCat(b.cat)] + '</span>';
      }
      return '<div style="background:var(--bg3);border:1px solid ' + (aberta ? 'var(--blue-dim,var(--border2))' : 'var(--border)') + ';border-radius:var(--radius)">' +
        '<div style="display:flex;align-items:center;gap:10px;padding:6px 10px' + (b.cat ? ';cursor:pointer' : '') + '"' + (b.cat ? ' onclick="ocoToggleCatOrdem(\'' + b.k.replace(/'/g, "\\'") + '\')"' : '') + '>' +
          '<span style="font-size:11px;font-family:var(--mono);color:var(--text3);width:22px;text-align:right">' + (i + 1) + '</span>' +
          '<span style="display:flex;flex-direction:column;gap:1px">' + btn(b.k, -1, i === 0) + btn(b.k, 1, i === blocos.length - 1) + '</span>' +
          '<span style="flex:1;min-width:0;font-size:12px;font-weight:600;color:var(--text)">' + (b.cat ? (aberta ? '▾ ' : '▸ ') : '') + b.nome + resumoCat + _ocoFatoresDaSecaoHtml(b.k) + '</span>' +
          (b.cat ? '' : '<span style="font-size:10px;color:var(--text3);white-space:nowrap">' + b.tipo + '</span>') +
        '</div>' +
        (aberta ? '<div style="padding:10px 12px 12px;border-top:1px solid var(--border);overflow-x:auto">' + _ocoCatConteudoHtml(b.cat, ctx) + '</div>' : '') +
      '</div>';
    }).join('') +
    '</div>' + _ocoRegrasSemCategoriaHtml(blocos, ctx) + '</div>';
}

// ─── VISÃO GERAL ────────────────────────────────────────────────────────────
// Cabeçalho (Tipo de Evento + Coquetéis + Salvar) e, logo abaixo, TODOS os
// Tipos de Evento cadastrados com os coquetéis já associados a cada um —
// pra ver de relance o que já foi feito, sem entrar um por um. Clicar no
// nome do Tipo de Evento abre o detalhe (quantidades).
function _ocoRenderOverview(cont, tipos) {
  var coqueteisAssociados = _ocoCoqueteisDoTipo(_ocoTipoAtual);
  var fichasOrdenadas = (D.fichas || []).slice().sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || '', 'pt-BR'); });

  var html = '<div style="padding:20px 24px;max-width:1100px">';

  html += '<div style="margin-bottom:16px">' +
    '<div style="font-size:18px;font-weight:700;color:var(--text)">Cálculos do Orçamento</div>' +
    '<div style="font-size:12px;color:var(--text3);margin-top:2px">Associe os coquetéis de cada Tipo de Evento aqui. Depois clique no nome do Tipo de Evento pra preencher as quantidades de cada insumo.</div>' +
  '</div>';

  html += _ocoTopTabsHtml();

  html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-bottom:20px;display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">' +
    '<div>' +
      '<label class="lbl">Tipo de evento</label>' +
      '<select onchange="ocoSetTipo(this.value)" style="min-width:220px;padding:7px 10px;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:13px">' +
        tiposEventoOptionsHtml(_ocoTipoAtual) +
      '</select>' +
    '</div>' +
    '<div style="flex:1;min-width:260px;position:relative">' +
      '<label class="lbl">Coquetéis deste Tipo de Evento</label>' +
      '<input class="inp" id="oco-coq-busca" type="text" placeholder="Digite o nome do coquetel para buscar..." oninput="ocoFiltrarCoqueteis(this.value)" style="width:100%">' +
      '<div id="oco-coq-lista" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">' +
        (fichasOrdenadas.length ? fichasOrdenadas.map(function(f) {
          var marcado = coqueteisAssociados.indexOf(f.id) !== -1;
          return '<label class="oco-coq-item" data-busca="' + f.nome.toLowerCase().replace(/"/g, '&quot;') + '" data-marcado="' + (marcado ? '1' : '0') + '" style="display:' + (marcado ? 'flex' : 'none') + ';align-items:center;gap:5px;font-size:11px;cursor:pointer;background:' + (marcado ? 'var(--green-bg)' : 'var(--bg3)') + ';padding:4px 10px;border-radius:var(--radius);border:1px solid ' + (marcado ? 'var(--green-dim)' : 'var(--border)') + '">' +
            '<input type="checkbox" ' + (marcado ? 'checked' : '') + ' onchange="ocoToggleCoquetel(\'' + f.id + '\',this.checked)"> ' + f.nome + '</label>';
        }).join('') : '<span style="font-size:11px;color:var(--text3)">Nenhuma ficha cadastrada ainda.</span>') +
        '<span id="oco-coq-vazio" style="font-size:11px;color:var(--text3)">' + (coqueteisAssociados.length ? 'Digite acima para adicionar mais coquetéis.' : 'Nenhum coquetel marcado ainda — digite acima para buscar.') + '</span>' +
      '</div>' +
    '</div>' +
    '<button class="btn" style="background:var(--green);font-weight:700" onclick="ocoSalvar()">💾 Salvar</button>' +
  '</div>';

  var porGrupo = {}, ordemGrupos = [];
  tipos.forEach(function(t) {
    var g = t.grupo || t.nome;
    if (!porGrupo[g]) { porGrupo[g] = []; ordemGrupos.push(g); }
    porGrupo[g].push(t);
  });

  ordemGrupos.forEach(function(g) {
    html += '<div style="margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px">' + g + '</div>';
    porGrupo[g].forEach(function(t) {
      var idsCoq = _ocoCoqueteisDoTipo(t.id);
      var nomesCoq = idsCoq.map(function(id) { var f = (D.fichas||[]).find(function(x){return x.id===id;}); return f ? f.nome : null; }).filter(Boolean);
      var nItens = _ocoRegras(t.id).length;
      html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;margin-bottom:8px">' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
          '<button onclick="ocoAbrirDetalhe(\'' + t.id + '\')" style="background:none;border:none;padding:0;cursor:pointer;font-size:14px;font-weight:700;color:var(--blue,#4F8EF7);text-decoration:underline">' + t.nome + '</button>' +
          (nItens ? '<span style="font-size:10px;color:var(--text3)">' + nItens + ' insumo(s) na tabela de quantidades</span>' : '') +
        '</div>' +
        '<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:6px">' +
          (nomesCoq.length
            ? nomesCoq.map(function(n) { return '<span style="font-size:11px;background:var(--bg3);border:1px solid var(--border2);border-radius:12px;padding:3px 10px;color:var(--text2)">' + n + '</span>'; }).join('')
            : '<span style="font-size:11px;color:var(--text3)">Nenhum coquetel associado ainda.</span>') +
        '</div>' +
      '</div>';
    });
    html += '</div>';
  });

  html += '</div>';
  cont.innerHTML = html;
}

// ─── CATÁLOGO DE INSUMOS (referência global, fora dos Tipos de Evento) ─────
// Todo insumo que aparece em qualquer Ficha de Coquetel do sistema — não
// pertence a nenhum Tipo de Evento específico. Serve pra ela achar
// duplicata/nome sem Cadastro de uma vez só, sem precisar entrar tipo por
// tipo, e pra saber o que existe antes de decidir associar em algum.
function _ocoRenderCatalogo(cont) {
  var norm = _ocoNorm;
  var html = '<div style="padding:20px 24px;max-width:1100px">';

  html += '<div style="margin-bottom:16px">' +
    '<div style="font-size:18px;font-weight:700;color:var(--text)">Cálculos do Orçamento</div>' +
    '<div style="font-size:12px;color:var(--text3);margin-top:2px">Todo insumo que aparece em alguma Ficha de Coquetel, de referência — não é filtrado por Tipo de Evento.</div>' +
  '</div>';

  html += _ocoTopTabsHtml();

  var todosItens = _ocoTodosItensDeFichas();

  // Marca quem tem problema (grafia diferente entre fichas, ou nome que
  // não bate com nenhum insumo cadastrado) — é isso que ela chama de
  // "duplicada": o mesmo insumo aparecendo mais de uma vez com nome
  // ligeiramente diferente entre fichas.
  todosItens.forEach(function(it) {
    var grafias = Object.keys(it.grafias || {});
    it._grafias = grafias;
    it._temInsumo = (D.insumos || []).some(function(i) { return norm(i.nome) === norm(it.nome); });
    it._temAviso = grafias.length > 1 || !it._temInsumo;
  });
  var totalAvisos = todosItens.filter(function(it) { return it._temAviso; }).length;
  window._ocoSemCadastro = [];
  var itensFiltrados = _ocoSoAvisos ? todosItens.filter(function(it) { return it._temAviso; }) : todosItens;

  var porCatCatalogo = {};
  itensFiltrados.forEach(function(it) { (porCatCatalogo[it.cat] = porCatCatalogo[it.cat] || []).push(it); });
  var ordemCatsCatalogo = (typeof getCategorias === 'function' ? getCategorias() : []).filter(function(c) { return porCatCatalogo[c]; });
  Object.keys(porCatCatalogo).forEach(function(c) { if (ordemCatsCatalogo.indexOf(c) === -1) ordemCatsCatalogo.push(c); });

  html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">' +
    '<button class="btn-sm" style="background:' + (_ocoSoAvisos ? 'var(--amber)' : 'var(--bg3)') + ';color:' + (_ocoSoAvisos ? '#1a1400' : 'var(--text)') + ';font-weight:700" onclick="ocoToggleSoAvisos()">' +
      (totalAvisos ? '⚠️ ' + totalAvisos + ' com grafia duplicada/sem cadastro' : '✓ nenhuma duplicata encontrada') +
      (_ocoSoAvisos ? ' — mostrando só esses' : ' — ver só esses') +
    '</button>' +
    (_ocoSoAvisos ? '<button class="btn-sm" style="background:var(--bg3)" onclick="ocoToggleSoAvisos()">Ver todos de novo</button>' : '') +
  '</div>';

  if (!todosItens.length) {
    html += '<div style="text-align:center;color:var(--text3);padding:32px">Nenhuma Ficha de Coquetel cadastrada ainda.</div>';
  } else if (_ocoSoAvisos && !totalAvisos) {
    html += '<div style="text-align:center;color:var(--text3);padding:32px">Nenhuma duplicata encontrada — todo insumo de ficha bate com um item do Cadastro.</div>';
  }

  ordemCatsCatalogo.forEach(function(cat) {
    var itensCat = porCatCatalogo[cat];
    html += '<div style="margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:2px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:grid;gap:4px">' +
      itensCat.map(function(it) {
        var avisoGrafia = it._grafias.length > 1
          ? '<div style="font-size:9px;color:var(--amber);margin-top:2px">⚠️ grafia diferente entre fichas: ' +
              it._grafias.map(function(g) { return '"' + g + '" (' + it.grafias[g].join(', ') + ')'; }).join(' · ') +
              ' — corrija a ficha errada pra usar sempre o mesmo nome</div>'
          : (!it._temInsumo ? '<div style="font-size:9px;color:var(--amber);margin-top:2px">⚠️ esse nome não bate com nenhum insumo do Cadastro — confira se é apelido/nome digitado diferente</div>' : '');
        // Sem cadastro: vincular a um produto já cadastrado (renomeia nas
        // fichas/regras) ou criar o produto novo no Cadastro.
        var acoes = '';
        if (!it._temInsumo) {
          var idx = window._ocoSemCadastro.push({ nome: it.nome, cat: it.cat, grafias: it._grafias }) - 1;
          acoes = '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px">' +
            '<div style="position:relative">' +
              '<input type="text" autocomplete="off" placeholder="Vincular a produto do Cadastro — digite pra buscar..." ' +
                'oninput="ocoFiltrarVinculo(' + idx + ',this.value)" onfocus="ocoFiltrarVinculo(' + idx + ',this.value)" ' +
                'onblur="setTimeout(function(){var d=document.getElementById(\'oco-vinc-dd-' + idx + '\');if(d)d.style.display=\'none\';},150)" ' +
                'style="width:300px;font-size:11px;padding:4px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
              '<div id="oco-vinc-dd-' + idx + '" style="display:none;position:absolute;top:28px;left:0;width:360px;max-height:240px;overflow-y:auto;background:var(--bg2);border:1px solid var(--border2);border-radius:var(--radius);z-index:500;box-shadow:0 6px 24px rgba(0,0,0,.55)"></div>' +
            '</div>' +
            '<span style="font-size:10px;color:var(--text3)">ou</span>' +
            '<button class="btn-sm" style="background:var(--green);color:#fff" onclick="ocoCriarInsumoDoCatalogo(' + idx + ')">Criar produto novo</button>' +
          '</div>';
        }
        return '<div style="background:var(--bg3);border:1px solid ' + (it._temAviso ? 'var(--amber-dim,var(--amber))' : 'var(--border)') + ';border-radius:var(--radius);padding:6px 12px;font-size:11px">' +
          '<div style="display:flex;align-items:center;gap:10px">' +
            '<span style="flex:1;color:var(--text);font-weight:500">' + it.nome + '</span>' +
            '<span style="font-size:10px;color:var(--text3)">' + it.fichas.join(', ') + '</span>' +
          '</div>' +
          avisoGrafia + acoes +
        '</div>';
      }).join('') +
      '</div></div>';
  });

  html += '</div>';
  cont.innerHTML = html;
}

// ─── Catálogo: item de ficha sem cadastro ──────────────────────────────────
function ocoFiltrarVinculo(idx, busca) {
  var dd = document.getElementById('oco-vinc-dd-' + idx);
  var item = (window._ocoSemCadastro || [])[idx];
  if (!dd || !item) return;
  var b = _ocoNorm(busca);
  var esc = function(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  var lista = (typeof getInsumos === 'function' ? getInsumos() : (D.insumos || []))
    .filter(function(i) { return !b || _ocoNorm(i.nome).indexOf(b) !== -1; })
    .sort(function(a, c) { return (a.nome || '').localeCompare(c.nome || '', 'pt-BR'); });
  dd.innerHTML = lista.length ? lista.map(function(i) {
    return '<div data-nome="' + esc(i.nome) + '" onmousedown="ocoVincularItemCatalogo(' + idx + ',this.dataset.nome)" ' +
      'style="padding:7px 12px;cursor:pointer;font-size:11px;color:var(--text);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:8px" ' +
      'onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'\'">' +
      '<span>' + esc(i.nome) + '</span><span style="color:var(--text3);font-size:9px">' + esc(i.categoria) + '</span></div>';
  }).join('') : '<div style="padding:8px 12px;color:var(--text3);font-size:11px">Nenhum produto com esse nome no Cadastro.</div>';
  dd.style.display = 'block';
}

// Troca o nome solto pelo produto cadastrado em TODO lugar que guarda o nome
// (fichas, copo da ficha, Regras de Separação, Associações — via
// _propagarRenomeInsumo — e as listas de Cálculos do Orçamento). O nome
// antigo vira apelido do produto, pra histórico/importação continuar casando.
function ocoVincularItemCatalogo(idx, nomeAlvo) {
  var item = (window._ocoSemCadastro || [])[idx];
  var alvo = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(nomeAlvo) : null;
  if (!item || !alvo) return;
  var grafias = (item.grafias && item.grafias.length) ? item.grafias : [item.nome];
  if (!confirm('Trocar "' + grafias.join('" / "') + '" por "' + alvo.nome + '" em todas as Fichas de Coquetel e regras?\n\n"' + grafias.join('", "') + '" vira apelido de "' + alvo.nome + '" no Cadastro.')) return;

  var normGrafias = grafias.map(_ocoNorm);
  // Fichas: casa sem acento/caixa (o _propagarRenomeInsumo casa só exato) e
  // já ajusta a categoria pra do Cadastro.
  var mudouFichas = false;
  (D.fichas || []).forEach(function(f) {
    (f.itens || []).forEach(function(it) {
      if (normGrafias.indexOf(_ocoNorm(it.nome)) !== -1) { it.nome = alvo.nome; if (alvo.categoria) it.cat = alvo.categoria; mudouFichas = true; }
    });
    if (f.copo && normGrafias.indexOf(_ocoNorm(f.copo)) !== -1) { f.copo = alvo.nome; mudouFichas = true; }
  });
  if (mudouFichas) sv('fichas');
  if (typeof _propagarRenomeInsumo === 'function') grafias.forEach(function(g) { _propagarRenomeInsumo(g, alvo.nome); });

  var mudouCalc = false;
  Object.keys(D.calculosOrcamento || {}).forEach(function(k) {
    var lista = D.calculosOrcamento[k];
    if (!Array.isArray(lista)) return;
    lista.forEach(function(r) {
      if (r.item && normGrafias.indexOf(_ocoNorm(r.item)) !== -1) { r.item = alvo.nome; mudouCalc = true; }
      if (r.principal && normGrafias.indexOf(_ocoNorm(r.principal)) !== -1) { r.principal = alvo.nome; mudouCalc = true; }
    });
  });
  if (mudouCalc) sv('calculosOrcamento');

  if (!alvo.aliases) alvo.aliases = [];
  grafias.forEach(function(g) {
    var gU = (g || '').trim().toUpperCase();
    if (gU && gU !== (alvo.nome || '').toUpperCase() && alvo.aliases.map(function(a) { return (a || '').toUpperCase(); }).indexOf(gU) === -1) alvo.aliases.push(gU);
  });
  sv('insumos');

  alert2('"' + grafias.join('" / "') + '" agora é "' + alvo.nome + '" nas fichas.');
  rOrcCalculos();
}

// Abre o formulário de produto novo no Cadastro já com o nome/categoria do
// item; salvar/cancelar volta pra cá (window._cadVoltarPara).
function ocoCriarInsumoDoCatalogo(idx) {
  var item = (window._ocoSemCadastro || [])[idx];
  if (!item) return;
  go('cadastro');
  setTimeout(function() {
    window._cadVoltarPara = 'orcCalculos';
    if (typeof setCadastroView === 'function') setCadastroView('form');
    if (typeof rFormInsumo === 'function') rFormInsumo();
    var nomeEl = document.getElementById('cad-nome');
    if (nomeEl) nomeEl.value = item.nome;
    var catEl = document.getElementById('cad-categoria');
    if (catEl) {
      var opt = Array.from(catEl.options).find(function(o) { return _ocoNorm(o.value) === _ocoNorm(item.cat); });
      if (opt) catEl.value = opt.value;
    }
  }, 80);
}

// ─── DETALHE (quantidades de um Tipo de Evento) ────────────────────────────
function _ocoRenderDetalhe(cont, tipos) {
  var norm = _ocoNorm;

  _ocoSincronizarDeFichas(_ocoTipoAtual);
  var regras = _ocoRegras(_ocoTipoAtual);
  var cargos = _cargosDisponiveis();
  var coqueteisAssociados = _ocoCoqueteisDoTipo(_ocoTipoAtual);

  var porCat = {};
  regras.forEach(function(r) { (porCat[r.cat] = porCat[r.cat] || []).push(r); });
  var ordemCats = (typeof getCategorias === 'function' ? getCategorias() : []).filter(function(c) { return porCat[c]; });
  Object.keys(porCat).forEach(function(c) { if (ordemCats.indexOf(c) === -1) ordemCats.push(c); });

  var _bibFlat = [];
  var _bib = getBiblioteca();
  Object.keys(_bib).sort().forEach(function(c) { (_bib[c] || []).forEach(function(it) { _bibFlat.push(it); }); });

  var itensExistentes = {};
  regras.forEach(function(r) { itensExistentes[norm(r.item)] = true; });

  // Todo item deve corresponder a um insumo real do Cadastro — usado pra
  // avisar (e oferecer revincular) quando o nome salvo na regra não bate
  // com nenhum insumo (renomeado no Cadastro, ou digitado diferente na
  // ficha de origem).
  var insumosParaRevincular = (typeof getInsumos === 'function' ? getInsumos() : [])
    .map(function(i) { return i.nome; }).filter(Boolean)
    .sort(function(a, b) { return a.localeCompare(b, 'pt-BR'); });

  var nomeTipoDetalhe = (buscarTipoEventoPorId(_ocoTipoAtual) || {}).nome || _ocoTipoAtual;
  var html = '<div style="padding:20px 24px;max-width:1100px">';

  html += '<div style="margin-bottom:16px;display:flex;align-items:center;gap:12px">' +
    '<button class="btn-sm" style="background:var(--bg3)" onclick="ocoVoltarOverview()">← Voltar</button>' +
    '<div>' +
      '<div style="font-size:18px;font-weight:700;color:var(--text)">Cálculos do Orçamento — ' + nomeTipoDetalhe + '</div>' +
      '<div style="font-size:12px;color:var(--text3);margin-top:2px">Quanto considerar de cada insumo na Calculadora do Orçamento — a média real de uso, não a quantidade de levar (essa fica em Folha de Separação → Cálculos).</div>' +
    '</div>' +
  '</div>';

  html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:14px 16px;margin-bottom:18px;display:flex;gap:20px;flex-wrap:wrap;align-items:flex-end">' +
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
      '<button class="btn" style="background:var(--green);font-weight:700" onclick="ocoSalvar()">💾 Salvar</button>' +
    '</div>' +
  '</div>';

  var fichasOrdenadasDet = (D.fichas || []).slice().sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || '', 'pt-BR'); });
  html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:18px;overflow:hidden">' +
    '<div style="padding:8px 14px;background:var(--bg3);border-bottom:1px solid var(--border)">' +
      '<span style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.8px">🍹 Coquetéis deste Tipo de Evento</span>' +
      '<span style="font-size:10px;color:var(--text3);margin-left:8px">Marque/desmarque aqui mesmo — não precisa voltar pra visão geral</span>' +
    '</div>' +
    '<div style="padding:10px 14px">' +
      '<input class="inp" id="oco-coq-busca" type="text" placeholder="Digite o nome do coquetel para buscar..." oninput="ocoFiltrarCoqueteis(this.value)" style="width:100%;max-width:280px;margin-bottom:10px">' +
      '<div id="oco-coq-lista" style="display:flex;flex-wrap:wrap;gap:6px">' +
        (fichasOrdenadasDet.length ? fichasOrdenadasDet.map(function(f) {
          var marcado = coqueteisAssociados.indexOf(f.id) !== -1;
          return '<label class="oco-coq-item" data-busca="' + f.nome.toLowerCase().replace(/"/g, '&quot;') + '" data-marcado="' + (marcado ? '1' : '0') + '" style="display:' + (marcado ? 'flex' : 'none') + ';align-items:center;gap:5px;font-size:11px;cursor:pointer;background:' + (marcado ? 'var(--green-bg)' : 'var(--bg3)') + ';padding:4px 10px;border-radius:var(--radius);border:1px solid ' + (marcado ? 'var(--green-dim)' : 'var(--border)') + '">' +
            '<input type="checkbox" ' + (marcado ? 'checked' : '') + ' onchange="ocoToggleCoquetel(\'' + f.id + '\',this.checked)"> ' + f.nome + '</label>';
        }).join('') : '<span style="font-size:11px;color:var(--text3)">Nenhuma ficha cadastrada ainda.</span>') +
        '<span id="oco-coq-vazio" style="font-size:11px;color:var(--text3)">' + (coqueteisAssociados.length ? 'Digite acima para adicionar mais coquetéis.' : 'Nenhum coquetel marcado ainda — digite acima para buscar.') + '</span>' +
      '</div>' +
    '</div>' +
  '</div>';

  var orfaos = _ocoItensOrfaos(_ocoTipoAtual);
  var orfaosIds = {};
  orfaos.forEach(function(r) { orfaosIds[r.id] = true; });
  if (orfaos.length) {
    html += '<div style="background:var(--amber-bg,rgba(245,166,35,.1));border:1px solid var(--amber-dim,var(--amber));border-radius:var(--radius);padding:10px 14px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:700;color:var(--amber);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + orfaos.length + ' item(ns) que não pertence(m) a nenhum coquetel associado</div>' +
      '<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Sobrou de um coquetel que foi desmarcado, ou de antes de existir a associação por coquetel: ' +
        orfaos.map(function(r) { return '"' + r.item + '"'; }).join(', ') +
      '</div>' +
      '<button class="btn-sm" style="background:var(--amber);color:#1a1400;font-weight:700" onclick="ocoLimparOrfaos()">Remover todos</button>' +
    '</div>';
  }

  if (!regras.length) {
    html += '<div style="text-align:center;color:var(--text3);padding:32px">' +
      (coqueteisAssociados.length
        ? 'Nenhum ingrediente encontrado nos coquetéis associados — adicione um item manualmente lá embaixo.'
        : 'Nenhum coquetel associado ainda — volte pra visão geral e marque os coquetéis deste Tipo de Evento.') +
      '</div>';
  }

  var ctxLinha = { regras: regras, cargos: cargos, insumos: insumosParaRevincular, orfaosIds: orfaosIds };

  ordemCats.forEach(function(cat) {
    var itens = porCat[cat];
    if (!itens || !itens.length) return;
    html += '<div style="margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:2px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:grid;gap:6px">';

    itens.forEach(function(r) {
      html += _ocoLinhaRegraHtml(r, ctxLinha);
    });

    html += '</div></div>';
  });

  var disponiveis = _bibFlat.filter(function(it) { return !itensExistentes[norm(it)]; });
  html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;margin-top:8px">' +
    '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">+ Adicionar item (só neste Tipo de Evento)</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">' +
      '<div style="flex:1;min-width:240px"><label class="lbl">Item</label>' +
        _ocoBuscaItemHtml(Object.keys(_bib).reduce(function(acc, cat) {
          (_bib[cat] || []).forEach(function(it) { if (!itensExistentes[norm(it)]) acc.push({ nome: it, cat: cat }); });
          return acc;
        }, [])) + '</div>' +
      '<button class="btn" onclick="ocoAdicionarItem()" style="background:var(--blue);white-space:nowrap">+ Adicionar</button>' +
    '</div>' +
    (disponiveis.length ? '' : '<div style="font-size:10px;color:var(--text3);margin-top:6px">Todos os itens da Biblioteca já estão na lista deste Tipo de Evento.</div>') +
  '</div>';

  html += '<div style="margin:16px 0 20px">' +
    '<button class="btn" style="background:var(--green);font-weight:700;padding:10px 24px" onclick="ocoSalvar()">💾 Salvar</button>' +
  '</div>';

  html += '</div>';
  cont.innerHTML = html;
}

// Uma linha de regra (base/qtd/a cada/mín/cargos/segue item) — usada tanto
// no detalhe de um Tipo de Evento quanto na lista de Itens automáticos
// (todos os eventos). ctx: { regras, cargos, insumos, orfaosIds, extraNome(r) }.
function _ocoLinhaRegraHtml(r, ctx) {
  var regras = ctx.regras, cargos = ctx.cargos, insumosParaRevincular = ctx.insumos, orfaosIds = ctx.orfaosIds || {};
  var html = '';
  var ef = _regraBaseEfetiva(r);
  // Com as colunas do Cadastro (Itens automáticos) as outras encolhem um pouco pra caber.
  var cols = ctx.extraColWidth
    // colunas elásticas (encolhem até um mínimo) pra caber em tela menor
    ? 'minmax(110px,1.4fr) minmax(100px,1fr) minmax(50px,.5fr) minmax(60px,.6fr) minmax(50px,.5fr) ' + ctx.extraColWidth + ' 28px'
    : 'minmax(160px,1fr) 140px 70px 110px 70px 40px';

  var insumoDaRegra = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(r.item) : null;
  var semInsumo = !insumoDaRegra;
  var ehOrfao = !!orfaosIds[r.id];

  html += '<div style="background:var(--bg3);border:1px solid ' + (semInsumo ? 'var(--amber-dim,var(--amber))' : (ehOrfao ? 'var(--amber-dim,var(--amber))' : 'var(--border)')) + ';border-radius:var(--radius);padding:8px 12px;font-size:11px">' +
    '<div style="display:grid;grid-template-columns:' + cols + ';gap:8px;align-items:end">' +

    '<div><span style="color:var(--text);font-weight:500">' + r.item + '</span>' +
      (semInsumo
        ? '<div style="font-size:9px;color:var(--amber);margin-top:2px">⚠️ não bate com nenhum insumo do Cadastro. Incluir (revincular):' +
            '<select onchange="ocoRevincular(\'' + r.id + '\',this.value)" style="display:block;margin-top:3px;width:100%;font-size:10px;padding:2px 4px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
              '<option value="">— escolher insumo —</option>' +
              insumosParaRevincular.map(function(n) { return '<option value="' + n.replace(/"/g, '&quot;') + '">' + n + '</option>'; }).join('') +
            '</select>' +
            '<span style="display:block;margin-top:2px">ou <a href="#" onclick="ocoRemoverItem(\'' + r.id + '\');return false" style="color:var(--red)">excluir este item</a></span>' +
          '</div>'
        : (ehOrfao ? '<div style="font-size:9px;color:var(--amber);margin-top:2px">⚠️ não está em nenhum coquetel associado atualmente</div>' : '')) +
      (ctx.extraNome ? ctx.extraNome(r) : '') +
    '</div>' +

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

    (ctx.extraCol ? ctx.extraCol(r) : '') +

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
  return html;
}

// ─── ITENS AUTOMÁTICOS (TODOS OS EVENTOS) ───────────────────────────────────
// Lista única, na ordem em que ela cadastra (sem agrupar por categoria nem
// puxar de coquetel/Tipo de Evento). Cada item:
// - "só com cardápio" DESMARCADO → entra sozinho em todo orçamento (gelo,
//   seguro quebra, lanche...) — ver _sincronizarItensAutoGlobais (orcamento.js).
// - "só com cardápio" MARCADO → não entra sozinho; só dá a quantidade quando
//   um coquetel do cardápio do orçamento usa esse item (calcQtdItemOrcamento).

// Item que aparece em alguma Ficha de Coquetel = ingrediente → por padrão
// "só com cardápio" (não cobrar vodka em festa sem coquetel de vodka).
function _ocoItemEmAlgumaFicha(nome) {
  var n = _ocoNorm(nome);
  return (D.fichas || []).some(function(f) {
    return (f.itens || []).some(function(it) { return _ocoNorm(it.nome) === n; });
  });
}

function ocoTodosSetCardapio(id, checked) {
  var r = _ocoRegras(OCO_LISTA_TODOS).find(function(x) { return x.id === id; });
  if (!r) return;
  r.soSeCardapio = !!checked;
  rOrcCalculos();
}


// Contexto das linhas de regra da lista única (Itens automáticos) — usado
// também dentro das categorias em "Ordem na Calculadora".
function _ocoCtxTodos() {
  var regras = _ocoRegras(OCO_LISTA_TODOS);
  var insumosNomes = (typeof getInsumos === 'function' ? getInsumos() : []).map(function(i) { return i.nome; }).filter(Boolean)
    .sort(function(a, b) { return a.localeCompare(b, 'pt-BR'); });
  var esc = function(s) { return String(s).replace(/"/g, '&quot;'); };
  var moeda = function(v) { return (typeof fR === 'function') ? fR(v) : 'R$ ' + Number(v || 0).toFixed(2); };
  var ctx = {
    regras: regras, cargos: _cargosDisponiveis(), insumos: insumosNomes, orfaosIds: {},
    // Depois do MÍN.: um card por valor do Cadastro de Insumos (Custo,
    // Revenda baixa, Revenda alta) — só consulta, mesmo tamanho dos campos
    // da linha. Clicar em qualquer um abre o insumo no Cadastro.
    extraColWidth: 'minmax(62px,.7fr) minmax(62px,.7fr) minmax(62px,.7fr)',
    extraCol: function(r) {
      var ins = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(r.item) : null;
      var abrir = 'data-nome="' + esc(r.item) + '" onclick="ocoAbrirCadastroInsumo(this.dataset.nome);return false" title="Valor do Cadastro de Insumos (só consulta) — clique pra alterar"';
      var num = function(v) { return v ? Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'; };
      var card = function(rot, val, cor) {
        return '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px;white-space:nowrap">' + rot + '</div>' +
          '<div ' + abrir + ' style="cursor:pointer;width:100%;box-sizing:border-box;font-size:11px;font-family:var(--mono);padding:3px 5px;border-radius:4px;border:1px dashed var(--border2);background:var(--bg);text-align:center;color:' + (cor || 'var(--text)') + '">' + val + '</div></div>';
      };
      if (!ins) return card('CUSTO', 'sem cad.', 'var(--amber)') + card('REV. BAIXA', '—', 'var(--text3)') + card('REV. ALTA', '—', 'var(--text3)');
      var custo = (typeof precoEfetivoInsumo === 'function') ? precoEfetivoInsumo(ins) : Number(ins.custoReposicao || 0);
      return card('CUSTO / ' + (ins.unidadeCompra || 'UN').toLowerCase(), num(custo), custo ? '' : 'var(--amber)') +
        card('REV. BAIXA', num(ins.revendaBaixaTemporada), ins.revendaBaixaTemporada ? 'var(--green)' : 'var(--text3)') +
        card('REV. ALTA', num(ins.revendaAltaTemporada), ins.revendaAltaTemporada ? 'var(--green)' : 'var(--text3)');
    },
    // Embaixo do nome: "só com cardápio"
    extraNome: function(r) {
      return '' +
        '<label style="display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:500;color:var(--text2);margin:4px 0 0;cursor:pointer;text-transform:none;letter-spacing:0;width:auto" ' +
          'title="Marcado: só entra quando um coquetel do cardápio usa este item. Desmarcado: entra sozinho em todo orçamento.">' +
          '<input type="checkbox" style="width:auto;margin:0" ' + (r.soSeCardapio ? 'checked' : '') + ' onchange="ocoTodosSetCardapio(\'' + r.id + '\',this.checked)"> só com cardápio' +
        '</label>';
    },
  };
  return ctx;
}

function _ocoRenderTodos(cont) {
  var regras = _ocoRegras(OCO_LISTA_TODOS);
  var norm = _ocoNorm;
  var insumos = (typeof getInsumos === 'function' ? getInsumos() : []);
  var insumosNomes = insumos.map(function(i) { return i.nome; }).filter(Boolean)
    .sort(function(a, b) { return a.localeCompare(b, 'pt-BR'); });
  var esc = function(s) { return String(s).replace(/"/g, '&quot;'); };
  var moeda = function(v) { return (typeof fR === 'function') ? fR(v) : 'R$ ' + Number(v || 0).toFixed(2); };

  var ctx = _ocoCtxTodos();

  var html = '<div style="padding:20px 24px;max-width:1100px">' +
    '<div style="margin-bottom:16px">' +
      '<div style="font-size:18px;font-weight:700;color:var(--text)">Cálculos do Orçamento</div>' +
      '<div style="font-size:12px;color:var(--text3);margin-top:2px">Quantidade de cada item no orçamento — vale para todos os eventos. O preço vem do Cadastro de Insumos.</div>' +
    '</div>' +
    _ocoTopTabsHtml() +
    '<div style="font-size:12px;color:var(--text3);margin-bottom:14px;line-height:1.6">' +
      '<strong style="color:var(--text2)">"Só com cardápio" desmarcado</strong>: entra sozinho em todo orçamento (ex.: gelo, seguro quebra, lanche).<br>' +
      '<strong style="color:var(--text2)">"Só com cardápio" marcado</strong>: só entra quando um coquetel do cardápio usa o item, com a quantidade daqui.<br>' +
      'Fixo = sempre a mesma quantidade · Por convidado / equipe / cargo = quantidade a cada X pessoas · Segue outro item = a quantidade vem de outro item.' +
    '</div>';

  html += regras.length
    ? '<div style="display:grid;gap:6px">' + regras.map(function(r) { return _ocoLinhaRegraHtml(r, ctx); }).join('') + '</div>'
    : '<div style="text-align:center;color:var(--text3);padding:28px;border:1px dashed var(--border2);border-radius:var(--radius)">Nenhum item ainda — adicione abaixo, na ordem que quiser.</div>';

  var existentes = {};
  regras.forEach(function(r) { existentes[norm(r.item)] = true; });
  var porCat = {};
  insumos.forEach(function(i) {
    if (!i.nome || existentes[norm(i.nome)]) return;
    var c = i.categoria || 'SEM CATEGORIA';
    (porCat[c] = porCat[c] || []).push(i.nome);
  });

  html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:10px 12px;margin-top:12px">' +
    '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">+ Adicionar item do Cadastro de Insumos</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">' +
      '<div style="flex:1;min-width:240px"><label class="lbl">Item</label>' +
        _ocoBuscaItemHtml(Object.keys(porCat).reduce(function(acc, cat) {
          porCat[cat].forEach(function(n) { acc.push({ nome: n, cat: cat }); });
          return acc;
        }, [])) + '</div>' +
      '<button class="btn" onclick="ocoAdicionarItem()" style="background:var(--blue);white-space:nowrap">+ Adicionar</button>' +
      '<button class="btn" onclick="go(\'cadastro\')" style="white-space:nowrap" title="Item que ainda não existe (ex.: Seguro Quebra) — cadastre lá com o preço e volte aqui">Cadastrar insumo novo</button>' +
    '</div>' +
  '</div>' +
  '<div style="margin:16px 0 20px"><button class="btn" style="background:var(--green);font-weight:700;padding:10px 24px" onclick="ocoSalvar()">💾 Salvar</button></div>' +
  '</div>';

  cont.innerHTML = html;
}
