// ─── FICHA TÉCNICA + FOTOS DOS COPOS ──────────────────────────────────────
// Ficha Técnica = documento enviado aos colaboradores, um card por coquetel:
// foto do copo, ingredientes com medida, método, serviço, modo de preparo e
// finalização. Gerada a partir da Folha de Separação de um evento (usa os
// coquetéis marcados nela) ou de um coquetel avulso.
//
// O "copo" de uma ficha é o INSUMO da categoria COPOS E TAÇAS (Cadastro de
// Insumos) — não há cadastro separado. A ficha guarda o copo pelo nome
// (f.copo); a foto vem do Cadastro de Insumos (insumoFoto_<id>). O antigo
// D.copos / copoFoto_ fica só como fallback pra fichas que ainda apontam
// por id (f.copoId).

var METODOS_PREPARO = ['BATIDO', 'MEXIDO', 'MONTADO', 'DIRETO', 'DRY SHAKE'];
var UNIDADES_INGREDIENTE = ['ML', 'GR', 'UN', 'DASH', 'GTS', 'BSP', '—'];
var CAT_COPOS = 'COPOS E TAÇAS';
// Categorias que, por padrão, NÃO são ingrediente — não saem na lista da
// Ficha Técnica (copo aparece na linha "SERVIÇO"; material/associação não
// aparece). A ficha pode marcar item a item ("na receita") pra sobrepor.
var CATS_FORA_FICHA_TECNICA = ['MATERIAL', 'DESCARTÁVEIS', 'KIT BARTENDER', 'EQUIPE', 'COPOS E TAÇAS'];

function _ftItemEhIngrediente(i) {
  if (i.foraFT === true) return false;
  if (i.foraFT === false) return true;
  var cat = (typeof categoriaAtualDoInsumo === 'function') ? categoriaAtualDoInsumo(i.nome, i.cat) : i.cat;
  return CATS_FORA_FICHA_TECNICA.indexOf((cat || '').toUpperCase()) === -1;
}

// Lista de copos = insumos da categoria COPOS E TAÇAS, no formato { id, nome }
// que o resto do código espera. Copos antigos de D.copos que ainda não têm
// insumo correspondente entram marcados como _legado.
function getCopos() {
  var base = (typeof getInsumos === 'function' ? getInsumos() : (D.insumos || []))
    .filter(function(i) { return (i.categoria || '') === CAT_COPOS; })
    .map(function(i) { return { id: i.id, nome: i.nome }; });
  (D.copos || []).forEach(function(c) {
    if (!base.some(function(x) { return (x.nome || '').toUpperCase() === (c.nome || '').toUpperCase(); })) {
      base.push({ id: c.id, nome: c.nome, _legado: true });
    }
  });
  return base.sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || ''); });
}

function buscarCopoPorId(id) {
  return (D.copos || []).find(function(c) { return c.id === id; }) || null;
}

// Nome do copo de uma ficha: o texto salvo (f.copo) vale; só cai no id
// antigo (D.copos) se não houver texto.
function nomeCopoDaFicha(f) {
  if (!f) return '';
  if (f.copo) return f.copo;
  if (f.copoId) {
    var c = buscarCopoPorId(f.copoId);
    if (c) return c.nome;
  }
  return '';
}

// Foto do copo pelo nome: insumo do Cadastro primeiro; se não tiver foto lá,
// cai no esquema antigo (D.copos + copoFoto_). Sempre devolve uma Promise.
function _ftFotoCopoPorNome(nome) {
  if (!nome) return Promise.resolve(null);
  var insumo = (typeof buscarInsumoPorNome === 'function') ? buscarInsumoPorNome(nome) : null;
  if (insumo && typeof window.buscarInsumoFoto === 'function') {
    return window.buscarInsumoFoto(insumo.id).then(function(b64) {
      return b64 || _ftFotoCopoLegado(nome);
    });
  }
  return _ftFotoCopoLegado(nome);
}
function _ftFotoCopoLegado(nome) {
  var c = (D.copos || []).find(function(x) { return (x.nome || '').toUpperCase() === (nome || '').toUpperCase(); });
  if (c && typeof window.buscarCopoFoto === 'function') return window.buscarCopoFoto(c.id);
  return Promise.resolve(null);
}

function rCoposBiblioteca() {
  var cont = document.getElementById('copos-biblioteca-body');
  if (!cont) return;
  var lista = getCopos();

  var html = '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">' +
    'Os copos são os insumos da categoria <strong>' + CAT_COPOS + '</strong> do Cadastro de Insumos — não tem cadastro separado. ' +
    'Aqui você só define a <strong>foto</strong> de cada um (a mesma que aparece na Ficha Técnica). ' +
    'Pra adicionar ou renomear um copo, use o <a href="#" onclick="go(\'cadastro\');return false" style="color:var(--blue)">Cadastro de Insumos</a>.' +
  '</div>';

  html += lista.length ? ('<div style="display:grid;gap:8px">' + lista.map(function(c) {
    var leg = c._legado ? 'true' : 'false';
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:12px">' +
      '<label style="position:relative;flex:0 0 auto;cursor:pointer" title="Clique pra enviar ou trocar a foto">' +
        '<img id="copo-thumb-' + c.id + '" src="" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:6px;border:1px solid var(--border2);background:var(--bg2);display:block">' +
        '<span id="copo-thumb-empty-' + c.id + '" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:8px;color:var(--text3);text-align:center;line-height:1.15;pointer-events:none">sem<br>foto</span>' +
        '<input type="file" accept="image/*" onchange="copoSelecionarFoto(this,\'' + c.id + '\',' + leg + ')" style="display:none">' +
      '</label>' +
      '<span style="flex:1;font-size:12px;color:var(--text)">' + (c.nome || '').replace(/</g, '&lt;') +
        (c._legado ? ' <span style="font-size:9px;color:var(--amber)">(copo antigo — cadastre como insumo em ' + CAT_COPOS + ')</span>' : '') +
      '</span>' +
      '<label class="btn-sm" style="background:var(--bg2);cursor:pointer;white-space:nowrap">📷 Foto' +
        '<input type="file" accept="image/*" onchange="copoSelecionarFoto(this,\'' + c.id + '\',' + leg + ')" style="display:none"></label>' +
    '</div>';
  }).join('') + '</div>') : '<div style="font-size:12px;color:var(--text3)">Nenhum insumo na categoria ' + CAT_COPOS + '. Cadastre os copos e taças no <a href="#" onclick="go(\'cadastro\');return false" style="color:var(--blue)">Cadastro de Insumos</a>.</div>';

  cont.innerHTML = html;

  lista.forEach(function(c) {
    var carregar = c._legado
      ? (typeof window.buscarCopoFoto === 'function' ? window.buscarCopoFoto(c.id) : Promise.resolve(null))
      : (typeof window.buscarInsumoFoto === 'function' ? window.buscarInsumoFoto(c.id) : Promise.resolve(null));
    carregar.then(function(b64) {
      var img = document.getElementById('copo-thumb-' + c.id);
      var vazio = document.getElementById('copo-thumb-empty-' + c.id);
      if (img && b64) img.src = b64;
      if (vazio) vazio.style.display = b64 ? 'none' : 'flex';
    });
  });
}

function copoSelecionarFoto(inputEl, id, legado) {
  var file = inputEl.files && inputEl.files[0];
  if (!file) return;
  var leitor = new FileReader();
  leitor.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var sc = Math.min(400 / img.width, 400 / img.height, 1);
      var cv = document.createElement('canvas');
      cv.width = Math.round(img.width * sc);
      cv.height = Math.round(img.height * sc);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      var b64 = cv.toDataURL('image/jpeg', 0.82);
      var salvar = legado
        ? (typeof window.salvarCopoFoto === 'function' ? window.salvarCopoFoto(id, b64) : Promise.resolve())
        : (typeof window.salvarInsumoFoto === 'function' ? window.salvarInsumoFoto(id, b64) : Promise.resolve());
      salvar.then(function() {
        var t = document.getElementById('copo-thumb-' + id);
        if (t) t.src = b64;
        var vazio = document.getElementById('copo-thumb-empty-' + id);
        if (vazio) vazio.style.display = 'none';
      });
    };
    img.src = e.target.result;
  };
  leitor.readAsDataURL(file);
  inputEl.value = '';
}

// ── Geração da Ficha Técnica ──────────────────────────────────────────────

// Linhas de ingrediente: { med: "50 ML", nome: "APEROL" } (sem medida = med '').
// Só itens que são de fato ingrediente (ver _ftItemEhIngrediente).
function _ftLinhasIngredientes(ficha) {
  return (ficha.itens || []).filter(_ftItemEhIngrediente).map(function(i) {
    var med = '';
    if (i.qtd != null && i.qtd !== '' && !isNaN(parseFloat(i.qtd))) {
      var un = (i.un && i.un !== '—') ? i.un : '';
      med = parseFloat(i.qtd) + (un ? ' ' + un : '');
    }
    return { med: med, nome: i.nome };
  });
}

function _ftCardHtml(ficha, copoNome, fotoB64) {
  var ingr = _ftLinhasIngredientes(ficha).map(function(l) {
    return '<div>' + (l.med ? '<strong>' + _ftEsc(l.med) + '</strong> — ' : '') + _ftEsc(l.nome) + '</div>';
  }).join('');
  var fotoHtml = fotoB64
    ? '<img src="' + fotoB64 + '" style="width:90px;height:115px;object-fit:contain">'
    : '<div style="width:90px;height:115px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:9px">sem foto</div>';
  return '<div class="ft-card">' +
    '<div class="ft-title">' + _ftEsc(ficha.nome || '—') + '<span>1 UN</span></div>' +
    '<div class="ft-body">' +
      '<div class="ft-foto">' + fotoHtml + '</div>' +
      '<div class="ft-conteudo">' +
        '<div class="ft-ingr">' + (ingr || '<div style="color:#bbb">Sem ingredientes cadastrados</div>') + '</div>' +
        (ficha.metodo ? '<div class="ft-lin"><strong>MÉTODO:</strong> ' + _ftEsc(ficha.metodo) + '</div>' : '') +
        (copoNome ? '<div class="ft-lin"><strong>SERVIÇO:</strong> ' + _ftEsc(copoNome) + '</div>' : '') +
        (ficha.modoPreparo ? '<div class="ft-blk"><strong>MODO DE PREPARO:</strong><br>' + _ftEsc(ficha.modoPreparo) + '</div>' : '') +
        (ficha.finalizacao ? '<div class="ft-blk"><strong>FINALIZAÇÃO:</strong><br>' + _ftEsc(ficha.finalizacao) + '</div>' : '') +
      '</div>' +
    '</div>' +
  '</div>';
}

function _ftEsc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

// `w` já deve estar aberto (window.open síncrono no clique) — evita o
// bloqueador de pop-up, que barra window.open chamado dentro de um .then().
function _ftEscreverDocumento(w, tituloCabecalho, subtitulo, cardsHtml, tituloAba) {
  if (!w) { alert('O navegador bloqueou a janela de impressão. Libere pop-ups para este site e tente de novo.'); return; }
  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>' + _ftEsc(tituloAba || 'Ficha Técnica') + '</title>' +
    '<style>' +
    'body{font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#111;margin:12mm}' +
    '.ft-head{font-weight:bold;font-size:12px;margin-bottom:2px}' +
    '.ft-sub{font-size:10px;color:#555;margin-bottom:2px}' +
    '.ft-band{background:#eee;text-align:center;font-style:italic;font-weight:bold;font-size:11px;padding:3px;margin:8px 0 12px;border-top:1px solid #999;border-bottom:1px solid #999}' +
    '.ft-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:10px;align-items:stretch}' +
    '.ft-card{border:1px solid #ddd;break-inside:avoid;page-break-inside:avoid}' +
    '.ft-title{background:#111;color:#fff;font-weight:bold;font-size:11px;padding:4px 8px;display:flex;justify-content:space-between}' +
    '.ft-body{display:flex;gap:10px;padding:8px}' +
    '.ft-foto{flex:0 0 90px}' +
    '.ft-conteudo{flex:1;line-height:1.35}' +
    '.ft-ingr{margin-bottom:6px}' +
    '.ft-lin{margin:1px 0}' +
    '.ft-blk{margin-top:6px}' +
    '@media print{body{margin:8mm}.ft-card{border-color:#999}}' +
    '</style></head><body>' +
    (tituloCabecalho ? '<div class="ft-head">' + _ftEsc(tituloCabecalho) + '</div>' : '') +
    (subtitulo ? '<div class="ft-sub">' + _ftEsc(subtitulo) + '</div>' : '') +
    '<div class="ft-band">Ficha técnica</div>' +
    '<div class="ft-grid">' + cardsHtml + '</div>' +
    '<div style="font-size:9px;color:#999;margin-top:16px">Impresso em ' + new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR') + '</div>' +
    '<script>window.onload=function(){window.print()}<\/script>' +
    '</body></html>');
  w.document.close();
}

// Nome do copo efetivo de uma ficha num evento (override do evento vence).
// O override guarda o NOME do copo (não mais um id de D.copos).
function _ftCopoNomeEfetivo(ficha, coposOverride) {
  if (coposOverride && coposOverride[ficha.id]) return coposOverride[ficha.id];
  return nomeCopoDaFicha(ficha);
}

// Ficha com os itens já trocados pela bebida/destilado escolhido só pra este
// evento (Folha de Separação → "Bebidas da Ficha Técnica") — o impresso pros
// bartenders precisa mostrar a marca certa, não a padrão da ficha.
function _ftFichaComBebidasEfetivas(ficha, bebidasOverride) {
  if (!bebidasOverride || !Object.keys(bebidasOverride).length) return ficha;
  var norm = (typeof _sepNormNome === 'function') ? _sepNormNome : function(s) { return (s || '').trim().toUpperCase(); };
  var itensNovos = (ficha.itens || []).map(function(it) {
    var novoNome = bebidasOverride[ficha.id + '|' + norm(it.nome)];
    return novoNome ? Object.assign({}, it, { nome: novoNome }) : it;
  });
  return Object.assign({}, ficha, { itens: itensNovos });
}

// Gera a Ficha Técnica de uma Folha de Separação (todos os coquetéis dela).
function imprimirFichaTecnica(sepId) {
  var s = (D.separacoes || []).find(function(x) { return x.id === sepId; });
  if (!s) return;
  var ids = s.coqueteisIds || [];
  var fichas = (ids.map(function(id) { return (D.fichas || []).find(function(f) { return f.id === id; }); })
    .filter(Boolean))
    .map(function(f) { return _ftFichaComBebidasEfetivas(f, s.bebidasOverride); });
  if (!fichas.length) { alert('Esta folha não tem coquetéis marcados — abra a folha e marque os coquetéis do evento.'); return; }

  var w = window.open('', '_blank'); // síncrono: evita bloqueio de pop-up
  var override = s.coposOverride || {};
  var nomes = fichas.map(function(f) { return _ftCopoNomeEfetivo(f, override); });
  var buscas = nomes.map(function(n) { return _ftFotoCopoPorNome(n); });

  Promise.all(buscas).then(function(fotos) {
    var cards = fichas.map(function(f, i) {
      return _ftCardHtml(f, nomes[i], fotos[i]);
    }).join('');
    var dataFmt = s.data ? s.data.split('-').reverse().join('/') : '';
    _ftEscreverDocumento(w,
      'EVENTO: ' + (s.evento || s.cliente || '—'),
      [dataFmt, s.local || '', (s.hrInicio ? s.hrInicio + '–' + (s.hrFim || '') : '')].filter(Boolean).join(' · '),
      cards,
      'Ficha Técnica — ' + (s.evento || '')
    );
  });
}

// Ficha Técnica de um coquetel avulso (aba Fichas).
function imprimirFichaTecnicaCoquetel(fichaId) {
  var f = (D.fichas || []).find(function(x) { return x.id === fichaId; });
  if (!f) return;
  var w = window.open('', '_blank');
  var nome = nomeCopoDaFicha(f);
  _ftFotoCopoPorNome(nome).then(function(foto) {
    _ftEscreverDocumento(w, '', '', _ftCardHtml(f, nome, foto), 'Ficha Técnica — ' + f.nome);
  });
}
