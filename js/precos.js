// ─── PREÇOS (CUSTO E REVENDA) ──────────────────────────────────────────────────
let precosView='lista';
function setPrecosView(v){
  precosView=v;
  ['lista','editar'].forEach(x=>{
    const btn=document.getElementById('pv-'+x);
    if(btn)btn.classList.toggle('active',x===v);
    const view=document.getElementById('pview-'+x);
    if(view)view.style.display=x===v?'block':'none';
  });
  if(v==='lista')rPrecos();
  if(v==='editar')rEditarPrecos();
}

function rPrecos(){
  const container=document.getElementById('precos-lista-body');
  if(!container)return;
  const busca=(document.getElementById('precos-busca')?.value||'').toLowerCase();
  const catF=document.getElementById('precos-cat')?.value||'';

  const rows=nomes.filter(n=>{
    if(busca&&!n.toLowerCase().includes(busca))return false;
    if(catF&&MAR[n].cat!==catF)return false;
    return true;
  });

  const comPreco=rows.filter(n=>D.precos[n]?.custo||D.precos[n]?.revenda).length;

  container.innerHTML=`
    <div style="padding:8px 16px;font-size:11px;color:var(--text3);border-bottom:1px solid var(--border)">
      ${comPreco} de ${rows.length} produto(s) com preço cadastrado
    </div>
    <table>
      <thead><tr><th>Produto</th><th>Categoria</th><th style="text-align:right">Custo unit.</th><th style="text-align:right">Revenda unit.</th><th style="text-align:right">Margem</th></tr></thead>
      <tbody>
        ${rows.map(n=>{
          const p=D.precos[n]||{};
          const margem=p.custo&&p.revenda?((p.revenda-p.custo)/p.revenda*100).toFixed(0):null;
          return`<tr>
            <td class="bold">${n}</td>
            <td><span class="badge b-blue" style="font-size:9px">${MAR[n].cat}</span></td>
            <td style="font-family:var(--mono);text-align:right;color:${p.custo?'var(--text2)':'var(--text3)'}">${p.custo?fR(p.custo):'— a preencher'}</td>
            <td style="font-family:var(--mono);text-align:right;color:${p.revenda?'var(--green)':'var(--text3)'}">${p.revenda?fR(p.revenda):'— a preencher'}</td>
            <td style="font-family:var(--mono);text-align:right;color:${margem?Number(margem)>=30?'var(--green)':'var(--amber)':'var(--text3)'}">${margem?margem+'%':'—'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function rEditarPrecos(){
  const container=document.getElementById('precos-editar-body');
  if(!container)return;
  const busca=(document.getElementById('precos-edit-busca')?.value||'').toLowerCase();
  const catF=document.getElementById('precos-edit-cat')?.value||'';

  const rows=nomes.filter(n=>{
    if(busca&&!n.toLowerCase().includes(busca))return false;
    if(catF&&MAR[n].cat!==catF)return false;
    return true;
  });

  container.innerHTML=`
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;background:var(--bg3);border-bottom:1px solid var(--border)">
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Categoria</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Custo unit. (R$)</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Revenda unit. (R$)</div>
    </div>`+
  rows.map(n=>{
    const p=D.precos[n]||{};
    return`<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;border-bottom:1px solid var(--border);align-items:center">
      <div style="padding:8px 14px;font-size:12px;font-weight:500;color:var(--text)">${n}</div>
      <div style="padding:8px 14px"><span class="badge b-blue" style="font-size:9px">${MAR[n].cat}</span></div>
      <div style="padding:6px 10px;text-align:center">
        <input type="number" min="0" step="0.01" placeholder="0,00"
          value="${p.custo||''}"
          onchange="if(!D.precos['${n.replace(/'/g,"\\'")}'])D.precos['${n.replace(/'/g,"\\'")}']={};D.precos['${n.replace(/'/g,"\\'")}'].custo=this.value?Number(this.value):null"
          style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
      </div>
      <div style="padding:6px 10px;text-align:center">
        <input type="number" min="0" step="0.01" placeholder="0,00"
          value="${p.revenda||''}"
          onchange="if(!D.precos['${n.replace(/'/g,"\\'")}'])D.precos['${n.replace(/'/g,"\\'")}']={};D.precos['${n.replace(/'/g,"\\'")}'].revenda=this.value?Number(this.value):null"
          style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
      </div>
    </div>`;
  }).join('');
}

function salvarPrecos(){
  sv('precos');
  alert2('Preços salvos com sucesso!');
  setPrecosView('lista');
}

