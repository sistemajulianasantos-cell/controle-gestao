// ─── RELATÓRIO ───────────────────────────────────────────────────────────────
let relSort={col:'nome',dir:1};
let relFiltro='todos';
function setRelFiltro(f){
  relFiltro=f;
  document.querySelectorAll('[id^="rf-"]').forEach(b=>b.classList.remove('active'));
  const btn=document.getElementById('rf-'+f);if(btn)btn.classList.add('active');
  rRelatorio();
}
function setRelSort(col){
  if(relSort.col===col)relSort.dir*=-1;else{relSort.col=col;relSort.dir=col==='nome'?1:-1;}
  rRelatorio();
}
function rRelatorio(){
  const allF=[...D.festas,...FESTAS_PRELOAD.filter(p=>!D.festas.find(f=>f.id===p.id))];
  const allQbrCopos=[];
  QUEBRAS_EVENTO_PRELOAD.forEach(ev=>ev.itens.forEach(item=>{
    const ja=allQbrCopos.find(x=>x.prod===item.prod);
    if(ja){ja.qtd+=item.qtd;ja.valor+=item.total;}else allQbrCopos.push({prod:item.prod,qtd:item.qtd,valor:item.total});
  }));
  D.quebras.filter(q=>!QUEBRAS_PRELOAD.find(p=>p.prod===q.prod&&p.data===q.data&&p.qtd===q.qtd)).forEach(q=>{
    const ja=allQbrCopos.find(x=>x.prod===q.prod);
    if(ja){ja.qtd+=q.qtd;ja.valor+=q.qtd*Number(q.custo||0);}else allQbrCopos.push({prod:q.prod,qtd:q.qtd,valor:q.qtd*Number(q.custo||0)});
  });
  const totalQbrPecas=allQbrCopos.reduce((a,c)=>a+c.qtd,0);
  const allRowsCards=nomes.map(nome=>{
    const m=MAR[nome],a=ABR[nome];if(!a)return null;
    const totM=m.est+m.salao,totA=a.est+a.salao;
    const isCopo=m.cat==='COPOS/TAÇAS';
    const ent=D.entradas.filter(e=>e.prod===nome).reduce((s,e)=>s+e.qtd,0);
    const fc=isCopo?0:allF.filter(f=>f.status==='encerrada').flatMap(f=>f.itens.filter(i=>i.prod===nome)).reduce((s,i)=>s+((i.consumido||i.qtd)||0),0);
    const qbr=isCopo?(allQbrCopos.find(x=>x.prod===nome)?.qtd||0):D.quebras.filter(q=>q.prod===nome).reduce((s,q)=>s+q.qtd,0);
    const esp=totM+ent-fc-qbr;const diff=totA-esp;
    return{nome,cat:m.cat,totM,ent,fc,qbr,esp,totA,diff,uso:fc+qbr};
  }).filter(Boolean);
  const tiposUsados=allRowsCards.filter(r=>r.uso>0).length;
  const totalTipos=allRowsCards.filter(r=>r.totM>0||r.totA>0).length;
  const diffNegativa=allRowsCards.filter(r=>r.diff<0).reduce((a,r)=>a+Math.abs(r.diff),0);
  const prodComDiffNeg=allRowsCards.filter(r=>r.diff<0).length;
  document.getElementById('rel-cards').innerHTML=`
    <div class="card blue"><div class="card-label">Entradas lançadas</div><div class="card-value">${D.entradas.length}</div></div>
    <div class="card green"><div class="card-label">Produtos utilizados</div><div class="card-value">${tiposUsados} <span style="font-size:14px;font-weight:400;color:var(--text3)">/ ${totalTipos}</span></div><div class="card-sub">tipos com saída no período</div></div>
    <div class="card amber"><div class="card-label">Peças quebradas</div><div class="card-value">${fN(totalQbrPecas)}</div><div class="card-sub">${allQbrCopos.length} tipos de peça</div></div>
    <div class="card red"><div class="card-label">⚠ Diferença não explicada</div><div class="card-value">${fN(diffNegativa)} un</div><div class="card-sub">${prodComDiffNeg} produto${prodComDiffNeg!==1?'s':''} — verificar</div></div>`;
  const relCatEl=document.getElementById('rel-cat');
  if(relCatEl&&relCatEl.options.length<=1){relCatEl.innerHTML='<option value="">Todas as categorias</option>'+[...new Set(nomes.map(n=>MAR[n].cat))].sort().map(c=>`<option value="${c}">${c}</option>`).join('');}
  const catF=relCatEl?relCatEl.value:'';
  const busca=(document.getElementById('rel-busca')?.value||'').toLowerCase();
  let rows=nomes.map(nome=>{
    const m=MAR[nome],a=ABR[nome];if(!a)return null;
    if(catF&&m.cat!==catF)return null;if(busca&&!nome.toLowerCase().includes(busca))return null;
    const totM=m.est+m.salao,totA=a.est+a.salao;const isCopo=m.cat==='COPOS/TAÇAS';
    const ent=D.entradas.filter(e=>e.prod===nome).reduce((s,e)=>s+e.qtd,0);
    const fc=isCopo?0:allF.filter(f=>f.status==='encerrada').flatMap(f=>f.itens.filter(i=>i.prod===nome)).reduce((s,i)=>s+((i.consumido||i.qtd)||0),0);
    const qbr=isCopo?(allQbrCopos.find(x=>x.prod===nome)?.qtd||0):D.quebras.filter(q=>q.prod===nome).reduce((s,q)=>s+q.qtd,0);
    const esp=totM+ent-fc-qbr;const diff=totA-esp;const uso=fc+qbr;
    return{nome,cat:m.cat,isCopo,totM,ent,fc,qbr,esp,totA,diff,uso};
  }).filter(Boolean);
  const filtrosSemSort=['diferenca','zerado','todos'];
  if(relFiltro==='mais-usado')rows=rows.filter(r=>r.uso>0).sort((a,b)=>b.uso-a.uso);
  else if(relFiltro==='menos-usado')rows=rows.filter(r=>r.totM>0||r.totA>0).sort((a,b)=>a.uso-b.uso);
  else if(relFiltro==='diferenca')rows=rows.filter(r=>r.diff!==0);
  else if(relFiltro==='positivo')rows=rows.filter(r=>r.diff>0).sort((a,b)=>b.diff-a.diff);
  else if(relFiltro==='negativo')rows=rows.filter(r=>r.diff<0).sort((a,b)=>a.diff-b.diff);
  else if(relFiltro==='zerado')rows=rows.filter(r=>r.uso===0&&r.ent===0);
  else rows=rows.filter(r=>r.totM>0||r.totA>0||r.ent>0||r.uso>0);
  if(filtrosSemSort.includes(relFiltro)){
    const sortMap={nome:'nome',inicial:'totM',entradas:'ent',quebras:'qbr',esperado:'esp',contado:'totA',diff:'diff'};
    const key=sortMap[relSort.col]||'nome';
    rows.sort((a,b)=>{const av=typeof a[key]==='string'?a[key]:Number(a[key]);const bv=typeof b[key]==='string'?b[key]:Number(b[key]);return av<bv?-relSort.dir:av>bv?relSort.dir:0;});
  }
  ['nome','inicial','entradas','quebras','esperado','contado','diff'].forEach(c=>{const el=document.getElementById('rs-'+c);if(el)el.textContent=relSort.col===c?(relSort.dir===1?' ▲':' ▼'):'';});
  document.getElementById('tab-rel').innerHTML=rows.map(r=>{
    const dc=r.diff===0?'neu':r.diff>0?'up':'dn';const dt=r.diff===0?'—':r.diff>0?'▲'+fN(r.diff):'▼'+fN(Math.abs(r.diff));
    const catBadge=r.isCopo?'b-purple':'b-blue';
    return`<tr><td class="bold">${r.nome}</td><td><span class="badge ${catBadge}" style="font-size:9px">${r.cat}</span></td><td>${fN(r.totM)}</td><td style="color:${r.ent?'var(--green)':'var(--text3)'}">${r.ent||'—'}</td><td style="color:${r.qbr?'var(--red)':'var(--text3)'}">${r.qbr||'—'}</td><td class="bold">${fN(r.esp)}</td><td class="bold">${fN(r.totA)}</td><td class="${dc}">${dt}</td></tr>`;
  }).join('')||'<tr><td colspan="8" style="color:var(--text3);text-align:center;padding:16px">Nenhum produto encontrado</td></tr>';
  const footerEl=document.getElementById('rel-footer');
  if(footerEl)footerEl.textContent=`${rows.length} produto${rows.length!==1?'s':''} exibido${rows.length!==1?'s':''}`;
}

