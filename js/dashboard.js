// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function rFechamento(){
  const allF=[...D.festas,...FESTAS_PRELOAD.filter(p=>!D.festas.find(f=>f.id===p.id))];
  const uso={};
  nomes.forEach(n=>uso[n]=0);
  allF.filter(f=>f.status==='encerrada').forEach(f=>{
    f.itens.forEach(i=>{if(uso[i.prod]!==undefined)uso[i.prod]+=(i.consumido||i.qtd||0);});
  });
  D.quebras.forEach(q=>{if(uso[q.prod]!==undefined)uso[q.prod]+=q.qtd;});

  const prodComMovimento=Object.keys(uso).filter(n=>uso[n]>0);
  const prodParado=nomes.filter(n=>{const m=MAR[n];return uso[n]===0&&(m.est+m.salao)>0&&m.cat!=='COPOS/TAÇAS';});
  const totalFat=allF.reduce((a,f)=>a+(f.valor_total_evento||f.itens.reduce((s,i)=>s+Number(i.valor||0),0)),0);
  const totalQbrVal=QUEBRAS_EVENTO_PRELOAD.reduce((a,ev)=>a+ev.total,0)+D.quebras.filter(q=>!QUEBRAS_PRELOAD.find(p=>p.prod===q.prod&&p.data===q.data&&p.qtd===q.qtd)).reduce((a,q)=>a+q.qtd*Number(q.custo||0),0);

  // Valor total do estoque com base na última contagem e preços cadastrados
  const ultimaContagem=D.contagens.length?D.contagens[D.contagens.length-1]:null;
  let valorEstoque=0, valorRevenda=0;
  if(ultimaContagem){
    ultimaContagem.itens.forEach(item=>{
      const preco=D.precos[item.prod]||{};
      const tot=(item.est||0)+(item.salao||0);
      valorEstoque+=tot*custoEfetivoProduto(item.prod);
      valorRevenda+=tot*(preco.revenda||0);
    });
  }

  document.getElementById('dash-cards').innerHTML=`
    <div class="card blue"><div class="card-label">Produtos em movimento</div><div class="card-value">${prodComMovimento.length}</div><div class="card-sub">de ${nomes.length} no inventário</div></div>
    <div class="card red"><div class="card-label">Produtos parados</div><div class="card-value">${prodParado.length}</div><div class="card-sub">sem nenhuma saída</div></div>
    <div class="card green"><div class="card-label">Faturamento eventos</div><div class="card-value">R$ ${totalFat.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div><div class="card-sub">${allF.length} eventos</div></div>
    <div class="card amber"><div class="card-label">Custo de quebras</div><div class="card-value">R$ ${totalQbrVal.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div></div>
    ${valorEstoque>0?`<div class="card purple"><div class="card-label">💰 Valor em estoque</div><div class="card-value">R$ ${valorEstoque.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div><div class="card-sub">${valorRevenda>0?'Revenda: R$ '+valorRevenda.toLocaleString('pt-BR',{minimumFractionDigits:0}):''}</div></div>`:''}
  `;

  // Top 10
  const top10=Object.entries(uso).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const maxUso=top10[0]?.[1]||1;
  document.getElementById('dash-top10').innerHTML=top10.map(([nome,qtd])=>{
    const pct=Math.round((qtd/maxUso)*100);
    const cat=MAR[nome]?.cat||'';
    const isCopo=cat==='COPOS/TAÇAS';
    return`<div style="padding:6px 14px;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:11px;font-weight:500;color:var(--text)">${nome}</span>
        <span style="font-family:var(--mono);font-size:11px;font-weight:600;color:${isCopo?'var(--red)':'var(--blue)'}">${fN(qtd)} un</span>
      </div>
      <div style="height:6px;background:var(--border);border-radius:3px">
        <div style="height:6px;width:${pct}%;background:${isCopo?'var(--red)':'var(--blue)'};border-radius:3px;transition:width .3s"></div>
      </div>
      <div style="font-size:9px;color:var(--text3);margin-top:2px">${cat}</div>
    </div>`;
  }).join('')||'<div style="padding:14px;font-size:12px;color:var(--text3)">Nenhum movimento registrado</div>';

  // Consumo por categoria
  const porcatF={};
  nomes.forEach(n=>{if(uso[n]>0){const cat=MAR[n]?.cat||'Outros';porcatF[cat]=(porcatF[cat]||0)+uso[n];}});
  const catSort=Object.entries(porcatF).sort((a,b)=>b[1]-a[1]);
  const maxCat=catSort[0]?.[1]||1;
  const totalCat=catSort.reduce((a,[,v])=>a+v,0);
  const catColors=['var(--blue)','var(--green)','var(--amber)','var(--red)','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#14b8a6'];
  document.getElementById('dash-cat-chart').innerHTML=catSort.map(([cat,qtd],i)=>{
    const pct=Math.round((qtd/maxCat)*100);
    const pctTotal=totalCat>0?((qtd/totalCat)*100).toFixed(0):0;
    return`<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="font-size:11px;color:var(--text2)">${cat}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--text3)">${fN(qtd)} un (${pctTotal}%)</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px">
        <div style="height:8px;width:${pct}%;background:${catColors[i%catColors.length]};border-radius:4px"></div>
      </div>
    </div>`;
  }).join('')||'<div style="font-size:12px;color:var(--text3)">Nenhum dado</div>';

  // Estoque parado
  document.getElementById('dash-parado').innerHTML=prodParado.length
    ?prodParado.sort((a,b)=>(MAR[b].est+MAR[b].salao)-(MAR[a].est+MAR[a].salao)).map(n=>{
        const tot=MAR[n].est+MAR[n].salao;
        return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 14px;border-bottom:1px solid var(--border)">
          <div><div style="font-size:11px;font-weight:500;color:var(--text)">${n}</div><div style="font-size:9px;color:var(--text3)">${MAR[n].cat}</div></div>
          <span style="font-family:var(--mono);font-size:11px;font-weight:600;color:var(--amber)">${fN(tot)} un</span>
        </div>`;
      }).join('')
    :'<div style="padding:14px;font-size:12px;color:var(--text3)">Nenhum produto parado 🎉</div>';

  // Quebras por evento
  const qbrEvt=QUEBRAS_EVENTO_PRELOAD.filter(ev=>ev.total>0).sort((a,b)=>b.total-a.total);
  const maxQbr=qbrEvt[0]?.total||1;
  document.getElementById('dash-qbr-chart').innerHTML=qbrEvt.map(ev=>{
    const pct=Math.round((ev.total/maxQbr)*100);
    const nomeEvt=ev.evento.length>35?ev.evento.slice(0,33)+'…':ev.evento;
    return`<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="font-size:11px;color:var(--text2)">${nomeEvt}</span>
        <span style="font-family:var(--mono);font-size:11px;font-weight:600;color:var(--red)">R$ ${ev.total.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px">
        <div style="height:8px;width:${pct}%;background:var(--red);border-radius:4px;opacity:${0.5+0.5*(ev.total/maxQbr)}"></div>
      </div>
      <div style="font-size:9px;color:var(--text3);margin-top:2px">${fd(ev.data)} · ${ev.itens.length} peça${ev.itens.length!==1?'s':''}</div>
    </div>`;
  }).join('')||'<div style="font-size:12px;color:var(--text3)">Nenhuma quebra registrada</div>';
}

