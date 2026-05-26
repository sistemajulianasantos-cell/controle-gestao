// ─── PREÇOS (CUSTO E REVENDA) ──────────────────────────────────────────────────
let precosView='lista';

// Varre D.entradas e popula D.precos com o custo mais recente por produto.
// Roda automaticamente ao abrir a aba — garante retrocompatibilidade com NFs
// lançadas antes do auto-update ser implementado.
function sincronizarPrecosDeEntradas(){
  if(!D.entradas||!D.entradas.length) return;
  if(!D.precos) D.precos={};
  let atualizado=false;
  D.entradas.forEach(e=>{
    if(!e.custo||!Number(e.custo)) return;
    const n=e.prod; if(!n) return;
    if(!D.precos[n]) D.precos[n]={};
    const ultData=D.precos[n].ultimaCompra||'';
    if(!ultData||e.data>=ultData){
      D.precos[n].custo=Number(e.custo);
      D.precos[n].ultimaCompra=e.data;
      D.precos[n].ultimoFornecedor=e.forn||'';
      atualizado=true;
    }
  });
  if(atualizado) sv('precos');
}

function setPrecosView(v){
  precosView=v;
  ['lista','editar'].forEach(x=>{
    const btn=document.getElementById('pv-'+x);
    if(btn)btn.classList.toggle('active',x===v);
    const view=document.getElementById('pview-'+x);
    if(view)view.style.display=x===v?'block':'none';
  });
  if(v==='lista'){sincronizarPrecosDeEntradas();rPrecos();}
  if(v==='editar'){sincronizarPrecosDeEntradas();rEditarPrecos();}
}

// Retorna lista unificada de produtos: D.produtos (se existir) + quaisquer
// chaves em D.precos que não estejam nessa lista (compatibilidade retroativa).
function _listaProdutosPrecos(){
  // Fonte principal: D.produtos cadastrados
  const base=(D.produtos&&D.produtos.length)
    ? D.produtos.map(p=>({nome:p.nome||p,cat:p.cat||MAR[p.nome||p]?.cat||''}))
    : nomes.map(n=>({nome:n,cat:MAR[n]?.cat||''}));

  // Adiciona produtos que têm preço mas não estão na lista principal
  const nomesBase=new Set(base.map(p=>p.nome));
  Object.keys(D.precos||{}).forEach(n=>{
    if(!nomesBase.has(n)) base.push({nome:n,cat:MAR[n]?.cat||''});
  });

  return base.sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
}

function rPrecos(){
  const container=document.getElementById('precos-lista-body');
  if(!container)return;
  const busca=(document.getElementById('precos-busca')?.value||'').toLowerCase();
  const catF=document.getElementById('precos-cat')?.value||'';

  const todos=_listaProdutosPrecos();
  const rows=todos.filter(p=>{
    if(busca&&!p.nome.toLowerCase().includes(busca))return false;
    if(catF&&p.cat!==catF)return false;
    return true;
  });

  const comPreco=rows.filter(p=>D.precos[p.nome]?.custo||D.precos[p.nome]?.revenda).length;

  container.innerHTML=`
    <div style="padding:8px 16px;font-size:11px;color:var(--text3);border-bottom:1px solid var(--border)">
      ${comPreco} de ${rows.length} produto(s) com preço cadastrado
    </div>
    <table>
      <thead><tr><th>Produto</th><th>Categoria</th><th style="text-align:right">Custo unit.</th><th style="text-align:right">Revenda unit.</th><th style="text-align:right">Margem</th></tr></thead>
      <tbody>
        ${rows.map(p=>{
          const pr=D.precos[p.nome]||{};
          const margem=pr.custo&&pr.revenda?((pr.revenda-pr.custo)/pr.revenda*100).toFixed(0):null;
          return`<tr>
            <td class="bold">${p.nome}</td>
            <td>${p.cat?`<span class="badge b-blue" style="font-size:9px">${p.cat}</span>`:'<span style="color:var(--text3);font-size:11px">—</span>'}</td>
            <td style="font-family:var(--mono);text-align:right;color:${pr.custo?'var(--text2)':'var(--text3)'}">${pr.custo?fR(pr.custo):'— a preencher'}</td>
            <td style="font-family:var(--mono);text-align:right;color:${pr.revenda?'var(--green)':'var(--text3)'}">${pr.revenda?fR(pr.revenda):'— a preencher'}</td>
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

  const todos=_listaProdutosPrecos();
  const rows=todos.filter(p=>{
    if(busca&&!p.nome.toLowerCase().includes(busca))return false;
    if(catF&&p.cat!==catF)return false;
    return true;
  });

  container.innerHTML=`
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;background:var(--bg3);border-bottom:1px solid var(--border)">
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Categoria</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Custo unit. (R$)</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Revenda unit. (R$)</div>
    </div>`+
  rows.map(p=>{
    const n=p.nome;
    const pr=D.precos[n]||{};
    const nEsc=n.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return`<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;border-bottom:1px solid var(--border);align-items:center">
      <div style="padding:8px 14px;font-size:12px;font-weight:500;color:var(--text)">${n}</div>
      <div style="padding:8px 14px">${p.cat?`<span class="badge b-blue" style="font-size:9px">${p.cat}</span>`:'<span style="color:var(--text3);font-size:11px">—</span>'}</div>
      <div style="padding:6px 10px;text-align:center">
        <input type="number" min="0" step="0.01" placeholder="0,00"
          value="${pr.custo||''}"
          onchange="if(!D.precos['${nEsc}'])D.precos['${nEsc}']={};D.precos['${nEsc}'].custo=this.value?Number(this.value):null"
          style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
      </div>
      <div style="padding:6px 10px;text-align:center">
        <input type="number" min="0" step="0.01" placeholder="0,00"
          value="${pr.revenda||''}"
          onchange="if(!D.precos['${nEsc}'])D.precos['${nEsc}']={};D.precos['${nEsc}'].revenda=this.value?Number(this.value):null"
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

