// ─── FORNECEDORES ────────────────────────────────────────────────────────────
let fornView='lista';
function setFornView(v){
  fornView=v;
  ['lista','novo'].forEach(x=>{
    document.getElementById('forn-v-'+x).classList.toggle('active',x===v);
    document.getElementById('forn-view-'+x).style.display=x===v?'block':'none';
  });
  if(v==='lista') rFornecedores();
  if(v==='novo') _populateCategoriasSelects && _populateCategoriasSelects();
}
function salvarForn(){
  const nome=document.getElementById('fn-nome').value.trim();
  if(!nome){alert2('Nome é obrigatório','error');return;}
  if(D.fornecedores.find(f=>f.nome.toLowerCase()===nome.toLowerCase())){alert2('Fornecedor já cadastrado','error');return;}
  D.fornecedores.push({
    nome,
    categoria: document.getElementById('fn-cat').value,
    tel:       document.getElementById('fn-tel').value,
    contato:   document.getElementById('fn-contato').value,
    pix:       document.getElementById('fn-pix').value.trim(),
    codBarras: document.getElementById('fn-cod-barras').value.trim(),
    obs:       document.getElementById('fn-obs').value,
    criadoEm:  td()
  });
  sv('fornecedores');
  ['fn-nome','fn-cat','fn-tel','fn-contato','fn-pix','fn-cod-barras','fn-obs'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  populateSels();
  if(typeof _populateFornecedoresDespesas==='function') _populateFornecedoresDespesas();
  alert2('Fornecedor cadastrado!'); setFornView('lista');
}

function _copiarTexto(txt, btn){
  navigator.clipboard.writeText(txt).then(()=>{
    const orig=btn.textContent; btn.textContent='✓'; setTimeout(()=>btn.textContent=orig, 1500);
  }).catch(()=>alert('Copie manualmente: '+txt));
}

function rFornecedores(){
  const ct=document.getElementById('forn-count'); if(ct) ct.textContent=D.fornecedores.length+' cadastrado(s)';
  document.getElementById('tab-forn').innerHTML=D.fornecedores.map(f=>{
    const compras=(D.entradas||[]).filter(e=>e.forn===f.nome).length;
    const pixCell = f.pix
      ? `<td style="font-size:11px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${f.pix}">
           <span style="color:var(--text2)">${f.pix.length>18?f.pix.slice(0,18)+'…':f.pix}</span>
           <button onclick="_copiarTexto('${f.pix.replace(/'/g,"\\'")}',this)" style="background:none;border:none;color:#4F8EF7;cursor:pointer;font-size:11px;padding:0 3px" title="Copiar">⎘</button>
         </td>`
      : `<td style="color:var(--text3);font-size:11px">—</td>`;
    const barCell = f.codBarras
      ? `<td style="font-size:11px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${f.codBarras}">
           <span style="color:var(--text2)">${f.codBarras.length>16?f.codBarras.slice(0,16)+'…':f.codBarras}</span>
           <button onclick="_copiarTexto('${f.codBarras.replace(/'/g,"\\'")}',this)" style="background:none;border:none;color:#4F8EF7;cursor:pointer;font-size:11px;padding:0 3px" title="Copiar">⎘</button>
         </td>`
      : `<td style="color:var(--text3);font-size:11px">—</td>`;
    const catTag = f.categoria
      ? `<span class="tag" style="background:#2A2F42;color:#CDD3E3;border:none;font-size:10px">${f.categoria}</span>`
      : `<span style="color:var(--text3);font-size:11px">—</span>`;
    return `<tr>
      <td class="bold">${f.nome}</td>
      <td>${catTag}</td>
      <td style="color:var(--text2)">${f.contato||'—'}</td>
      <td style="font-family:var(--mono);color:var(--text2)">${f.tel||'—'}</td>
      ${pixCell}
      ${barCell}
      <td><span class="badge b-blue">${compras} lançamento(s)</span></td>
      <td><button class="btn-sm" onclick="abrirEditForn('${f.nome.replace(/'/g,"\\'")}')">✏️</button></td>
    </tr>`;
  }).join('')||`<tr><td colspan="8" style="color:var(--text3);text-align:center;padding:16px">Nenhum fornecedor cadastrado</td></tr>`;
}

function abrirEditForn(nomeOrig){
  const f=(D.fornecedores||[]).find(x=>x.nome===nomeOrig);
  if(!f) return;
  if(typeof _populateCategoriasSelects==='function') _populateCategoriasSelects();
  document.getElementById('fn-edit-nome-orig').value = nomeOrig;
  document.getElementById('fn-edit-nome').value      = f.nome;
  document.getElementById('fn-edit-cat').value       = f.categoria||'';
  document.getElementById('fn-edit-tel').value       = f.tel||'';
  document.getElementById('fn-edit-contato').value   = f.contato||'';
  document.getElementById('fn-edit-obs').value       = f.obs||'';
  document.getElementById('fn-edit-pix').value       = f.pix||'';
  document.getElementById('fn-edit-cod-barras').value= f.codBarras||'';
  document.getElementById('fn-edit-aviso-cat').style.display='none';
  document.getElementById('m-edit-forn').style.display='flex';
}

function salvarEditForn(){
  const nomeOrig = document.getElementById('fn-edit-nome-orig').value;
  const f=(D.fornecedores||[]).find(x=>x.nome===nomeOrig);
  if(!f){alert2('Fornecedor não encontrado.','error');return;}
  const novoNome     = document.getElementById('fn-edit-nome').value.trim();
  const novaCategoria= document.getElementById('fn-edit-cat').value;
  if(!novoNome){alert2('Nome é obrigatório.','error');return;}
  const catAnterior = f.categoria||'';
  f.nome        = novoNome;
  f.categoria   = novaCategoria;
  f.tel         = document.getElementById('fn-edit-tel').value;
  f.contato     = document.getElementById('fn-edit-contato').value;
  f.obs         = document.getElementById('fn-edit-obs').value;
  f.pix         = document.getElementById('fn-edit-pix').value.trim();
  f.codBarras   = document.getElementById('fn-edit-cod-barras').value.trim();
  sv('fornecedores');
  // Sincroniza categoria e nome em todas as despesas vinculadas
  let atualizadas=0;
  (D.despesas||[]).forEach(d=>{
    if(d.fornecedor===nomeOrig){
      if(novoNome!==nomeOrig) d.fornecedor=novoNome;
      if(novaCategoria && novaCategoria!==catAnterior) d.categoria=novaCategoria;
      atualizadas++;
    }
  });
  if(atualizadas) sv('despesas');
  populateSels();
  if(typeof _populateFornecedoresDespesas==='function') _populateFornecedoresDespesas();
  document.getElementById('m-edit-forn').style.display='none';
  const msg = atualizadas
    ? `Fornecedor atualizado! ${atualizadas} despesa(s) sincronizada(s).`
    : 'Fornecedor atualizado!';
  alert2(msg);
  rFornecedores();
}

// ─── COMPARATIVO DE PREÇOS ───────────────────────────────────────────────────
var _MESES_PT=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function rComparativo(){
  try{
  const busca=(document.getElementById('comp-busca')?.value||'').toLowerCase();
  const container=document.getElementById('comp-body');if(!container)return;

  // Coleta entradas com custo e data válidos
  let ents=(D.entradas||[]).filter(e=>e.custo&&Number(e.custo)&&e.data&&e.prod);
  if(busca) ents=ents.filter(e=>e.prod.toLowerCase().includes(busca));

  if(!ents.length){
    container.innerHTML='<div style="padding:40px;text-align:center;font-size:12px;color:var(--text3)">'+
      'Nenhuma entrada com custo lançada ainda.<br>Preencha o campo <strong>Custo unit.</strong> ao lançar uma NF para ver o histórico aqui.</div>';
    return;
  }

  // Meses presentes (YYYY-MM), ordenados cronologicamente
  const mesesSet=new Set();
  ents.forEach(e=>mesesSet.add(e.data.substring(0,7)));
  const meses=[...mesesSet].sort();

  // Pivot: produto → { total, porMes: { 'YYYY-MM': [{custo,forn,nf,data,qtd}] } }
  const byProd={};
  ents.forEach(e=>{
    const mes=e.data.substring(0,7);
    if(!byProd[e.prod])byProd[e.prod]={prod:e.prod,total:0,porMes:{}};
    byProd[e.prod].total++;
    if(!byProd[e.prod].porMes[mes])byProd[e.prod].porMes[mes]=[];
    byProd[e.prod].porMes[mes].push({custo:Number(e.custo),forn:e.forn||'',nf:e.nf||'',data:e.data,qtd:Number(e.qtd)});
  });

  // Ordena por total de movimentações (maior → menor)
  const prods=Object.values(byProd).sort((a,b)=>b.total-a.total);

  // Largura fixa por coluna de mês
  const colW=86;
  const totalW=200+80+meses.length*colW;

  // Cabeçalho de meses
  const mesHeader=meses.map(m=>{
    const[y,mo]=m.split('-');
    return`<th style="min-width:${colW}px;width:${colW}px;padding:7px 4px;font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center;border-left:1px solid var(--border)">${_MESES_PT[Number(mo)-1]}/${y.slice(2)}</th>`;
  }).join('');

  // Linhas
  const linhas=prods.map(p=>{
    // Custos de todas as células para calcular min/max por linha
    const todosCustos=[];
    meses.forEach(m=>{
      const cel=p.porMes[m];
      if(cel&&cel.length){
        // Usa o último valor do mês (mais recente)
        const ult=cel.slice().sort((a,b)=>b.data.localeCompare(a.data))[0];
        todosCustos.push(ult.custo);
      }
    });
    const minC=todosCustos.length?Math.min(...todosCustos):null;
    const maxC=todosCustos.length?Math.max(...todosCustos):null;
    const temVar=minC!==null&&maxC!==null&&minC!==maxC;

    // Calcula tendência geral (primeira → última célula preenchida)
    const celPreench=meses.filter(m=>p.porMes[m]&&p.porMes[m].length);
    let tendHTML='<span style="color:var(--text3)">—</span>';
    if(celPreench.length>=2){
      const primeiro=p.porMes[celPreench[0]].slice().sort((a,b)=>a.data.localeCompare(b.data))[0].custo;
      const ultimo=p.porMes[celPreench[celPreench.length-1]].slice().sort((a,b)=>b.data.localeCompare(a.data))[0].custo;
      const v=((ultimo-primeiro)/primeiro*100);
      if(v>0.5)      tendHTML=`<span style="color:var(--red);font-size:11px;font-weight:700">↑ +${v.toFixed(0)}%</span>`;
      else if(v<-0.5)tendHTML=`<span style="color:var(--green);font-size:11px;font-weight:700">↓ ${v.toFixed(0)}%</span>`;
      else           tendHTML=`<span style="color:var(--text3);font-size:11px">→ estável</span>`;
    }

    const cels=meses.map((m,mi)=>{
      const cel=p.porMes[m];
      if(!cel||!cel.length) return`<td style="min-width:${colW}px;border-left:1px solid var(--border);text-align:center;color:var(--text3);font-size:11px">—</td>`;

      // Ordena cronológico — mostra última compra do mês
      const sorted=cel.slice().sort((a,b)=>b.data.localeCompare(a.data));
      const ult=sorted[0];
      const isMelhor=temVar&&ult.custo===minC;
      const isPior=temVar&&ult.custo===maxC;
      const bg=isMelhor?'rgba(34,197,94,.08)':isPior?'rgba(239,68,68,.08)':'';
      const cor=isMelhor?'var(--green)':isPior?'var(--red)':'var(--text)';

      // Variação em relação ao mês anterior com dados
      let varHTML='';
      const antMes=meses.slice(0,mi).reverse().find(mm=>p.porMes[mm]&&p.porMes[mm].length);
      if(antMes){
        const antCusto=p.porMes[antMes].slice().sort((a,b)=>b.data.localeCompare(a.data))[0].custo;
        const dlt=(ult.custo-antCusto)/antCusto*100;
        if(dlt>0.5)      varHTML=`<div style="font-size:9px;color:var(--red)">↑ +${dlt.toFixed(1)}%</div>`;
        else if(dlt<-0.5)varHTML=`<div style="font-size:9px;color:var(--green)">↓ ${dlt.toFixed(1)}%</div>`;
        else             varHTML=`<div style="font-size:9px;color:var(--text3)">→</div>`;
      }

      const cnt=cel.length>1?`<div style="font-size:9px;color:var(--text3)">${cel.length}x</div>`:'';
      const fornTip=ult.forn?`title="${ult.forn}${ult.nf?' · NF '+ult.nf:''} · ${fd(ult.data)}"`:'';

      return`<td ${fornTip} style="min-width:${colW}px;border-left:1px solid var(--border);text-align:center;background:${bg};padding:5px 4px;vertical-align:middle;cursor:default">
        <div style="font-family:var(--mono);font-size:12px;font-weight:700;color:${cor}">R$ ${ult.custo.toFixed(2)}</div>
        ${varHTML}${cnt}
      </td>`;
    }).join('');

    return`<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:8px 12px;font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;max-width:200px;overflow:hidden;text-overflow:ellipsis" title="${p.prod}">${p.prod}</td>
      <td style="padding:8px 8px;text-align:center;border-left:1px solid var(--border)">${tendHTML}</td>
      ${cels}
    </tr>`;
  }).join('');

  container.innerHTML=`
    <div style="overflow-x:auto;padding:16px">
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px">
        ${prods.length} produto(s) com histórico de preço · Ordenado por movimentação · Passe o mouse sobre o valor para ver fornecedor
      </div>
      <table style="border-collapse:collapse;min-width:${totalW}px;width:100%">
        <thead>
          <tr style="background:var(--bg2)">
            <th style="padding:8px 12px;font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:left;min-width:200px">Produto</th>
            <th style="padding:8px 8px;font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center;min-width:80px;border-left:1px solid var(--border)">Tendência</th>
            ${mesHeader}
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
      <div style="margin-top:12px;font-size:10px;color:var(--text3)">
        🟢 Menor preço do produto &nbsp;|&nbsp; 🔴 Maior preço &nbsp;|&nbsp; <em>Nx</em> = N compras no mês (exibe a mais recente)
      </div>
    </div>`;
  }catch(err){
    console.error('rComparativo:',err);
    if(document.getElementById('comp-body'))
      document.getElementById('comp-body').innerHTML=
        '<div style="padding:32px;text-align:center;font-size:12px;color:var(--text3)">Erro ao carregar comparativo. Recarregue a página.</div>';
  }
}

