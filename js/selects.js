// ─── SELECTS ──────────────────────────────────────────────────────────────────
function populateSels(){
  const co=cats.map(c=>`<option>${c}</option>`).join('');
  ['fcat','mcat','abcat','nova-cont-cat','precos-cat','precos-edit-cat'].forEach(id=>{
    const el=document.getElementById(id);
    if(el&&el.options.length<=1)el.innerHTML+=(id.includes('precos')||id.includes('cont')?'<option value="">Todas</option>':'')+co;
  });
  const fornOpts=D.fornecedores.map(f=>`<option value="${f.nome}">${f.nome}</option>`).join('');
  ['eforn'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<option value="">Selecione ou deixe em branco</option>'+fornOpts;});
  // qprod e fi-prod continuam usando nomes do MAR (estoque histórico)
  const po=nomes.map(n=>`<option value="${n}">${n}</option>`).join('');
  ['qprod','fi-prod'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<option value="">Selecione...</option>'+po;});
  // #eprod (lançamento de NF) usa D.produtos — catálogo de produtos cadastrados
  populateEprodList();
}

// Popula o <select id="eprod"> a partir de D.produtos.
// Chamado no startup e após cadastrar um produto novo pelo modal rápido.
// Fallback para nomes do MAR caso D.produtos esteja vazio.
function populateEprodList(){
  const sel=document.getElementById('eprod');
  if(!sel) return;
  const prods=(D.produtos||[]);
  const opts=prods.length
    ? prods.slice().sort((a,b)=>(a.nome||'').localeCompare(b.nome||''))
           .map(p=>`<option value="${p.nome.replace(/"/g,'&quot;')}">${p.nome}</option>`).join('')
    : nomes.map(n=>`<option value="${n}">${n}</option>`).join('');
  sel.innerHTML='<option value="">Selecionar produto...</option>'+opts;
}
