// ─── ESTOQUES HISTÓRICOS (MAR / ABR) ──────────────────────────────────────────
function rEst(mes){
  const src=mes==='mar'?MAR:ABR;
  const b=(document.getElementById(mes==='mar'?'mbusca':'abusca').value||'').toLowerCase();
  const cat=document.getElementById(mes==='mar'?'mcat':'abcat').value;
  document.getElementById('tab-'+mes).innerHTML=Object.entries(src)
    .filter(([n,v])=>(!b||n.toLowerCase().includes(b))&&(!cat||v.cat===cat))
    .map(([n,v])=>`<tr>
      <td class="bold">${n}</td>
      <td><span class="badge b-blue" style="font-size:9px">${v.cat}</span></td>
      <td>${fN(v.est)}</td><td>${fN(v.salao)}</td>
      <td class="bold">${fN(v.est+v.salao)}</td>
    </tr>`).join('');
}

