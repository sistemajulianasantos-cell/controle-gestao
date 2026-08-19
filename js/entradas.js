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
  // Limpa seleção e volta o foco para o campo de busca de produto
  document.getElementById('eprod').value='';
  const s=document.getElementById('eprod-search');
  if(s){s.value='';s.focus();}
  if(typeof filtrarEprod==='function') filtrarEprod('');
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

  // ── Atualiza D.precos com o custo mais recente de cada produto que teve valor informado
  let precosAtualizados=false;
  if(!D.precos) D.precos={};
  nfEntItens.forEach(i=>{
    if(!i.custo) return;
    if(!D.precos[i.prod]) D.precos[i.prod]={};
    // Só sobrescreve se esta data for >= à última compra registrada
    const ultData=D.precos[i.prod].ultimaCompra||'';
    if(!ultData||data>=ultData){
      D.precos[i.prod].custo=i.custo;
      D.precos[i.prod].ultimaCompra=data;
      D.precos[i.prod].ultimoFornecedor=forn||'';
      precosAtualizados=true;
    }
  });
  if(precosAtualizados) sv('precos');

  alert2(`${nfEntItens.length} produto(s) lançado(s) com sucesso!`);
  limparNFEnt();
  rEntradas();
}
function normalizarNF(nf){
  if(!nf)return'';
  return nf.replace(/[\s.\-\/\\]/g,'').replace(/^0+/,'').toLowerCase();
}

// ─── VÍNCULO COM DESPESAS (NF lançada mas sem entrada de produtos) ──────────
function _despesasNFPendentesEntrada(){
  const nfsComEntrada=new Set((D.entradas||[]).filter(e=>e.nf).map(e=>normalizarNF(e.nf)));
  return (D.despesas||[]).filter(d=>{
    if(!d.numeroNF||!d.numeroNF.trim())return false;
    return !nfsComEntrada.has(normalizarNF(d.numeroNF));
  }).sort((a,b)=>(b.data||'').localeCompare(a.data||''));
}

function rEntradasNFPendentes(){
  const el=document.getElementById('ent-nf-pendentes');
  if(!el)return;
  const pendentes=_despesasNFPendentesEntrada();
  if(!pendentes.length){el.style.display='none';el.innerHTML='';return;}
  el.style.display='block';
  el.innerHTML=`<div class="sec" style="margin:0 0 16px;border-left:3px solid #F7C84F">
    <div class="sec-head"><span class="sec-title" style="color:#F7C84F">⚠ ${pendentes.length} NF lançada(s) em Despesas aguardando entrada de produtos</span></div>
    <div style="padding:8px 16px 14px;display:flex;flex-direction:column;gap:6px">
      ${pendentes.map(d=>`
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:12px;color:var(--text2);background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:7px 12px">
          <span><strong style="color:var(--text)">NF ${d.numeroNF}</strong> — ${d.fornecedor||d.descricao||'—'} · ${fd(d.data)} · R$ ${Number(d.valor||0).toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
          <button class="btn-sm" onclick="_preencherEntradaDaDespesa('${d.id}')" style="background:var(--bg2);border:1px solid var(--border2);color:var(--text);font-size:11px;padding:3px 10px;white-space:nowrap">Dar entrada</button>
        </div>`).join('')}
    </div>
  </div>`;
}

function _preencherEntradaDaDespesa(despId){
  const d=(D.despesas||[]).find(x=>x.id===despId);
  if(!d)return;
  const enf=document.getElementById('enf'); if(enf)enf.value=d.numeroNF||'';
  const edata=document.getElementById('edata'); if(edata)edata.value=d.data||'';
  const eforn=document.getElementById('eforn'); if(eforn)eforn.value=d.fornecedor||'';
  verificarNFDuplicada();
  document.getElementById('enf')?.scrollIntoView({behavior:'smooth',block:'center'});
}

function rEntradas(){
  rEntradasNFPendentes();
  const groups={};
  D.entradas.forEach((e,idx)=>{
    const key=(e.nf||'SEM NF')+'|'+e.data;
    if(!groups[key])groups[key]={key,nf:e.nf||'Sem NF',data:e.data,forn:e.forn||'',obs:e.obs,itens:[]};
    groups[key].itens.push({...e,idx});
  });
  const sorted=Object.values(groups).sort((a,b)=>b.data.localeCompare(a.data));

  // Duplicity detection: NFs whose normalized form matches another group
  const normMap={};
  sorted.forEach(g=>{
    if(!g.nf||g.nf==='Sem NF')return;
    const n=normalizarNF(g.nf);
    if(n){if(!normMap[n])normMap[n]=[];normMap[n].push(g.key);}
  });
  const dupKeys=new Set();
  Object.values(normMap).forEach(keys=>{if(keys.length>1)keys.forEach(k=>dupKeys.add(k));});

  const totalGeral=D.entradas.reduce((a,e)=>a+(e.custo?Number(e.qtd)*Number(e.custo):0),0);
  const totEl=document.getElementById('tot-ent');
  if(totEl)totEl.textContent=totalGeral>0?'Total: R$ '+totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
  const container=document.getElementById('lista-entradas');
  if(!container)return;
  if(!sorted.length){container.innerHTML='<div style="font-size:12px;color:var(--text3);padding:14px">Nenhuma entrada lançada.</div>';return;}
  container.innerHTML=sorted.map(g=>{
    const totalNF=g.itens.reduce((a,i)=>a+(i.custo?Number(i.qtd)*Number(i.custo):0),0);
    const totalQtd=g.itens.reduce((a,i)=>a+Number(i.qtd),0);
    const isDup=dupKeys.has(g.key);
    const dupBadge=isDup?`<span style="display:inline-block;margin-left:8px;padding:1px 7px;background:#2A1A00;border:1px solid #F7C84F;border-radius:20px;font-size:9px;font-weight:600;color:#F7C84F;vertical-align:middle">⚠ possível duplicata</span>`:'';
    const keyJson=JSON.stringify(g.key).replace(/"/g,'&quot;');
    const itensHtml=g.itens.map(i=>`
      <div style="display:grid;grid-template-columns:1fr 60px 90px 80px;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:11px;align-items:center">
        <span style="color:var(--text2)">${i.prod}</span>
        <span style="font-family:var(--mono);color:var(--green);font-weight:600">${fN(i.qtd)}</span>
        <span style="font-family:var(--mono);color:var(--text3)">${i.custo?'R$ '+Number(i.custo).toFixed(2):'—'}</span>
        <span style="font-family:var(--mono);font-weight:600;color:${i.custo?'var(--text2)':'var(--text3)'}">${i.custo?'R$ '+(Number(i.qtd)*Number(i.custo)).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
      </div>`).join('');
    return`<div class="festa-card enc" style="margin:8px 16px${isDup?';border-color:#F7C84F55':''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;color:var(--text)">${g.nf}${dupBadge}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${fd(g.data)}${g.forn?' · '+g.forn:''}${g.obs?' · '+g.obs:''} · ${g.itens.length} produto(s)</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;margin-left:12px">
          <div style="text-align:right">
            <div style="font-size:16px;font-weight:600;font-family:var(--mono);color:var(--green)">${totalNF>0?'R$ '+totalNF.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</div>
            <div style="font-size:10px;color:var(--text3)">${fN(totalQtd)} unidades</div>
          </div>
          <div style="display:flex;gap:5px">
            <button onclick="abrirEdicaoNFEnt(${keyJson})" style="font-size:10px;padding:3px 9px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);color:var(--text2);cursor:pointer">✏️ Editar</button>
            <button onclick="excluirNFEnt(${keyJson})" style="font-size:10px;padding:3px 9px;background:#1A0808;border:1px solid #6B2020;border-radius:var(--radius);color:#E05555;cursor:pointer">Excluir</button>
          </div>
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

// ─── EDIÇÃO / EXCLUSÃO DE NF ─────────────────────────────────────────────────
let _nfEditKey=null;
let _nfEditItens=[];

function abrirEdicaoNFEnt(key){
  _nfEditKey=key;
  const g={nf:'',data:'',forn:'',obs:'',itens:[]};
  D.entradas.forEach(e=>{
    if((e.nf||'SEM NF')+'|'+e.data===key){
      g.nf=e.nf||''; g.data=e.data; g.forn=e.forn||''; g.obs=e.obs||'';
      g.itens.push({prod:e.prod,qtd:e.qtd,custo:e.custo});
    }
  });
  document.getElementById('ent-edit-nf').value=g.nf;
  document.getElementById('ent-edit-data').value=g.data;
  document.getElementById('ent-edit-forn').value=g.forn;
  document.getElementById('ent-edit-obs').value=g.obs;
  _nfEditItens=[...g.itens];
  const sel=document.getElementById('ent-edit-addprod');
  if(sel){
    const prods=(D.produtos||[]).slice().sort((a,b)=>(a.nome||'').localeCompare(b.nome||''));
    sel.innerHTML='<option value="">Selecione produto...</option>'+prods.map(p=>`<option value="${p.nome.replace(/"/g,'&quot;')}">${p.nome}</option>`).join('');
  }
  rNFEditItens();
  document.getElementById('m-edit-ent').style.display='flex';
}

function rNFEditItens(){
  const c=document.getElementById('ent-edit-itens');
  if(!c)return;
  if(!_nfEditItens.length){
    c.innerHTML='<div style="font-size:11px;color:var(--text3);padding:8px 12px">Nenhum produto</div>';
    return;
  }
  c.innerHTML=_nfEditItens.map((i,idx)=>`
    <div style="display:grid;grid-template-columns:1fr 80px 100px 28px;gap:6px;align-items:center;padding:7px 10px;border-bottom:1px solid var(--border);font-size:12px">
      <span style="color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${i.prod}">${i.prod}</span>
      <input type="number" class="inp" style="padding:4px 6px;font-size:11px;width:100%" value="${i.qtd}" min="0.01" step="0.01"
        onchange="_nfEditItens[${idx}].qtd=Number(this.value)">
      <input type="number" class="inp" style="padding:4px 6px;font-size:11px;width:100%" value="${i.custo||''}" placeholder="—" min="0" step="0.01"
        onchange="_nfEditItens[${idx}].custo=this.value?Number(this.value):''">
      <span style="cursor:pointer;color:var(--red);font-size:18px;text-align:center;line-height:1" onclick="_nfEditItens.splice(${idx},1);rNFEditItens()">×</span>
    </div>`).join('');
}

function addIEEdit(){
  const sel=document.getElementById('ent-edit-addprod');
  const qtd=Number(document.getElementById('ent-edit-addqtd').value);
  const custo=document.getElementById('ent-edit-addcusto').value;
  const prod=(sel?sel.value:'').trim();
  if(!prod||!qtd||qtd<=0){alert2('Selecione produto e quantidade','error');return;}
  const ex=_nfEditItens.find(i=>i.prod===prod);
  if(ex){ex.qtd+=qtd;}else{_nfEditItens.push({prod,qtd,custo:custo?Number(custo):''});}
  if(sel)sel.value='';
  document.getElementById('ent-edit-addqtd').value='';
  document.getElementById('ent-edit-addcusto').value='';
  rNFEditItens();
}

function salvarEdicaoNFEnt(){
  const newNF=document.getElementById('ent-edit-nf').value.trim();
  const newData=document.getElementById('ent-edit-data').value;
  const newForn=document.getElementById('ent-edit-forn').value.trim();
  const newObs=document.getElementById('ent-edit-obs').value.trim();
  if(!newData){alert2('Informe a data','error');return;}
  if(!_nfEditItens.length){alert2('A nota precisa ter ao menos um produto','error');return;}
  D.entradas=D.entradas.filter(e=>(e.nf||'SEM NF')+'|'+e.data!==_nfEditKey);
  _nfEditItens.forEach(i=>{D.entradas.push({prod:i.prod,data:newData,qtd:i.qtd,custo:i.custo||'',nf:newNF,forn:newForn,obs:newObs});});
  sv('entradas');
  alert2('Nota fiscal atualizada!');
  document.getElementById('m-edit-ent').style.display='none';
  rEntradas();
}

function excluirNFEnt(key){
  const nfLabel=key.split('|')[0];
  const qtd=D.entradas.filter(e=>(e.nf||'SEM NF')+'|'+e.data===key).length;
  if(!confirm(`Excluir a NF "${nfLabel}" com ${qtd} produto(s)? Esta ação não pode ser desfeita.`))return;
  D.entradas=D.entradas.filter(e=>(e.nf||'SEM NF')+'|'+e.data!==key);
  sv('entradas');
  alert2('Nota excluída!');
  rEntradas();
}

