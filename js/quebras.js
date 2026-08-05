// ─── QUEBRAS ─────────────────────────────────────────────────────────────────
let qView='evento';
function setQView(v){
  qView=v;
  ['evento','lista','consolidado','nova'].forEach(x=>{
    const btn=document.getElementById('qv-'+x);if(btn)btn.classList.toggle('active',x===v);
    const view=document.getElementById('qview-'+x);if(view)view.style.display=x===v?'block':'none';
  });
  if(v==='evento')rQuebrasEvento();
  if(v==='lista')rQuebrasList();
  if(v==='consolidado')rQuebrasConsolidado();
}
// Ao escolher o produto, sugere o custo unit. já cadastrado em Preços
// (Cadastro Central → Preços → Editar preços). Continua editável na hora —
// serve só pra evitar redigitar valores que se repetem toda quebra.
// Quando uma NF de verdade é lançada em Estoque, ela substitui esse valor
// em D.precos (ver regEnt em entradas.js), então a sugestão já vem atualizada.
function preencherCustoQuebra(){
  var prod=document.getElementById('qprod').value;
  var campo=document.getElementById('qcusto');
  if(!campo)return;
  var custo=prod&&D.precos&&D.precos[prod]?D.precos[prod].custo:null;
  campo.value=custo?custo:'';
}
function regQbr(){
  const prod=document.getElementById('qprod').value,qtd=document.getElementById('qqtd').value,data=document.getElementById('qdata').value;
  if(!prod||!qtd||!data){alert2('Preencha os campos','error');return;}
  D.quebras.push({prod,data,qtd:Number(qtd),motivo:document.getElementById('qmot').value,custo:document.getElementById('qcusto').value,obs:document.getElementById('qobs').value});
  sv('quebras');['qqtd','qcusto','qobs'].forEach(id=>document.getElementById(id).value='');
  rQuebrasEvento();alert2('Perda registrada!');setQView('lista');
}
function rQuebras(){rQuebrasEvento();}
function rQuebrasEvento(){
  const container=document.getElementById('lista-quebras-evento');if(!container)return;
  const allCards=[...QUEBRAS_EVENTO_PRELOAD];
  const manual=D.quebras.filter(q=>!QUEBRAS_PRELOAD.find(p=>p.prod===q.prod&&p.data===q.data&&p.qtd===q.qtd));
  const totalGeral=D.quebras.reduce((a,q)=>a+Number(q.qtd)*Number(q.custo||0),0);
  let html=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <div style="font-size:11px;color:var(--text3)">${allCards.length} eventos · ${D.quebras.length} itens de quebra</div>
    <div style="font-size:13px;font-weight:600;font-family:var(--mono);color:var(--red)">Total cobrado: R$ ${totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
  </div>`;
  allCards.sort((a,b)=>a.data.localeCompare(b.data));
  html+=allCards.map(qe=>{
    const totalEvento=qe.itens.reduce((a,i)=>a+i.total,0);
    const totalQtd=qe.itens.reduce((a,i)=>a+i.qtd,0);
    const temItens=qe.itens.length>0;
    const itensHtml=qe.itens.map(i=>`
      <div style="display:grid;grid-template-columns:1fr 50px 70px 80px;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:11px;align-items:center">
        <span style="color:var(--text2)">${i.prod}</span>
        <span style="font-family:var(--mono);color:var(--text2)">${i.qtd} un</span>
        <span style="font-family:var(--mono);color:var(--text3)">R$ ${Number(i.custo).toFixed(2)}</span>
        <span style="font-family:var(--mono);font-weight:600;color:var(--red)">R$ ${Number(i.total).toFixed(2)}</span>
      </div>`).join('');
    return`<div class="festa-card enc" style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text)">${qe.evento}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${fd(qe.data)}${qe.local?' · '+qe.local:''}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:16px;font-weight:600;font-family:var(--mono);color:${temItens?'var(--red)':'var(--text3)'}">${temItens?'R$ '+totalEvento.toLocaleString('pt-BR',{minimumFractionDigits:2}):'Sem quebras'}</div>
          ${temItens?`<div style="font-size:10px;color:var(--text3)">${totalQtd} itens quebrados</div>`:''}
        </div>
      </div>
      ${temItens?`<details><summary style="font-size:11px;color:var(--text3);cursor:pointer;user-select:none;margin-bottom:6px">Ver itens quebrados ▾</summary>
        <div style="margin-top:6px">
          <div style="display:grid;grid-template-columns:1fr 50px 70px 80px;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:2px">
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Item</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Unit.</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Total</span>
          </div>${itensHtml}
        </div>
      </details>`:''}
    </div>`;
  }).join('');
  if(manual.length){
    html+=`<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px">Quebras avulsas</div>`;
    html+=manual.map(q=>`<div class="festa-card enc" style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between">
        <div><div style="font-weight:600">${q.prod}</div><div style="font-size:11px;color:var(--text3)">${fd(q.data)} · ${q.motivo}${q.obs?' · '+q.obs:''}</div></div>
        <div style="font-family:var(--mono);font-weight:600;color:var(--red)">${q.custo?'R$ '+(q.qtd*Number(q.custo)).toFixed(2):'—'}</div>
      </div>
    </div>`).join('');
  }
  container.innerHTML=html;
}
function rQuebrasList(){
  const tot=D.quebras.reduce((a,q)=>a+Number(q.qtd)*Number(q.custo||0),0);
  const el=document.getElementById('tot-prej');
  if(el)el.textContent=tot>0?'Total cobrado: R$ '+tot.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
  const mc={'Quebra/Avaria':'b-amber','Vencimento':'b-red','Furto/Desvio':'b-red','Diferença Inventário':'b-blue','Outro':'b-amber'};
  const el2=document.getElementById('tab-qbr');
  if(el2)el2.innerHTML=[...D.quebras].reverse().map(q=>`<tr><td>${fd(q.data)}</td><td class="bold">${q.prod}</td>
    <td><span class="badge ${mc[q.motivo]||'b-amber'}">${q.motivo}</span></td>
    <td>${fN(q.qtd)}</td><td>${q.custo?'R$ '+Number(q.custo).toFixed(2):'—'}</td>
    <td style="color:${q.custo?'var(--red)':'inherit'};font-weight:${q.custo?600:400};font-family:var(--mono)">${q.custo?'R$ '+(q.qtd*Number(q.custo)).toFixed(2):'—'}</td>
    <td style="font-size:10px;color:var(--text3)">${q.obs||'—'}</td></tr>`).join('');
}
function rQuebrasConsolidado(){
  const container=document.getElementById('qview-consolidado');if(!container)return;
  const allQbr=[...D.quebras];
  QUEBRAS_EVENTO_PRELOAD.forEach(ev=>{ev.itens.forEach(item=>{
    const jaExiste=D.quebras.find(q=>q.prod===item.prod&&q.obs&&q.obs.includes(ev.evento));
    if(!jaExiste)allQbr.push({prod:item.prod,qtd:item.qtd,custo:item.custo,data:ev.data,motivo:'Quebra/Avaria',obs:ev.evento+' — '+ev.local});
  });});
  const byProd={};
  allQbr.forEach(q=>{
    if(!byProd[q.prod])byProd[q.prod]={prod:q.prod,totalQtd:0,totalValor:0,eventos:[]};
    byProd[q.prod].totalQtd+=Number(q.qtd);
    byProd[q.prod].totalValor+=Number(q.qtd)*Number(q.custo||0);
    byProd[q.prod].eventos.push({data:q.data,obs:q.obs||'—',qtd:q.qtd,custo:q.custo});
  });
  const produtos=Object.values(byProd).sort((a,b)=>b.totalQtd-a.totalQtd);
  const totalGeral=produtos.reduce((a,p)=>a+p.totalValor,0);
  const totalPecas=produtos.reduce((a,p)=>a+p.totalQtd,0);
  container.innerHTML=`<div style="padding:14px 16px">
    <div class="cards" style="margin-bottom:16px">
      <div class="card red"><div class="card-label">Total de peças quebradas</div><div class="card-value">${fN(totalPecas)}</div><div class="card-sub">${produtos.length} tipos de peça</div></div>
      <div class="card amber"><div class="card-label">Prejuízo total</div><div class="card-value">R$ ${totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div><div class="card-sub">custo de reposição</div></div>
    </div>
    <div class="sec">
      <div class="sec-head"><span class="sec-title">Consolidado por peça — todas as quebras do período</span></div>
      <div style="display:grid;grid-template-columns:2fr 80px 100px 100px;gap:0;border-bottom:1px solid var(--border);background:var(--bg3)">
        <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Peça</div>
        <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd total</div>
        <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Custo unit.</div>
        <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Prejuízo</div>
      </div>
      ${produtos.map(p=>{
        const cuUnit=p.totalQtd>0?(p.totalValor/p.totalQtd).toFixed(2):null;
        const pct=totalGeral>0?((p.totalValor/totalGeral)*100).toFixed(0):0;
        return`<div>
          <div style="display:grid;grid-template-columns:2fr 80px 100px 100px;gap:0;border-bottom:1px solid var(--border);cursor:pointer" onclick="this.parentElement.querySelector('details').open=!this.parentElement.querySelector('details').open">
            <div style="padding:9px 14px;font-size:12px;font-weight:500;color:var(--text)">${p.prod}
              <div style="margin-top:4px;height:3px;width:100%;background:var(--bg3);border-radius:2px"><div style="height:3px;width:${pct}%;background:var(--red);border-radius:2px"></div></div>
            </div>
            <div style="padding:9px 14px;font-family:var(--mono);font-weight:600;color:var(--red)">${fN(p.totalQtd)}</div>
            <div style="padding:9px 14px;font-family:var(--mono);color:var(--text3)">${cuUnit?'R$ '+cuUnit:'—'}</div>
            <div style="padding:9px 14px;font-family:var(--mono);font-weight:600;color:var(--red)">${p.totalValor>0?'R$ '+p.totalValor.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</div>
          </div>
          <details style="border-bottom:1px solid var(--border)"><summary style="display:none"></summary>
            <div style="background:var(--bg3);padding:8px 14px">
              <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Ocorrências</div>
              ${p.eventos.map(ev=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:11px">
                <span style="color:var(--text2)">${fd(ev.data)} · ${ev.obs}</span>
                <span style="font-family:var(--mono);color:var(--red)">${fN(ev.qtd)} un${ev.custo?' · R$ '+(ev.qtd*Number(ev.custo)).toFixed(2):''}</span>
              </div>`).join('')}
            </div>
          </details>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

