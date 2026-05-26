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
// Cache interno ordenado alfabeticamente
var _eprodLista = [];

function populateEprodList(){
  var prods=(D.produtos||[]);
  _eprodLista = (prods.length ? prods : nomes.map(function(n){return {nome:n};}))
    .slice().sort(function(a,b){return (a.nome||'').localeCompare(b.nome||'','pt-BR');});
}

function filtrarEprod(busca){
  var dd=document.getElementById('eprod-dropdown');
  if(!dd) return;
  var b=(busca||'').toLowerCase().trim();

  var lista=b
    ? _eprodLista.filter(function(p){return (p.nome||'').toLowerCase().includes(b);})
    : _eprodLista;

  if(!lista.length){
    dd.innerHTML='<div style="padding:10px 14px;color:var(--text3);font-size:12px">Nenhum produto encontrado — use "+ Novo" para cadastrar.</div>';
  } else {
    // Destaca a parte digitada em verde
    var esc=b.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    var re=b ? new RegExp('('+esc+')','gi') : null;
    dd.innerHTML=lista.map(function(p){
      var nome=re ? p.nome.replace(re,'<strong style="color:var(--green)">$1</strong>') : p.nome;
      var nomeEsc=(p.nome||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return '<div onmousedown="selecionarEprod(\''+nomeEsc+'\')" '+
        'style="padding:8px 14px;cursor:pointer;font-size:12px;color:var(--text);border-bottom:1px solid var(--border)" '+
        'onmouseover="this.style.background=\'var(--bg3)\'" onmouseout="this.style.background=\'\'">'+nome+'</div>';
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
