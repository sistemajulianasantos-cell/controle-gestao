// ─── SELECTS ──────────────────────────────────────────────────────────────────
function populateSels(){
  const co=cats.map(c=>`<option>${c}</option>`).join('');
  ['fcat','mcat','abcat','nova-cont-cat','precos-cat','precos-edit-cat'].forEach(id=>{
    const el=document.getElementById(id);
    if(el&&el.options.length<=1)el.innerHTML+=(id.includes('precos')||id.includes('cont')?'<option value="">Todas</option>':'')+co;
  });
  const fornOpts=D.fornecedores.map(f=>`<option value="${f.nome}">${f.nome}</option>`).join('');
  ['eforn'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<option value="">Selecione ou deixe em branco</option>'+fornOpts;});
  const po=nomes.map(n=>`<option value="${n}">${n}</option>`).join('');
  ['eprod','qprod','fi-prod'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<option value="">Selecione...</option>'+po;});
}

