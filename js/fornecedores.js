// ─── FORNECEDORES ────────────────────────────────────────────────────────────
let fornView='lista';
function setFornView(v){
  fornView=v;
  ['lista','novo'].forEach(x=>{
    document.getElementById('forn-v-'+x).classList.toggle('active',x===v);
    document.getElementById('forn-view-'+x).style.display=x===v?'block':'none';
  });
  if(v==='lista')rFornecedores();
}
function salvarForn(){
  const nome=document.getElementById('fn-nome').value.trim();
  if(!nome){alert2('Nome é obrigatório','error');return;}
  if(D.fornecedores.find(f=>f.nome.toLowerCase()===nome.toLowerCase())){alert2('Fornecedor já cadastrado','error');return;}
  D.fornecedores.push({nome,tel:document.getElementById('fn-tel').value,contato:document.getElementById('fn-contato').value,obs:document.getElementById('fn-obs').value,criadoEm:td()});
  sv('fornecedores');['fn-nome','fn-tel','fn-contato','fn-obs'].forEach(id=>document.getElementById(id).value='');
  populateSels();alert2('Fornecedor cadastrado!');setFornView('lista');
}
function rFornecedores(){
  const ct=document.getElementById('forn-count');if(ct)ct.textContent=D.fornecedores.length+' cadastrado(s)';
  document.getElementById('tab-forn').innerHTML=D.fornecedores.map(f=>{
    const compras=D.entradas.filter(e=>e.forn===f.nome).length;
    return`<tr><td class="bold">${f.nome}</td><td style="color:var(--text2)">${f.contato||'—'}</td><td style="font-family:var(--mono);color:var(--text2)">${f.tel||'—'}</td><td><span class="badge b-blue">${compras} lançamento(s)</span></td><td style="color:var(--text3);font-size:10px">${f.obs||'—'}</td></tr>`;
  }).join('')||'<tr><td colspan="5" style="color:var(--text3);text-align:center;padding:16px">Nenhum fornecedor cadastrado</td></tr>';
}

// ─── COMPARATIVO DE PREÇOS ───────────────────────────────────────────────────
function rComparativo(){
  const busca=(document.getElementById('comp-busca')?.value||'').toLowerCase();
  const container=document.getElementById('comp-body');if(!container)return;
  const byProd={};
  D.entradas.forEach(e=>{
    if(!e.custo||!Number(e.custo))return;if(busca&&!e.prod.toLowerCase().includes(busca))return;
    if(!byProd[e.prod])byProd[e.prod]={prod:e.prod,compras:[]};
    byProd[e.prod].compras.push({data:e.data,forn:e.forn||e.nf||'Sem fornecedor',custo:Number(e.custo),qtd:Number(e.qtd),nf:e.nf||'—'});
  });
  const prods=Object.values(byProd).sort((a,b)=>a.prod.localeCompare(b.prod));
  if(!prods.length){container.innerHTML='<div style="padding:16px;font-size:12px;color:var(--text3)">Nenhuma entrada com valor lançada ainda. Lance entradas com custo unitário para ver o comparativo.</div>';return;}
  container.innerHTML=prods.map(p=>{
    const custos=p.compras.map(c=>c.custo);const minCusto=Math.min(...custos);const maxCusto=Math.max(...custos);const temVariacao=minCusto!==maxCusto;
    const economia=temVariacao?((maxCusto-minCusto)/maxCusto*100).toFixed(0):0;
    const comprasHtml=p.compras.sort((a,b)=>a.custo-b.custo).map(c=>{
      const isMelhor=c.custo===minCusto;const isPior=c.custo===maxCusto&&temVariacao;
      return`<div style="display:grid;grid-template-columns:1fr 120px 80px 80px 80px;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;align-items:center">
        <span style="color:var(--text2)">${c.forn}</span><span style="font-size:10px;color:var(--text3)">${fd(c.data)} · NF ${c.nf}</span>
        <span style="font-family:var(--mono);color:var(--text2)">${fN(c.qtd)} un</span>
        <span style="font-family:var(--mono);font-weight:600;color:${isMelhor?'var(--green)':isPior?'var(--red)':'var(--text)'}">R$ ${c.custo.toFixed(2)}</span>
        <span>${isMelhor?'<span class="badge b-green">Melhor</span>':isPior?'<span class="badge b-red">Mais caro</span>':'<span class="badge b-neutral">—</span>'}</span>
      </div>`;}).join('');
    return`<div style="margin:8px 16px;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">
      <div style="padding:10px 14px;background:var(--bg3);display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:13px;font-weight:600;color:var(--text)">${p.prod}</div><div style="font-size:10px;color:var(--text3);margin-top:2px">${p.compras.length} compra(s) com preço registrado</div></div>
        ${temVariacao?`<div style="text-align:right"><div style="font-size:11px;color:var(--text3)">Variação de preço</div><div style="font-size:14px;font-weight:600;font-family:var(--mono);color:var(--amber)">${economia}% de diferença</div><div style="font-size:10px;color:var(--text3)">R$ ${minCusto.toFixed(2)} → R$ ${maxCusto.toFixed(2)}</div></div>`:`<span class="badge b-neutral">Preço estável</span>`}
      </div>
      <div style="padding:0 14px">
        <div style="display:grid;grid-template-columns:1fr 120px 80px 80px 80px;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Fornecedor</span>
          <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Data / NF</span>
          <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Quantidade</span>
          <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Custo unit.</span>
          <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Status</span>
        </div>${comprasHtml}
      </div>
    </div>`;}).join('');
}

