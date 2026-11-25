// ─── DESPESAS RECORRENTES (11-25) ────────────────────────────────────────────
// Descobre sozinho os pagamentos que se repetem todo mês (CEMIG, COPASA,
// aluguel…) olhando o histórico de D.despesas, e avisa quando o mês escolhido
// ainda não tem lançamento deles. Nada é lançado automaticamente: o botão
// "Lançar" só abre o formulário já preenchido para ela conferir e salvar.
//
// Regra:
//   - Mesmo pagamento = mesmo fornecedor (ou, sem fornecedor, a descrição sem
//     números — "CEMIG 10/2026" e "CEMIG 11/2026" viram um só).
//   - Conta para o mês se a data OU o vencimento cair nele.
//   - Recorrente = apareceu em 3+ dos 6 meses anteriores e em pelo menos um
//     dos 3 últimos (o que parou há tempo sai sozinho).
//   - Ela pode fixar ("Sempre acompanhar") ou tirar ("Não é recorrente");
//     fica salvo em D.despRecorrentes = { chave: { modo, nome } }.
// Pagamentos de equipe (gerados pelos eventos) ficam de fora.

const _REC_MESES_JANELA = 6;
const _REC_MIN_MESES = 3;
const _REC_NOMES_MES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function _recEsc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function _recConfig() { return D.despRecorrentes || (D.despRecorrentes = {}); }

function _recChave(d) {
  const base = d.fornecedor || _descricaoSemPrefixo(d) || '';
  return String(base).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
    .replace(/[0-9]+/g, ' ').replace(/[^A-Z ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
// Nome para mostrar: sem o mês/ano que vem na descrição ("COPASA 10/2026").
function _recSemMes(t) { return String(t || '').replace(/\b\d{1,2}\/\d{2,4}\b/g, '').replace(/\s+/g, ' ').trim(); }
function _recChaveNome(nome) { return _recChave({ fornecedor: nome }); }

// AAAA-MM somando n meses
function _recMesMais(am, n) {
  const a = +am.slice(0, 4), m = +am.slice(5, 7) - 1 + n;
  const d = new Date(a, m, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
function _recNomeMes(am) { return _REC_NOMES_MES[+am.slice(5, 7) - 1] + '/' + am.slice(0, 4); }

// Mês que está sendo conferido: o do filtro Mês/Ano do topo; sem mês
// escolhido, o mês atual (ou dezembro, se o ano escolhido já passou).
function _recMesRef() {
  const hoje = new Date();
  const anoAtual = String(hoje.getFullYear());
  const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = document.getElementById('desp-ano')?.value || anoAtual;
  const mes = document.getElementById('desp-mes')?.value || '';
  if (mes) return ano + '-' + mes;
  if (ano === anoAtual) return ano + '-' + mesAtual;
  return ano + (ano < anoAtual ? '-12' : '-01');
}

// Agrupa o histórico por pagamento e decide quem é recorrente.
function _recCalcular(mesRef) {
  const cfg = _recConfig();
  const grupos = new Map();
  (D.despesas || []).forEach(d => {
    if (d.pagamentoEquipeId) return;
    const k = _recChave(d);
    if (!k || k.length < 3) return;
    let g = grupos.get(k);
    if (!g) grupos.set(k, g = { chave: k, meses: new Map(), lista: [] });
    g.lista.push(d);
    [d.data, d.dataVencimento].forEach(dt => {
      if (!dt || !/^\d{4}-\d{2}/.test(dt)) return;
      const am = dt.slice(0, 7);
      if (!g.meses.has(am)) g.meses.set(am, []);
      if (g.meses.get(am).indexOf(d) === -1) g.meses.get(am).push(d);
    });
  });
  // Fixado à mão sem nenhum lançamento ainda: aparece também.
  Object.keys(cfg).forEach(k => {
    if (cfg[k] && cfg[k].modo === 'fixo' && !grupos.has(k)) grupos.set(k, { chave: k, meses: new Map(), lista: [] });
  });

  const janela = [];
  for (let i = _REC_MESES_JANELA; i >= 1; i--) janela.push(_recMesMais(mesRef, -i));
  const ultimos = janela.slice(-3);
  const hojeISO = new Date().toISOString().slice(0, 10);

  const itens = [];
  grupos.forEach(g => {
    const modo = cfg[g.chave] && cfg[g.chave].modo;
    const nJanela = janela.filter(am => g.meses.has(am)).length;
    const recente = ultimos.some(am => g.meses.has(am));
    const auto = nJanela >= _REC_MIN_MESES && recente;
    if (modo === 'ignorado') { if (auto) itens.push(Object.assign(g, { modo, nJanela })); return; }
    if (!auto && modo !== 'fixo') return;

    // Mais recente primeiro (pela data ou vencimento)
    const ord = g.lista.slice().sort((a, b) => ((b.dataVencimento || b.data || '')).localeCompare(a.dataVencimento || a.data || ''));
    const anteriores = ord.filter(d => (d.dataVencimento || d.data || '').slice(0, 7) < mesRef);
    const ult = anteriores[0] || ord[0] || null;
    const valores = anteriores.slice(0, 3).map(d => Number(d.valor) || 0).filter(v => v > 0);
    const media = valores.length ? valores.reduce((s, v) => s + v, 0) / valores.length : 0;
    // Dia em que costuma vencer (mediana dos últimos vencimentos)
    const dias = anteriores.filter(d => d.dataVencimento).slice(0, 6).map(d => +d.dataVencimento.slice(8, 10)).sort((a, b) => a - b);
    const dia = dias.length ? dias[Math.floor(dias.length / 2)] : 0;

    const doMes = g.meses.get(mesRef) || [];
    let status;
    if (doMes.length) status = 'lancado';
    else {
      const ultimoDia = new Date(+mesRef.slice(0, 4), +mesRef.slice(5, 7), 0).getDate();
      const venc = mesRef + '-' + String(Math.min(dia || ultimoDia, ultimoDia)).padStart(2, '0');
      status = venc < hojeISO ? 'atrasado' : 'falta';
    }
    itens.push(Object.assign(g, {
      modo: modo || 'auto', nJanela, ult, media, dia, doMes, status,
      nome: (ult && (ult.fornecedor || _recSemMes(_descricaoSemPrefixo(ult)))) || (cfg[g.chave] && cfg[g.chave].nome) || g.chave,
      categoria: ult ? ult.categoria || '' : '',
    }));
  });
  return { itens, janela };
}

// Os que faltam lançar no mês — usado também no aviso do Dashboard.
function _recPendentes(mesRef) {
  return _recCalcular(mesRef).itens.filter(i => i.modo !== 'ignorado' && i.status !== 'lancado');
}

function rDespesasRecorrentes() {
  const el = document.getElementById('desp-view-recorrentes');
  if (!el) return;
  const mesRef = _recMesRef();
  const { itens, janela } = _recCalcular(mesRef);
  const ativos = itens.filter(i => i.modo !== 'ignorado');
  const ignorados = itens.filter(i => i.modo === 'ignorado');
  const ordem = { atrasado: 0, falta: 1, lancado: 2 };
  ativos.sort((a, b) => ordem[a.status] - ordem[b.status] || (a.dia || 99) - (b.dia || 99) || a.nome.localeCompare(b.nome, 'pt-BR'));
  const faltam = ativos.filter(i => i.status !== 'lancado');
  const lancados = ativos.length - faltam.length;

  const tag = (txt, cor, bg) => `<span style="background:${bg};color:${cor};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;border:1px solid ${cor}40;white-space:nowrap">${txt}</span>`;
  const btn = 'font-size:11px;padding:3px 8px;background:var(--bg3);border:1px solid var(--border2)';

  const linha = i => {
    const st = i.status === 'lancado'
      ? tag('Lançado', 'var(--green)', 'var(--green-bg)')
      : i.status === 'atrasado' ? tag('Sem lançamento', 'var(--red)', 'var(--red-bg)') : tag('Ainda não lançado', 'var(--amber)', 'var(--amber-bg)');
    const noMes = i.doMes.length
      ? i.doMes.map(d => `${fR(d.valor || 0)}${d.dataVencimento ? ' · vence ' + fd(d.dataVencimento) : ''}`).join('<br>')
      : (i.dia ? `costuma vencer dia ${i.dia}` : '—');
    const hist = janela.map(am => `<span title="${_recNomeMes(am)}" style="display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:2px;background:${i.meses.has(am) ? 'var(--green)' : 'var(--border)'}"></span>`).join('');
    const k = _recEsc(i.chave);
    return `<tr style="border-bottom:1px solid var(--bg3)">
      <td style="padding:8px 10px"><strong>${_recEsc(i.nome)}</strong>${i.modo === 'fixo' ? '<div style="font-size:10px;color:var(--text3)">acompanhado sempre</div>' : ''}</td>
      <td style="padding:8px 10px;font-size:12px;color:var(--text2)">${_recEsc(i.categoria || '—')}</td>
      <td style="padding:8px 10px;white-space:nowrap">${hist}<div style="font-size:10px;color:var(--text3)">${i.nJanela} de ${janela.length} meses</div></td>
      <td style="padding:8px 10px;text-align:right;white-space:nowrap">${i.media ? fR(i.media) : '—'}</td>
      <td style="padding:8px 10px">${st}</td>
      <td style="padding:8px 10px;font-size:12px;color:var(--text2)">${noMes}</td>
      <td style="padding:8px 10px;white-space:nowrap">
        ${i.status !== 'lancado' ? `<button class="btn-sm" onclick="recLancar('${k}')" style="font-size:11px;padding:3px 8px;background:var(--green-bg);border:1px solid #15803D40;color:var(--green)">Lançar</button>` : ''}
        ${i.modo === 'fixo'
          ? `<button class="btn-sm" onclick="recDefinir('${k}','')" style="${btn}" title="Volta a ser detectado pelo histórico">Deixar automático</button>`
          : `<button class="btn-sm" onclick="recDefinir('${k}','fixo')" style="${btn}" title="Continua na lista mesmo se pular algum mês">Sempre acompanhar</button>`}
        <button class="btn-sm" onclick="recDefinir('${k}','ignorado')" style="${btn}">Não é recorrente</button>
      </td>
    </tr>`;
  };

  // Fornecedores que ainda não estão na lista, para acompanhar à mão.
  const naLista = new Set(itens.map(i => i.chave));
  const fornOpc = (D.fornecedores || []).map(f => f.nome).filter(n => n && !naLista.has(_recChaveNome(n)))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  el.innerHTML = `
    <div class="cards" style="margin-bottom:16px">
      <div class="card"><div class="card-label">Conferindo</div><div class="card-val" style="font-size:20px">${_recNomeMes(mesRef)}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">troque o Mês/Ano no topo para ver outro mês</div></div>
      <div class="card" style="border-left:3px solid var(--red)"><div class="card-label">Faltam lançar</div><div class="card-val" style="color:var(--red)">${faltam.length}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">${faltam.length ? 'previsto ' + fR(faltam.reduce((s, i) => s + i.media, 0)) : 'tudo lançado'}</div></div>
      <div class="card" style="border-left:3px solid var(--green)"><div class="card-label">Já lançados</div><div class="card-val" style="color:var(--green)">${lancados}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">de ${ativos.length} recorrente(s)</div></div>
    </div>

    <div class="sec">
      <div class="sec-head"><span class="sec-title">Pagamentos recorrentes</span>
        <span style="font-size:11px;color:var(--text3)">recorrente = apareceu em ${_REC_MIN_MESES} ou mais dos ${_REC_MESES_JANELA} meses anteriores (${_recNomeMes(janela[0])} a ${_recNomeMes(janela[janela.length - 1])})</span></div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead><tr style="color:var(--text2);border-bottom:1px solid var(--border);text-align:left">
            <th style="padding:8px 10px;font-weight:500">Pagamento</th>
            <th style="padding:8px 10px;font-weight:500">Categoria</th>
            <th style="padding:8px 10px;font-weight:500">Últimos meses</th>
            <th style="padding:8px 10px;font-weight:500;text-align:right">Valor médio</th>
            <th style="padding:8px 10px;font-weight:500">${_recNomeMes(mesRef)}</th>
            <th style="padding:8px 10px;font-weight:500">No mês</th>
            <th style="padding:8px 10px"></th>
          </tr></thead>
          <tbody>${ativos.length ? ativos.map(linha).join('') : '<tr><td colspan="7" style="text-align:center;color:var(--text2);padding:24px">Nenhum pagamento recorrente encontrado no histórico.</td></tr>'}</tbody>
        </table>
      </div>
      <div style="padding:12px 14px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;border-top:1px solid var(--border)">
        <span style="font-size:12px;color:var(--text2)">Acompanhar outro fornecedor:</span>
        <select id="rec-add-forn" class="inp" style="max-width:260px"><option value="">Escolha...</option>${fornOpc.map(n => `<option value="${_recEsc(n)}">${_recEsc(n)}</option>`).join('')}</select>
        <button class="btn-sm" onclick="recAdicionar()" style="${btn}">Acompanhar</button>
      </div>
    </div>

    ${ignorados.length ? `
    <div class="sec" style="margin-top:16px">
      <div class="sec-head"><span class="sec-title">Marcados como não recorrentes</span></div>
      <div style="padding:10px 14px;display:flex;gap:8px;flex-wrap:wrap">
        ${ignorados.map(i => `<span style="font-size:12px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;padding:3px 8px">${_recEsc((D.despRecorrentes[i.chave] || {}).nome || i.chave)}
          <button class="btn-sm" onclick="recDefinir('${_recEsc(i.chave)}','')" style="font-size:10px;padding:1px 6px;margin-left:4px">Voltar a acompanhar</button></span>`).join('')}
      </div>
    </div>` : ''}
  `;
}

function recDefinir(chave, modo) {
  const cfg = _recConfig();
  const item = _recCalcular(_recMesRef()).itens.find(i => i.chave === chave);
  if (!modo) delete cfg[chave];
  else cfg[chave] = { modo, nome: (item && item.nome) || (cfg[chave] && cfg[chave].nome) || chave };
  sv('despRecorrentes');
  rDespesasRecorrentes();
}

function recAdicionar() {
  const nome = document.getElementById('rec-add-forn')?.value || '';
  if (!nome) { alert2('Escolha um fornecedor.', 'error'); return; }
  _recConfig()[_recChaveNome(nome)] = { modo: 'fixo', nome };
  sv('despRecorrentes');
  rDespesasRecorrentes();
}

// Abre o "Lançar" já preenchido com o último lançamento desse pagamento.
// Ela confere e salva — nada é gravado aqui.
function recLancar(chave) {
  const mesRef = _recMesRef();
  const item = _recCalcular(mesRef).itens.find(i => i.chave === chave);
  if (!item) return;
  const u = item.ult || {};
  _despEsconderCloneHint();
  despSetView('lancar');
  const set = (id, v) => { const e = document.getElementById(id); if (e) e.value = v == null ? '' : v; };
  const forn = u.fornecedor || (D.despRecorrentes[chave] || {}).nome || item.nome;
  _despGarantirOpcao('desp-form-forn', forn);
  set('desp-form-forn', forn);
  if (item.categoria) { _despGarantirOpcao('desp-form-cat', item.categoria); set('desp-form-cat', item.categoria); }
  let forma = u.forma || _detectarFormaDespesa(u) || '';
  if (forma === 'pix_manual' || forma === 'pix_nota') forma = 'pix';
  set('desp-form-forma', forma);
  // Mês/ano da descrição antiga troca pelo mês conferido ("COPASA 10/2026" → 11/2026)
  set('desp-form-desc', u.descricao ? _descricaoSemPrefixo(u).replace(/\b\d{1,2}\/\d{4}\b/g, mesRef.slice(5, 7) + '/' + mesRef.slice(0, 4)) : '');
  set('desp-form-valor', item.media ? item.media.toFixed(2) : '');
  set('desp-form-data', new Date().toISOString().slice(0, 10));
  if (item.dia) {
    const ultimoDia = new Date(+mesRef.slice(0, 4), +mesRef.slice(5, 7), 0).getDate();
    set('desp-form-vencimento', mesRef + '-' + String(Math.min(item.dia, ultimoDia)).padStart(2, '0'));
  } else set('desp-form-vencimento', '');
  set('desp-form-pagamento', '');
  set('desp-form-nf', '');
  set('desp-form-obs', '');
  if (typeof _despPixInfo === 'function') _despPixInfo(forn, 'desp-form-pix-box');
  const h = document.getElementById('desp-form-clone-hint');
  if (h) { h.style.display = ''; h.textContent = 'Preenchido com o último lançamento de ' + item.nome + ' (valor = média dos últimos). Confira antes de salvar.'; }
}

// Aviso no Dashboard de Despesas.
function _recAvisoDashboard() {
  const el = document.getElementById('desp-view-kpi');
  if (!el) return;
  const mesRef = _recMesRef();
  const pend = _recPendentes(mesRef);
  if (!pend.length) return;
  const nomes = pend.slice(0, 6).map(i => _recEsc(i.nome)).join(', ') + (pend.length > 6 ? '…' : '');
  el.insertAdjacentHTML('afterbegin', `<div style="background:var(--amber-bg);border:1px solid var(--amber);border-radius:var(--radius);padding:10px 14px;margin-bottom:16px;font-size:13px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
    <span><strong>${pend.length} pagamento(s) recorrente(s) sem lançamento em ${_recNomeMes(mesRef)}:</strong> ${nomes}</span>
    <button class="btn-sm" onclick="despSetView('recorrentes')" style="margin-left:auto">Ver recorrentes</button></div>`);
}
