// ─── EQUIPE ────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

let equipeView = 'lista'; // 'lista' | 'perfil' | 'agenda'
let equipeAtualId = null;

const CARGOS_EQUIPE = ['Head Bartender','Bartender','Bar Back','Copeiro','Coordenador','Auxiliar'];
const NIVEIS_EQUIPE = ['Novato','Experiente','Sênior'];

function rEquipe() {
  if (equipeView === 'perfil' && equipeAtualId) rEquipePerfil();
  else if (equipeView === 'agenda') rEscalaAgenda();
  else rEquipeLista();
}

// ─── LISTA ────────────────────────────────────────────────────────────────────

function rEquipeLista() {
  equipeView = 'lista';
  const el = document.getElementById('eq-content');
  if (!el) return;

  const equipe   = D.equipe  || [];
  const busca    = (document.getElementById('eq-busca')?.value        || '').toLowerCase();
  const fCargo   =  document.getElementById('eq-filtro-cargo')?.value || '';
  const fStatus  =  document.getElementById('eq-filtro-status')?.value|| 'ativo';

  const hoje     = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const lista = equipe.filter(c => {
    if (fStatus !== 'todos' && (c.status||'ativo') !== fStatus) return false;
    if (fCargo  && c.cargo !== fCargo) return false;
    if (busca   && !(c.nome||'').toLowerCase().includes(busca)) return false;
    return true;
  }).sort((a,b) => (a.nome||'').localeCompare(b.nome||''));

  const ativos          = equipe.filter(c => (c.status||'ativo') !== 'inativo').length;
  const aniversariantes = equipe.filter(c => c.nascimento && parseInt(c.nascimento.split('-')[1]) === mesAtual);
  const escalasDoMes    = (D.escalas||[]).filter(e => {
    if (!e.dataEvento) return false;
    return e.dataEvento.startsWith(`${anoAtual}-${String(mesAtual).padStart(2,'0')}`);
  });

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <span style="font-size:16px;font-weight:600;color:var(--text)">Equipe</span>
      <input id="eq-busca" type="text" placeholder="Buscar..." value="${busca}"
        oninput="rEquipeLista()"
        style="padding:6px 10px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);color:var(--text);font-size:12px;width:160px">
      <select id="eq-filtro-cargo" onchange="rEquipeLista()"
        style="padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);color:var(--text);font-size:12px">
        <option value="">Todos os cargos</option>
        ${CARGOS_EQUIPE.map(c=>`<option value="${c}" ${fCargo===c?'selected':''}>${c}</option>`).join('')}
      </select>
      <select id="eq-filtro-status" onchange="rEquipeLista()"
        style="padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);color:var(--text);font-size:12px">
        <option value="ativo"   ${fStatus==='ativo'  ?'selected':''}>Ativos</option>
        <option value="inativo" ${fStatus==='inativo'?'selected':''}>Inativos</option>
        <option value="todos"   ${fStatus==='todos'  ?'selected':''}>Todos</option>
      </select>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-sm" onclick="equipeView='agenda';rEscalaAgenda()"
          style="background:var(--bg2);border:1px solid var(--border2)">📅 Agenda de Escalas</button>
        <button class="btn btn-primary btn-sm" onclick="abrirNovoColab()">+ Novo colaborador</button>
      </div>
    </div>

    <div class="cards" style="margin-bottom:14px">
      <div class="card">
        <div class="card-label">Colaboradores ativos</div>
        <div class="card-val">${ativos}</div>
      </div>
      <div class="card">
        <div class="card-label">Aniversariantes do mês</div>
        <div class="card-val" style="color:${aniversariantes.length?'var(--amber)':'var(--text)'}">${aniversariantes.length}</div>
      </div>
      <div class="card">
        <div class="card-label">Escalas este mês</div>
        <div class="card-val">${escalasDoMes.length}</div>
      </div>
      <div class="card">
        <div class="card-label">Exibindo</div>
        <div class="card-val">${lista.length}</div>
      </div>
    </div>

    ${aniversariantes.length ? `
    <div style="background:#1A1400;border:1px solid var(--amber);border-radius:var(--radius);
                padding:10px 16px;margin-bottom:12px;font-size:12px;color:var(--amber)">
      🎂 <strong>Aniversariantes de ${['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
        'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][mesAtual]}:</strong>
      ${aniversariantes.map(c=>`<strong>${c.nome.split(' ')[0]}</strong> (${fd(c.nascimento)})`).join(' · ')}
    </div>` : ''}

    <div class="sec">
      <div class="sec-head"><span class="sec-title">👥 Colaboradores</span></div>
      ${!lista.length ? `
        <div style="text-align:center;padding:48px;color:var(--text3)">
          <div style="font-size:32px;margin-bottom:10px">👥</div>
          <div>Nenhum colaborador encontrado</div>
        </div>` : `
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="border-bottom:2px solid var(--border2);font-size:10px;text-transform:uppercase;color:var(--text3)">
              <th style="padding:8px 12px;text-align:left;font-weight:500">Nome</th>
              <th style="padding:8px 8px;text-align:left;font-weight:500">Cargo</th>
              <th style="padding:8px 8px;text-align:left;font-weight:500">Nível</th>
              <th style="padding:8px 8px;text-align:left;font-weight:500">Telefone</th>
              <th style="padding:8px 8px;text-align:center;font-weight:500">Aniversário</th>
              <th style="padding:8px 8px;text-align:center;font-weight:500">Escalas</th>
              <th style="padding:8px 8px;text-align:center;font-weight:500">Status</th>
              <th style="padding:8px 8px;text-align:center;font-weight:500"></th>
            </tr>
          </thead>
          <tbody>
            ${lista.map(c => {
              const totalEsc  = (D.escalas||[]).filter(e => e.colaboradorId === c.id).length;
              const isAniv    = c.nascimento && parseInt(c.nascimento.split('-')[1]) === mesAtual;
              return `
              <tr style="border-bottom:1px solid var(--border);cursor:pointer;transition:.1s"
                  onclick="abrirPerfilColab('${c.id}')"
                  onmouseover="this.style.background='var(--bg3)'"
                  onmouseout="this.style.background=''">
                <td style="padding:8px 12px">
                  <div style="font-weight:600;color:var(--text)">${c.nome}</div>
                  ${c.cpf ? `<div style="font-size:10px;color:var(--text3)">${c.cpf}</div>` : ''}
                </td>
                <td style="padding:8px 8px">
                  <span class="badge b-blue" style="font-size:10px">${c.cargo||'—'}</span>
                </td>
                <td style="padding:8px 8px;font-size:11px;
                           color:${c.nivel==='Novato'?'var(--amber)':c.nivel==='Sênior'?'var(--green)':'var(--text3)'}">
                  ${c.nivel||'—'}
                </td>
                <td style="padding:8px 8px;font-size:11px;color:var(--text3)">${c.telefone||'—'}</td>
                <td style="padding:8px 8px;text-align:center;font-size:11px;color:var(--text3)">
                  ${c.nascimento ? fd(c.nascimento) + (isAniv ? ' 🎂' : '') : '—'}
                </td>
                <td style="padding:8px 8px;text-align:center;font-size:12px;color:var(--text2)">${totalEsc}</td>
                <td style="padding:8px 8px;text-align:center">
                  <span class="tag ${(c.status||'ativo')==='inativo'?'tag-red':'tag-green'}" style="font-size:9px">
                    ${(c.status||'ativo')==='inativo'?'Inativo':'Ativo'}
                  </span>
                </td>
                <td style="padding:8px 8px;text-align:center" onclick="event.stopPropagation()">
                  <button class="btn-sm" onclick="abrirNovoColab('${c.id}')" title="Editar">✏️</button>
                  <button class="btn-sm btn-red" onclick="excluirColab('${c.id}')" title="Excluir">✕</button>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`}
    </div>`;
}

// ─── PERFIL ───────────────────────────────────────────────────────────────────

function abrirPerfilColab(id) {
  equipeView   = 'perfil';
  equipeAtualId = id;
  rEquipePerfil();
}

function rEquipePerfil() {
  const el = document.getElementById('eq-content');
  if (!el) return;

  const c = (D.equipe||[]).find(e => e.id === equipeAtualId);
  if (!c) { rEquipeLista(); return; }

  const hoje   = new Date().toISOString().slice(0,10);
  const todas  = (D.escalas||[]).filter(e => e.colaboradorId === c.id)
                   .sort((a,b) => a.dataEvento.localeCompare(b.dataEvento));
  const proximas = todas.filter(e => e.dataEvento >= hoje);
  const passadas = todas.filter(e => e.dataEvento <  hoje).reverse();

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn-sm" onclick="rEquipeLista()" style="background:var(--bg3)">← Voltar</button>
      <span style="font-weight:600;font-size:15px;color:var(--text)">${c.nome}</span>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-sm" onclick="abrirEscalarModal('','','',null,'${c.id}')"
          style="background:var(--bg2);border:1px solid var(--green);color:var(--green)">
          + Escalar
        </button>
        <button class="btn-sm btn-primary" onclick="abrirNovoColab('${c.id}')">✏️ Editar</button>
      </div>
    </div>

    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);
                padding:16px 20px;margin-bottom:14px;
                display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:12px">
      <div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Cargo</div>
        <span class="badge b-blue">${c.cargo||'—'}</span>
      </div>
      <div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Nível</div>
        <div style="font-weight:600;color:${c.nivel==='Novato'?'var(--amber)':c.nivel==='Sênior'?'var(--green)':'var(--text)'}">${c.nivel||'—'}</div>
      </div>
      <div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">CPF</div>
        <div style="color:var(--text2)">${c.cpf||'—'}</div>
      </div>
      <div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Telefone</div>
        <div style="color:var(--text2)">${c.telefone||'—'}</div>
      </div>
      <div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Aniversário</div>
        <div style="color:var(--text2)">${c.nascimento ? fd(c.nascimento) : '—'}</div>
      </div>
      <div>
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Status</div>
        <span class="tag ${(c.status||'ativo')==='inativo'?'tag-red':'tag-green'}">
          ${(c.status||'ativo')==='inativo'?'Inativo':'Ativo'}
        </span>
      </div>
      ${c.endereco ? `
      <div style="grid-column:1/-1">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Endereço</div>
        <div style="color:var(--text2)">${c.endereco}</div>
      </div>` : ''}
      ${c.obs ? `
      <div style="grid-column:1/-1">
        <div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Observações</div>
        <div style="color:var(--text2);font-size:12px">${c.obs}</div>
      </div>` : ''}
    </div>

    <div class="cards" style="margin-bottom:14px">
      <div class="card"><div class="card-label">Total de escalas</div><div class="card-val">${todas.length}</div></div>
      <div class="card"><div class="card-label">Próximas</div><div class="card-val" style="color:var(--green)">${proximas.length}</div></div>
      <div class="card"><div class="card-label">Realizadas</div><div class="card-val">${passadas.length}</div></div>
    </div>

    ${proximas.length ? `
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-head"><span class="sec-title">📅 Próximas escalas</span></div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="border-bottom:1px solid var(--border2);font-size:10px;text-transform:uppercase;color:var(--text3)">
          <th style="padding:7px 10px;text-align:left;font-weight:500">Data</th>
          <th style="padding:7px 10px;text-align:left;font-weight:500">Evento</th>
          <th style="padding:7px 10px;text-align:left;font-weight:500">Cargo</th>
          <th style="padding:7px 10px;text-align:left;font-weight:500">Status</th>
          <th style="padding:7px 10px"></th>
        </tr></thead>
        <tbody>
          ${proximas.map(e=>`
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:7px 10px;font-weight:600">${fd(e.dataEvento)}</td>
            <td style="padding:7px 10px">${e.nomeEvento||'—'}</td>
            <td style="padding:7px 10px"><span class="badge b-blue" style="font-size:10px">${e.cargo||c.cargo||'—'}</span></td>
            <td style="padding:7px 10px">
              <span class="tag ${e.status==='confirmado'?'tag-green':e.status==='cancelado'?'tag-red':'tag-yellow'}" style="font-size:9px">
                ${e.status==='confirmado'?'Confirmado':e.status==='cancelado'?'Cancelado':'Pendente'}
              </span>
            </td>
            <td style="padding:7px 10px;text-align:center">
              <button class="btn-sm btn-red" onclick="removerEscala('${e.id}')" title="Remover">✕</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}

    ${passadas.length ? `
    <div class="sec">
      <div class="sec-head"><span class="sec-title">📋 Histórico de eventos</span></div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <tbody>
          ${passadas.slice(0,15).map(e=>`
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:6px 10px;color:var(--text3);width:110px">${fd(e.dataEvento)}</td>
            <td style="padding:6px 10px">${e.nomeEvento||'—'}</td>
            <td style="padding:6px 10px"><span class="badge b-blue" style="font-size:10px">${e.cargo||c.cargo||'—'}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}

    ${!todas.length ? `
    <div style="text-align:center;padding:40px;color:var(--text3)">
      Nenhuma escala registrada ainda.
    </div>` : ''}`;
}

// ─── AGENDA DE ESCALAS ────────────────────────────────────────────────────────

function rEscalaAgenda() {
  equipeView = 'agenda';
  const el = document.getElementById('eq-content');
  if (!el) return;

  const hoje   = new Date().toISOString().slice(0,10);
  const escalas = (D.escalas||[])
    .filter(e => e.dataEvento >= hoje && e.status !== 'cancelado')
    .sort((a,b) => a.dataEvento.localeCompare(b.dataEvento));

  const porData = {};
  escalas.forEach(e => {
    if (!porData[e.dataEvento]) porData[e.dataEvento] = [];
    porData[e.dataEvento].push(e);
  });

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn-sm" onclick="rEquipeLista()" style="background:var(--bg3)">← Colaboradores</button>
      <span style="font-weight:600;font-size:15px;color:var(--text)">Agenda de Escalas</span>
      <button class="btn-sm btn-primary" onclick="abrirEscalarModal()" style="margin-left:auto">+ Escalar colaborador</button>
    </div>

    ${!Object.keys(porData).length ? `
    <div style="text-align:center;padding:60px;color:var(--text3)">
      <div style="font-size:32px;margin-bottom:10px">📅</div>
      <div>Nenhuma escala futura registrada</div>
    </div>` :
    Object.entries(porData).map(([data, esc]) => {
      const ids       = esc.map(e=>e.colaboradorId);
      const conflitos = ids.filter((id,i)=>ids.indexOf(id)!==i);
      return `
      <div class="sec" style="margin-bottom:10px">
        <div class="sec-head">
          <span class="sec-title">📅 ${fd(data)}</span>
          <span style="font-size:11px;color:var(--text3)">${esc.length} colaborador${esc.length>1?'es':''}</span>
          ${conflitos.length?`<span style="background:#7A5A00;color:#F7C84F;font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px;margin-left:6px">⚠️ CONFLITO</span>`:''}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px 14px">
          ${esc.map(e=>{
            const col = (D.equipe||[]).find(c=>c.id===e.colaboradorId);
            const dupl = conflitos.includes(e.colaboradorId);
            return `
            <div style="background:${dupl?'#1A1400':'var(--bg3)'};border:1px solid ${dupl?'var(--amber)':'var(--border)'};
                        border-radius:8px;padding:8px 12px;min-width:160px;position:relative">
              <div style="font-weight:600;font-size:12px;color:${dupl?'var(--amber)':'var(--text)'}">
                ${col?.nome||'?'} ${dupl?'⚠️':''}
              </div>
              <div style="font-size:10px;color:var(--text3);margin-top:2px">${e.cargo||col?.cargo||'—'}</div>
              <div style="font-size:10px;color:var(--text3)">${e.nomeEvento||'—'}</div>
              <button class="btn-sm btn-red" onclick="removerEscala('${e.id}')"
                style="position:absolute;top:6px;right:6px;padding:1px 5px;font-size:9px" title="Remover">✕</button>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('')}`;
}

// ─── CRUD COLABORADOR ─────────────────────────────────────────────────────────

function abrirNovoColab(id) {
  const c = id ? (D.equipe||[]).find(e=>e.id===id) : null;
  document.getElementById('eq-m-id').value         = id  || '';
  document.getElementById('eq-m-nome').value        = c?.nome       || '';
  document.getElementById('eq-m-cpf').value         = c?.cpf        || '';
  document.getElementById('eq-m-telefone').value    = c?.telefone   || '';
  document.getElementById('eq-m-nascimento').value  = c?.nascimento || '';
  document.getElementById('eq-m-cargo').value       = c?.cargo      || '';
  document.getElementById('eq-m-nivel').value       = c?.nivel      || '';
  document.getElementById('eq-m-endereco').value    = c?.endereco   || '';
  document.getElementById('eq-m-obs').value         = c?.obs        || '';
  document.getElementById('eq-m-status').value      = c?.status     || 'ativo';
  document.getElementById('eq-m-titulo').textContent = id ? '✏️ Editar Colaborador' : '+ Novo Colaborador';
  document.getElementById('m-novo-colab').style.display = 'flex';
}

function salvarColab() {
  const nome = document.getElementById('eq-m-nome')?.value?.trim();
  if (!nome) { alert('Informe o nome do colaborador.'); return; }
  if (!D.equipe) D.equipe = [];

  const id    = document.getElementById('eq-m-id')?.value;
  const dados = {
    nome,
    cpf:        document.getElementById('eq-m-cpf')?.value?.trim()      || '',
    telefone:   document.getElementById('eq-m-telefone')?.value?.trim() || '',
    nascimento: document.getElementById('eq-m-nascimento')?.value       || '',
    cargo:      document.getElementById('eq-m-cargo')?.value            || '',
    nivel:      document.getElementById('eq-m-nivel')?.value            || '',
    endereco:   document.getElementById('eq-m-endereco')?.value?.trim() || '',
    obs:        document.getElementById('eq-m-obs')?.value?.trim()      || '',
    status:     document.getElementById('eq-m-status')?.value           || 'ativo',
  };

  if (id) {
    const idx = D.equipe.findIndex(e=>e.id===id);
    if (idx >= 0) D.equipe[idx] = { ...D.equipe[idx], ...dados };
  } else {
    D.equipe.push({ id: 'EQ'+Date.now(), ...dados, criadoEm: new Date().toISOString() });
  }

  sv('equipe');
  document.getElementById('m-novo-colab').style.display = 'none';
  rEquipe();
  alert2(id ? 'Colaborador atualizado!' : 'Colaborador cadastrado!');
}

function excluirColab(id) {
  const c = (D.equipe||[]).find(e=>e.id===id);
  if (!confirm(`Excluir "${c?.nome}"?\nAs escalas vinculadas também serão removidas.`)) return;
  D.equipe  = (D.equipe ||[]).filter(e=>e.id!==id);
  D.escalas = (D.escalas||[]).filter(e=>e.colaboradorId!==id);
  sv('equipe'); sv('escalas');
  rEquipeLista();
}

// ─── ESCALAS ──────────────────────────────────────────────────────────────────

function verificarConflito(colaboradorId, dataEvento) {
  return (D.escalas||[]).some(e =>
    e.colaboradorId === colaboradorId &&
    e.dataEvento    === dataEvento    &&
    e.status        !== 'cancelado'
  );
}

function escalarColab(colaboradorId, dataEvento, nomeEvento, cargoEscala, contratoId) {
  if (verificarConflito(colaboradorId, dataEvento)) {
    const c       = (D.equipe ||[]).find(e=>e.id===colaboradorId);
    const conflito= (D.escalas||[]).find(e=>e.colaboradorId===colaboradorId && e.dataEvento===dataEvento);
    if (!confirm(`⚠️ ${c?.nome} já está escalado para\n"${conflito?.nomeEvento||'outro evento'}" em ${fd(dataEvento)}.\n\nDeseja escalar mesmo assim?`)) return false;
  }
  if (!D.escalas) D.escalas = [];
  D.escalas.push({
    id:            'ESC'+Date.now()+Math.random().toString(36).slice(2,5),
    colaboradorId,
    contratoId:   contratoId || '',
    nomeEvento:   nomeEvento || '',
    dataEvento,
    cargo:        cargoEscala || '',
    status:       'confirmado',
    criadoEm:     new Date().toISOString()
  });
  sv('escalas');
  return true;
}

function removerEscala(escalaId) {
  if (!confirm('Remover esta escala?')) return;
  D.escalas = (D.escalas||[]).filter(e=>e.id!==escalaId);
  sv('escalas');
  rEquipe();
}

// ─── MODAL ESCALAR ────────────────────────────────────────────────────────────

function abrirEscalarModal(dataEvento, nomeEvento, contratoId, eventoObj, fixarColabId) {
  if (!(D.equipe||[]).filter(c=>(c.status||'ativo')!=='inativo').length) {
    alert('Nenhum colaborador ativo cadastrado. Cadastre na aba Equipe primeiro.');
    return;
  }
  document.getElementById('esc-m-data').value     = dataEvento || '';
  document.getElementById('esc-m-evento').value   = nomeEvento || '';
  document.getElementById('esc-m-contrato').value = contratoId || '';
  document.getElementById('esc-m-cargo').value    = '';

  const select = document.getElementById('esc-m-lista');
  if (!select) return;
  select.innerHTML = '';

  const disponiveis = (D.equipe||[])
    .filter(c => (c.status||'ativo') !== 'inativo')
    .sort((a,b)=>(a.cargo||'').localeCompare(b.cargo||'')||a.nome.localeCompare(b.nome));

  // Se veio com colaborador fixo, coloca ele primeiro
  if (fixarColabId) {
    const fixo = disponiveis.find(c=>c.id===fixarColabId);
    if (fixo) {
      const opt = document.createElement('option');
      opt.value    = fixo.id;
      opt.selected = true;
      opt.textContent = `${fixo.nome} — ${fixo.cargo||'sem cargo'}`;
      select.appendChild(opt);
    }
  }

  disponiveis.forEach(c => {
    if (fixarColabId && c.id===fixarColabId) return;
    const conflito = dataEvento ? verificarConflito(c.id, dataEvento) : false;
    const opt = document.createElement('option');
    opt.value       = c.id;
    opt.textContent = `${conflito?'⚠️ ':''}${c.nome} — ${c.cargo||'sem cargo'}${conflito?' (conflito)':''}`;
    select.appendChild(opt);
  });

  document.getElementById('m-escalar-colab').style.display = 'flex';
}

function confirmarEscalar() {
  const colaboradorId = document.getElementById('esc-m-lista')?.value;
  const dataEvento    = document.getElementById('esc-m-data')?.value;
  const nomeEvento    = document.getElementById('esc-m-evento')?.value;
  const contratoId    = document.getElementById('esc-m-contrato')?.value;
  const cargo         = document.getElementById('esc-m-cargo')?.value;
  if (!colaboradorId)    { alert('Selecione um colaborador.');        return; }
  if (!dataEvento)       { alert('Informe a data do evento.');        return; }

  const ok = escalarColab(colaboradorId, dataEvento, nomeEvento, cargo, contratoId);
  if (ok) {
    document.getElementById('m-escalar-colab').style.display = 'none';
    alert2('Colaborador escalado com sucesso!');
    if (document.getElementById('page-equipe')?.classList.contains('active')) rEquipe();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
