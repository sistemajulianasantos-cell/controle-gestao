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

  const festasManuais = [
    ...D.festas.filter(f => !deletedIds.has(f.id)),
    ...FESTAS_PRELOAD.filter(p => !editedIds.has(p.id) && !deletedIds.has(p.id))
  ];

  // Gera entradas virtuais a partir de fechamentos que não têm festa manual correspondente
  const festasDatas = new Set(festasManuais.map(f => f.data));
  const virtuais = {};
  (D.fechamentos || []).forEach(fch => {
    if (!fch.dataEvento || festasDatas.has(fch.dataEvento)) return;
    if (virtuais[fch.id]) return;
    virtuais[fch.id] = {
      id:                  '_fch_' + fch.id,
      nome:                fch.eventoNome || fch.clienteNome || '—',
      data:                fch.dataEvento,
      local:               '',
      status:              'encerrada',
      valor_total_evento:  fch.totalExtras || 0,
      itens:               (fch.itens || [])
        .filter(it => {
          const t = it.tipo || '';
          return !['quebra','peca','servico','hora_extra','adicional'].includes(t);
        })
        .map(it => {
          const p = (typeof _fchParseItem === 'function') ? _fchParseItem(it) : { produto: it.descricao, qtd: null };
          const q = p.qtd || 1;
          return { prod: p.produto, qtd: q, consumido: q, valor: it.valor };
        }),
      _virtual:            true,
    };
  });

  return [...festasManuais, ...Object.values(virtuais)]
    .sort((a,b) => (b.data || '').localeCompare(a.data || ''));
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
  ['geral','produtos','quebras','fechamento','novo','importar-fch','cadastro'].forEach(x=>{
    const btn=document.getElementById('fv-'+x);if(btn)btn.classList.toggle('active',x===v);
    const view=document.getElementById('fview-'+x);if(view)view.style.display=x===v?'block':'none';
  });
  if(v==='geral')rFestas();
  if(v==='produtos')rFestaProdutos();
  if(v==='quebras')rFestaQuebras();
  if(v==='fechamento')rFestaFechamentos();
  if(v==='novo')rFestaPendentes();
  if(v==='cadastro')rFchCadastro();
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
        return `<tr>
          <td style="font-size:11px;color:var(--text3);white-space:nowrap;padding:10px 12px">${fd(c.data)||'—'}</td>
          <td style="padding:10px 12px"><strong>${c.nomeEvento||c.nome}</strong><div style="font-size:10px;color:var(--text3)">${c.nome}</div></td>
          <td style="font-size:11px;padding:10px 12px">${c.tipo||'—'}</td>
          <td style="font-size:11px;padding:10px 12px">${c.convidados||'—'}</td>
          <td style="font-family:var(--mono);font-size:11px;padding:10px 12px">${c.opcao||'—'}</td>
          <td style="padding:10px 12px">
            <button class="btn-sm" onclick="abrirImporteFechamento('${c.id}')" style="border-color:#1A3D2B;color:#4ADE80">↓ Importar dados</button>
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
  // Itens de quebra registrados nos fechamentos
  (D.fechamentos||[]).forEach(fch=>{
    (fch.itens||[]).filter(it=>it.tipo==='quebra'||it.tipo==='peca').forEach(it=>{
      const p=(typeof _fchParseItem==='function')?_fchParseItem(it):{produto:it.descricao,qtd:null,valorUnit:null};
      const q=p.qtd||1;
      const custo=p.valorUnit||(q>0&&it.valor?it.valor/q:it.valor)||0;
      rows.push({evento:fch.eventoNome||fch.clienteNome||'—',data:fch.dataEvento||'',prod:p.produto,qtd:q,custo,total:it.valor});
    });
  });
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
        ${f._virtual
          ? `<span style="font-size:10px;color:var(--text3);font-style:italic">via fechamento</span>`
          : `<button class="btn btn-sm" onclick="editarFesta('${f.id}')" style="font-size:10px">✏️ Editar</button>
             <button class="btn-sm btn-red" onclick="excluirFesta('${f.id}')" title="Excluir evento" style="font-size:13px;padding:3px 7px">🗑</button>`
        }
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
  all.forEach(f=>{f.itens.forEach(i=>{if(!busca||i.prod.toLowerCase().includes(busca)||f.nome.toLowerCase().includes(busca)){
    const qtd=i.consumido||i.qtd||0;
    const valorUnit=i.valorUnit||(qtd>0&&i.valor?i.valor/qtd:null);
    rows.push({evento:f.nome,data:f.data,prod:i.prod,qtd,valorUnit,valor:i.valor});
  }});});
  const fmtR=v=>v?'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—';
  document.getElementById('tab-festa-prods').innerHTML=rows.length?rows.map(r=>`<tr>
    <td style="font-size:11px">${r.evento}</td>
    <td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(r.data)}</td>
    <td class="bold">${r.prod}</td>
    <td style="font-family:var(--mono);font-weight:600;color:var(--blue)">${fN(r.qtd)}</td>
    <td style="font-family:var(--mono);color:var(--text3)">${fmtR(r.valorUnit)}</td>
    <td style="font-family:var(--mono);color:${r.valor?'var(--green)':'var(--text3)'}">${fmtR(r.valor)}</td>
  </tr>`).join(''):'<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:16px">Nenhum produto encontrado</td></tr>';
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

// ── Importar arquivo de fechamento ───────────────────────────────────────────
let _fchImportContratoId = '';

function abrirImporteFechamento(contratoId) {
  _fchImportContratoId = contratoId;
  const c = (D.contratos || []).find(x => x.id === contratoId);

  setFestaView('importar-fch');

  const info = document.getElementById('fch-import-contrato-info');
  if (info && c) info.textContent = `Contrato: ${c.nomeEvento || c.nome} — ${fd(c.data) || '—'}`;

  const status  = document.getElementById('fch-imp-status');
  const preview = document.getElementById('fch-imp-preview');
  if (status)  status.textContent = '';
  if (preview) preview.style.display = 'none';

  const fileInput = document.getElementById('fch-imp-file-input');
  if (fileInput) fileInput.value = '';

  window._fchImportItens = [];
  _initFchImportZone();
}

function _initFchImportZone() {
  const zone = document.getElementById('fch-imp-upload-zone');
  if (!zone || zone._initDone) return;
  zone._initDone = true;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = '#4F8EF7'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = '#2A2F42'; });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = '#2A2F42';
    if (e.dataTransfer.files[0]) _processarArquivoFechamento(e.dataTransfer.files[0]);
  });
}

function lerArquivoFechamento(input) {
  if (input.files[0]) _processarArquivoFechamento(input.files[0]);
}

async function _processarArquivoFechamento(file) {
  const status  = document.getElementById('fch-imp-status');
  const preview = document.getElementById('fch-imp-preview');
  if (status)  status.textContent = 'Lendo arquivo…';
  if (preview) preview.style.display = 'none';

  try {
    let itens = [];

    if (file.name.toLowerCase().endsWith('.pdf')) {
      itens = await _lerPDFFechamento(file);
    } else {
      const txt = await file.text();
      itens = _parsearItensFechamento(txt);
    }

    if (!itens.length) {
      if (status) status.textContent = '⚠ Nenhum item encontrado. Verifique se o PDF segue o formato padrão com tabela de itens e valores.';
      return;
    }

    window._fchImportItens = itens;
    _renderPreviewImporteFch(itens);
    if (status)  status.textContent = `${itens.length} item(s) encontrado(s). Confirme abaixo.`;
    if (preview) preview.style.display = '';
  } catch(e) {
    if (status) status.textContent = 'Erro ao ler arquivo: ' + e.message;
  }
}

async function _lerPDFFechamento(file) {
  if (!window.pdfjsLib) throw new Error('PDF.js não disponível. Recarregue a página.');
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  const ab  = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  let txt = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const pg = await pdf.getPage(i);
    const tc = await pg.getTextContent();
    let lastY = null, currentLine = '', pageLines = [];

    for (const item of tc.items) {
      const y = item.transform ? Math.round(item.transform[5]) : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
        if (currentLine.trim()) pageLines.push(currentLine.trim());
        currentLine = item.str;
      } else {
        currentLine += (currentLine && item.str && !currentLine.endsWith(' ') ? ' ' : '') + item.str;
      }
      lastY = y;
    }
    if (currentLine.trim()) pageLines.push(currentLine.trim());
    txt += pageLines.join('\n') + '\n';
  }

  return _parsearPDFFechamento(txt);
}

function _parsearPDFFechamento(txt) {
  const SKIP = /^(ITEM|UNIDADES|VALOR|VALOR UNIT|UNIT[ÁA]RIO|TOTAL|PIX|Dados Banc|Banco|Ag[eê]ncia|Conta|CNPJ|Gentileza|Proposta|Cliente|E-mail|Telefone|Evento|Convidados|Data:|Local|FECHAMENTO|QUEBRAS|DADOS DO)/i;
  const itens = [];

  txt.split('\n').map(l => l.trim()).filter(Boolean).forEach(linha => {
    if (SKIP.test(linha)) return;

    // Formato: "Nome qtd R$ unitário R$ total" — ex: "Gin Tanqueray 4 R$ 125,00 R$ 500,00"
    const m = linha.match(/^(.+?)\s+(\d+)\s+R\$\s*([\d.,]+)\s+R\$\s*([\d.,]+)/);
    if (m) {
      const nome      = m[1].trim();
      const qtd       = m[2];
      const unitario  = m[3];
      const total     = parseFloat(m[4].replace(/\./g, '').replace(',', '.'));
      if (nome && total > 0 && !/^TOTAL/i.test(nome)) {
        const descricao = `${nome} — ${qtd} un. × R$ ${unitario}`;
        itens.push({ tipo: _classificarTipoFechamento(nome), descricao, valor: total });
      }
      return;
    }

    // Fallback: linha com 2+ valores R$ — pega o último como total
    const rsMatches = [...linha.matchAll(/R\$\s*([\d.,]+)/g)];
    if (rsMatches.length >= 2) {
      const nome  = linha.slice(0, linha.indexOf('R$')).replace(/\s+\d+\s*$/, '').trim();
      const total = parseFloat(rsMatches[rsMatches.length - 1][1].replace(/\./g, '').replace(',', '.'));
      if (nome && total > 0 && !/^TOTAL/i.test(nome)) {
        itens.push({ tipo: _classificarTipoFechamento(nome), descricao: nome, valor: total });
      }
    }
  });

  return itens;
}

function _classificarTipoFechamento(nome) {
  const n = nome.toLowerCase();
  if (/copo|taça|jarra|bowl|vidro|bandeja|prato/.test(n))                                                    return 'quebra';
  if (/vodka|gin|whiskey|whisky|rum|cacha[cç]a|cerveja|vinho|prosecco|espumante|champagne|bebida/.test(n))   return 'bebida_extra';
  if (/hora\s*extra/.test(n))                                                                                 return 'hora_extra';
  return 'adicional';
}

function _parsearItensFechamento(txt) {
  const TIPOS = ['bebida_extra', 'quebra', 'hora_extra', 'adicional'];
  const itens = [];

  txt.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).forEach(linha => {
    const partes = linha.split(/[,;\t]/).map(p => p.trim());

    if (partes.length >= 3) {
      const tipoRaw = partes[0].toLowerCase().replace(/\s+/g, '_');
      const tipo    = TIPOS.includes(tipoRaw) ? tipoRaw : 'adicional';
      const desc    = partes[1];
      const valor   = parseFloat(partes[2].replace(/[R$\s.]/g, '').replace(',', '.'));
      if (desc && valor > 0) itens.push({ tipo, descricao: desc, valor });
    } else if (partes.length === 2) {
      const desc  = partes[0];
      const valor = parseFloat(partes[1].replace(/[R$\s.]/g, '').replace(',', '.'));
      if (desc && valor > 0) itens.push({ tipo: 'adicional', descricao: desc, valor });
    }
  });

  return itens;
}

function _renderPreviewImporteFch(itens) {
  const list = document.getElementById('fch-imp-itens-list');
  if (!list) return;
  const total = itens.reduce((s, i) => s + i.valor, 0);
  list.innerHTML =
    `<div style="padding:0 16px">
      <div style="display:grid;grid-template-columns:130px 1fr 110px;gap:8px;padding:6px 14px;background:var(--bg4);border-bottom:1px solid var(--border)">
        <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Tipo</span>
        <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Descrição</span>
        <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Valor</span>
      </div>
      ${itens.map(it =>
        `<div style="display:grid;grid-template-columns:130px 1fr 110px;gap:8px;padding:6px 14px;border-bottom:1px solid var(--border);font-size:11px">
          <span style="color:${_fchCor(it.tipo)};font-weight:600">${_fchLabel(it.tipo)}</span>
          <span style="color:var(--text2)">${it.descricao}</span>
          <span style="font-family:var(--mono);font-weight:600;color:#FBBF24;text-align:right">${fR(it.valor)}</span>
        </div>`
      ).join('')}
      <div style="padding:10px 14px;text-align:right;font-weight:700;color:#FBBF24;font-family:var(--mono)">Total: ${fR(total)}</div>
    </div>`;
}

function confirmarImporteFechamento() {
  const itens = window._fchImportItens || [];
  if (!itens.length) { alert2('Nenhum item para importar', 'error'); return; }

  const contratoId = _fchImportContratoId;
  const c = (D.contratos || []).find(x => x.id === contratoId);

  _fchItens = [...itens];

  const sel = document.getElementById('fch-modal-contrato');
  sel.innerHTML = '<option value="">Selecionar contrato...</option>' +
    (D.contratos || [])
      .slice().sort((a, b) => (b.data || '').localeCompare(a.data || ''))
      .map(ct => `<option value="${ct.id}"${ct.id === contratoId ? ' selected' : ''}>${ct.nome || '—'} — ${fd(ct.data) || '—'}</option>`)
      .join('');

  document.getElementById('fch-modal-id').value  = '';
  document.getElementById('fch-modal-obs').value  = '';
  if (c) {
    document.getElementById('fch-modal-nome').value = c.nome || '';
    document.getElementById('fch-modal-data').value = c.data || '';
    if (c.data) {
      const d = new Date(c.data + 'T12:00:00');
      d.setDate(d.getDate() + 3);
      document.getElementById('fch-modal-venc').value = d.toISOString().slice(0, 10);
    }
  }

  _rFchItens();
  _fchAtualizarDatalist();
  setFestaView('novo');
  openM('mfechamento');
}

// ─── CATÁLOGO DE ITENS ────────────────────────────────────────────────────────
const _CAT_TIPO = {
  produto: { label: 'Produto',           icon: '🍾', color: '#22C55E' },
  peca:    { label: 'Peça',              icon: '🥃', color: '#EF4444' },
  servico: { label: 'Serviço adicional', icon: '⚙️', color: '#8B91A8' },
};

function _fchCatMergeRows() {
  // Coleta todos os itens únicos dos fechamentos (usa _fchParseItem para nome limpo)
  if (!D.catalogoFch) D.catalogoFch = [];
  const map = {}; // key=nome.lower → { nome, tipo, ocorrencias }
  (D.fechamentos || []).forEach(fch => {
    (fch.itens || []).forEach(it => {
      const p = (typeof _fchParseItem === 'function') ? _fchParseItem(it) : { produto: it.descricao };
      const nome = (p.produto || '').trim();
      if (!nome || nome === '—') return;
      const key = nome.toLowerCase();
      if (!map[key]) {
        const cat = D.catalogoFch.find(c => c.nome.toLowerCase() === key);
        // tipo: catálogo > item atual > inferência pelo tipo legado
        let tipo = cat ? cat.tipo : (it.tipo || '');
        if (!tipo || !_CAT_TIPO[tipo]) {
          if (tipo === 'quebra')               tipo = 'peca';
          else if (tipo === 'hora_extra' || tipo === 'adicional') tipo = 'servico';
          else if (tipo === 'bebida_extra')    tipo = 'produto';
          else                                 tipo = 'produto';
        }
        map[key] = { nome, tipo, ocorrencias: 0 };
      }
      map[key].ocorrencias++;
    });
  });
  // inclui itens do catálogo que não aparecem em nenhum fechamento ainda
  D.catalogoFch.forEach(c => {
    const key = c.nome.toLowerCase();
    if (!map[key]) map[key] = { nome: c.nome, tipo: c.tipo, ocorrencias: 0 };
  });
  return Object.values(map).sort((a, b) => a.nome.localeCompare(b.nome));
}

function _fchNormNome(nome) {
  return nome.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\b\d+\s*(ml|l\b|g\b|kg|un\.?)\b/gi, '')
    .replace(/\s+/g, ' ').trim();
}

function _fchLevenshtein(a, b) {
  if (Math.abs(a.length - b.length) > 4) return 99;
  const dp = Array.from({length: a.length + 1}, (_, i) => Array.from({length: b.length + 1}, (_, j) => i || j));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length];
}

function _fchCatDetectDups(rows) {
  const dups = new Set();
  const norm = rows.map(r => ({ key: r.nome.toLowerCase(), norm: _fchNormNome(r.nome) }));
  for (let i = 0; i < norm.length; i++) {
    for (let j = i + 1; j < norm.length; j++) {
      const a = norm[i].norm, b = norm[j].norm;
      if (!a || !b) continue;
      if (a === b || a.includes(b) || b.includes(a) || _fchLevenshtein(a, b) <= 2) {
        dups.add(norm[i].key);
        dups.add(norm[j].key);
      }
    }
  }
  return dups;
}

function rFchCadastro() {
  const busca = (document.getElementById('cat-busca')?.value || '').toLowerCase().trim();
  const allRows = _fchCatMergeRows();
  const dups = _fchCatDetectDups(allRows);

  const rows = busca ? allRows.filter(r => r.nome.toLowerCase().includes(busca)) : allRows;

  // Alerta de duplicatas
  const dupEl = document.getElementById('cat-dup-alert');
  if (dupEl) {
    const n = dups.size;
    dupEl.style.display = (n > 0 && !busca) ? 'block' : 'none';
    if (n > 0 && !busca) dupEl.innerHTML = `⚠️ <strong>${n} item${n>1?'s':''} com possível duplicidade</strong> detectado${n>1?'s':''} — revise os destacados abaixo`;
  }
  const lbEl = document.getElementById('cat-total-label');
  if (lbEl) lbEl.textContent = rows.length + ' item' + (rows.length !== 1 ? 's' : '');

  const tb = document.getElementById('tab-catalogo');
  if (!tb) return;

  tb.innerHTML = rows.length
    ? rows.map(item => {
        const info = _CAT_TIPO[item.tipo] || _CAT_TIPO.produto;
        const escNome = item.nome.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const isDup = dups.has(item.nome.toLowerCase());
        const dupBadge = isDup
          ? '<span style="font-size:10px;background:#FBBF2422;color:#FBBF24;border:1px solid #FBBF2455;padding:1px 6px;border-radius:10px;margin-left:6px;vertical-align:middle">⚠️ duplicata</span>'
          : '';
        const ocBadge = item.ocorrencias > 0
          ? `<span style="font-size:10px;color:var(--text3);margin-left:5px">(${item.ocorrencias}×)</span>` : '';
        const rowBg = isDup ? 'background:rgba(251,191,36,0.06);' : '';
        const delTitle = item.ocorrencias > 0
          ? `Remove do catálogo (item ainda presente em ${item.ocorrencias} fechamento${item.ocorrencias>1?'s':''})`
          : 'Excluir item do catálogo';
        return `<tr style="${rowBg}">
          <td style="font-size:13px;font-weight:500">${item.nome}${dupBadge}${ocBadge}</td>
          <td>
            <select style="font-size:11px;font-weight:600;color:${info.color};background:${info.color}18;border:1px solid ${info.color}55;padding:3px 8px;border-radius:20px;cursor:pointer"
              onchange="_fchCatSetTipo('${escNome}', this.value)">
              ${Object.entries(_CAT_TIPO).map(([v,inf]) =>
                `<option value="${v}"${item.tipo===v?' selected':''}>${inf.icon} ${inf.label}</option>`).join('')}
            </select>
          </td>
          <td style="text-align:center">
            <span style="cursor:pointer;color:var(--red);font-size:20px;font-weight:300;line-height:1;display:inline-block;width:24px;text-align:center"
              onclick="_fchCatDel('${escNome}', ${item.ocorrencias})" title="${delTitle}">×</span>
          </td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="3" style="text-align:center;color:var(--text3);padding:20px;font-size:12px">Nenhum item encontrado</td></tr>';

  _fchAtualizarDatalist(allRows);
}

function _fchCatSetTipo(nome, tipo) {
  if (!D.catalogoFch) D.catalogoFch = [];
  const key = nome.toLowerCase();
  // Atualiza ou cria entrada no catálogo
  let cat = D.catalogoFch.find(c => c.nome.toLowerCase() === key);
  if (cat) cat.tipo = tipo; else D.catalogoFch.push({ nome, tipo });
  // Atualiza todos os itens nos fechamentos com esse nome
  let updated = 0;
  (D.fechamentos || []).forEach(fch => {
    (fch.itens || []).forEach(it => {
      const p = (typeof _fchParseItem === 'function') ? _fchParseItem(it) : { produto: it.descricao };
      if ((p.produto || '').toLowerCase() === key) { it.tipo = tipo; updated++; }
    });
  });
  sv('catalogoFch');
  if (updated > 0) sv('fechamentos');
  // Atualiza visual do select sem re-renderizar a tabela inteira
  const info = _CAT_TIPO[tipo] || _CAT_TIPO.produto;
  const sel = event && event.target;
  if (sel) { sel.style.color = info.color; sel.style.background = info.color+'18'; sel.style.borderColor = info.color+'55'; }
  _fchAtualizarDatalist();
}

function _fchCatAdd() {
  const nome = (document.getElementById('cat-nome')?.value || '').trim();
  const tipo = document.getElementById('cat-tipo')?.value || 'produto';
  if (!nome) { alert2('Informe o nome do item', 'error'); return; }
  _fchCatSetTipo(nome, tipo);
  document.getElementById('cat-nome').value = '';
  rFchCadastro();
}

function _fchCatDel(nome, ocorrencias) {
  const msg = ocorrencias > 0
    ? `"${nome}" aparece em ${ocorrencias} fechamento${ocorrencias>1?'s':''}.\nRemover do catálogo? (os fechamentos não serão alterados)`
    : `Excluir "${nome}" do catálogo?`;
  if (!confirm(msg)) return;
  if (!D.catalogoFch) D.catalogoFch = [];
  const key = nome.toLowerCase();
  D.catalogoFch = D.catalogoFch.filter(c => c.nome.toLowerCase() !== key);
  sv('catalogoFch');
  rFchCadastro();
}

function _fchAtualizarDatalist(rows) {
  const dl = document.getElementById('fch-catalogo-list');
  if (!dl) return;
  const list = rows || _fchCatMergeRows();
  dl.innerHTML = list.map(x => `<option value="${x.nome}">`).join('');
}

function _fchAutoTipo(nome) {
  if (!nome) return;
  const rows = _fchCatMergeRows();
  const item = rows.find(x => x.nome.toLowerCase() === nome.toLowerCase());
  if (!item) return;
  const sel = document.getElementById('fch-item-tipo');
  if (sel) sel.value = item.tipo;
}

