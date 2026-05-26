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

  // Agrupa entradas com custo por produto
  const byProd={};
  D.entradas.forEach(e=>{
    if(!e.custo||!Number(e.custo))return;
    if(busca&&!e.prod.toLowerCase().includes(busca))return;
    if(!byProd[e.prod])byProd[e.prod]={prod:e.prod,compras:[]};
    byProd[e.prod].compras.push({
      data:e.data,forn:e.forn||'Sem fornecedor',
      custo:Number(e.custo),qtd:Number(e.qtd),nf:e.nf||'—'
    });
  });

  const prods=Object.values(byProd).sort((a,b)=>a.prod.localeCompare(b.prod,'pt-BR'));
  if(!prods.length){
    container.innerHTML='<div style="padding:32px;text-align:center;font-size:12px;color:var(--text3)">'+
      'Nenhuma entrada com custo lançada ainda.<br>Preencha o campo <strong>Custo unit.</strong> ao lançar uma NF para ver o histórico aqui.</div>';
    return;
  }

  container.innerHTML=prods.map(p=>{
    // Ordena por data (cronológico) para mostrar evolução
    const compras=p.compras.slice().sort((a,b)=>a.data.localeCompare(b.data));
    const custos=compras.map(c=>c.custo);
    const minC=Math.min(...custos),maxC=Math.max(...custos);
    const ultima=compras[compras.length-1];
    const temVar=minC!==maxC;
    const varTotal=temVar?(((ultima.custo-compras[0].custo)/compras[0].custo)*100):0;

    // Melhor fornecedor = quem vendeu pelo menor preço
    const melhorForn=compras.find(c=>c.custo===minC)?.forn||'—';

    const rows=compras.map((c,i)=>{
      const ant=i>0?compras[i-1].custo:null;
      const delta=ant?((c.custo-ant)/ant*100):null;
      const isMelhor=c.custo===minC,isPior=c.custo===maxC&&temVar;
      let tendEl='';
      if(delta!==null){
        if(delta>0.5)      tendEl=`<span style="color:var(--red);font-weight:600">↑ +${delta.toFixed(1)}%</span>`;
        else if(delta<-0.5)tendEl=`<span style="color:var(--green);font-weight:600">↓ ${delta.toFixed(1)}%</span>`;
        else               tendEl=`<span style="color:var(--text3)">→</span>`;
      }
      return`<div style="display:grid;grid-template-columns:90px 1fr 70px 90px 60px 80px;gap:6px;padding:6px 14px;border-bottom:1px solid var(--border);font-size:11px;align-items:center">
        <span style="color:var(--text3);font-family:var(--mono)">${fd(c.data)}</span>
        <span style="color:var(--text2)">${c.forn}<span style="color:var(--text3);font-size:10px;margin-left:6px">NF ${c.nf}</span></span>
        <span style="font-family:var(--mono);color:var(--text3);text-align:right">${fN(c.qtd)} un</span>
        <span style="font-family:var(--mono);font-weight:700;text-align:right;color:${isMelhor?'var(--green)':isPior?'var(--red)':'var(--text)'}">R$ ${c.custo.toFixed(2)}</span>
        <span style="text-align:center;font-size:10px">${tendEl}</span>
        <span style="text-align:center">${isMelhor?'<span class="badge b-green" style="font-size:9px">Melhor</span>':isPior?'<span class="badge b-red" style="font-size:9px">Mais caro</span>':''}</span>
      </div>`;
    }).join('');

    // Cabeçalho do card
    const trendIcon=varTotal>0?`<span style="color:var(--red)">↑ +${varTotal.toFixed(1)}%</span>`:
                    varTotal<0?`<span style="color:var(--green)">↓ ${varTotal.toFixed(1)}%</span>`:
                    `<span style="color:var(--text3)">Estável</span>`;

    return`<div style="margin:8px 16px;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;margin-bottom:14px">
      <!-- Cabeçalho -->
      <div style="padding:12px 14px;background:var(--bg3);display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px">
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--text)">${p.prod}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:3px">${compras.length} compra(s) registrada(s)</div>
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;text-align:right">
          <div><div style="font-size:9px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Menor preço</div>
            <div style="font-size:13px;font-weight:700;color:var(--green);font-family:var(--mono)">R$ ${minC.toFixed(2)}</div>
            <div style="font-size:9px;color:var(--text3)">${melhorForn}</div></div>
          <div><div style="font-size:9px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Maior preço</div>
            <div style="font-size:13px;font-weight:700;color:${temVar?'var(--red)':'var(--text)'};font-family:var(--mono)">R$ ${maxC.toFixed(2)}</div></div>
          <div><div style="font-size:9px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Última compra</div>
            <div style="font-size:13px;font-weight:700;color:var(--text);font-family:var(--mono)">R$ ${ultima.custo.toFixed(2)}</div>
            <div style="font-size:9px;color:var(--text3)">${fd(ultima.data)}</div></div>
          <div><div style="font-size:9px;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Tendência</div>
            <div style="font-size:13px;font-weight:700">${trendIcon}</div></div>
        </div>
      </div>
      <!-- Colunas -->
      <div style="display:grid;grid-template-columns:90px 1fr 70px 90px 60px 80px;gap:6px;padding:6px 14px;border-bottom:1px solid var(--border2);background:var(--bg2)">
        <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Data</span>
        <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Fornecedor / NF</span>
        <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:right">Qtd</span>
        <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:right">Custo unit.</span>
        <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Var.</span>
        <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Status</span>
      </div>
      ${rows}
    </div>`;
  }).join('');
}

