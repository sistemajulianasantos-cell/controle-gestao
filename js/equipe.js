// ─── EQUIPE ────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

let equipeView    = 'lista'; // 'lista' | 'perfil' | 'eventos' | 'evento-detalhe' | 'regras'
let equipeAtualId = null;
let escalaEventoAtual = null; // { id, nome, data }

const CARGOS_EQUIPE = ['Head Bartender','Bartender','Bar Back','Copeiro','Coordenador'];
const NIVEIS_EQUIPE = ['Novato','Antigo'];

const REGIOES_PAGAMENTO = [
  { key: 'area_central',  label: 'Área Central BH' },
  { key: 'jardim_canada', label: 'Jardim Canadá / C. Nova' },
  { key: 'reg_metro',     label: 'Região Metropolitana' },
  { key: 'viagem_100',    label: 'Viagem 50 a 100 km' },
  { key: 'viagem_250',    label: 'Viagem 101 a 250 km' },
  { key: 'viagem_400',    label: 'Viagem 251 a 400 km' },
  { key: 'viagem_mais',   label: 'Viagem acima de 400 km' },
];

const CARGOS_PAGAMENTO = [
  { key: 'hb', label: 'Head Bartender' },
  { key: 'cd', label: 'Coordenador' },
  { key: 'bt', label: 'Bartender' },
  { key: 'bb', label: 'Bar Back' },
  { key: 'cp', label: 'Copeiro' },
];

function rEquipe() {
  if      (equipeView === 'regras')                            rEquipeRegras();
  else if (equipeView === 'perfil' && equipeAtualId)           rEquipePerfil();
  else if (equipeView === 'eventos')                           rEscalaEventos();
  else if (equipeView === 'evento-detalhe' && escalaEventoAtual) rEscalaEvento();
  else rEquipeLista();
}

// ─── LISTA ────────────────────────────────────────────────────────────────────

function rEquipeLista() {
  equipeView = 'lista';
  const el = document.getElementById('eq-content');
  if (!el) return;

  const busca   = (document.getElementById('eq-busca')?.value        || '').toLowerCase();
  const fCargo  =  document.getElementById('eq-filtro-cargo')?.value || '';
  const fStatus =  document.getElementById('eq-filtro-status')?.value|| 'ativo';
  const hoje    = new Date();
  const mes     = hoje.getMonth() + 1;
  const ano     = hoje.getFullYear();

  const lista = (D.equipe||[]).filter(c => {
    if (fStatus !== 'todos' && (c.status||'ativo') !== fStatus) return false;
    if (fCargo  && c.cargo !== fCargo) return false;
    if (busca   && !(c.nome||'').toLowerCase().includes(busca)) return false;
    return true;
  }).sort((a,b) => (a.nome||'').localeCompare(b.nome||''));

  const ativos   = (D.equipe||[]).filter(c => (c.status||'ativo') !== 'inativo').length;
  const anivs    = (D.equipe||[]).filter(c => c.nascimento && parseInt(c.nascimento.split('-')[1]) === mes);
  const escMes   = (D.escalas||[]).filter(e => e.dataEvento?.startsWith(`${ano}-${String(mes).padStart(2,'0')}`));

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <span style="font-size:16px;font-weight:600;color:var(--text)">Equipe</span>
      <input id="eq-busca" type="text" placeholder="Buscar..." value="${busca}" oninput="rEquipeLista()"
        style="padding:6px 10px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);color:var(--text);font-size:12px;width:150px">
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
      <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-sm" onclick="equipeView='regras';rEquipeRegras()"
          style="background:var(--bg2);border:1px solid var(--border2)">💰 Regras de Pagamento</button>
        <button class="btn-sm" onclick="equipeView='eventos';rEscalaEventos()"
          style="background:var(--bg2);border:1px solid var(--border2)">📅 Escala por Evento</button>
        <button class="btn-sm" onclick="abrirImportEquipe()"
          style="background:var(--bg2);border:1px solid var(--border2)">📥 Importar planilha</button>
        <button class="btn btn-primary btn-sm" onclick="abrirNovoColab()">+ Novo colaborador</button>
      </div>
    </div>

    <div class="cards" style="margin-bottom:14px">
      <div class="card"><div class="card-label">Colaboradores ativos</div><div class="card-val">${ativos}</div></div>
      <div class="card"><div class="card-label">Aniversariantes do mês</div>
        <div class="card-val" style="color:${anivs.length?'var(--amber)':'var(--text)'}">${anivs.length}</div></div>
      <div class="card"><div class="card-label">Escalas este mês</div><div class="card-val">${escMes.length}</div></div>
      <div class="card"><div class="card-label">Exibindo</div><div class="card-val">${lista.length}</div></div>
    </div>

    ${anivs.length ? `
    <div style="background:#1A1400;border:1px solid var(--amber);border-radius:var(--radius);padding:10px 16px;margin-bottom:12px;font-size:12px;color:var(--amber)">
      🎂 <strong>Aniversariantes de ${['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][mes]}:</strong>
      ${anivs.map(c=>`<strong>${c.nome.split(' ')[0]}</strong> (${fd(c.nascimento)})`).join(' · ')}
    </div>` : ''}

    <div class="sec">
      <div class="sec-head"><span class="sec-title">👥 Colaboradores</span></div>
      ${!lista.length ? `
        <div style="text-align:center;padding:48px;color:var(--text3)">
          <div style="font-size:32px;margin-bottom:10px">👥</div>
          <div style="margin-bottom:12px">Nenhum colaborador encontrado</div>
          <button class="btn btn-primary btn-sm" onclick="abrirImportEquipe()">📥 Importar planilha</button>
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
              const totalEsc = (D.escalas||[]).filter(e=>e.colaboradorId===c.id).length;
              const isAniv   = c.nascimento && parseInt(c.nascimento.split('-')[1]) === mes;
              return `
              <tr style="border-bottom:1px solid var(--border);cursor:pointer;transition:.1s"
                  onclick="abrirPerfilColab('${c.id}')"
                  onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">
                <td style="padding:8px 12px">
                  <div style="display:flex;align-items:center;gap:8px">
                    ${c.foto ? `<img src="${c.foto}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0">` :
                      `<div style="width:28px;height:28px;border-radius:50%;background:var(--bg3);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--text3);flex-shrink:0">${(c.nome||'?')[0].toUpperCase()}</div>`}
                    <div>
                      <div style="font-weight:600;color:var(--text)">${c.nome}</div>
                      ${c.chave_pix?`<div style="font-size:10px;color:var(--green);font-family:monospace">PIX: ${c.chave_pix}</div>`:c.cpf?`<div style="font-size:10px;color:var(--text3)">${c.cpf}</div>`:''}
                    </div>
                  </div>
                </td>
                <td style="padding:8px 8px">
                  ${(c.cargos && c.cargos.length ? c.cargos : (c.cargo ? [c.cargo] : ['—']))
                    .map(g=>`<span class="badge b-blue" style="font-size:10px;margin-right:3px">${g}</span>`).join('')}
                </td>
                <td style="padding:8px 8px;font-size:11px;color:${c.nivel==='Novato'?'var(--amber)':c.nivel==='Antigo'?'var(--green)':'var(--text3)'}">${c.nivel||'—'}</td>
                <td style="padding:8px 8px;font-size:11px;color:var(--text3)">${c.telefone||'—'}</td>
                <td style="padding:8px 8px;text-align:center;font-size:11px;color:var(--text3)">${c.nascimento?fd(c.nascimento)+(isAniv?' 🎂':''):'—'}</td>
                <td style="padding:8px 8px;text-align:center;font-size:12px">${totalEsc}</td>
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
  equipeView    = 'perfil';
  equipeAtualId = id;
  rEquipePerfil();
}

function rEquipePerfil() {
  const el = document.getElementById('eq-content');
  if (!el) return;
  const c = (D.equipe||[]).find(e=>e.id===equipeAtualId);
  if (!c) { rEquipeLista(); return; }

  const hoje   = new Date().toISOString().slice(0,10);
  const todas  = (D.escalas||[]).filter(e=>e.colaboradorId===c.id)
                   .sort((a,b)=>a.dataEvento.localeCompare(b.dataEvento));
  const proximas = todas.filter(e=>e.dataEvento >= hoje);
  const passadas = todas.filter(e=>e.dataEvento <  hoje).reverse();

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn-sm" onclick="rEquipeLista()" style="background:var(--bg3)">← Voltar</button>
      <span style="font-weight:600;font-size:15px;color:var(--text)">${c.nome}</span>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button class="btn-sm btn-primary" onclick="abrirNovoColab('${c.id}')">✏️ Editar</button>
      </div>
    </div>

    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;margin-bottom:14px">
      <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
        <!-- Foto -->
        <div style="flex-shrink:0;text-align:center">
          ${c.foto
            ? `<img src="${c.foto}" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:2px solid var(--border2)">`
            : `<div style="width:72px;height:72px;border-radius:50%;background:var(--bg3);border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:var(--text3)">${(c.nome||'?')[0].toUpperCase()}</div>`}
          <label style="display:block;margin-top:6px;font-size:10px;color:var(--text3);cursor:pointer;text-decoration:underline">
            Alterar foto
            <input type="file" accept="image/*" style="display:none" onchange="uploadFotoColab('${c.id}',this)">
          </label>
        </div>
        <!-- Dados -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;flex:1">
          <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Funções</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px">
              ${(c.cargos && c.cargos.length ? c.cargos : (c.cargo ? [c.cargo] : ['—']))
                .map(g=>`<span class="badge b-blue">${g}</span>`).join('')}
            </div></div>
          ${c.chave_pix?`<div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Chave PIX</div>
            <div style="color:var(--green);font-family:monospace;font-size:12px">${c.chave_pix}</div></div>`:''}
          <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Nível</div>
            <div style="font-weight:600;color:${c.nivel==='Novato'?'var(--amber)':c.nivel==='Antigo'?'var(--green)':'var(--text)'}">${c.nivel||'—'}</div></div>
          <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">CPF</div>
            <div style="color:var(--text2)">${c.cpf||'—'}</div></div>
          <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Telefone</div>
            <div style="color:var(--text2)">${c.telefone||'—'}</div></div>
          <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Aniversário</div>
            <div style="color:var(--text2)">${c.nascimento?fd(c.nascimento):'—'}</div></div>
          <div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Status</div>
            <span class="tag ${(c.status||'ativo')==='inativo'?'tag-red':'tag-green'}">${(c.status||'ativo')==='inativo'?'Inativo':'Ativo'}</span></div>
          ${c.endereco?`<div style="grid-column:1/-1"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Endereço</div><div style="color:var(--text2)">${c.endereco}</div></div>`:''}
          ${c.obs?`<div style="grid-column:1/-1"><div style="font-size:10px;color:var(--text3);text-transform:uppercase;margin-bottom:3px">Observações</div><div style="color:var(--text2);font-size:12px">${c.obs}</div></div>`:''}
        </div>
      </div>
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
              <button class="btn-sm btn-red" onclick="removerEscala('${e.id}')">✕</button>
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
          ${passadas.slice(0,20).map(e=>`
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:6px 10px;color:var(--text3);width:110px">${fd(e.dataEvento)}</td>
            <td style="padding:6px 10px">${e.nomeEvento||'—'}</td>
            <td style="padding:6px 10px"><span class="badge b-blue" style="font-size:10px">${e.cargo||c.cargo||'—'}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>` : ''}

    ${!todas.length?`<div style="text-align:center;padding:32px;color:var(--text3)">Nenhuma escala registrada ainda.</div>`:''}`;
}

// Foto: converte File → base64 e salva no colaborador
function uploadFotoColab(colabId, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const c = (D.equipe||[]).find(x=>x.id===colabId);
    if (!c) return;
    c.foto = e.target.result;
    sv('equipe');
    rEquipePerfil();
  };
  reader.readAsDataURL(file);
}

// ─── ESCALA POR EVENTO ────────────────────────────────────────────────────────

let _mostrarHistoricoEscala = false;

function rEscalaEventos() {
  equipeView = 'eventos';
  const el = document.getElementById('eq-content');
  if (!el) return;

  const hoje = new Date().toISOString().slice(0,10);

  const todos    = (D.contratos||[]).filter(c=>(c.status||'ativo')!=='cancelado').sort((a,b)=>a.data.localeCompare(b.data));
  const futuros  = todos.filter(c => c.data >= hoje);
  const passados = todos.filter(c => c.data <  hoje).reverse(); // mais recente primeiro

  const _cardEvento = (c, passado=false) => {
    const escalas = _escalasDoEvento(c);
    const nomeEsc = (c.nome||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');
    return `
    <div class="sec" style="margin-bottom:10px">
      <div class="sec-head" style="flex-wrap:wrap;gap:8px">
        <div>
          <span class="sec-title">${c.nome||'Sem nome'}</span>
          <span style="font-size:11px;color:var(--text3);margin-left:8px">
            ${fd(c.data)}${c.local?' · '+c.local.split(',')[0]:''}${c.convidados?' · '+c.convidados+' conv.':''}
          </span>
        </div>
        <button class="btn-sm ${passado?'':'btn-primary'}" style="${passado?'background:var(--bg3)':''}"
          onclick="abrirEscalaEvento('${c.id}','${nomeEsc}','${c.data}')">
          👥 ${passado?'Ver equipe':'Montar equipe'}
        </button>
      </div>
      ${!escalas.length
        ? `<div style="padding:10px 14px;color:var(--text3);font-size:12px">Nenhum colaborador escalado</div>`
        : `<div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px 14px">
            ${escalas.map(e=>{
              const col=(D.equipe||[]).find(x=>x.id===e.colaboradorId);
              if(!col) return '';
              return `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:6px 10px;display:flex;align-items:center;gap:7px">
                ${col.foto?`<img src="${col.foto}" style="width:22px;height:22px;border-radius:50%;object-fit:cover">`:
                  `<div style="width:22px;height:22px;border-radius:50%;background:var(--bg2);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:var(--text3)">${(col.nome||'?')[0]}</div>`}
                <div>
                  <div style="font-size:12px;font-weight:600;color:var(--text)">${col.nome.split(' ')[0]}</div>
                  <div style="font-size:10px;color:var(--text3)">${e.cargo||col.cargo||'—'}</div>
                </div>
              </div>`;
            }).join('')}
          </div>`}
    </div>`;
  };

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn-sm" onclick="rEquipeLista()" style="background:var(--bg3)">← Colaboradores</button>
      <span style="font-weight:600;font-size:15px;color:var(--text)">Escala por Evento</span>
    </div>

    ${!futuros.length ? `
    <div style="text-align:center;padding:48px;color:var(--text3)">
      <div style="font-size:32px;margin-bottom:10px">📅</div>
      <div>Nenhum evento futuro em Contratos</div>
    </div>` :
    futuros.map(c => _cardEvento(c, false)).join('')}

    <!-- Histórico -->
    ${passados.length ? `
    <div style="margin-top:8px">
      <button onclick="_mostrarHistoricoEscala=!_mostrarHistoricoEscala;rEscalaEventos()"
        style="width:100%;padding:10px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);
               color:var(--text3);font-size:12px;cursor:pointer;text-align:left">
        ${_mostrarHistoricoEscala?'▲':'▼'} Histórico — ${passados.length} evento(s) realizado(s)
      </button>
      ${_mostrarHistoricoEscala ? `
      <div style="margin-top:8px;opacity:.75">
        ${passados.map(c=>_cardEvento(c,true)).join('')}
      </div>` : ''}
    </div>` : ''}`;
}

function _escalasDoEvento(contrato) {
  return (D.escalas||[]).filter(e =>
    e.contratoId === contrato.id ||
    (e.nomeEvento === contrato.nome && e.dataEvento === contrato.data)
  );
}

// Abre a tela de detalhe de escala de um evento específico
function abrirEscalaEvento(contratoId, nomeEvento, dataEvento) {
  escalaEventoAtual = { id: contratoId, nome: nomeEvento, data: dataEvento };
  equipeView = 'evento-detalhe';
  rEscalaEvento();
}

function rEscalaEvento() {
  const el = document.getElementById('eq-content');
  if (!el || !escalaEventoAtual) return;

  const contrato = (D.contratos||[]).find(c=>c.id===escalaEventoAtual.id);
  const ev       = escalaEventoAtual;
  const escalas  = _escalasDoEvento(contrato || { id: ev.id, nome: ev.nome, data: ev.data });
  const hoje     = new Date().toISOString().slice(0,10);

  // Montar equipe por cargo
  const porCargo = {};
  escalas.forEach(e => {
    const col  = (D.equipe||[]).find(x=>x.id===e.colaboradorId);
    if (!col) return;
    const cargo = e.cargo || col.cargo || 'Outros';
    if (!porCargo[cargo]) porCargo[cargo] = [];
    porCargo[cargo].push({ ...col, cargo, escalaId: e.id, status: e.status });
  });

  const ordemCargos = ['Coordenador','Head Bartender','Bartender','Bar Back','Copeiro','Auxiliar','Outros'];
  const cargosOrdenados = Object.keys(porCargo).sort((a,b)=>{
    const ia = ordemCargos.indexOf(a); const ib = ordemCargos.indexOf(b);
    return (ia<0?99:ia)-(ib<0?99:ib);
  });

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn-sm" onclick="equipeView='eventos';rEscalaEventos()" style="background:var(--bg3)">← Eventos</button>
      <div>
        <div style="font-weight:600;font-size:15px;color:var(--text)">${ev.nome}</div>
        <div style="font-size:11px;color:var(--text3)">${fd(ev.data)}${contrato?.local?' · '+contrato.local.split(',')[0]:''}</div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="abrirAddColabEvento()" style="margin-left:auto">+ Adicionar colaborador</button>
    </div>

    <!-- Resumo contrato -->
    ${contrato ? `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:10px 16px;margin-bottom:12px;font-size:12px;display:flex;gap:20px;flex-wrap:wrap">
      ${contrato.tipo?`<div><span style="color:var(--text3)">Tipo:</span> ${contrato.tipo}</div>`:''}
      ${contrato.convidados?`<div><span style="color:var(--text3)">Convidados:</span> ${contrato.convidados}</div>`:''}
      ${contrato.hrInicio?`<div><span style="color:var(--text3)">Horário:</span> ${contrato.hrInicio}${contrato.hrFim?' – '+contrato.hrFim:''}</div>`:''}
      ${contrato.local?`<div><span style="color:var(--text3)">Local:</span> ${contrato.local.split(',').slice(0,2).join(',')}</div>`:''}
    </div>` : ''}

    <div class="cards" style="margin-bottom:14px">
      <div class="card"><div class="card-label">Colaboradores escalados</div><div class="card-val">${escalas.length}</div></div>
      ${cargosOrdenados.map(cargo=>`
      <div class="card">
        <div class="card-label">${cargo}</div>
        <div class="card-val">${porCargo[cargo].length}</div>
      </div>`).join('')}
    </div>

    ${!escalas.length ? `
    <div style="text-align:center;padding:48px;color:var(--text3)">
      <div style="font-size:28px;margin-bottom:10px">👥</div>
      <div style="margin-bottom:14px">Nenhum colaborador escalado para este evento</div>
      <button class="btn btn-primary" onclick="abrirAddColabEvento()">+ Adicionar colaborador</button>
    </div>` :

    cargosOrdenados.map(cargo => `
    <div class="sec" style="margin-bottom:10px">
      <div class="sec-head">
        <span class="sec-title">${cargo}</span>
        <span style="font-size:11px;color:var(--text3)">${porCargo[cargo].length} pessoa${porCargo[cargo].length>1?'s':''}</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px;padding:10px 14px">
        ${porCargo[cargo].map(col=>`
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:10px;position:relative">
          ${col.foto?`<img src="${col.foto}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0">`:
            `<div style="width:36px;height:36px;border-radius:50%;background:var(--bg2);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:var(--text3);flex-shrink:0">${(col.nome||'?')[0].toUpperCase()}</div>`}
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${col.nome}</div>
            <div style="font-size:10px;color:var(--text3)">${col.nivel||''} ${col.telefone?'· '+col.telefone:''}</div>
          </div>
          <button class="btn-sm btn-red" onclick="removerEscala('${col.escalaId}');equipeView='evento-detalhe';setTimeout(rEscalaEvento,100)"
            style="position:absolute;top:6px;right:6px;padding:1px 5px;font-size:9px" title="Remover">✕</button>
        </div>`).join('')}
      </div>
    </div>`).join('')}`;
}

// ─── MODAL: ADICIONAR COLABORADOR AO EVENTO ──────────────────────────────────

function abrirAddColabEvento() {
  if (!escalaEventoAtual) return;
  if (!(D.equipe||[]).filter(c=>(c.status||'ativo')!=='inativo').length) {
    alert('Nenhum colaborador ativo. Cadastre colaboradores primeiro.');
    return;
  }

  const ev = escalaEventoAtual;
  const jaEscalados = new Set(
    (D.escalas||[])
      .filter(e => e.contratoId===ev.id || (e.nomeEvento===ev.nome && e.dataEvento===ev.data))
      .map(e=>e.colaboradorId)
  );

  const select = document.getElementById('add-ev-lista');
  if (!select) return;
  select.innerHTML = '';

  const disponiveis = (D.equipe||[])
    .filter(c=>(c.status||'ativo')!=='inativo')
    .sort((a,b)=>(a.cargo||'').localeCompare(b.cargo||'')||a.nome.localeCompare(b.nome));

  let count = 0;
  disponiveis.forEach(c => {
    if (jaEscalados.has(c.id)) return;
    const conflito = verificarConflito(c.id, ev.data);
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${conflito?'⚠️ ':''}${c.nome} — ${c.cargo||'sem cargo'}${conflito?' (conflito de data)':''}`;
    select.appendChild(opt);
    count++;
  });

  if (!count) {
    alert('Todos os colaboradores ativos já foram escalados para este evento.');
    return;
  }

  document.getElementById('add-ev-titulo').textContent = `Adicionar à: ${ev.nome} (${fd(ev.data)})`;
  document.getElementById('add-ev-cargo').value = '';
  document.getElementById('m-add-colab-evento').style.display = 'flex';
}

function confirmarAddColabEvento() {
  const colaboradorId = document.getElementById('add-ev-lista')?.value;
  const cargo         = document.getElementById('add-ev-cargo')?.value;
  if (!colaboradorId || !escalaEventoAtual) return;

  const ev = escalaEventoAtual;
  const ok = escalarColab(colaboradorId, ev.data, ev.nome, cargo, ev.id);
  if (ok) {
    document.getElementById('m-add-colab-evento').style.display = 'none';
    rEscalaEvento();
  }
}

// ─── CRUD COLABORADOR ─────────────────────────────────────────────────────────

const _EQ_CARGOS_CB = [
  { id: 'hb', val: 'Head Bartender' },
  { id: 'cd', val: 'Coordenador' },
  { id: 'bt', val: 'Bartender' },
  { id: 'bb', val: 'Bar Back' },
  { id: 'cp', val: 'Copeiro' },
];

function eqPreviewFoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('eq-m-foto').value = e.target.result;
    const prev = document.getElementById('eq-m-foto-preview');
    if (prev) {
      prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover">`;
    }
  };
  reader.readAsDataURL(file);
}

function eqAtualizarInicial(nome) {
  const el = document.getElementById('eq-m-foto-inicial');
  if (el) el.textContent = (nome||'?')[0].toUpperCase();
}

function eqToggleCargo(cb) {
  const lbl = document.getElementById('eq-lbl-' + cb.id.replace('eq-m-cargo-',''));
  if (lbl) {
    lbl.style.borderColor   = cb.checked ? '#4F8EF7' : '';
    lbl.style.background    = cb.checked ? '#1a2540' : '';
    lbl.style.color         = cb.checked ? '#93C5FD' : '';
  }
}

function abrirNovoColab(id) {
  const c = id ? (D.equipe||[]).find(e=>e.id===id) : null;
  document.getElementById('eq-m-id').value        = id  || '';
  document.getElementById('eq-m-nome').value       = c?.nome       || '';
  document.getElementById('eq-m-pix').value        = c?.chave_pix  || '';
  document.getElementById('eq-m-foto').value       = c?.foto       || '';
  document.getElementById('eq-m-foto-file').value  = '';

  // Preview foto ou inicial
  const prev = document.getElementById('eq-m-foto-preview');
  const ini  = document.getElementById('eq-m-foto-inicial');
  if (prev) {
    if (c?.foto) {
      prev.innerHTML = `<img src="${c.foto}" style="width:100%;height:100%;object-fit:cover">`;
    } else {
      prev.innerHTML = `<span id="eq-m-foto-inicial">${(c?.nome||'?')[0].toUpperCase()}</span>`;
    }
  } else if (ini) {
    ini.textContent = (c?.nome||'?')[0].toUpperCase();
  }
  document.getElementById('eq-m-cpf').value        = c?.cpf        || '';
  document.getElementById('eq-m-telefone').value   = c?.telefone   || '';
  document.getElementById('eq-m-nascimento').value = c?.nascimento || '';
  document.getElementById('eq-m-nivel').value      = c?.nivel      || '';
  document.getElementById('eq-m-endereco').value   = c?.endereco   || '';
  document.getElementById('eq-m-obs').value        = c?.obs        || '';
  document.getElementById('eq-m-status').value     = c?.status     || 'ativo';

  // Cargos: suporta array (cargos) ou string legada (cargo)
  const selecionados = c ? (c.cargos && c.cargos.length ? c.cargos : (c.cargo ? [c.cargo] : [])) : [];
  _EQ_CARGOS_CB.forEach(({ id: cbId, val }) => {
    const cb = document.getElementById('eq-m-cargo-' + cbId);
    if (cb) { cb.checked = selecionados.includes(val); eqToggleCargo(cb); }
  });

  document.getElementById('eq-m-titulo').textContent = id ? '✏️ Editar Colaborador' : '+ Novo Colaborador';
  document.getElementById('m-novo-colab').style.display = 'flex';
}

function salvarColab() {
  const nome = document.getElementById('eq-m-nome')?.value?.trim();
  if (!nome) { alert('Informe o nome.'); return; }
  if (!D.equipe) D.equipe = [];

  const id    = document.getElementById('eq-m-id')?.value;
  const cargos = _EQ_CARGOS_CB
    .filter(({ id: cbId }) => document.getElementById('eq-m-cargo-' + cbId)?.checked)
    .map(({ val }) => val);
  const dados = {
    nome,
    chave_pix:  document.getElementById('eq-m-pix')?.value?.trim()      || '',
    foto:       document.getElementById('eq-m-foto')?.value             || '',
    cargos,
    cargo:      cargos[0] || '',  // cargo principal (compatibilidade)
    cpf:        document.getElementById('eq-m-cpf')?.value?.trim()      || '',
    telefone:   document.getElementById('eq-m-telefone')?.value?.trim() || '',
    nascimento: document.getElementById('eq-m-nascimento')?.value       || '',
    nivel:      document.getElementById('eq-m-nivel')?.value            || '',
    endereco:   document.getElementById('eq-m-endereco')?.value?.trim() || '',
    obs:        document.getElementById('eq-m-obs')?.value?.trim()      || '',
    status:     document.getElementById('eq-m-status')?.value           || 'ativo',
  };

  if (id) {
    const idx = D.equipe.findIndex(e=>e.id===id);
    if (idx >= 0) D.equipe[idx] = { ...D.equipe[idx], ...dados };
  } else {
    D.equipe.push({ id:'EQ'+Date.now(), ...dados, criadoEm: new Date().toISOString() });
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
    id:           'ESC'+Date.now()+Math.random().toString(36).slice(2,5),
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

// ─── IMPORTAR PLANILHA ────────────────────────────────────────────────────────
// Formato esperado (colado do Excel, colunas separadas por Tab):
// Nome | CPF | Telefone | Nascimento (DD/MM/AAAA) | Cargo | Nível | Endereço | Obs

function abrirImportEquipe() {
  const el = document.getElementById('m-import-equipe');
  if (!el) return;
  document.getElementById('eq-imp-area').value = '';
  document.getElementById('eq-imp-preview').innerHTML = '';
  document.getElementById('eq-imp-info').textContent = 'Cole os dados do Excel (Nome | Chave PIX | Cargo) e clique em Visualizar';
  el.style.display = 'flex';
}

function _normCargo(s) {
  const sL = (s||'').toLowerCase().trim();
  if (sL.includes('head'))                          return 'Head Bartender';
  if (sL.includes('bar back')||sL.includes('barback')) return 'Bar Back';
  if (sL.includes('bartender'))                     return 'Bartender';
  if (sL.includes('copeiro'))                       return 'Copeiro';
  if (sL.includes('coord'))                         return 'Coordenador';
  if (sL.includes('auxiliar')||sL.includes('aux'))  return 'Auxiliar';
  return s || '';
}

function _normNivel(s) {
  const sL = (s||'').toLowerCase().trim();
  if (sL.includes('nov'))                               return 'Novato';
  if (sL.includes('nior')||sL.includes('ênior')||sL==='s') return 'Sênior';
  if (sL.includes('exp'))                               return 'Experiente';
  return '';
}

function _parseDataBR(s) {
  if (!s) return '';
  s = s.trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) { const [d,m,a]=s.split('/'); return `${a}-${m}-${d}`; }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s))   return s;
  return '';
}

function _parsearLinhasEquipe() {
  const texto = document.getElementById('eq-imp-area')?.value || '';
  const result = [];
  texto.trim().split('\n').filter(l=>l.trim()).forEach(linha => {
    const cols = linha.split('\t').map(c=>c.trim().replace(/^"|"$/g,''));
    if (!cols[0] || /^(nome|name|colaborador|collab)/i.test(cols[0])) return;
    result.push({
      nome:      cols[0] || '',
      chave_pix: cols[1] || '',
      cargo:     _normCargo(cols[2]),
    });
  });
  return result;
}

function previewImportEquipe() {
  const linhas  = _parsearLinhasEquipe();
  const preview = document.getElementById('eq-imp-preview');
  const info    = document.getElementById('eq-imp-info');

  if (!linhas.length) {
    preview.innerHTML = '<div style="padding:12px;color:var(--text3);font-size:12px">Nenhum dado reconhecido. Verifique o formato.</div>';
    info.textContent  = '';
    return;
  }

  preview.innerHTML = `
    <div style="overflow-x:auto;max-height:260px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius)">
      <table style="width:100%;border-collapse:collapse;font-size:11px">
        <thead>
          <tr style="background:var(--bg3);font-size:10px;text-transform:uppercase;color:var(--text3)">
            <th style="padding:6px 8px;text-align:left">Nome</th>
            <th style="padding:6px 8px;text-align:left">Chave PIX</th>
            <th style="padding:6px 8px;text-align:left">Cargo</th>
          </tr>
        </thead>
        <tbody>
          ${linhas.map(l=>`
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:5px 8px;font-weight:600">${l.nome||'—'}</td>
            <td style="padding:5px 8px;color:var(--green);font-family:monospace;font-size:10px">${l.chave_pix||'—'}</td>
            <td style="padding:5px 8px"><span class="badge b-blue" style="font-size:9px">${l.cargo||'—'}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  info.textContent = `${linhas.length} colaborador(es) reconhecido(s)`;
}

function confirmarImportEquipe() {
  const linhas = _parsearLinhasEquipe();
  if (!linhas.length) { alert('Nenhum dado para importar.'); return; }
  if (!D.equipe) D.equipe = [];

  let adicionados = 0, atualizados = 0;
  linhas.forEach(l => {
    if (!l.nome) return;
    const idx = D.equipe.findIndex(e =>
      (l.chave_pix && e.chave_pix && e.chave_pix === l.chave_pix) ||
      (e.nome||'').toLowerCase() === (l.nome||'').toLowerCase()
    );
    if (idx >= 0) {
      D.equipe[idx] = { ...D.equipe[idx], ...l };
      atualizados++;
    } else {
      D.equipe.push({ id:'EQ'+Date.now()+Math.random().toString(36).slice(2,4), ...l, status:'ativo', criadoEm:new Date().toISOString() });
      adicionados++;
    }
  });

  sv('equipe');
  document.getElementById('m-import-equipe').style.display = 'none';
  alert2(`✅ ${adicionados} adicionado(s), ${atualizados} atualizado(s)!`);
  rEquipe();
}

// ─── BOTÃO RÁPIDO: escalar de qualquer tela ───────────────────────────────────
// Chamado dos contratos/agenda com os dados do evento
function escalarDeContrato(contratoId, nomeEvento, dataEvento) {
  escalaEventoAtual = { id: contratoId, nome: nomeEvento, data: dataEvento };
  equipeView = 'evento-detalhe';
  go('equipe');
}

// ─── REGRAS DE PAGAMENTO ──────────────────────────────────────────────────────

function _rpInp(id, val) {
  return `<input type="number" min="0" step="5" id="${id}" value="${val||''}" placeholder="—"
    style="width:76px;text-align:center;padding:4px 5px;background:var(--bg3);border:1px solid var(--border2);
           border-radius:var(--radius);color:var(--text);font-size:12px">`;
}

function rEquipeRegras() {
  equipeView = 'regras';
  const el = document.getElementById('eq-content');
  if (!el) return;

  const rg  = D.regrasEquipe || {};
  const base = rg.base || {};
  const he   = rg.horaExtra        || {};
  const hev  = rg.horaExtraViagem  || {};
  const bc   = rg.bonusConvidados  || {};

  const thStyle = 'padding:6px 8px;font-weight:500;color:var(--text3);font-size:10px;text-transform:uppercase;';
  const tdStyle = 'padding:4px 5px;text-align:center;';

  // Tabela 1 — valor base: região × cargo × (novato | antigo)
  const tabelaBase = `
    <div style="overflow-x:auto">
      <table style="border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="border-bottom:1px solid var(--border2)">
            <th style="${thStyle}text-align:left;min-width:165px">Região</th>
            ${CARGOS_PAGAMENTO.map(c=>`<th colspan="2" style="${thStyle}text-align:center;border-left:1px solid var(--border2);padding:6px 16px">${c.label}</th>`).join('')}
          </tr>
          <tr style="border-bottom:2px solid var(--border2)">
            <th style="${thStyle}"></th>
            ${CARGOS_PAGAMENTO.map(()=>`
              <th style="${thStyle}border-left:1px solid var(--border2);color:#6EE7B7">Novato</th>
              <th style="${thStyle}color:#93C5FD">Antigo</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${REGIOES_PAGAMENTO.map(r => {
            const rv = base[r.key] || {};
            return `<tr style="border-bottom:1px solid var(--border)">
              <td style="padding:6px 10px;font-weight:600;color:var(--text);white-space:nowrap">${r.label}</td>
              ${CARGOS_PAGAMENTO.map(c => {
                const cv = rv[c.key] || {};
                return `<td style="${tdStyle}border-left:1px solid var(--border2)">${_rpInp(`rp-b-${r.key}-${c.key}-n`, cv.novato)}</td>
                        <td style="${tdStyle}">${_rpInp(`rp-b-${r.key}-${c.key}-a`, cv.antigo)}</td>`;
              }).join('')}
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  // Tabela 2 — hora extra
  const heAntN  = (he.antecipada||{}).novato;  const heAntA  = (he.antecipada||{}).antigo;
  const heNhN   = (he.naHora||{}).novato;       const heNhA   = (he.naHora||{}).antigo;
  const hevAntN = (hev.antecipada||{}).novato;  const hevAntA = (hev.antecipada||{}).antigo;
  const hevNhN  = (hev.naHora||{}).novato;      const hevNhA  = (hev.naHora||{}).antigo;

  const _thHE = txt => `<th style="${thStyle}text-align:left;min-width:220px">${txt}</th>`;
  const _thNv = txt => `<th style="${thStyle}text-align:center;color:#6EE7B7;min-width:110px">${txt}</th>`;
  const _thAt = txt => `<th style="${thStyle}text-align:center;color:#93C5FD;min-width:110px">${txt}</th>`;

  const tabelaHE = `
    <table style="border-collapse:collapse;font-size:12px;width:100%">
      <thead>
        <tr style="border-bottom:2px solid var(--border2)">
          ${_thHE('Tipo de hora extra')}
          ${_thNv('Novato')}
          ${_thAt('Antigo')}
        </tr>
      </thead>
      <tbody>
        <tr style="background:var(--bg3)">
          <td colspan="3" style="padding:5px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text3);letter-spacing:.06em">
            Eventos locais (BH e Região Metropolitana)
          </td>
        </tr>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:7px 10px;color:var(--text)">Contratada com antecedência</td>
          <td style="${tdStyle}">${_rpInp('rp-he-ant-n', heAntN)}</td>
          <td style="${tdStyle}">${_rpInp('rp-he-ant-a', heAntA)}</td>
        </tr>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:7px 10px;color:var(--text)">Contratada na hora</td>
          <td style="${tdStyle}">${_rpInp('rp-he-nh-n', heNhN)}</td>
          <td style="${tdStyle}">${_rpInp('rp-he-nh-a', heNhA)}</td>
        </tr>
        <tr style="background:var(--bg3)">
          <td colspan="3" style="padding:5px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--text3);letter-spacing:.06em">
            Viagem (valor fixo — qualquer distância)
          </td>
        </tr>
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:7px 10px;color:var(--text)">Contratada com antecedência</td>
          <td style="${tdStyle}">${_rpInp('rp-hev-ant-n', hevAntN)}</td>
          <td style="${tdStyle}">${_rpInp('rp-hev-ant-a', hevAntA)}</td>
        </tr>
        <tr>
          <td style="padding:7px 10px;color:var(--text)">Contratada na hora</td>
          <td style="${tdStyle}">${_rpInp('rp-hev-nh-n', hevNhN)}</td>
          <td style="${tdStyle}">${_rpInp('rp-hev-nh-a', hevNhA)}</td>
        </tr>
      </tbody>
    </table>`;

  // Tabela 3 — bônus por 100 convidados
  const tabelaBonus = `
    <table style="border-collapse:collapse;font-size:12px">
      <thead>
        <tr style="border-bottom:2px solid var(--border2)">
          <th style="${thStyle}text-align:left;min-width:200px">Cargo</th>
          <th style="${thStyle}text-align:center;min-width:130px">+ R$ a cada 100 convidados</th>
        </tr>
      </thead>
      <tbody>
        ${CARGOS_PAGAMENTO.map(c=>`
        <tr style="border-bottom:1px solid var(--border)">
          <td style="padding:7px 10px;color:var(--text)">${c.label}</td>
          <td style="${tdStyle}">${_rpInp(`rp-bc-${c.key}`, bc[c.key])}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn-sm" onclick="rEquipeLista()" style="background:var(--bg3)">← Colaboradores</button>
      <span style="font-weight:600;font-size:15px;color:var(--text)">Regras de Pagamento</span>
      <button class="btn btn-primary btn-sm" onclick="salvarRegrasEquipe()" style="margin-left:auto">Salvar regras</button>
    </div>

    <!-- Config básica -->
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-head"><span class="sec-title">⚙️ Configuração geral</span></div>
      <div style="padding:12px 14px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div>
          <label style="font-size:11px;color:var(--text3);display:block;margin-bottom:4px">Duração padrão do evento (horas)</label>
          <input type="number" min="1" max="24" step="1" id="rp-horas-base"
            value="${rg.horasBase || 6}"
            style="width:80px;text-align:center;padding:6px 8px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);color:var(--text);font-size:14px;font-weight:600">
        </div>
        <div style="font-size:11px;color:var(--text3);max-width:360px">
          Horas adicionais acima desse valor serão calculadas como hora extra.
        </div>
      </div>
    </div>

    <!-- Valor base -->
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-head"><span class="sec-title">💰 Valor base por cargo, região e nível (R$)</span></div>
      <div style="padding:12px 14px">
        <div style="font-size:11px;color:var(--text3);margin-bottom:10px">
          <span style="color:#6EE7B7">■</span> Novato &nbsp;&nbsp;
          <span style="color:#93C5FD">■</span> Antigo / Experiente
        </div>
        ${tabelaBase}
      </div>
    </div>

    <!-- Hora extra -->
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-head"><span class="sec-title">⏱️ Adicional por hora extra (R$ / hora)</span></div>
      <div style="padding:12px 14px">${tabelaHE}</div>
    </div>

    <!-- Bônus convidados -->
    <div class="sec" style="margin-bottom:12px">
      <div class="sec-head"><span class="sec-title">👥 Bônus por convidados (R$ a cada 100 convidados)</span></div>
      <div style="padding:12px 14px">
        <div style="font-size:11px;color:var(--text3);margin-bottom:10px">
          Coloque 0 para cargos que não recebem bônus por convidados.
        </div>
        ${tabelaBonus}
      </div>
    </div>`;
}

function salvarRegrasEquipe() {
  if (!D.regrasEquipe) D.regrasEquipe = {};

  D.regrasEquipe.horasBase = parseInt(document.getElementById('rp-horas-base')?.value) || 6;

  if (!D.regrasEquipe.base) D.regrasEquipe.base = {};
  REGIOES_PAGAMENTO.forEach(r => {
    if (!D.regrasEquipe.base[r.key]) D.regrasEquipe.base[r.key] = {};
    CARGOS_PAGAMENTO.forEach(c => {
      D.regrasEquipe.base[r.key][c.key] = {
        novato: parseFloat(document.getElementById(`rp-b-${r.key}-${c.key}-n`)?.value) || 0,
        antigo: parseFloat(document.getElementById(`rp-b-${r.key}-${c.key}-a`)?.value) || 0,
      };
    });
  });

  D.regrasEquipe.horaExtra = {
    antecipada: {
      novato: parseFloat(document.getElementById('rp-he-ant-n')?.value) || 0,
      antigo: parseFloat(document.getElementById('rp-he-ant-a')?.value) || 0,
    },
    naHora: {
      novato: parseFloat(document.getElementById('rp-he-nh-n')?.value) || 0,
      antigo: parseFloat(document.getElementById('rp-he-nh-a')?.value) || 0,
    },
  };

  D.regrasEquipe.horaExtraViagem = {
    antecipada: {
      novato: parseFloat(document.getElementById('rp-hev-ant-n')?.value) || 0,
      antigo: parseFloat(document.getElementById('rp-hev-ant-a')?.value) || 0,
    },
    naHora: {
      novato: parseFloat(document.getElementById('rp-hev-nh-n')?.value) || 0,
      antigo: parseFloat(document.getElementById('rp-hev-nh-a')?.value) || 0,
    },
  };

  if (!D.regrasEquipe.bonusConvidados) D.regrasEquipe.bonusConvidados = {};
  CARGOS_PAGAMENTO.forEach(c => {
    D.regrasEquipe.bonusConvidados[c.key] = parseFloat(document.getElementById(`rp-bc-${c.key}`)?.value) || 0;
  });

  sv('regrasEquipe');
  alert2('Regras de pagamento salvas!');
}

// ═══════════════════════════════════════════════════════════════════════════════
