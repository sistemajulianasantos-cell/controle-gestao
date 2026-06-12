// ─── CONTAGENS SEMANAIS ───────────────────────────────────────────────────────
let contView='historico';
function setContView(v){
  contView=v;
  ['historico','nova','comparar'].forEach(x=>{
    const btn=document.getElementById('cv-'+x);
    if(btn)btn.classList.toggle('active',x===v);
    const view=document.getElementById('cview-'+x);
    if(view)view.style.display=x===v?'block':'none';
  });
  if(v==='historico')rContagens();
  if(v==='comparar')rCompararContagens();
}

// Itens da nova contagem em andamento
let contItens={};

function iniciarNovaContagem(){
  // Pré-preenche com zeros para todos os produtos
  contItens={};
  nomes.forEach(n=>contItens[n]={est:0,salao:0});
  rNovaContagem();
}

function rNovaContagem(){
  const busca=(document.getElementById('nova-cont-busca')?.value||'').toLowerCase();
  const catFiltro=document.getElementById('nova-cont-cat')?.value||'';
  const container=document.getElementById('nova-cont-body');
  if(!container)return;

  const prodsFiltrados=nomes.filter(n=>{
    if(busca&&!n.toLowerCase().includes(busca))return false;
    if(catFiltro&&MAR[n].cat!==catFiltro)return false;
    return true;
  });

  container.innerHTML=`
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;background:var(--bg3);border-bottom:1px solid var(--border)">
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Categoria</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Depósito</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Salão</div>
    </div>`+
  prodsFiltrados.map(n=>`
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;border-bottom:1px solid var(--border);align-items:center">
      <div style="padding:8px 14px;font-size:12px;font-weight:500;color:var(--text)">${n}</div>
      <div style="padding:8px 14px"><span class="badge b-blue" style="font-size:9px">${MAR[n].cat}</span></div>
      <div style="padding:6px 10px;text-align:center">
        <input type="number" min="0" step="0.5"
          value="${contItens[n]?.est||0}"
          onchange="contItens['${n.replace(/'/g,"\\'")}'].est=Number(this.value)"
          style="width:70px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
      </div>
      <div style="padding:6px 10px;text-align:center">
        <input type="number" min="0" step="0.5"
          value="${contItens[n]?.salao||0}"
          onchange="contItens['${n.replace(/'/g,"\\'")}'].salao=Number(this.value)"
          style="width:70px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
      </div>
    </div>`).join('');
}

function salvarContagem(){
  const data=document.getElementById('cont-data')?.value;
  const label=document.getElementById('cont-label')?.value?.trim()||'Contagem '+fd(data);
  if(!data){alert2('Informe a data da contagem','error');return;}
  const itens=nomes.map(n=>({prod:n,est:contItens[n]?.est||0,salao:contItens[n]?.salao||0}));
  const novaContagem={id:'C'+Date.now(),data,label,itens};
  D.contagens.push(novaContagem);
  sv('contagens');
  alert2('Contagem salva com sucesso!');
  setContView('historico');
}

function rContagens(){
  const container=document.getElementById('cont-historico-body');
  if(!container)return;
  if(!D.contagens.length){
    container.innerHTML='<div style="padding:20px;font-size:12px;color:var(--text3);text-align:center">Nenhuma contagem lançada ainda.<br>Clique em "+ Nova Contagem" para começar.</div>';
    return;
  }
  const sorted=[...D.contagens].sort((a,b)=>b.data.localeCompare(a.data));
  container.innerHTML=sorted.map(c=>{
    const totalItens=c.itens.reduce((a,i)=>a+i.est+i.salao,0);
    // Calcular valor com base nos preços cadastrados
    let valorTotal=0;
    c.itens.forEach(i=>{
      const preco=D.precos[i.prod]||{};
      valorTotal+=(i.est+i.salao)*(preco.custo||0);
    });
    return`<div class="festa-card enc" style="margin:8px 16px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text)">${c.label}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${fd(c.data)} · ${fN(totalItens)} unidades totais</div>
        </div>
        <div style="text-align:right">
          ${valorTotal>0?`<div style="font-size:14px;font-weight:600;font-family:var(--mono);color:var(--green)">R$ ${valorTotal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div><div style="font-size:10px;color:var(--text3)">valor em custo</div>`:'<div style="font-size:11px;color:var(--text3)">Sem preços cadastrados</div>'}
        </div>
      </div>
    </div>`;
  }).join('');
}

function rCompararContagens(){
  const container=document.getElementById('cont-comparar-body');
  if(!container)return;
  if(D.contagens.length<2){
    container.innerHTML='<div style="padding:20px;font-size:12px;color:var(--text3);text-align:center">Você precisa de pelo menos 2 contagens para comparar.</div>';
    return;
  }
  const sorted=[...D.contagens].sort((a,b)=>b.data.localeCompare(a.data));
  const atual=sorted[0];
  const anterior=sorted[1];

  // Monta select de contagens para o usuário escolher quais comparar
  const selectA=document.getElementById('comp-cont-a');
  const selectB=document.getElementById('comp-cont-b');
  if(selectA&&!selectA.dataset.populated){
    const opts=sorted.map(c=>`<option value="${c.id}">${c.label} (${fd(c.data)})</option>`).join('');
    selectA.innerHTML=opts;
    selectB.innerHTML=opts;
    if(sorted.length>=2)selectB.value=sorted[1].id;
    selectA.dataset.populated='1';
  }

  const idA=selectA?.value||atual.id;
  const idB=selectB?.value||anterior.id;
  const cA=D.contagens.find(c=>c.id===idA)||atual;
  const cB=D.contagens.find(c=>c.id===idB)||anterior;

  // Indexa itens por produto
  const mapA={},mapB={};
  cA.itens.forEach(i=>mapA[i.prod]={est:i.est,salao:i.salao});
  cB.itens.forEach(i=>mapB[i.prod]={est:i.est,salao:i.salao});

  const busca=(document.getElementById('comp-cont-busca')?.value||'').toLowerCase();
  const rows=nomes.filter(n=>!busca||n.toLowerCase().includes(busca)).map(n=>{
    const a=mapA[n]||{est:0,salao:0};
    const b=mapB[n]||{est:0,salao:0};
    const totA=a.est+a.salao;
    const totB=b.est+b.salao;
    const diff=totA-totB;
    return{nome:n,cat:MAR[n].cat,totA,totB,diff,estA:a.est,salaoA:a.salao,estB:b.est,salaoB:b.salao};
  });

  const totalDiff=rows.reduce((a,r)=>a+r.diff,0);
  const comDiff=rows.filter(r=>r.diff!==0).length;

  container.innerHTML=`
    <div class="cards" style="margin-bottom:14px">
      <div class="card blue"><div class="card-label">Produtos comparados</div><div class="card-value">${rows.length}</div></div>
      <div class="card ${totalDiff>0?'green':totalDiff<0?'red':'amber'}"><div class="card-label">Variação total</div><div class="card-value">${totalDiff>0?'+':''}${fN(totalDiff)} un</div><div class="card-sub">${comDiff} produto(s) com diferença</div></div>
    </div>
    <div class="sec">
      <div class="sec-head">
        <span class="sec-title">Comparativo: ${cA.label} vs ${cB.label}</span>
        <input type="text" id="comp-cont-busca" placeholder="Buscar..." oninput="rCompararContagens()" style="width:160px;font-size:11px;padding:5px 9px;border:1px solid var(--border2);background:var(--bg3);color:var(--text);border-radius:var(--radius)">
      </div>
      <table>
        <thead><tr>
          <th>Produto</th><th>Cat.</th>
          <th style="text-align:right">${cA.label}</th>
          <th style="text-align:right">${cB.label}</th>
          <th style="text-align:right">Diferença</th>
        </tr></thead>
        <tbody>
          ${rows.filter(r=>r.diff!==0||r.totA>0).map(r=>{
            const dc=r.diff===0?'neu':r.diff>0?'up':'dn';
            const dt=r.diff===0?'—':r.diff>0?'▲'+fN(r.diff):'▼'+fN(Math.abs(r.diff));
            return`<tr>
              <td class="bold">${r.nome}</td>
              <td><span class="badge b-blue" style="font-size:9px">${r.cat}</span></td>
              <td style="font-family:var(--mono);text-align:right">${fN(r.totA)}<span style="font-size:9px;color:var(--text3)"> (${fN(r.estA)}+${fN(r.salaoA)})</span></td>
              <td style="font-family:var(--mono);text-align:right">${fN(r.totB)}<span style="font-size:9px;color:var(--text3)"> (${fN(r.estB)}+${fN(r.salaoB)})</span></td>
              <td class="${dc}" style="text-align:right">${dt}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

