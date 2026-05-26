// ─── ENTRADAS ────────────────────────────────────────────────────────────────
let nfEntItens=[];
function addIE(){
  const prod=document.getElementById('eprod').value;
  const qtd=Number(document.getElementById('eqtd').value);
  const custo=document.getElementById('ecusto').value;
  if(!prod||!qtd||qtd<=0){alert2('Selecione produto e informe a quantidade','error');return;}
  const ex=nfEntItens.find(i=>i.prod===prod);
  if(ex){ex.qtd+=qtd;}else{nfEntItens.push({prod,qtd,custo:custo?Number(custo):null});}
  document.getElementById('eqtd').value='';
  document.getElementById('ecusto').value='';
  document.getElementById('eprod').focus();
  rNFEntItens();
}
function rNFEntItens(){
  const c=document.getElementById('nf-ent-itens');
  const ct=document.getElementById('nf-ent-count');
  if(!nfEntItens.length){
    c.innerHTML='<div style="font-size:11px;color:var(--text3);padding:12px 14px">Nenhum produto adicionado</div>';
    if(ct)ct.textContent='';return;
  }
  const totalNF=nfEntItens.reduce((a,i)=>a+(i.custo?i.qtd*i.custo:0),0);
  c.innerHTML=`<div style="display:grid;grid-template-columns:1fr 80px 90px 28px;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg4);z-index:1">
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</span>
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd</span>
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Custo unit.</span>
    <span></span>
  </div>`+nfEntItens.map((i,idx)=>`
    <div style="display:grid;grid-template-columns:1fr 80px 90px 28px;gap:8px;align-items:center;padding:7px 14px;font-size:12px;border-bottom:1px solid var(--border)">
      <span style="color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.prod}</span>
      <span style="font-weight:600;font-family:var(--mono);color:var(--green)">${fN(i.qtd)}</span>
      <span style="font-family:var(--mono);color:${i.custo?'var(--text2)':'var(--text3)'}">${i.custo?'R$ '+Number(i.custo).toFixed(2):'—'}</span>
      <span style="cursor:pointer;color:var(--red);font-size:16px;line-height:1;text-align:center" onclick="nfEntItens.splice(${idx},1);rNFEntItens()">×</span>
    </div>`).join('');
  if(ct){
    ct.textContent=nfEntItens.length+' produto'+(nfEntItens.length>1?'s':'')+' · '+(totalNF>0?'Total: R$ '+totalNF.toLocaleString('pt-BR',{minimumFractionDigits:2}):'sem valores');
  }
}
// ─── VERIFICAÇÃO DE NF DUPLICADA ─────────────────────────────────────────────
function verificarNFDuplicada(){
  const nf=(document.getElementById('enf')?.value||'').trim();
  const av=document.getElementById('enf-aviso');
  const inp=document.getElementById('enf');
  if(!av) return;

  if(!nf){
    av.style.display='none';
    if(inp) inp.style.borderColor='';
    return;
  }

  const dups=(D.entradas||[]).filter(e=>e.nf&&e.nf.trim()===nf);
  if(!dups.length){
    av.style.display='none';
    if(inp) inp.style.borderColor='';
    return;
  }

  // Agrupa por data para listar todas as ocorrências
  const porData={};
  dups.forEach(e=>{
    if(!porData[e.data]) porData[e.data]={forn:e.forn||'',itens:0};
    porData[e.data].itens++;
  });
  const linhas=Object.entries(porData)
    .sort((a,b)=>b[0].localeCompare(a[0]))
    .map(([dt,v])=>`${fd(dt)}${v.forn?' · '+v.forn:''} — ${v.itens} item${v.itens>1?'s':''}`)
    .join('<br>');

  // Destaca o campo de NF com borda laranja
  if(inp) inp.style.borderColor='#F7C84F';

  // Exibe o banner
  av.style.display='block';
  av.innerHTML=`⚠️ <strong>NF ${nf} já lançada no sistema</strong><br><span style="font-size:11px;opacity:.9">${linhas}</span>`;
}

function limparNFEnt(){
  nfEntItens=[];
  ['enf','eobs'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  const ef=document.getElementById('eforn'); if(ef) ef.value='';
  document.getElementById('edata').value=td();
  // Limpa aviso e borda
  const av=document.getElementById('enf-aviso'); if(av){av.style.display='none';av.innerHTML='';}
  const inp=document.getElementById('enf'); if(inp) inp.style.borderColor='';
  rNFEntItens();
}

function regEnt(){
  const nf=document.getElementById('enf').value.trim();
  const data=document.getElementById('edata').value;
  const obs=document.getElementById('eobs').value;
  if(!data){alert2('Informe a data','error');return;}
  if(!nfEntItens.length){alert2('Adicione pelo menos um produto','error');return;}

  // Bloqueia com confirmação se NF já existir
  if(nf){
    const dups=(D.entradas||[]).filter(e=>e.nf&&e.nf.trim()===nf);
    if(dups.length){
      const dtAnterior=dups.slice().sort((a,b)=>b.data.localeCompare(a.data))[0].data;
      if(!confirm(`⚠ A NF "${nf}" já foi lançada em ${fd(dtAnterior)} com ${dups.length} item(s).\n\nDeseja lançar mesmo assim?`)) return;
    }
  }

  const forn=document.getElementById('eforn').value;
  nfEntItens.forEach(i=>{D.entradas.push({prod:i.prod,data,qtd:i.qtd,custo:i.custo||'',nf,forn,obs});});
  sv('entradas');
  alert2(`${nfEntItens.length} produto(s) lançado(s) com sucesso!`);
  limparNFEnt();
  rEntradas();
}
function rEntradas(){
  const groups={};
  D.entradas.forEach((e,idx)=>{
    const key=(e.nf||'SEM NF')+'|'+e.data;
    if(!groups[key])groups[key]={nf:e.nf||'Sem NF',data:e.data,forn:e.forn||'',obs:e.obs,itens:[]};
    groups[key].itens.push({...e,idx});
  });
  const sorted=Object.values(groups).sort((a,b)=>b.data.localeCompare(a.data));
  const totalGeral=D.entradas.reduce((a,e)=>a+(e.custo?Number(e.qtd)*Number(e.custo):0),0);
  const totEl=document.getElementById('tot-ent');
  if(totEl)totEl.textContent=totalGeral>0?'Total: R$ '+totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
  const container=document.getElementById('lista-entradas');
  if(!container)return;
  if(!sorted.length){container.innerHTML='<div style="font-size:12px;color:var(--text3);padding:14px">Nenhuma entrada lançada.</div>';return;}
  container.innerHTML=sorted.map(g=>{
    const totalNF=g.itens.reduce((a,i)=>a+(i.custo?Number(i.qtd)*Number(i.custo):0),0);
    const totalQtd=g.itens.reduce((a,i)=>a+Number(i.qtd),0);
    const itensHtml=g.itens.map(i=>`
      <div style="display:grid;grid-template-columns:1fr 60px 90px 80px;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:11px;align-items:center">
        <span style="color:var(--text2)">${i.prod}</span>
        <span style="font-family:var(--mono);color:var(--green);font-weight:600">${fN(i.qtd)}</span>
        <span style="font-family:var(--mono);color:var(--text3)">${i.custo?'R$ '+Number(i.custo).toFixed(2):'—'}</span>
        <span style="font-family:var(--mono);font-weight:600;color:${i.custo?'var(--text2)':'var(--text3)'}">${i.custo?'R$ '+(Number(i.qtd)*Number(i.custo)).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
      </div>`).join('');
    return`<div class="festa-card enc" style="margin:8px 16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text)">${g.nf}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${fd(g.data)}${g.forn?' · '+g.forn:''}${g.obs?' · '+g.obs:''} · ${g.itens.length} produto(s)</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:16px;font-weight:600;font-family:var(--mono);color:var(--green)">${totalNF>0?'R$ '+totalNF.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</div>
          <div style="font-size:10px;color:var(--text3)">${fN(totalQtd)} unidades</div>
        </div>
      </div>
      <details>
        <summary style="font-size:11px;color:var(--text3);cursor:pointer;user-select:none;margin-bottom:6px">Ver produtos ▾</summary>
        <div style="margin-top:6px">
          <div style="display:grid;grid-template-columns:1fr 60px 90px 80px;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:2px">
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Unit.</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Total</span>
          </div>${itensHtml}
        </div>
      </details>
    </div>`;
  }).join('');
}

