// ─── FICHA TÉCNICA + BIBLIOTECA DE COPOS ───────────────────────────────────
// Ficha Técnica = documento enviado aos colaboradores, um card por coquetel:
// foto do copo, ingredientes com medida, método, serviço, modo de preparo e
// finalização. Gerada a partir da Folha de Separação de um evento (usa os
// coquetéis marcados nela) ou de um coquetel avulso.
//
// Biblioteca de Copos: D.copos = [{ id, nome }]. A foto de cada copo fica num
// documento próprio (copoFoto_<id>), igual à foto de ficha.

var METODOS_PREPARO = ['BATIDO', 'MEXIDO', 'MONTADO', 'DIRETO', 'DRY SHAKE'];
var UNIDADES_INGREDIENTE = ['ML', 'GR', 'UN', 'DASH', 'GTS', 'BSP', '—'];

// ── Biblioteca de Copos ───────────────────────────────────────────────────
function getCopos() {
  return D.copos || [];
}

function buscarCopoPorId(id) {
  return (D.copos || []).find(function(c) { return c.id === id; }) || null;
}

// Nome do copo de uma ficha, resolvendo id → nome, com fallback no texto
// livre antigo (f.copo).
function nomeCopoDaFicha(f) {
  if (!f) return '';
  if (f.copoId) {
    var c = buscarCopoPorId(f.copoId);
    if (c) return c.nome;
  }
  return f.copo || '';
}

function rCoposBiblioteca() {
  var cont = document.getElementById('copos-biblioteca-body');
  if (!cont) return;
  if (!D.copos) D.copos = [];
  var lista = (D.copos || []).slice().sort(function(a, b) { return (a.nome || '').localeCompare(b.nome || ''); });

  var html = '<div style="font-size:11px;color:var(--text3);margin-bottom:12px">' +
    'Cadastre cada copo/taça uma vez com a foto. Nas Fichas de Coquetéis você escolhe o copo desta lista, e na Folha de Separação dá pra trocar o copo só de um evento.' +
  '</div>';

  html += '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' +
    '<input class="inp" id="copo-novo-nome" type="text" placeholder="Nome do copo (ex: Taça Coupe)" style="flex:1;min-width:200px">' +
    '<button class="btn" style="background:var(--green)" onclick="adicionarCopo()">+ Adicionar copo</button>' +
  '</div>';

  html += lista.length ? ('<div style="display:grid;gap:8px">' + lista.map(function(c) {
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:12px">' +
      '<img id="copo-thumb-' + c.id + '" src="" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:6px;border:1px solid var(--border2);background:var(--bg2)">' +
      '<input class="inp" type="text" value="' + (c.nome || '').replace(/"/g, '&quot;') + '" onchange="renomearCopo(\'' + c.id + '\',this.value)" style="flex:1;font-size:12px">' +
      '<label class="btn-sm" style="background:var(--bg2);cursor:pointer">📷 Foto' +
        '<input type="file" accept="image/*" onchange="copoSelecionarFoto(this,\'' + c.id + '\')" style="display:none"></label>' +
      '<button class="btn-sm btn-red" onclick="excluirCopo(\'' + c.id + '\')">×</button>' +
    '</div>';
  }).join('') + '</div>') : '<div style="font-size:12px;color:var(--text3)">Nenhum copo cadastrado ainda.</div>';

  cont.innerHTML = html;

  // Carrega as fotos (documento próprio por copo)
  lista.forEach(function(c) {
    if (typeof window.buscarCopoFoto !== 'function') return;
    window.buscarCopoFoto(c.id).then(function(b64) {
      var img = document.getElementById('copo-thumb-' + c.id);
      if (img && b64) img.src = b64;
    });
  });
}

function adicionarCopo() {
  var nome = (document.getElementById('copo-novo-nome')?.value || '').trim();
  if (!nome) { alert('Digite o nome do copo.'); return; }
  if (!D.copos) D.copos = [];
  if (D.copos.some(function(c) { return (c.nome || '').toUpperCase() === nome.toUpperCase(); })) {
    alert('Já existe um copo com esse nome.');
    return;
  }
  D.copos.push({ id: _gerarId('COP'), nome: nome });
  sv('copos');
  rCoposBiblioteca();
}

function renomearCopo(id, nome) {
  var c = buscarCopoPorId(id);
  if (!c) return;
  c.nome = (nome || '').trim();
  sv('copos');
}

function excluirCopo(id) {
  var c = buscarCopoPorId(id);
  if (!c) return;
  var emUso = (D.fichas || []).filter(function(f) { return f.copoId === id; });
  var aviso = emUso.length ? '\n\n' + emUso.length + ' ficha(s) usam este copo e vão ficar sem copo: ' + emUso.map(function(f){return f.nome;}).join(', ') : '';
  if (!confirm('Excluir o copo "' + c.nome + '"?' + aviso)) return;
  D.copos = (D.copos || []).filter(function(x) { return x.id !== id; });
  sv('copos');
  emUso.forEach(function(f) { f.copoId = null; });
  if (emUso.length) sv('fichas');
  if (typeof window.excluirCopoFoto === 'function') window.excluirCopoFoto(id);
  rCoposBiblioteca();
}

function copoSelecionarFoto(inputEl, copoId) {
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
      if (typeof window.salvarCopoFoto === 'function') {
        window.salvarCopoFoto(copoId, b64).then(function() {
          var t = document.getElementById('copo-thumb-' + copoId);
          if (t) t.src = b64;
        });
      }
    };
    img.src = e.target.result;
  };
  leitor.readAsDataURL(file);
  inputEl.value = '';
}

// ── Geração da Ficha Técnica ──────────────────────────────────────────────

// Linhas de ingrediente: "50ML de APEROL" (sem medida = só o nome).
function _ftLinhasIngredientes(ficha) {
  return (ficha.itens || []).map(function(i) {
    var med = '';
    if (i.qtd != null && i.qtd !== '' && !isNaN(parseFloat(i.qtd))) {
      var un = (i.un && i.un !== '—') ? i.un : '';
      med = parseFloat(i.qtd) + (un ? un : '') + ' de ';
    }
    return med + i.nome;
  });
}

function _ftCardHtml(ficha, copoNome, fotoB64) {
  var ingr = _ftLinhasIngredientes(ficha).map(function(l) { return '<div>' + _ftEsc(l) + '</div>'; }).join('');
  var fotoHtml = fotoB64
    ? '<img src="' + fotoB64 + '" style="width:120px;height:150px;object-fit:contain">'
    : '<div style="width:120px;height:150px;border:1px dashed #ccc;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:9px">sem foto</div>';
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
    'body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;margin:24px}' +
    '.ft-head{font-weight:bold;font-size:12px;margin-bottom:2px}' +
    '.ft-sub{font-size:11px;color:#555;margin-bottom:2px}' +
    '.ft-band{background:#eee;text-align:center;font-style:italic;font-weight:bold;padding:4px;margin:10px 0 14px;border-top:1px solid #999;border-bottom:1px solid #999}' +
    '.ft-card{border:1px solid #ddd;margin-bottom:14px;page-break-inside:avoid}' +
    '.ft-title{background:#111;color:#fff;font-weight:bold;font-size:12px;padding:5px 10px;display:flex;justify-content:space-between}' +
    '.ft-body{display:flex;gap:16px;padding:12px}' +
    '.ft-foto{flex:0 0 120px}' +
    '.ft-conteudo{flex:1;line-height:1.7}' +
    '.ft-ingr{margin-bottom:8px}' +
    '.ft-lin{margin:2px 0}' +
    '.ft-blk{margin-top:8px}' +
    '@media print{body{margin:10mm}.ft-card{border-color:#999}}' +
    '</style></head><body>' +
    (tituloCabecalho ? '<div class="ft-head">' + _ftEsc(tituloCabecalho) + '</div>' : '') +
    (subtitulo ? '<div class="ft-sub">' + _ftEsc(subtitulo) + '</div>' : '') +
    '<div class="ft-band">Ficha técnica</div>' +
    cardsHtml +
    '<div style="font-size:9px;color:#999;margin-top:16px">Impresso em ' + new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR') + '</div>' +
    '<script>window.onload=function(){window.print()}<\/script>' +
    '</body></html>');
  w.document.close();
}

// Resolve o copoId efetivo de uma ficha num evento (override do evento vence).
function _ftCopoIdEfetivo(ficha, coposOverride) {
  if (coposOverride && coposOverride[ficha.id]) return coposOverride[ficha.id];
  return ficha.copoId || null;
}

// Gera a Ficha Técnica de uma Folha de Separação (todos os coquetéis dela).
function imprimirFichaTecnica(sepId) {
  var s = (D.separacoes || []).find(function(x) { return x.id === sepId; });
  if (!s) return;
  var ids = s.coqueteisIds || [];
  var fichas = ids.map(function(id) { return (D.fichas || []).find(function(f) { return f.id === id; }); }).filter(Boolean);
  if (!fichas.length) { alert('Esta folha não tem coquetéis marcados — abra a folha e marque os coquetéis do evento.'); return; }

  var w = window.open('', '_blank'); // síncrono: evita bloqueio de pop-up
  var override = s.coposOverride || {};
  var buscas = fichas.map(function(f) {
    var cid = _ftCopoIdEfetivo(f, override);
    if (cid && typeof window.buscarCopoFoto === 'function') return window.buscarCopoFoto(cid);
    return Promise.resolve(null);
  });

  Promise.all(buscas).then(function(fotos) {
    var cards = fichas.map(function(f, i) {
      var cid = _ftCopoIdEfetivo(f, override);
      var nome = cid ? ((buscarCopoPorId(cid) || {}).nome || '') : nomeCopoDaFicha(f);
      return _ftCardHtml(f, nome, fotos[i]);
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
  var p = f.copoId && typeof window.buscarCopoFoto === 'function' ? window.buscarCopoFoto(f.copoId) : Promise.resolve(null);
  p.then(function(foto) {
    _ftEscreverDocumento(w, '', '', _ftCardHtml(f, nomeCopoDaFicha(f), foto), 'Ficha Técnica — ' + f.nome);
  });
}
