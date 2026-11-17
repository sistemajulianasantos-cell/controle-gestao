// ─── SELECTS ──────────────────────────────────────────────────────────────────
function populateSels(){
  const co=cats.map(c=>`<option>${c}</option>`).join('');
  ['fcat','mcat','abcat','nova-cont-cat','precos-cat','precos-edit-cat'].forEach(id=>{
    const el=document.getElementById(id);
    if(el&&el.options.length<=1)el.innerHTML+=(id.includes('precos')||id.includes('cont')?'<option value="">Todas</option>':'')+co;
  });
  const fornOpts=D.fornecedores.map(f=>`<option value="${f.nome}">${f.nome}</option>`).join('');
  ['eforn'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<option value="">Selecione ou deixe em branco</option>'+fornOpts;});
  // selects legados continuam com nomes do MAR
  const po=nomes.map(n=>`<option value="${n}">${n}</option>`).join('');
  ['qprod','fi-prod'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<option value="">Selecione...</option>'+po;});
  // Carrega o cache do dropdown de produtos da NF
  populateEprodList();
}

// ─── DROPDOWN DE PRODUTO NA NF ────────────────────────────────────────────────
// Itens do Cadastro de Insumos, com o nome exato de lá (pedido dela 11-17:
// digitar "aperol" virava produto novo e duplicava). Busca também pelos nomes
// antigos (aliases), sem acento/maiúscula. Sem "+ Novo": item que não existe
// se cadastra em Cadastro de Insumos.
var _eprodLista = [];

function populateEprodList(){
  _eprodLista = (D.insumos||[]).filter(function(i){return i && i.nome;})
    .slice().sort(function(a,b){return (a.nome||'').localeCompare(b.nome||'','pt-BR');});
}

function _eprodNorm(s){
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
}

function filtrarEprod(busca){
  var dd=document.getElementById('eprod-dropdown');
  if(!dd) return;
  populateEprodList();
  var b=_eprodNorm(busca);

  var lista=b
    ? _eprodLista.filter(function(p){
        return [p.nome].concat(p.aliases||[]).some(function(n){return _eprodNorm(n).indexOf(b)!==-1;});
      })
    : _eprodLista;

  if(!lista.length){
    dd.innerHTML='<div style="padding:10px 14px;color:var(--text3);font-size:12px">Nenhum item do Cadastro de Insumos com esse nome. Cadastre primeiro em Cadastro de Insumos.</div>';
  } else {
    dd.innerHTML=lista.map(function(p){
      var nomeEsc=(p.nome||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'&quot;');
      var html=String(p.nome).replace(/&/g,'&amp;').replace(/</g,'&lt;');
      return '<div onmousedown="selecionarEprod(\''+nomeEsc+'\')" '+
        'style="padding:8px 14px;cursor:pointer;font-size:12px;color:var(--text);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:10px" '+
        'onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'\'">'+
        '<span>'+html+'</span>'+(p.categoria?'<span style="font-size:10px;color:var(--text3);white-space:nowrap">'+String(p.categoria).replace(/</g,'&lt;')+'</span>':'')+'</div>';
    }).join('');
  }
  dd.style.display='block';
}

function selecionarEprod(nome){
  var hidden=document.getElementById('eprod');
  var search=document.getElementById('eprod-search');
  var dd=document.getElementById('eprod-dropdown');
  if(hidden) hidden.value=nome;
  if(search) search.value=nome;
  if(dd)     dd.style.display='none';
  // Foca automaticamente em quantidade
  setTimeout(function(){var q=document.getElementById('eqtd');if(q)q.focus();},80);
}

function fecharEprod(){
  var dd=document.getElementById('eprod-dropdown');
  if(dd) dd.style.display='none';
}

// Navegação por teclado: Enter seleciona primeiro resultado, Escape fecha
function navegarEprod(e){
  if(e.key==='Escape'){ fecharEprod(); return; }
  if(e.key==='Enter'){
    e.preventDefault();
    var dd=document.getElementById('eprod-dropdown');
    if(dd && dd.style.display!=='none'){
      var primeiro=dd.querySelector('div[onmousedown]');
      if(primeiro) primeiro.dispatchEvent(new MouseEvent('mousedown'));
    }
  }
}
