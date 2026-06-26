// ─── FESTAS ──────────────────────────────────────────────────────────────────
let nfItens=[];
function addIF(){
  const prod=document.getElementById('fi-prod').value;
  const qtd=Number(document.getElementById('fi-qtd').value);
  const val=document.getElementById('fi-val').value;
  if(!prod||!qtd||qtd<=0){alert2('Selecione produto e informe a quantidade','error');return;}
  const ex=nfItens.find(i=>i.prod===prod);
  if(ex){ex.qtd+=qtd;if(val)ex.valor=(Number(ex.valor||0)+Number(val));}
  else{nfItens.push({prod,qtd,consumido:qtd,valor:val?Number(val):null});}
  document.getElementById('fi-qtd').value='';
  document.getElementById('fi-val').value='';
  document.getElementById('fi-prod').focus();
  rNFItens();
}
function rNFItens(){
  const c=document.getElementById('nf-itens');
  const ct=document.getElementById('nf-count');
  if(!nfItens.length){c.innerHTML='<div style="font-size:11px;color:var(--text3);padding:12px 14px">Nenhum produto adicionado</div>';if(ct)ct.textContent='';return;}
  c.innerHTML=`<div style="display:grid;grid-template-columns:1fr 80px 100px 28px;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg4);z-index:1">
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</span>
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd</span>
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Valor</span>
    <span></span>
  </div>`+nfItens.map((i,idx)=>`
    <div style="display:grid;grid-template-columns:1fr 80px 100px 28px;gap:8px;align-items:center;padding:7px 14px;font-size:12px;border-bottom:1px solid var(--border)">
      <span style="color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${i.prod}">${i.prod}</span>
      <span style="font-weight:600;font-family:var(--mono);color:var(--blue)">${fN(i.qtd)}</span>
      <span style="font-family:var(--mono);color:${i.valor?'var(--green)':'var(--text3)'}">${i.valor?'R$ '+Number(i.valor).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
      <span style="cursor:pointer;color:var(--red);font-size:16px;line-height:1;text-align:center" onclick="nfItens.splice(${idx},1);rNFItens()">×</span>
    </div>`).join('');
  if(ct)ct.textContent=nfItens.length+' produto'+(nfItens.length>1?'s':'')+' adicionado'+(nfItens.length>1?'s':'');
}
function limparNF(){
  nfItens=[];
  ['fnome','flocal','fresp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const fv=document.getElementById('fvalor');if(fv)fv.value='';
  const fd2=document.getElementById('fdata');if(fd2)fd2.value=td();
  rNFItens();
}
function criarFesta(){
  const nome=document.getElementById('fnome').value.trim();
  const data=document.getElementById('fdata').value;
  if(!nome||!data){alert2('Nome e data são obrigatórios','error');return;}
  const valor=Number(document.getElementById('fvalor')?.value||0);
  D.festas.push({id:'F'+Date.now(),nome,data,local:document.getElementById('flocal').value,resp:document.getElementById('fresp').value,status:'encerrada',valor_total_evento:valor||null,itens:nfItens.map(i=>({prod:i.prod,qtd:i.qtd,consumido:i.qtd,retornado:0,valor:i.valor||null}))});
  sv('festas');nfItens=[];limparNF();alert2('Evento salvo!');setFestaView('geral');
}
function _allFestas(){
  const editedIds  = new Set(D.festas.map(f=>f.id));
  const deletedIds = new Set(D.deletedFestaIds || []);
  return [
    ...D.festas.filter(f => !deletedIds.has(f.id)),
    ...FESTAS_PRELOAD.filter(p => !editedIds.has(p.id) && !deletedIds.has(p.id))
  ].sort((a,b)=>b.data.localeCompare(a.data));
}
function _qbrPorEvento(){
  const map={};
  QUEBRAS_EVENTO_PRELOAD.forEach(ev=>{
    if(!map[ev.evento])map[ev.evento]={total:0,itens:[],data:ev.data};
    ev.itens.forEach(i=>{map[ev.evento].itens.push(i);map[ev.evento].total+=i.total;});
  });
  return map;
}
function setFestaView(v){
  ['geral','produtos','quebras','fechamento','novo'].forEach(x=>{
    const btn=document.getElementById('fv-'+x);if(btn)btn.classList.toggle('active',x===v);
    const view=document.getElementById('fview-'+x);if(view)view.style.display=x===v?'block':'none';
  });
  if(v==='geral')rFestas();
  if(v==='produtos')rFestaProdutos();
  if(v==='quebras')rFestaQuebras();
  if(v==='fechamento')rFestaFechamentos();
  if(v==='novo')rFestaPendentes();
}

function rFestaPendentes() {
  const fchPorContrato = {};
  (D.fechamentos || []).forEach(f => { if (f.contratoId) fchPorContrato[f.contratoId] = true; });

  const mes   = document.getElementById('fview-novo-mes')?.value  || '';
  const ano   = document.getElementById('fview-novo-ano')?.value  || '';
  const busca = (document.getElementById('fview-novo-busca')?.value || '').toLowerCase();

  const pendentes = (D.contratos || [])
    .filter(c => {
      if (c.status !== 'concluido') return false;
      if (fchPorContrato[c.id]) return false;
      if (ano && !(c.data || '').startsWith(ano)) return false;
      if (mes && (c.data || '').slice(5, 7) !== mes) return false;
      if (busca) {
        const haystack = ((c.nomeEvento || '') + ' ' + (c.nome || '') + ' ' + (c.tipo || '')).toLowerCase();
        if (!haystack.includes(busca)) return false;
      }
      return true;
    })
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''));

  const body = document.getElementById('fview-novo-body');
  if (!body) return;

  if (!pendentes.length) {
    const msg = (ano || mes || busca)
      ? '🔍 Nenhum evento encontrado para o filtro selecionado.'
      : '✅ Todos os eventos concluídos já têm fechamento registrado.';
    body.innerHTML = `<div style="padding:32px;text-align:center;color:var(--text3)">${msg}</div>`;
    return;
  }

  body.innerHTML = `<div style="overflow-x:auto"><table class="table">
    <thead><tr>
      <th style="padding:10px 12px">Data</th>
      <th style="padding:10px 12px">Evento / Cliente</th>
      <th style="padding:10px 12px">Tipo</th>
      <th style="padding:10px 12px">Convidados</th>
      <th style="padding:10px 12px">Valor contrato</th>
      <th style="padding:10px 12px">Ação</th>
    </tr></thead>
    <tbody>
      ${pendentes.map(c => {
        const temFesta = (D.festas || []).some(f => f.data === c.data);
        const importStyle = temFesta
          ? 'border-color:#1A3D2B;color:#4ADE80'
          : 'border-color:#2A2D1A;color:#A3B86A;opacity:0.7';
        return `<tr>
          <td style="font-size:11px;color:var(--text3);white-space:nowrap;padding:10px 12px">${fd(c.data)||'—'}</td>
          <td style="padding:10px 12px"><strong>${c.nomeEvento||c.nome}</strong><div style="font-size:10px;color:var(--text3)">${c.nome}</div></td>
          <td style="font-size:11px;padding:10px 12px">${c.tipo||'—'}</td>
          <td style="font-size:11px;padding:10px 12px">${c.convidados||'—'}</td>
          <td style="font-family:var(--mono);font-size:11px;padding:10px 12px">${c.opcao||'—'}</td>
          <td style="padding:10px 12px">
            <button class="btn-sm" onclick="importarFechamento('${c.id}')" style="${importStyle}" title="${temFesta ? 'Importar dados da festa' : 'Sem dados de festa — abrirá o modal para preenchimento manual'}">↓ Importar dados</button>
            <button class="btn-sm" onclick="novoFechamento('${c.id}')" style="border-color:#1A2A3D;color:#60A5FA">✏️ Manual</button>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table></div>`;
}
function rFestaQuebras(){
  // Apenas eventos que ainda estão visíveis (não excluídos)
  const eventosVisiveis=new Set(_allFestas().map(f=>f.nome));
  const rows=[];
  QUEBRAS_EVENTO_PRELOAD.forEach(ev=>{
    if(!eventosVisiveis.has(ev.evento))return;
    ev.itens.forEach(i=>rows.push({evento:ev.evento,data:ev.data,prod:i.prod,qtd:i.qtd,custo:i.custo,total:i.total}));
  });
  D.quebras.filter(q=>q.obs&&eventosVisiveis.has(q.obs)&&!QUEBRAS_PRELOAD.find(p=>p.prod===q.prod&&p.data===q.data&&p.qtd===q.qtd)).forEach(q=>{rows.push({evento:q.obs,data:q.data,prod:q.prod,qtd:q.qtd,custo:q.custo,total:q.qtd*Number(q.custo||0)});});
  rows.sort((a,b)=>b.data.localeCompare(a.data));
  const totalVal=rows.reduce((a,r)=>a+Number(r.total||0),0);
  document.getElementById('tab-festa-qbr').innerHTML=rows.length
    ?rows.map(r=>`<tr><td style="font-size:11px">${r.evento}</td><td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(r.data)}</td><td class="bold">${r.prod}</td><td style="font-family:var(--mono);font-weight:600;color:var(--red)">${fN(r.qtd)}</td><td style="font-family:var(--mono);color:var(--text3)">${r.custo?'R$ '+Number(r.custo).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td><td style="font-family:var(--mono);font-weight:600;color:var(--red)">${r.total?'R$ '+Number(r.total).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td></tr>`).join('')+`<tr style="background:var(--bg4)"><td colspan="5" style="font-size:11px;font-weight:600;text-align:right;padding-right:16px">Total</td><td style="font-family:var(--mono);font-weight:700;color:var(--red)">R$ ${totalVal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>`
    :'<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:16px">Nenhuma quebra registrada</td></tr>';
}
function rFestas(){
  const all=_allFestas();
  const qbrMap=_qbrPorEvento();
  const busca=(document.getElementById('festas-busca')?.value||'').toLowerCase();
  const totalValProd=all.reduce((a,f)=>a+(f.valor_total_evento||f.itens.reduce((s,i)=>s+Number(i.valor||0),0)),0);
  // Soma quebras apenas dos eventos visíveis (não de preloads excluídos)
  const eventosVisiveis=new Set(all.map(f=>f.nome));
  const totalValQbr=Object.entries(qbrMap).filter(([nome])=>eventosVisiveis.has(nome)).reduce((a,[,v])=>a+v.total,0);
  document.getElementById('festas-cards').innerHTML=`
    <div class="card green"><div class="card-label">Eventos no período</div><div class="card-value">${all.length}</div></div>
    <div class="card blue"><div class="card-label">🍾 Val. produtos</div><div class="card-value">R$ ${totalValProd.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div></div>
    <div class="card red"><div class="card-label">🥃 Val. quebras</div><div class="card-value">R$ ${totalValQbr.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div></div>
    <div class="card amber"><div class="card-label">💰 Total geral</div><div class="card-value">R$ ${(totalValProd+totalValQbr).toLocaleString('pt-BR',{minimumFractionDigits:0})}</div></div>`;
  const rows=all.filter(f=>!busca||f.nome.toLowerCase().includes(busca)||(f.local&&f.local.toLowerCase().includes(busca)));
  document.getElementById('tab-festas').innerHTML=rows.map(f=>{
    const valProd=f.valor_total_evento||f.itens.reduce((a,i)=>a+Number(i.valor||0),0);
    const qbr=qbrMap[f.nome];const valQbr=qbr?qbr.total:0;const valTotal=valProd+valQbr;const uid='fe-'+f.id;
    const detailHeader=`<div style="display:grid;grid-template-columns:1fr 60px 100px 110px 110px;gap:8px;padding:5px 14px;background:var(--bg4);border-bottom:1px solid var(--border)">
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Item</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Qtd</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Val. unit.</span>
      <span style="font-size:10px;font-weight:700;color:var(--green);text-transform:uppercase;text-align:right">🍾 Produtos</span>
      <span style="font-size:10px;font-weight:700;color:var(--red);text-transform:uppercase;text-align:right">🥃 Quebras</span>
    </div>`;
    const prodLines=f.itens.map(i=>{const qtd=i.consumido||i.qtd||0;const vt=Number(i.valor||0);const vu=qtd>0&&vt>0?vt/qtd:null;
      return`<div style="display:grid;grid-template-columns:1fr 60px 100px 110px 110px;gap:8px;padding:6px 14px;border-bottom:1px solid var(--border);align-items:center;background:var(--bg3)">
        <span style="font-size:11px;color:var(--text2)">${i.prod}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--blue);text-align:right">${fN(qtd)}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--text3);text-align:right">${vu?'R$ '+vu.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--green);font-weight:600;text-align:right">${vt?'R$ '+vt.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--text3);text-align:right">—</span>
      </div>`;});
    const qbrLines=qbr?qbr.itens.map(i=>{const custo=Number(i.custo||0);const total=Number(i.total||0);
      return`<div style="display:grid;grid-template-columns:1fr 60px 100px 110px 110px;gap:8px;padding:6px 14px;border-bottom:1px solid var(--border);align-items:center;background:var(--bg3)">
        <span style="font-size:11px;color:var(--text2)">${i.prod}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--red);text-align:right">${fN(i.qtd)}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--text3);text-align:right">${custo?'R$ '+custo.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--text3);text-align:right">—</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--red);font-weight:600;text-align:right">${total?'R$ '+total.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
      </div>`;}):[];
    const emptyLine=!prodLines.length&&!qbrLines.length?`<div style="padding:10px 14px;font-size:11px;color:var(--text3)">Nenhum produto lançado — clique em ✏️ Editar para adicionar</div>`:'';
    const detailContent=detailHeader+(prodLines.join('')||(!qbrLines.length?emptyLine:''))+qbrLines.join('');
    return`<tr style="cursor:pointer" onclick="toggleFesta('${uid}')">
      <td style="width:24px;font-size:12px;color:var(--text3);text-align:center;user-select:none" id="${uid}-arrow">▶</td>
      <td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(f.data)}</td>
      <td class="bold">${f.nome}${f.local?`<div style="font-size:10px;font-weight:400;color:var(--text3)">${f.local}</div>`:''}</td>
      <td style="font-size:10px;color:var(--text3)">${f.itens.length?f.itens.length+' produto'+(f.itens.length>1?'s':''):'—'}</td>
      <td style="font-family:var(--mono);color:${valProd?'var(--green)':'var(--text3)'};font-weight:${valProd?600:400}">${valProd?'R$ '+valProd.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td>
      <td style="font-family:var(--mono);color:${valQbr?'var(--red)':'var(--text3)'};font-weight:${valQbr?600:400}">${valQbr?'R$ '+valQbr.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td>
      <td style="font-family:var(--mono);color:${valTotal?'var(--text)':'var(--text3)'};font-weight:${valTotal?700:400}">${valTotal?'R$ '+valTotal.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td>
      <td onclick="event.stopPropagation()" style="white-space:nowrap">
        <button class="btn btn-sm" onclick="editarFesta('${f.id}')" style="font-size:10px">✏️ Editar</button>
        <button class="btn-sm btn-red" onclick="excluirFesta('${f.id}')" title="Excluir evento" style="font-size:13px;padding:3px 7px">🗑</button>
      </td>
    </tr>
    <tr id="${uid}-detail" style="display:none"><td colspan="8" style="padding:0;border-bottom:2px solid var(--border2)">${detailContent}</td></tr>`;
  }).join('')||'<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:16px">Nenhum evento encontrado</td></tr>';
}
function excluirFesta(id){
  if(!confirm('Excluir este evento? Esta ação não pode ser desfeita.'))return;
  const isPreload = (window.FESTAS_PRELOAD||[]).some(f=>f.id===id);
  if(isPreload){
    if(!D.deletedFestaIds) D.deletedFestaIds=[];
    if(!D.deletedFestaIds.includes(id)) D.deletedFestaIds.push(id);
    sv('deletedFestaIds');
  } else {
    D.festas=D.festas.filter(x=>x.id!==id);
    sv('festas');
  }
  rFestas();alert2('Evento excluído.');
}
function toggleFesta(uid){
  const detail=document.getElementById(uid+'-detail');const arrow=document.getElementById(uid+'-arrow');if(!detail)return;
  const open=detail.style.display==='none'||detail.style.display==='';
  detail.style.display=open?'table-row':'none';if(arrow)arrow.textContent=open?'▼':'▶';
}
function rFestaProdutos(){
  const all=_allFestas();const busca=(document.getElementById('fp-busca')?.value||'').toLowerCase();const rows=[];
  all.forEach(f=>{f.itens.forEach(i=>{if(!busca||i.prod.toLowerCase().includes(busca)||f.nome.toLowerCase().includes(busca)){rows.push({evento:f.nome,data:f.data,prod:i.prod,qtd:i.consumido||i.qtd||0,valor:i.valor});}});});
  document.getElementById('tab-festa-prods').innerHTML=rows.length?rows.map(r=>`<tr><td style="font-size:11px">${r.evento}</td><td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(r.data)}</td><td class="bold">${r.prod}</td><td style="font-family:var(--mono);font-weight:600;color:var(--blue)">${fN(r.qtd)}</td><td style="font-family:var(--mono);color:${r.valor?'var(--green)':'var(--text3)'}">${r.valor?'R$ '+Number(r.valor).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td></tr>`).join(''):'<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:16px">Nenhum produto encontrado</td></tr>';
}
function editarFesta(id){
  let f=D.festas.find(x=>x.id===id);
  if(!f){const pf=FESTAS_PRELOAD.find(x=>x.id===id);if(pf){f=JSON.parse(JSON.stringify(pf));D.festas.push(f);sv('festas');}}
  if(!f){alert2('Evento não encontrado','error');return;}
  document.getElementById('edit-id').value=id;
  document.getElementById('edit-nome').value=f.nome;
  document.getElementById('edit-data').value=f.data;
  document.getElementById('edit-local').value=f.local||'';
  document.getElementById('edit-resp').value=f.resp||'';
  editItens=f.itens.map(i=>({...i}));
  const ep=document.getElementById('edit-fi-prod');
  if(ep&&ep.options.length<=1){ep.innerHTML='<option value="">Adicionar produto...</option>'+nomes.map(n=>`<option value="${n}">${n}</option>`).join('');}
  rEditItens();openM('medit');
}
let editItens=[];
function addEditItem(){
  const prod=document.getElementById('edit-fi-prod').value;const qtd=Number(document.getElementById('edit-fi-qtd').value);const val=document.getElementById('edit-fi-val').value;
  if(!prod||!qtd||qtd<=0){alert2('Selecione produto e informe a quantidade','error');return;}
  const ex=editItens.find(i=>i.prod===prod);
  if(ex){ex.qtd+=qtd;ex.consumido+=qtd;if(val)ex.valor=(Number(ex.valor||0)+Number(val));}
  else{editItens.push({prod,qtd,consumido:qtd,valor:val?Number(val):null});}
  document.getElementById('edit-fi-qtd').value='';document.getElementById('edit-fi-val').value='';document.getElementById('edit-fi-prod').focus();rEditItens();
}
function rEditItens(){
  const c=document.getElementById('edit-itens');const ct=document.getElementById('edit-count');
  if(!editItens.length){c.innerHTML='<div style="font-size:12px;color:var(--text3);padding:14px 16px;text-align:center">Nenhum produto lançado ainda — adicione abaixo ↓</div>';if(ct)ct.textContent='';return;}
  c.innerHTML=`<div style="display:grid;grid-template-columns:1fr 80px 110px 28px;gap:8px;padding:7px 14px;border-bottom:2px solid var(--border);position:sticky;top:0;background:var(--bg4);z-index:1">
    <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Produto</span>
    <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Qtd</span>
    <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Valor (R$)</span>
    <span></span>
  </div>`+editItens.map((i,idx)=>`
    <div style="display:grid;grid-template-columns:1fr 80px 110px 28px;gap:8px;align-items:center;padding:7px 14px;font-size:12px;border-bottom:1px solid var(--border);background:${idx%2===0?'var(--bg3)':'var(--bg4)'}">
      <span style="color:var(--text);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${i.prod}">${i.prod}</span>
      <input type="number" value="${i.qtd}" step="0.01" style="font-size:11px;padding:4px 6px;font-weight:600;color:var(--blue)" onchange="editItens[${idx}].qtd=Number(this.value);editItens[${idx}].consumido=Number(this.value)">
      <input type="number" value="${i.valor||''}" step="0.01" placeholder="—" style="font-size:11px;padding:4px 6px" onchange="editItens[${idx}].valor=this.value?Number(this.value):null">
      <span style="cursor:pointer;color:var(--red);font-size:18px;line-height:1;text-align:center;font-weight:300" title="Remover" onclick="editItens.splice(${idx},1);rEditItens()">×</span>
    </div>`).join('');
  if(ct)ct.textContent=editItens.length+' produto'+(editItens.length>1?'s':'');
}
function salvarEdicao(){
  const id=document.getElementById('edit-id').value;const f=D.festas.find(x=>x.id===id);
  f.nome=document.getElementById('edit-nome').value.trim()||f.nome;
  f.data=document.getElementById('edit-data').value||f.data;
  f.local=document.getElementById('edit-local').value;
  f.resp=document.getElementById('edit-resp').value;
  // Empilha: mantém o que já existia e soma/adiciona o que foi editado
  const itensBase=f.itens?[...f.itens]:[];
  editItens.forEach(novo=>{
    const ex=itensBase.find(i=>i.prod===novo.prod);
    if(ex){
      // produto já existe: atualiza qtd e valor conforme o que está no editor
      ex.qtd=novo.qtd;ex.consumido=novo.consumido||novo.qtd;
      if(novo.valor!=null)ex.valor=novo.valor;
    } else {
      // produto novo: adiciona na lista
      itensBase.push({...novo});
    }
  });
  f.itens=itensBase;
  sv('festas');closeM('medit');rFestas();alert2('Evento atualizado!');
}

