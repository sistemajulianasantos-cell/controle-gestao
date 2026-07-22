// ─── EQUIPE ────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

let equipeView    = 'lista'; // 'lista' | 'perfil' | 'eventos' | 'evento-detalhe' | 'regras' | 'pagamentos'
let _escalaViewMode = 'lista'; // 'lista' | 'imagem'
let equipeAtualId = null;
let escalaEventoAtual = null; // { id, nome, data }
const _folhaState = {}; // persiste estado da folha por evento durante a sessão
let _folhaLinhas  = []; // última folha calculada (para autorização)
let _novoColabFromEvento = false; // flag: novo colab aberto a partir do modal de evento
let _colabEventoOpcoes  = []; // colaboradores disponíveis para busca no modal de escala
let _folhaSaveTimer     = null; // debounce para salvar folhaConfig no contrato
let _escalaFiltroState  = { ini: '', fim: '', ano: '', mes: '' }; // persiste filtros da tela de eventos
let _equipeSearchTimer  = null; // debounce para busca na lista de equipe

const CARGOS_EQUIPE = ['Head Bartender','Coordenador','Bartender','Bar Back','Copeiro'];
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
  else if (equipeView === 'pagamentos')                        rEquipePagamentos();
  else rEquipeLista();
}

// ─── LISTA ────────────────────────────────────────────────────────────────────

function _equipeSearch(inp) {
  clearTimeout(_equipeSearchTimer);
  const cursor = inp.selectionStart;
  _equipeSearchTimer = setTimeout(() => {
    rEquipeLista();
    const el = document.getElementById('eq-busca');
    if (el) { el.focus(); el.setSelectionRange(cursor, cursor); }
  }, 120);
}

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
      <input id="eq-busca" type="text" placeholder="Buscar..." value="${busca}" oninput="_equipeSearch(this)"
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
        <button class="btn-sm" onclick="equipeView='pagamentos';rEquipePagamentos()"
          style="background:var(--bg2);border:1px solid var(--border2)">💳 Pagamentos</button>
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
                    ${c.foto ? `<img src="${c.foto}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid var(--border2)">` :
                      `<div style="width:52px;height:52px;border-radius:50%;background:var(--bg3);border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--text3);flex-shrink:0">${(c.nome||'?')[0].toUpperCase()}</div>`}
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

// Foto: redimensiona, converte File → base64 e salva no colaborador
function uploadFotoColab(colabId, input) {
  const file = input.files[0];
  if (!file) return;
  _redimensionarFoto(file, base64 => {
    const c = (D.equipe||[]).find(x=>x.id===colabId);
    if (!c) return;
    c.foto = base64;
    sv('equipe');
    rEquipePerfil();
  });
}

// ─── ESCALA POR EVENTO ────────────────────────────────────────────────────────

let _mostrarHistoricoEscala  = false;
let _escalaEventosViewMode  = 'imagem'; // 'imagem' | 'lista'

function rEscalaEventos() {
  equipeView = 'eventos';
  const el = document.getElementById('eq-content');
  if (!el) return;

  const hoje = new Date().toISOString().slice(0,10);

  // Lê filtros do DOM (se existir) ou do estado persistente (ao voltar de detalhe)
  const anoVal  = document.getElementById('eq-esc-ano')?.value ?? _escalaFiltroState.ano;
  const mesVal  = document.getElementById('eq-esc-mes')?.value ?? _escalaFiltroState.mes;
  const filtroI = document.getElementById('eq-esc-ini')?.value ?? _escalaFiltroState.ini;
  const filtroF = document.getElementById('eq-esc-fim')?.value ?? _escalaFiltroState.fim;
  _escalaFiltroState = { ini: filtroI, fim: filtroF, ano: anoVal, mes: mesVal };

  const todos = (D.contratos||[]).filter(c=>(c.status||'ativo')!=='cancelado').sort((a,b)=>a.data.localeCompare(b.data));

  const filtrados = (filtroI || filtroF) ? todos.filter(c => {
    if (filtroI && c.data < filtroI) return false;
    if (filtroF && c.data > filtroF) return false;
    return true;
  }) : todos;

  const futuros      = filtrados.filter(c => c.data >= hoje);
  const passados     = filtrados.filter(c => c.data <  hoje).reverse();
  const filtroAtivo  = !!(filtroI || filtroF);

  const MESES = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  const ordemCargosEv = ['Head Bartender','Coordenador','Bartender','Bar Back','Copeiro'];
  const _cardEvento = (c, passado=false) => {
    const escalas = _escalasDoEvento(c).slice().sort((a,b)=>{
      const iA = ordemCargosEv.indexOf(a.cargo||''); const iB = ordemCargosEv.indexOf(b.cargo||'');
      return (iA<0?99:iA)-(iB<0?99:iB);
    });
    const nomeEsc = (c.nome||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');
    const coresLabel = { 'Head Bartender':'#6366f1','Coordenador':'#f59e0b','Bartender':'#3b82f6','Bar Back':'#22c55e','Copeiro':'#ec4899' };

    const corpo = !escalas.length
      ? `<div style="padding:10px 14px;color:var(--text3);font-size:12px">Nenhum colaborador escalado</div>`
      : _escalaEventosViewMode === 'lista'
        ? `<div style="overflow-x:auto">
            <table style="border-collapse:collapse;font-size:12px;width:100%">
              <thead>
                <tr style="border-bottom:1px solid var(--border2);font-size:10px;text-transform:uppercase;color:var(--text3)">
                  <th style="padding:5px 12px;text-align:left">Nome</th>
                  <th style="padding:5px 10px;text-align:left">Cargo</th>
                  <th style="padding:5px 10px;text-align:left">Nível</th>
                  <th style="padding:5px 10px;text-align:left;font-family:monospace">Chave PIX</th>
                </tr>
              </thead>
              <tbody>
                ${escalas.map(e=>{
                  const col=(D.equipe||[]).find(x=>x.id===e.colaboradorId);
                  if(!col) return '';
                  const cargo = e.cargo||col.cargo||'';
                  const cor   = coresLabel[cargo]||'var(--text2)';
                  const foto  = col.foto
                    ? `<img src="${col.foto}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;flex-shrink:0">`
                    : `<div style="width:28px;height:28px;border-radius:50%;background:var(--bg3);border:1px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:var(--text3);flex-shrink:0">${(col.nome||'?')[0].toUpperCase()}</div>`;
                  return `<tr style="border-bottom:1px solid var(--border)">
                    <td style="padding:5px 12px">
                      <div style="display:flex;align-items:center;gap:7px">
                        ${foto}
                        <span style="font-weight:600">${col.nome}</span>
                      </div>
                    </td>
                    <td style="padding:5px 10px;color:${cor};font-size:11px">${cargo}</td>
                    <td style="padding:5px 10px;color:${col.nivel==='Novato'?'var(--amber)':'var(--green)'};font-size:11px">${col.nivel||'—'}</td>
                    <td style="padding:5px 10px;font-family:monospace;font-size:10px;color:#4ade80">${col.chave_pix||'—'}</td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>`
        : `<div style="display:flex;flex-wrap:wrap;gap:14px;padding:14px 16px">
            ${escalas.map(e=>{
              const col=(D.equipe||[]).find(x=>x.id===e.colaboradorId);
              if(!col) return '';
              const primeiroNome = col.nome.split(' ')[0];
              const sobrenome   = col.nome.split(' ')[1] || '';
              const cargo       = e.cargo||col.cargo||'';
              const foto        = col.foto
                ? `<img src="${col.foto}" style="width:80px;height:88px;border-radius:10px;object-fit:cover;object-position:top center;display:block">`
                : `<div style="width:80px;height:88px;border-radius:10px;background:var(--bg2);border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:30px;font-weight:700;color:var(--text3)">${(col.nome||'?')[0].toUpperCase()}</div>`;
              return `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:80px">
                ${foto}
                <div style="font-size:11px;font-weight:700;color:var(--text);text-align:center;line-height:1.2;width:100%">
                  ${primeiroNome}${sobrenome?' '+sobrenome:''}
                </div>
                ${cargo?`<div style="font-size:10px;color:${coresLabel[cargo]||'var(--text3)'};text-align:center;margin-top:-4px">${cargo}</div>`:''}
              </div>`;
            }).join('')}
          </div>`;

    return `
    <div class="sec" style="margin-bottom:10px">
      <div class="sec-head" style="flex-wrap:wrap;gap:8px">
        <div>
          <span style="font-size:15px;font-weight:700;color:var(--text)">${c.nome||'Sem nome'}</span>
          <span style="font-size:12px;color:var(--text2);margin-left:10px">
            ${fd(c.data)}${c.local?' · '+c.local:''}${c.convidados?' · '+c.convidados+' conv.':''}
          </span>
        </div>
        <button class="btn-sm ${passado?'':'btn-primary'}" style="${passado?'background:var(--bg3)':''}"
          onclick="abrirEscalaEvento('${c.id}','${nomeEsc}','${c.data}')">
          👥 ${passado?'Ver equipe':'Montar equipe'}
        </button>
      </div>
      ${corpo}
    </div>`;
  };

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <button class="btn-sm" onclick="rEquipeLista()" style="background:var(--bg3)">← Colaboradores</button>
      <span style="font-weight:600;font-size:15px;color:var(--text)">Escala por Evento</span>
      <div style="margin-left:auto;display:flex;gap:4px">
        <button class="sort-btn${_escalaEventosViewMode==='lista'?' active':''}" onclick="_escalaEventosViewMode='lista';rEscalaEventos()" title="Lista">☰ Lista</button>
        <button class="sort-btn${_escalaEventosViewMode==='imagem'?' active':''}" onclick="_escalaEventosViewMode='imagem';rEscalaEventos()" title="Imagem">⊞ Imagem</button>
      </div>
    </div>

    <div style="display:flex;gap:12px;align-items:flex-end;margin-bottom:14px;flex-wrap:wrap">
      <div><label class="lbl">Ano</label><select id="eq-esc-ano" class="inp" style="width:80px" onchange="aplicarMesFechado('eq-esc-ano','eq-esc-mes','eq-esc-ini','eq-esc-fim',rEscalaEventos)"></select></div>
      <div><label class="lbl">Mês</label><select id="eq-esc-mes" class="inp" style="width:110px" onchange="aplicarMesFechado('eq-esc-ano','eq-esc-mes','eq-esc-ini','eq-esc-fim',rEscalaEventos)">
        <option value="">Mês...</option>
        ${MESES.slice(1).map((m,i)=>`<option value="${i+1}" ${mesVal===String(i+1)?'selected':''}>${m}</option>`).join('')}
      </select></div>
      <div><label class="lbl">De</label><input id="eq-esc-ini" class="inp" type="date" style="width:145px" value="${filtroI}" onchange="document.getElementById('eq-esc-ano').value='';document.getElementById('eq-esc-mes').value='';rEscalaEventos()"></div>
      <div><label class="lbl">Até</label><input id="eq-esc-fim" class="inp" type="date" style="width:145px" value="${filtroF}" onchange="document.getElementById('eq-esc-ano').value='';document.getElementById('eq-esc-mes').value='';rEscalaEventos()"></div>
      <button class="sort-btn active" onclick="rEscalaEventos()">Filtrar</button>
      ${filtroAtivo?`<button class="sort-btn" onclick="_escalaFiltroState={ini:'',fim:'',ano:'',mes:''};rEscalaEventos()" style="color:var(--red)">✕ Limpar</button>`:''}
    </div>

    ${filtroAtivo && !filtrados.length ? `
    <div style="text-align:center;padding:48px;color:var(--text3)">
      <div style="font-size:32px;margin-bottom:10px">🔍</div>
      <div>Nenhum evento encontrado para o período selecionado</div>
    </div>` : ''}

    ${!filtroAtivo && !futuros.length ? `
    <div style="text-align:center;padding:48px;color:var(--text3)">
      <div style="font-size:32px;margin-bottom:10px">📅</div>
      <div>Nenhum evento futuro em Contratos</div>
    </div>` : futuros.map(c => _cardEvento(c, false)).join('')}

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

  // Popula select de ano e restaura valor
  gerarAnosFromData('eq-esc-ano', todos.map(c=>c.data));
  if (anoVal) { const el2 = document.getElementById('eq-esc-ano'); if (el2) el2.value = anoVal; }
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

// Mapeamento cargo → chave nas regras de pagamento
const _CARGO_PAG_KEY = {
  'Head Bartender': 'hb', 'Coordenador': 'cd',
  'Bartender': 'bt', 'Bar Back': 'bb', 'Copeiro': 'cp',
};

function _calcHorasEvento(ini, fim) {
  try {
    const [hi, mi] = ini.split(':').map(Number);
    let [hf, mf]   = fim.split(':').map(Number);
    let diff = (hf*60+mf) - (hi*60+mi);
    if (diff < 0) diff += 1440; // cruza meia-noite
    return Math.round(diff/60*10)/10;
  } catch { return null; }
}

function _calcPagamento(cargoKey, nivel, regiao, horasContr, horasNH, convidados) {
  const rg = D.regrasEquipe || {};
  const nk = (nivel||'').toLowerCase().includes('novato') ? 'novato' : 'antigo';
  // Valor base vem do Cadastro de Cargos (js/cargos.js) — não mais de
  // D.regrasEquipe.base. As faixas de região são as mesmas nos dois lugares.
  const cargo   = (typeof buscarCargoPorKey === 'function') ? buscarCargoPorKey(cargoKey) : null;
  const porReg  = (cargo && cargo.porRegiao && cargo.porRegiao[regiao]) || {};
  const valorBase     = (nk === 'novato' ? porReg.custoNovato : porReg.custoAntigo) || 0;
  const horasBase     = rg.horasBase || 6;
  const ehViagem      = (regiao||'').startsWith('viagem');
  const tabHE         = ehViagem ? (rg.horaExtraViagem||{}) : (rg.horaExtra||{});
  // Horas do contrato acima da base → rate antecipada
  const horasExtraAnt = Math.max(0, (horasContr||0) - horasBase);
  const horasExtraNH  = horasNH || 0;
  const valorHE_ant   = ((tabHE.antecipada||{})[nk]||0) * horasExtraAnt;
  const valorHE_nh    = ((tabHE.naHora    ||{})[nk]||0) * horasExtraNH;
  const horasExtra    = horasExtraAnt + horasExtraNH;
  const valorHE       = valorHE_ant + valorHE_nh;
  const paxUnits      = cargoKey === 'hb'
    ? Math.max(1, (convidados||0) / 100)
    : Math.floor((convidados||0) / 100);
  const valorBonus = ((rg.bonusConvidados||{})[cargoKey]||0) * paxUnits;
  return { valorBase, horasExtra, horasExtraAnt, horasExtraNH, valorHE, valorHE_ant, valorHE_nh, valorBonus, total: valorBase+valorHE+valorBonus };
}

function toggleHoraExtraEvento() {
  const checked = document.getElementById('eq-fp-tem-he')?.checked;
  const det = document.getElementById('eq-fp-he-detalhes');
  if (det) det.style.display = checked ? 'flex' : 'none';
  calcularFolhaPagamento();
}

function calcularFolhaPagamento() {
  const regiao     = document.getElementById('eq-fp-regiao')?.value || '';
  const horasBase  = D.regrasEquipe?.horasBase || 6;
  const temHEck    = document.getElementById('eq-fp-tem-he')?.checked || false;
  const horasContr = parseFloat(document.getElementById('eq-fp-horas-base')?.value) || horasBase;
  const horasNH    = temHEck ? (parseFloat(document.getElementById('eq-fp-horas-extra')?.value)||0) : 0;
  const el      = document.getElementById('eq-folha-resultado');
  if (!el) return;

  // Persiste o estado da folha para restaurar ao voltar à tela
  if (escalaEventoAtual?.id) {
    const prev = _folhaState[escalaEventoAtual.id] || {};
    _folhaState[escalaEventoAtual.id] = { ...prev, regiao, temHE: temHEck, horasExtra: horasNH };
    // Salva no contrato (Firebase) com debounce para persistir entre sessões
    clearTimeout(_folhaSaveTimer);
    _folhaSaveTimer = setTimeout(() => {
      const ct = (D.contratos||[]).find(c => c.id === escalaEventoAtual?.id);
      if (!ct) return;
      const sf = _folhaState[escalaEventoAtual.id] || {};
      ct.folhaConfig = { regiao: sf.regiao||'', temHE: sf.temHE||false, horasExtra: sf.horasExtra||0, totalOverride: sf.totalOverride||{} };
      sv('contratos');
    }, 800);
  }

  if (!regiao) {
    el.innerHTML = '<div style="padding:14px;color:var(--text3);font-size:12px">Selecione a região do evento para calcular.</div>';
    return;
  }

  const ev       = escalaEventoAtual;
  const contrato = (D.contratos||[]).find(c=>c.id===ev?.id);
  const escalas  = _escalasDoEvento(contrato||{id:ev?.id,nome:ev?.nome,data:ev?.data});
  const convidados = parseInt(contrato?.convidados||0);
  const temHE     = temHEck || horasContr > horasBase;

  const overrides = _folhaState[ev.id] || {};
  if (!overrides.totalOverride) overrides.totalOverride = {};

  const linhas = [];
  escalas.forEach(e => {
    const col = (D.equipe||[]).find(x=>x.id===e.colaboradorId);
    if (!col) return;
    const cargo    = e.cargo || col.cargo || '';
    const cargoKey = _CARGO_PAG_KEY[cargo];
    if (!cargoKey) return;
    const pag = _calcPagamento(cargoKey, col.nivel, regiao, horasContr, horasNH, convidados);
    const totalFinal = overrides.totalOverride[col.id] !== undefined ? overrides.totalOverride[col.id] : pag.total;
    linhas.push({ col, cargo, ...pag, total: totalFinal, totalEditado: overrides.totalOverride[col.id] !== undefined });
  });

  // Calcular vagas ausentes (slots esperados não preenchidos)
  const contrato2 = (D.contratos||[]).find(c=>c.id===ev?.id);
  const vagasAusentes = [];
  if (contrato2?.equipe?.length) {
    const escalasGrupadas2 = {};
    escalas.forEach(e => {
      const c = e.cargo || (D.equipe||[]).find(x=>x.id===e.colaboradorId)?.cargo || '';
      if(!escalasGrupadas2[c]) escalasGrupadas2[c]=[];
      escalasGrupadas2[c].push(e);
    });
    const cargosNoContrato2 = new Set((contrato2.equipe||[]).map(e => e.cargo));
    contrato2.equipe.forEach(item => {
      let preenchidos = (escalasGrupadas2[item.cargo]||[]).length;
      if (item.cargo === 'Bartender' && !cargosNoContrato2.has('Head Bartender')) {
        preenchidos += (escalasGrupadas2['Head Bartender']||[]).length;
      }
      const faltando = (item.qtd||0) - preenchidos;
      if (faltando > 0) {
        const cargoKey = _CARGO_PAG_KEY[item.cargo];
        if (cargoKey) {
          const pag = _calcPagamento(cargoKey, 'Antigo', regiao, horasContr, horasNH, convidados);
          for (let i=0; i<faltando; i++) vagasAusentes.push({ cargo: item.cargo, cargoKey, valorCalc: pag.total });
        }
      }
    });
  }

  if (!linhas.length && !vagasAusentes.length) {
    _folhaLinhas = [];
    el.innerHTML = '<div style="padding:14px;color:var(--text3);font-size:12px">Nenhum colaborador com cargo mapeado nas regras.</div>';
    return;
  }

  const _ORD_PAG = ['Head Bartender','Coordenador','Bartender','Bar Back','Copeiro'];
  linhas.sort((a, b) => {
    const ia = _ORD_PAG.indexOf(a.cargo); const ib = _ORD_PAG.indexOf(b.cargo);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  _folhaLinhas = linhas.map(l => ({ ...l }));

  let totalGeral = linhas.reduce((s,l)=>s+l.total,0);
  const fmt = v => v !== undefined && v !== null ? `R$ ${Number(v).toFixed(2).replace('.',',')}` : '—';
  const cspan = temHE ? 7 : 6;

  const pagExist = (D.pagamentosEquipe||[]).filter(p => p.contratoId === ev?.id);
  const jaAutorizado = pagExist.length > 0;
  const dataAut = jaAutorizado ? pagExist[0].dataAutorizacao : null;

  el.innerHTML = `
    <div style="overflow-x:auto">
      <table style="border-collapse:collapse;font-size:12px;width:100%">
        <thead>
          <tr style="border-bottom:2px solid var(--border2);font-size:10px;text-transform:uppercase;color:var(--text3)">
            <th style="padding:7px 10px;text-align:left;min-width:160px">Colaborador</th>
            <th style="padding:7px 10px;text-align:left">Cargo</th>
            <th style="padding:7px 10px;text-align:left">Nível</th>
            <th style="padding:7px 10px;text-align:right">Valor base</th>
            ${temHE?`<th style="padding:7px 10px;text-align:right">H. extra${horasNH>0?` (+${horasNH}h NH)`:''}</th>`:''}
            <th style="padding:7px 10px;text-align:right">Bônus</th>
            <th style="padding:7px 10px;text-align:right;color:var(--green)">Total</th>
            <th style="padding:7px 10px;text-align:center;min-width:130px">Chave PIX</th>
          </tr>
        </thead>
        <tbody>
          ${linhas.map((l,idx)=>`
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:7px 10px;font-weight:600">${l.col.nome}</td>
            <td style="padding:7px 10px;color:var(--text2)">${l.cargo}</td>
            <td style="padding:7px 10px;color:${l.col.nivel==='Novato'?'var(--amber)':'var(--green)'}">${l.col.nivel||'—'}</td>
            <td style="padding:7px 10px;text-align:right">${fmt(l.valorBase)}</td>
            ${temHE?`<td style="padding:7px 10px;text-align:right;color:var(--amber)">${fmt(l.valorHE)}</td>`:''}
            <td style="padding:7px 10px;text-align:right;color:var(--text3)">${l.valorBonus>0?fmt(l.valorBonus):'—'}</td>
            <td style="padding:4px 10px;text-align:right">
              <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px">
                ${l.totalEditado?`<button onclick="resetarTotalFolha('${l.col.id}')" title="Restaurar valor original" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:11px;padding:0 2px;line-height:1">↺</button>`:''}
                <input type="number" value="${l.total.toFixed(2)}" step="0.01" min="0"
                  style="width:80px;text-align:right;padding:3px 5px;background:var(--bg3);border:1px solid ${l.totalEditado?'var(--amber)':'var(--border2)'};border-radius:var(--radius);color:${l.totalEditado?'var(--amber)':'var(--green)'};font-weight:700;font-size:12px"
                  onchange="salvarTotalFolha('${l.col.id}',this.value)"
                  onkeydown="if(event.key==='Enter')this.blur()">
              </div>
            </td>
            <td style="padding:7px 10px;text-align:center;font-size:10px;color:#4ade80;font-family:monospace">${l.col.chave_pix||'—'}</td>
          </tr>`).join('')}
        </tbody>
        <tfoot>
          <tr style="border-top:2px solid var(--border2);background:var(--bg3)">
            <td colspan="${cspan}" style="padding:9px 10px;font-weight:600;color:var(--text3);font-size:11px;text-transform:uppercase">Total geral</td>
            <td style="padding:9px 10px;text-align:right;font-weight:700;font-size:15px;color:var(--green)">R$ ${totalGeral.toFixed(2).replace('.',',')}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
    ${vagasAusentes.length ? `
    <div style="padding:10px 14px;border-top:1px solid var(--border);background:rgba(251,191,36,.05)">
      <div style="font-size:11px;font-weight:600;color:var(--amber);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Vagas não preenchidas</div>
      ${vagasAusentes.map((v,i)=>`
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px;font-size:12px">
        <span style="color:var(--text3);min-width:140px">${v.cargo} (ausente)</span>
        <span style="color:var(--amber);font-weight:600">${fmt(v.valorCalc)}</span>
        <button class="btn-sm" onclick="distribuirValorAusente(${v.valorCalc})"
          style="font-size:10px;padding:2px 8px;background:var(--bg3);border:1px solid var(--amber);color:var(--amber)">
          ÷ Distribuir entre presentes
        </button>
      </div>`).join('')}
      <div style="font-size:10px;color:var(--text3);margin-top:4px">Valor calculado para nível Antigo. Clique "Distribuir" para repartir igualmente entre os presentes.</div>
    </div>` : ''}
    <div style="padding:12px 14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      ${jaAutorizado
        ? `<span style="font-size:12px;color:var(--green)">✅ Autorizado em ${fd(dataAut)}</span>
           <button class="btn-sm" onclick="autorizarPagamentosEvento()" style="background:var(--bg3);border:1px solid var(--border2)">🔄 Reautorizar</button>`
        : `<button class="btn btn-primary btn-sm" onclick="autorizarPagamentosEvento()">💳 Autorizar Pagamentos</button>`}
      <button class="btn-sm" onclick="imprimirFolhaEvento()"
        style="background:var(--bg2);border:1px solid var(--border2)">🖨️ Imprimir folha</button>
      <button class="btn-sm" onclick="equipeView='pagamentos';rEquipePagamentos()"
        style="background:var(--bg2);border:1px solid var(--border2);margin-left:auto">📋 Ver todos os pagamentos</button>
    </div>`;
}

function imprimirFolhaEvento() {
  if (!_folhaLinhas.length) { alert('Calcule a folha antes de imprimir.'); return; }
  const ev = escalaEventoAtual;
  const contrato = (D.contratos||[]).find(c=>c.id===ev?.id);
  const regiao = document.getElementById('eq-fp-regiao')?.value || '';
  const regiaoLabel = REGIOES_PAGAMENTO.find(r=>r.key===regiao)?.label || regiao || '';
  const temHE = _folhaLinhas.some(l=>l.horasExtra>0);
  const fmtR = v => `R$ ${(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const fmtD = d => d ? d.split('-').reverse().join('/') : '—';
  const totalGeral = _folhaLinhas.reduce((s,l)=>s+l.total,0);

  const linhasHtml = _folhaLinhas.map(l => `
    <tr>
      <td>${l.col.nome}</td>
      <td>${l.cargo}</td>
      <td>${l.col.nivel||'—'}</td>
      <td style="text-align:right">${fmtR(l.valorBase)}</td>
      <td style="text-align:right">${l.valorHE>0?'<span style="color:#b45309">'+fmtR(l.valorHE)+(l.horasExtra?' <span style="font-size:9px;color:#999">(+'+l.horasExtra+'h)</span>':'')+'</span>':'—'}</td>
      <td style="text-align:right">${l.valorBonus>0?fmtR(l.valorBonus):'—'}</td>
      <td style="text-align:right;font-weight:700;color:#1a6b1a">${fmtR(l.total)}</td>
      <td style="font-family:monospace;font-size:10px">${l.col.chave_pix||'—'}</td>
    </tr>`).join('');

  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Folha de Pagamento — ${ev?.nome||''}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#111}
    h2{font-size:15px;margin:0 0 2px;font-weight:700}
    .sub{font-size:10px;color:#666;margin-bottom:12px}
    .totais{display:inline-flex;gap:32px;margin:10px 0 18px;border:1px solid #ddd;border-radius:4px;padding:10px 16px;background:#f9f9f9}
    .tot-item .lbl{font-size:10px;color:#666;margin-bottom:2px}
    .tot-item .val{font-weight:700;font-size:14px}
    .ev-head{background:#222;color:#fff;padding:7px 10px;border-radius:3px 3px 0 0;font-size:12px;display:flex;justify-content:space-between;align-items:center}
    .ev-meta{display:block;font-size:9px;color:#bbb;margin-top:2px;font-weight:400}
    table{width:100%;border-collapse:collapse;margin:0}
    th{background:#f4f4f4;color:#444;padding:5px 8px;text-align:left;font-size:10px;text-transform:uppercase;border:1px solid #ddd;font-weight:600}
    td{padding:5px 8px;border-bottom:1px solid #eee;font-size:11px}
    tr:last-child td{border-bottom:1px solid #ccc}
    tfoot td{background:#f4f4f4;font-weight:700;border-top:2px solid #ccc;padding:6px 8px}
    .rodape{margin-top:24px;font-size:9px;color:#999;border-top:1px solid #ddd;padding-top:6px}
    @media print{body{margin:10px}.totais,.ev-head{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style>
  </head><body>
  <h2>FOLHA DE PAGAMENTO</h2>
  <div class="sub">Impresso em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</div>
  <div class="totais">
    <div class="tot-item"><div class="lbl">Total geral</div><div class="val" style="color:#1a6b1a">${fmtR(totalGeral)}</div></div>
    <div class="tot-item"><div class="lbl">Colaboradores</div><div class="val">${_folhaLinhas.length}</div></div>
    ${regiaoLabel?`<div class="tot-item"><div class="lbl">Região</div><div class="val" style="font-size:11px">${regiaoLabel}</div></div>`:''}
  </div>
  <div class="ev-head">
    <div>
      <strong>${ev?.nome||''}</strong>
      <span class="ev-meta">${fmtD(ev?.data||'')}${contrato?.hrInicio?' · '+contrato.hrInicio+(contrato.hrFim?' – '+contrato.hrFim:''):''}${contrato?.convidados?' · '+contrato.convidados+' convidados':''}${contrato?.local?' · '+contrato.local:''}</span>
    </div>
    <strong>${fmtR(totalGeral)}</strong>
  </div>
  <table>
    <thead><tr>
      <th>Colaborador</th>
      <th>Cargo</th>
      <th>Nível</th>
      <th style="text-align:right">Valor base</th>
      <th style="text-align:right">H. extra</th>
      <th style="text-align:right">Bônus</th>
      <th style="text-align:right;color:#1a6b1a">Total</th>
      <th>Chave PIX</th>
    </tr></thead>
    <tbody>${linhasHtml}</tbody>
    <tfoot><tr>
      <td colspan="6" style="text-align:right;text-transform:uppercase;font-size:10px;color:#555">Total geral</td>
      <td style="text-align:right;color:#1a6b1a;font-size:13px">${fmtR(totalGeral)}</td>
      <td></td>
    </tr></tfoot>
  </table>
  <div class="rodape">Controle e Gestão — Juliana Santos · ${new Date().toLocaleDateString('pt-BR')}</div>
  <script>window.onload=function(){window.print()};<\/script>
  </body></html>`);
  w.document.close();
}

function salvarTotalFolha(colId, valor) {
  const v = parseFloat(valor);
  if (isNaN(v) || v < 0) { calcularFolhaPagamento(); return; }
  const ev = escalaEventoAtual;
  if (!ev) return;
  if (!_folhaState[ev.id]) _folhaState[ev.id] = {};
  if (!_folhaState[ev.id].totalOverride) _folhaState[ev.id].totalOverride = {};
  _folhaState[ev.id].totalOverride[colId] = v;
  calcularFolhaPagamento();
}

function resetarTotalFolha(colId) {
  const ev = escalaEventoAtual;
  if (!ev || !_folhaState[ev.id]?.totalOverride) return;
  delete _folhaState[ev.id].totalOverride[colId];
  calcularFolhaPagamento();
}

function distribuirValorAusente(valor) {
  if (!_folhaLinhas.length) return;
  const partes = Math.round((valor / _folhaLinhas.length) * 100) / 100;
  const ev = escalaEventoAtual;
  if (!ev) return;
  if (!_folhaState[ev.id]) _folhaState[ev.id] = {};
  if (!_folhaState[ev.id].totalOverride) _folhaState[ev.id].totalOverride = {};
  _folhaLinhas.forEach(l => {
    const atual = _folhaState[ev.id].totalOverride[l.col.id] !== undefined
      ? _folhaState[ev.id].totalOverride[l.col.id] : l.total;
    _folhaState[ev.id].totalOverride[l.col.id] = Math.round((atual + partes) * 100) / 100;
  });
  calcularFolhaPagamento();
}

function alterarCargoEscala(escalaId, novoCargo) {
  const e = (D.escalas||[]).find(x=>x.id===escalaId);
  if (e) { e.cargo = novoCargo; sv('escalas'); calcularFolhaPagamento(); }
}

function rEscalaEvento() {
  const el = document.getElementById('eq-content');
  if (!el || !escalaEventoAtual) return;

  const contrato = (D.contratos||[]).find(c=>c.id===escalaEventoAtual.id);
  const ev       = escalaEventoAtual;
  const escalas  = _escalasDoEvento(contrato || { id: ev.id, nome: ev.nome, data: ev.data });

  const horasAuto = contrato?.hrInicio && contrato?.hrFim
    ? _calcHorasEvento(contrato.hrInicio, contrato.hrFim)
    : null;
  const horasDefault = horasAuto || D.regrasEquipe?.horasBase || 6;

  // Se não há estado em memória, restaura a partir de pagamentos autorizados ou config salva
  if (!_folhaState[ev.id]) {
    const pagSalvos = (D.pagamentosEquipe||[]).filter(p => p.contratoId === ev.id);
    if (pagSalvos.length) {
      // Prioridade 1: restaura configuração da folha autorizada, mas NÃO bloqueia o recálculo
      // (totalOverride intencional bloqueava alterações de região/horas)
      const pRef = pagSalvos[0];
      _folhaState[ev.id] = {
        regiao:        pRef.regiao       || '',
        temHE:         (pRef.horasExtras || 0) > 0,
        horasExtra:    pRef.horasExtras  || 0,
        totalOverride: {},
      };
    } else if (contrato?.folhaConfig?.regiao) {
      // Prioridade 2: rascunho salvo antes da autorização
      const fc = contrato.folhaConfig;
      _folhaState[ev.id] = {
        regiao:        fc.regiao        || '',
        temHE:         fc.temHE         || false,
        horasExtra:    fc.horasExtra    || 0,
        totalOverride: fc.totalOverride || {},
      };
    }
  }

  // Recupera estado salvo da folha para este evento
  const _sf = _folhaState[ev.id] || {};

  const ordemCargos = ['Head Bartender','Coordenador','Bartender','Bar Back','Copeiro','Outros'];
  const avatar = col => col.foto
    ? `<img src="${col.foto}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid var(--border2)">`
    : `<div style="width:48px;height:48px;border-radius:50%;background:var(--bg3);border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--text3);flex-shrink:0">${(col.nome||'?')[0].toUpperCase()}</div>`;

  const cargoSelect = (escalaId, atual) =>
    `<select onchange="alterarCargoEscala('${escalaId}',this.value)"
      style="padding:3px 6px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);color:var(--text);font-size:11px">
      ${['Head Bartender','Coordenador','Bartender','Bar Back','Copeiro']
        .map(c=>`<option value="${c}" ${c===atual?'selected':''}>${c}</option>`).join('')}
    </select>`;

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <button class="btn-sm" onclick="equipeView='eventos';rEscalaEventos()" style="background:var(--bg3)">← Eventos</button>
      <div>
        <div style="font-weight:600;font-size:15px;color:var(--text)">${ev.nome}</div>
        <div style="font-size:11px;color:var(--text3)">${fd(ev.data)}${contrato?.hrInicio?' · '+contrato.hrInicio+(contrato.hrFim?' – '+contrato.hrFim:''):''}${horasAuto?' ('+horasAuto+'h)':''}</div>
      </div>
      ${(()=>{const tot=contrato?.equipe?.length?contrato.equipe.reduce((s,e)=>s+(e.qtd||0),0):(contrato?.equipeTotal||0);const cheia=tot&&escalas.length>=tot;return `<button class="btn btn-primary btn-sm" onclick="abrirAddColabEvento()" style="margin-left:auto${cheia?';opacity:.45;cursor:not-allowed':''}">+ Adicionar</button>`})()}
    </div>

    ${contrato ? `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:8px 14px;margin-bottom:12px;font-size:12px;display:flex;gap:18px;flex-wrap:wrap">
      ${contrato.tipo?`<span><span style="color:var(--text3)">Tipo: </span>${contrato.tipo}</span>`:''}
      ${contrato.convidados?`<span><span style="color:var(--text3)">Convidados: </span>${contrato.convidados}</span>`:''}
      ${contrato.local?`<span><span style="color:var(--text3)">Local: </span>${contrato.local}</span>`:''}
    </div>` : ''}

    <!-- Tabela equipe -->
    <div class="sec" style="margin-bottom:14px">
      <div class="sec-head" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        ${(()=>{
          const textoBreakdown = contrato?.equipe?.length ? contrato.equipe.map(e=>`${e.qtd} ${e.cargo}`).join(' · ') : (contrato?.equipeTexto||'');
          const _totBruto = contrato?.equipe?.length
            ? contrato.equipe.reduce((s,e)=>s+(e.qtd||0),0)
            : textoBreakdown
              ? ([...textoBreakdown.matchAll(/(\d+)\s+\w/g)].reduce((s,m)=>s+parseInt(m[1]),0) || contrato?.equipeTotal||0)
              : (contrato?.equipeTotal||0);
          const tot = Math.max(_totBruto, 0);
          const cor = !tot ? 'var(--text)' : escalas.length >= tot ? 'var(--red)' : escalas.length > 0 ? 'var(--amber)' : 'var(--text)';
          const label = tot ? `${escalas.length} / ${tot} pessoa${tot!==1?'s':''}` : `${escalas.length} pessoa${escalas.length!==1?'s':''}`;
          const breakdown = textoBreakdown ? `<span style="font-size:10px;color:var(--text3);margin-left:8px">(${textoBreakdown})</span>` : '';
          return `<span class="sec-title">👥 Equipe escalada — <span style="color:${cor}">${label}</span>${breakdown}</span>`;
        })()}
        <div style="margin-left:auto;display:flex;gap:4px">
          <button class="sort-btn${_escalaViewMode==='lista'?' active':''}" onclick="_escalaViewMode='lista';rEscalaEvento()" title="Visualização em lista">☰ Lista</button>
          <button class="sort-btn${_escalaViewMode==='imagem'?' active':''}" onclick="_escalaViewMode='imagem';rEscalaEvento()" title="Visualização em imagem">⊞ Imagem</button>
        </div>
      </div>
      ${(()=>{
        // Build expected slots from contrato.equipe
        const slotsCargos = ['Head Bartender','Coordenador','Bartender','Bar Back','Copeiro'];
        const slotsEsperados = [];
        if (contrato?.equipe?.length) {
          const eq = [...contrato.equipe].sort((a,b)=>(slotsCargos.indexOf(a.cargo)<0?99:slotsCargos.indexOf(a.cargo))-(slotsCargos.indexOf(b.cargo)<0?99:slotsCargos.indexOf(b.cargo)));
          eq.forEach(item => {
            for (let i=1;i<=(item.qtd||0);i++) slotsEsperados.push({ cargo: item.cargo, num: i, total: item.qtd });
          });
        }

        // Group escalas by cargo — resolve empty cargo from collaborator profile
        const escalasGrupadas = {};
        escalas.slice().sort((a,b)=>(ordemCargos.indexOf(a.cargo)<0?99:ordemCargos.indexOf(a.cargo))-(ordemCargos.indexOf(b.cargo)<0?99:ordemCargos.indexOf(b.cargo)))
          .forEach(e => {
            const c = e.cargo || (D.equipe||[]).find(x=>x.id===e.colaboradorId)?.cargo || '';
            if(!escalasGrupadas[c]) escalasGrupadas[c]=[];
            escalasGrupadas[c].push({...e, cargo: c});
          });

        // Build display rows: expected slots first, then overflow escalas
        const rows = [];
        if (slotsEsperados.length) {
          const cargosNoContrato = new Set(slotsEsperados.map(s => s.cargo));
          const usados = {};
          slotsEsperados.forEach(slot => {
            const grupoExato = escalasGrupadas[slot.cargo]||[];
            const used = usados[slot.cargo]||0;
            let escala = grupoExato[used];
            if (escala) {
              usados[slot.cargo] = used + 1;
            } else if (slot.cargo === 'Bartender' && !cargosNoContrato.has('Head Bartender')) {
              // Head Bartender preenche slot de Bartender quando não há slot próprio de HB no contrato
              const grupoHB = escalasGrupadas['Head Bartender']||[];
              const usadoHB = usados['Head Bartender']||0;
              if (grupoHB[usadoHB]) {
                escala = grupoHB[usadoHB];
                usados['Head Bartender'] = usadoHB + 1;
              }
            }
            const label = slot.total > 1 ? `${slot.cargo} ${slot.num}` : slot.cargo;
            rows.push(escala ? { tipo:'filled', escala, label } : { tipo:'vaga', cargo:slot.cargo, label });
          });
          // overflow: escalas além do que foi usado (HBs em slots de Bartender já contabilizados)
          Object.entries(escalasGrupadas).forEach(([cargo, grupo]) => {
            grupo.slice(usados[cargo]||0).forEach(e => rows.push({ tipo:'filled', escala:e, label:cargo+' (extra)' }));
          });
          // Reordena sempre pelo cargo real: HB/Coord → Bartender → Bar Back → Copeiro
          rows.sort((a, b) => {
            const cA = a.tipo === 'filled' ? (a.escala.cargo||'') : (a.cargo||'');
            const cB = b.tipo === 'filled' ? (b.escala.cargo||'') : (b.cargo||'');
            return (ordemCargos.indexOf(cA) < 0 ? 99 : ordemCargos.indexOf(cA))
                 - (ordemCargos.indexOf(cB) < 0 ? 99 : ordemCargos.indexOf(cB));
          });
        } else {
          escalas.slice().sort((a,b)=>(ordemCargos.indexOf(a.cargo)<0?99:ordemCargos.indexOf(a.cargo))-(ordemCargos.indexOf(b.cargo)<0?99:ordemCargos.indexOf(b.cargo)))
            .forEach(e => rows.push({ tipo:'filled', escala:e, label:e.cargo }));
        }

        const temRows = rows.length > 0;
        if (!temRows) return `<div style="text-align:center;padding:40px;color:var(--text3)">
             <div style="margin-bottom:12px">Nenhum colaborador escalado ainda.</div>
             <button class="btn btn-primary btn-sm" onclick="abrirAddColabEvento()">+ Adicionar colaborador</button>
           </div>`;

        // ── VIEW IMAGEM ─────────────────────────────────────────────────────
        if (_escalaViewMode === 'imagem') {
          const coresLabel = {
            'Coordenador':    '#f59e0b',
            'Head Bartender': '#6366f1',
            'Bartender':      '#3b82f6',
            'Bar Back':       '#22c55e',
            'Copeiro':        '#ec4899',
          };
          // Agrupa escalados por cargo mantendo ordem
          const gruposImagem = {};
          rows.filter(r=>r.tipo==='filled').forEach(r=>{
            const c = r.escala.cargo||'Outros';
            if(!gruposImagem[c]) gruposImagem[c]=[];
            gruposImagem[c].push(r.escala);
          });
          const linhas = Object.entries(gruposImagem).map(([cargo, lista])=>{
            const cor = coresLabel[cargo]||'var(--text2)';
            const cards = lista.map(e=>{
              const col=(D.equipe||[]).find(x=>x.id===e.colaboradorId);
              if(!col) return '';
              const primeiroNome = col.nome.split(' ')[0];
              const foto = col.foto
                ? `<img src="${col.foto}" style="width:72px;height:72px;border-radius:10px;object-fit:cover;display:block">`
                : `<div style="width:72px;height:72px;border-radius:10px;background:var(--bg3);border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:var(--text3)">${col.nome[0].toUpperCase()}</div>`;
              return `<div style="display:flex;flex-direction:column;align-items:center;gap:5px;cursor:default" title="${col.nome}">
                ${foto}
                <div style="font-size:11px;font-weight:600;color:var(--text);text-align:center;max-width:72px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${primeiroNome}</div>
              </div>`;
            }).join('');
            return `<div style="display:flex;align-items:center;gap:0;border-bottom:1px solid var(--border);min-height:100px">
              <div style="min-width:140px;max-width:140px;padding:12px 14px;font-weight:700;font-size:12px;color:${cor};border-right:3px solid ${cor};background:var(--bg2);align-self:stretch;display:flex;align-items:center">${cargo}</div>
              <div style="display:flex;flex-wrap:wrap;gap:12px;padding:12px 16px">${cards||'<span style="color:var(--text3);font-size:11px;font-style:italic">— nenhum escalado —</span>'}</div>
            </div>`;
          }).join('');
          return `<div style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">${linhas}</div>`;
        }

        return `<div style="overflow-x:auto">
           <table style="border-collapse:collapse;font-size:12px;width:100%">
             <thead>
               <tr style="border-bottom:2px solid var(--border2);font-size:10px;text-transform:uppercase;color:var(--text3)">
                 <th style="padding:7px 12px;text-align:left;min-width:80px">Vaga</th>
                 <th style="padding:7px 12px;text-align:left">Colaborador</th>
                 <th style="padding:7px 10px;text-align:left">Cargo no evento</th>
                 <th style="padding:7px 10px;text-align:left">Nível</th>
                 <th style="padding:7px 10px;text-align:center">CPF</th>
                 <th style="padding:7px 10px;text-align:center">Chave PIX</th>
                 <th style="padding:7px 10px"></th>
               </tr>
             </thead>
             <tbody>
               ${rows.map(row => {
                 if (row.tipo === 'vaga') {
                   return `<tr style="border-bottom:1px solid var(--border);opacity:.5">
                     <td style="padding:7px 12px;font-size:11px;color:var(--text3);font-style:italic">${row.label}</td>
                     <td style="padding:7px 12px" colspan="5">
                       <div style="display:flex;align-items:center;gap:8px">
                         <div style="width:48px;height:48px;border-radius:50%;background:var(--bg3);border:2px dashed var(--border2);flex-shrink:0"></div>
                         <span style="color:var(--text3);font-style:italic">— Vaga em aberto —</span>
                         <button class="btn-sm" onclick="abrirAddColabEvento()" style="margin-left:8px;font-size:10px;padding:2px 7px">+ Adicionar</button>
                       </div>
                     </td>
                     <td></td>
                   </tr>`;
                 }
                 const e = row.escala;
                 const col = (D.equipe||[]).find(x=>x.id===e.colaboradorId);
                 if (!col) return '';
                 return `<tr style="border-bottom:1px solid var(--border)">
                   <td style="padding:7px 12px;font-size:11px;color:var(--text3)">${row.label}</td>
                   <td style="padding:7px 12px">
                     <div style="display:flex;align-items:center;gap:8px">
                       ${avatar(col)}
                       <div>
                         <div style="font-weight:600">${col.nome}</div>
                         ${col.telefone?`<div style="font-size:10px;color:var(--text3)">${col.telefone}</div>`:''}
                       </div>
                     </div>
                   </td>
                   <td style="padding:7px 10px">${cargoSelect(e.id, e.cargo||col.cargo||'')}</td>
                   <td style="padding:7px 10px;color:${col.nivel==='Novato'?'var(--amber)':'var(--green)'}">${col.nivel||'—'}</td>
                   <td style="padding:7px 10px;text-align:center;font-size:10px;color:var(--text2);font-family:monospace">${col.cpf||'—'}</td>
                   <td style="padding:7px 10px;text-align:center;font-size:10px;color:#4ade80;font-family:monospace">${col.chave_pix||'—'}</td>
                   <td style="padding:7px 10px;text-align:center">
                     <button class="btn-sm btn-red" onclick="removerEscala('${e.id}');equipeView='evento-detalhe';setTimeout(rEscalaEvento,80)" title="Remover">✕</button>
                   </td>
                 </tr>`;
               }).join('')}
             </tbody>
           </table>
           </div>`;
      })()}
    </div>

    <!-- Folha de pagamento -->
    <div class="sec">
      <div class="sec-head"><span class="sec-title">💰 Folha de Pagamento</span></div>
      <input type="hidden" id="eq-fp-horas-base" value="${horasDefault}">
      <div style="padding:12px 14px;display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;border-bottom:1px solid var(--border)">
        <div>
          <label class="lbl">Região do evento</label>
          <select id="eq-fp-regiao" class="inp" style="width:200px" onchange="calcularFolhaPagamento()">
            <option value="">Selecione...</option>
            ${REGIOES_PAGAMENTO.map(r=>`<option value="${r.key}" ${r.key===_sf.regiao?'selected':''}>${r.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="lbl">Horas do evento (contrato)</label>
          <div style="padding:6px 10px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);font-size:13px;font-weight:600;color:var(--text);min-width:90px">
            ${horasDefault}h${contrato?.hrInicio&&contrato?.hrFim?' <span style="font-size:10px;font-weight:400;color:var(--text3)">('+contrato.hrInicio+' – '+contrato.hrFim+')</span>':''}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <label class="lbl">Hora extra?</label>
          <label style="display:flex;align-items:center;gap:7px;cursor:pointer;padding:6px 0;font-size:13px;color:var(--text)">
            <input type="checkbox" id="eq-fp-tem-he" onchange="toggleHoraExtraEvento()"
              style="width:15px;height:15px;cursor:pointer;accent-color:var(--amber)"
              ${_sf.temHE?'checked':''}>
            Houve hora extra
          </label>
        </div>
        <div id="eq-fp-he-detalhes" style="display:${_sf.temHE?'flex':'none'};gap:14px;flex-wrap:wrap;align-items:flex-end">
          <div>
            <label class="lbl">Horas extras</label>
            <input type="number" id="eq-fp-horas-extra" class="inp" style="width:90px" min="0.5" max="12" step="0.5"
              value="${_sf.horasExtra||1}" onchange="calcularFolhaPagamento()">
          </div>
        </div>
      </div>
      <div id="eq-folha-resultado" style="padding:0">
        <div style="padding:14px;color:var(--text3);font-size:12px">Selecione a região do evento para calcular.</div>
      </div>
    </div>`;

  // Se havia região salva, recalcula automaticamente
  if (_sf.regiao) setTimeout(calcularFolhaPagamento, 0);
}

// ─── MODAL: ADICIONAR COLABORADOR AO EVENTO ──────────────────────────────────

function abrirAddColabEvento() {
  if (!escalaEventoAtual) return;

  const contrato = (D.contratos||[]).find(c=>c.id===escalaEventoAtual.id);
  const maxEquipe = contrato?.equipe?.length
    ? contrato.equipe.reduce((s,e)=>s+(e.qtd||0),0)
    : (contrato?.equipeTotal || 0);
  if (maxEquipe) {
    const escalasDoEvento = (D.escalas||[]).filter(e =>
      e.contratoId===escalaEventoAtual.id || (e.nomeEvento===escalaEventoAtual.nome && e.dataEvento===escalaEventoAtual.data)
    );
    // Conta apenas slots regulares preenchidos (extras além da cota por cargo não bloqueiam vagas abertas)
    const preenchidos = contrato?.equipe?.length
      ? (() => {
          const cargosNoContratoAdc = new Set((contrato.equipe||[]).map(e => e.cargo));
          return contrato.equipe.reduce((s, slot) => {
            const qtdDoCargo = escalasDoEvento.filter(e =>
              e.cargo === slot.cargo ||
              (e.cargo === 'Head Bartender' && slot.cargo === 'Bartender' && !cargosNoContratoAdc.has('Head Bartender'))
            ).length;
            return s + Math.min(qtdDoCargo, slot.qtd || 0);
          }, 0);
        })()
      : escalasDoEvento.length;
    if (preenchidos >= maxEquipe) {
      alert(`Limite atingido: este evento contratou ${maxEquipe} colaborador${maxEquipe!==1?'es':''} e já há ${preenchidos} escalado${preenchidos!==1?'s':''}.`);
      return;
    }
  }

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

  const disponiveis = (D.equipe||[])
    .filter(c=>(c.status||'ativo')!=='inativo')
    .sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));

  _colabEventoOpcoes = disponiveis
    .filter(c => !jaEscalados.has(c.id))
    .map(c => {
      const conflito = verificarConflito(c.id, ev.data);
      return {
        id: c.id,
        searchText: c.nome.toLowerCase(),
        label: `${conflito?'⚠️ ':''}${c.nome} — ${c.cargo||'sem cargo'}${conflito?' (conflito de data)':''}`,
        inputVal: `${c.nome} — ${c.cargo||'sem cargo'}`
      };
    });

  if (!_colabEventoOpcoes.length) {
    alert('Todos os colaboradores ativos já foram escalados para este evento.');
    return;
  }

  // Limpa estado do dropdown de busca
  const buscaEl  = document.getElementById('add-ev-busca');
  const opcoesEl = document.getElementById('add-ev-opcoes');
  const listaEl  = document.getElementById('add-ev-lista');
  if (buscaEl)  buscaEl.value = '';
  if (opcoesEl) { opcoesEl.innerHTML = ''; opcoesEl.style.display = 'none'; }
  if (listaEl)  listaEl.value = '';

  document.getElementById('add-ev-titulo').textContent = `Adicionar à: ${ev.nome} (${fd(ev.data)})`;
  document.getElementById('add-ev-cargo').value = '';
  document.getElementById('m-add-colab-evento').style.display = 'flex';
}

function confirmarAddColabEvento() {
  const colaboradorId = document.getElementById('add-ev-lista')?.value;
  let cargo           = document.getElementById('add-ev-cargo')?.value;
  if (!escalaEventoAtual) return;
  if (!colaboradorId) { alert('Selecione um colaborador.'); return; }
  if (!cargo) {
    const col = (D.equipe||[]).find(c=>c.id===colaboradorId);
    cargo = col?.cargo || '';
  }
  const ev = escalaEventoAtual;
  const ok = escalarColab(colaboradorId, ev.data, ev.nome, cargo, ev.id);
  if (ok) {
    document.getElementById('m-add-colab-evento').style.display = 'none';
    rEscalaEvento();
  }
}

// ─── DROPDOWN DE BUSCA: COLABORADOR NO EVENTO ─────────────────────────────────

function _abrirDropdownColab() {
  _renderColabEventoOpcoes(document.getElementById('add-ev-busca')?.value || '');
}

function _filtrarColabEvento() {
  document.getElementById('add-ev-lista').value = '';
  _renderColabEventoOpcoes(document.getElementById('add-ev-busca')?.value || '');
}

function _renderColabEventoOpcoes(busca) {
  const opcoes = document.getElementById('add-ev-opcoes');
  if (!opcoes) return;
  const termo = busca.toLowerCase().trim();
  const filtrados = termo
    ? _colabEventoOpcoes.filter(c => c.searchText.includes(termo))
    : _colabEventoOpcoes;

  if (!filtrados.length) {
    opcoes.innerHTML = '<div style="padding:10px 12px;color:#8B91A8;font-size:12px">Nenhum resultado</div>';
  } else {
    opcoes.innerHTML = filtrados.map(c =>
      `<div data-id="${c.id}" data-val="${c.inputVal.replace(/"/g,'&quot;')}"
        onmousedown="event.preventDefault();_selecionarColabEvento(this.dataset.id,this.dataset.val)"
        onmouseover="this.style.background='#1E2332'" onmouseout="this.style.background=''"
        style="padding:8px 12px;cursor:pointer;font-size:13px;color:#E8EAF0;border-bottom:1px solid #1A1E2E"
      >${c.label}</div>`
    ).join('');
  }
  opcoes.style.display = 'block';
}

function _selecionarColabEvento(id, inputVal) {
  document.getElementById('add-ev-lista').value = id;
  document.getElementById('add-ev-busca').value = inputVal;
  document.getElementById('add-ev-opcoes').style.display = 'none';
}

// ─── CRUD COLABORADOR ─────────────────────────────────────────────────────────

const _EQ_CARGOS_CB = [
  { id: 'hb', val: 'Head Bartender' },
  { id: 'cd', val: 'Coordenador' },
  { id: 'bt', val: 'Bartender' },
  { id: 'bb', val: 'Bar Back' },
  { id: 'cp', val: 'Copeiro' },
];

function _redimensionarFoto(file, cb, maxPx=200, quality=0.75) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const w = Math.round(img.width  * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      cb(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function eqPreviewFoto(input) {
  const file = input.files[0];
  if (!file) return;
  _redimensionarFoto(file, base64 => {
    document.getElementById('eq-m-foto').value = base64;
    const prev = document.getElementById('eq-m-foto-preview');
    if (prev) prev.innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover">`;
  });
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

function abrirNovoColabFromEvento() {
  _novoColabFromEvento = true;
  document.getElementById('m-add-colab-evento').style.display = 'none';
  abrirNovoColab();
}

var _salvandoColab = false;
function salvarColab() {
  if (_salvandoColab) return;
  _salvandoColab = true;
  const nome = document.getElementById('eq-m-nome')?.value?.trim();
  if (!nome) { alert2('Informe o nome.', 'error'); _salvandoColab = false; return; }
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
    D.equipe.push({ id: _gerarId('EQ'), ...dados, criadoEm: new Date().toISOString() });
  }

  sv('equipe');
  _salvandoColab = false;
  document.getElementById('m-novo-colab').style.display = 'none';

  if (_novoColabFromEvento && !id) {
    _novoColabFromEvento = false;
    const novoId = D.equipe[D.equipe.length - 1]?.id;
    rEscalaEvento();
    abrirAddColabEvento();
    if (novoId) setTimeout(() => {
      const sel = document.getElementById('add-ev-lista');
      if (sel) sel.value = novoId;
    }, 50);
    alert2('Colaborador cadastrado! Confirme para escalá-lo no evento.');
    return;
  }

  _novoColabFromEvento = false;
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
  document.getElementById('eq-imp-info').textContent = 'Cole os dados do Excel (Nome | Endereço | Telefone | Chave PIX) e clique em Visualizar';
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
      endereco:  cols[1] || '',
      telefone:  cols[2] || '',
      chave_pix: cols[3] || '',
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
            <th style="padding:6px 8px;text-align:left">Endereço</th>
            <th style="padding:6px 8px;text-align:left">Telefone</th>
            <th style="padding:6px 8px;text-align:left">Chave PIX</th>
          </tr>
        </thead>
        <tbody>
          ${linhas.map(l=>`
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:5px 8px;font-weight:600">${l.nome||'—'}</td>
            <td style="padding:5px 8px;color:var(--text2);font-size:10px">${l.endereco||'—'}</td>
            <td style="padding:5px 8px;font-family:monospace;font-size:10px">${l.telefone||'—'}</td>
            <td style="padding:5px 8px;color:var(--green);font-family:monospace;font-size:10px">${l.chave_pix||'—'}</td>
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
            return `<tr style="border-bottom:1px solid var(--border)">
              <td style="padding:6px 10px;font-weight:600;color:var(--text);white-space:nowrap">${r.label}</td>
              ${CARGOS_PAGAMENTO.map(c => {
                const cargo = (typeof buscarCargoPorKey === 'function') ? buscarCargoPorKey(c.key) : null;
                const cv = (cargo && cargo.porRegiao && cargo.porRegiao[r.key]) || {};
                return `<td style="${tdStyle}border-left:1px solid var(--border2);color:var(--text2);font-family:var(--mono)">${cv.custoNovato ? fR(cv.custoNovato) : '—'}</td>
                        <td style="${tdStyle}color:var(--text2);font-family:var(--mono)">${cv.custoAntigo ? fR(cv.custoAntigo) : '—'}</td>`;
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
      <div class="sec-head"><span class="sec-title">💰 Valor base por cargo, região e nível (R$)</span>
        <button class="btn-sm" style="margin-left:auto;background:var(--blue)" onclick="go('cargos')">✏️ Editar em Cadastro → Cargos</button>
      </div>
      <div style="padding:12px 14px">
        <div style="font-size:11px;color:var(--text3);margin-bottom:10px">
          Somente leitura — para alterar, use o <b>Cadastro → Cargos</b>. <span style="color:#6EE7B7">■</span> Novato &nbsp;&nbsp;
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
  // Valor base por cargo/região/nível não é mais editado aqui — vem do
  // Cadastro de Cargos (js/cargos.js), somente leitura nesta tela.

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

// ─── PAGAMENTOS DA EQUIPE ────────────────────────────────────────────────────

function autorizarPagamentosEvento() {
  if (!_folhaLinhas.length || !escalaEventoAtual) {
    alert('Calcule a folha antes de autorizar os pagamentos.');
    return;
  }
  const ev          = escalaEventoAtual;
  const regiao      = document.getElementById('eq-fp-regiao')?.value || '';
  const _horasBase = D.regrasEquipe?.horasBase || 6;
  const temHEck    = document.getElementById('eq-fp-tem-he')?.checked || false;
  const horasContr = parseFloat(document.getElementById('eq-fp-horas-base')?.value) || _horasBase;
  const horasNH    = temHEck ? (parseFloat(document.getElementById('eq-fp-horas-extra')?.value)||0) : 0;
  const hoje       = new Date().toISOString().slice(0,10);

  if (!D.pagamentosEquipe) D.pagamentosEquipe = [];
  // Remove pagamentos e despesas anteriores deste evento (reautorização limpa)
  D.pagamentosEquipe = D.pagamentosEquipe.filter(p => p.contratoId !== ev.id);
  if (typeof _removerDespesasDoEvento === 'function') _removerDespesasDoEvento(ev.id);

  _folhaLinhas.forEach(l => {
    const pag = {
      id:               `PE_${ev.id}_${l.col.id}`,
      contratoId:       ev.id,
      nomeEvento:       ev.nome,
      dataEvento:       ev.data,
      colaboradorId:    l.col.id,
      nomeColab:        l.col.nome,
      cargo:            l.cargo,
      nivel:            l.col.nivel || '',
      chave_pix:        l.col.chave_pix || '',
      valorBase:        l.valorBase,
      valorHE:          l.valorHE,
      valorBonus:       l.valorBonus,
      total:            l.total,
      regiao,
      horasContratadas: horasContr,
      horasExtras:      horasNH,
      dataAutorizacao:  hoje,
      status:           'pendente',
      dataPagamento:    null,
    };
    D.pagamentosEquipe.push(pag);
    if (typeof _registrarPagamentoEquipeComoDespesa === 'function') _registrarPagamentoEquipeComoDespesa(pag);
  });

  sv('pagamentosEquipe');
  sv('despesas');
  alert2('Pagamentos autorizados! Os valores já aparecem nas Despesas (categoria Pessoal).', 'success');
  calcularFolhaPagamento();
}

function marcarPagamentoPago(id) {
  const p = (D.pagamentosEquipe||[]).find(x => x.id === id);
  if (!p) return;
  p.status = p.status === 'pago' ? 'pendente' : 'pago';
  p.dataPagamento = p.status === 'pago' ? new Date().toISOString().slice(0,10) : null;
  sv('pagamentosEquipe');
  if (p.status === 'pago') {
    if (typeof _registrarPagamentoEquipeComoDespesa === 'function') _registrarPagamentoEquipeComoDespesa(p);
  } else {
    if (typeof _removerDespesaPagamentoEquipe === 'function') _removerDespesaPagamentoEquipe(p.id);
  }
  sv('despesas');
  rEquipePagamentos();
}

function marcarTodosEventoPago(contratoId, novoStatus) {
  const hoje = new Date().toISOString().slice(0,10);
  (D.pagamentosEquipe||[]).filter(p => p.contratoId === contratoId).forEach(p => {
    p.status = novoStatus;
    p.dataPagamento = novoStatus === 'pago' ? hoje : null;
    if (novoStatus === 'pago') {
      if (typeof _registrarPagamentoEquipeComoDespesa === 'function') _registrarPagamentoEquipeComoDespesa(p);
    } else {
      if (typeof _removerDespesaPagamentoEquipe === 'function') _removerDespesaPagamentoEquipe(p.id);
    }
  });
  sv('pagamentosEquipe');
  sv('despesas');
  rEquipePagamentos();
}

function excluirPagamentosEvento(contratoId) {
  if (!confirm('Remover todos os pagamentos autorizados deste evento?')) return;
  if (typeof _removerDespesasDoEvento === 'function') _removerDespesasDoEvento(contratoId);
  D.pagamentosEquipe = (D.pagamentosEquipe||[]).filter(p => p.contratoId !== contratoId);
  sv('pagamentosEquipe');
  sv('despesas');
  rEquipePagamentos();
}

function sincronizarPagamentosComDespesas() {
  const pagos = (D.pagamentosEquipe||[]).filter(p => p.status === 'pago');
  if (!pagos.length) { alert2('Nenhum pagamento marcado como pago.'); return; }
  let criados = 0;
  pagos.forEach(p => {
    if (typeof _registrarPagamentoEquipeComoDespesa === 'function') {
      const antes = (D.despesas||[]).length;
      _registrarPagamentoEquipeComoDespesa(p);
      if ((D.despesas||[]).length > antes) criados++;
    }
  });
  sv('despesas');
  alert2(criados ? `${criados} despesa(s) lançada(s) com sucesso!` : 'Todos os pagamentos já estavam nas despesas.', 'success');
}

function sincronizarDadosColaboradores() {
  const pagamentos = D.pagamentosEquipe || [];
  if (!pagamentos.length) { alert('Nenhum pagamento cadastrado.'); return; }

  let atualizados = 0;
  pagamentos.forEach(p => {
    const col = (D.equipe || []).find(c => c.id === p.colaboradorId);
    if (!col) return;
    const pixNovo  = col.chave_pix || '';
    const nomeNovo = col.nome || p.nomeColab;
    if (p.chave_pix !== pixNovo || p.nomeColab !== nomeNovo) {
      p.chave_pix = pixNovo;
      p.nomeColab = nomeNovo;
      atualizados++;
    }
  });

  sv('pagamentosEquipe');
  rEquipePagamentos();
  alert2(atualizados > 0
    ? `${atualizados} registro${atualizados>1?'s':''} atualizado${atualizados>1?'s':''} com os dados atuais dos colaboradores.`
    : 'Todos os registros já estão atualizados.', 'success');
}

let _pgFiltro = 'pendente';

function rEquipePagamentos() {
  equipeView = 'pagamentos';
  const el = document.getElementById('eq-content');
  if (!el) return;

  const todos = D.pagamentosEquipe || [];
  const busca = (document.getElementById('eq-pg-busca')?.value || '').toLowerCase();

  const lista = todos.filter(p => {
    if (_pgFiltro !== 'todos' && p.status !== _pgFiltro) return false;
    if (busca && !(p.nomeEvento||'').toLowerCase().includes(busca) &&
                 !(p.nomeColab||'').toLowerCase().includes(busca)) return false;
    return true;
  });

  const porEvento = {};
  lista.forEach(p => {
    if (!porEvento[p.contratoId]) porEvento[p.contratoId] = { nome: p.nomeEvento, data: p.dataEvento, itens: [] };
    porEvento[p.contratoId].itens.push(p);
  });

  const totalPendente = todos.filter(p=>p.status==='pendente').reduce((a,p)=>a+p.total,0);
  const totalPago     = todos.filter(p=>p.status==='pago').reduce((a,p)=>a+p.total,0);
  const fmtR = v => `R$ ${(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  const eventosSorted = Object.entries(porEvento)
    .sort((a,b) => (b[1].data||'').localeCompare(a[1].data||''));

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap">
      <button class="btn-sm" onclick="rEquipeLista()" style="background:var(--bg3)">← Colaboradores</button>
      <span style="font-weight:600;font-size:15px;color:var(--text)">💳 Pagamentos da Equipe</span>
      <div style="display:flex;gap:8px;align-items:center;margin-left:auto;flex-wrap:wrap">
        <input id="eq-pg-busca" type="text" placeholder="Buscar evento ou colaborador..."
          value="${busca}" oninput="rEquipePagamentos()"
          style="padding:6px 10px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);color:var(--text);font-size:12px;width:220px">
        <button class="btn-sm" onclick="sincronizarPagamentosComDespesas()"
          style="background:var(--bg2);border:1px solid var(--border2)" title="Lança os pagamentos já marcados como pagos nas Despesas da empresa">📤 Lançar nas Despesas</button>
        <button class="btn-sm" onclick="sincronizarDadosColaboradores()"
          style="background:var(--bg2);border:1px solid var(--border2)" title="Atualiza chave PIX e nome de todos os pagamentos com os dados atuais do cadastro">🔄 Atualizar cadastro</button>
        <button class="btn-sm" onclick="imprimirPagamentosEquipe()"
          style="background:var(--bg2);border:1px solid var(--border2)">🖨️ Imprimir</button>
      </div>
    </div>

    <div class="cards" style="margin-bottom:14px">
      <div class="card amber"><div class="card-label">Total pendente</div><div class="card-val">${fmtR(totalPendente)}</div></div>
      <div class="card green"><div class="card-label">Total pago</div><div class="card-val">${fmtR(totalPago)}</div></div>
      <div class="card"><div class="card-label">Registros</div><div class="card-val">${todos.length}</div></div>
    </div>

    <div style="display:flex;gap:6px;margin-bottom:14px">
      ${[['pendente','⏳ Pendentes'],['pago','✅ Pagos'],['todos','Todos']].map(([k,l])=>`
        <button onclick="_pgFiltro='${k}';rEquipePagamentos()"
          style="padding:5px 12px;border-radius:var(--radius);border:1px solid var(--border2);font-size:12px;cursor:pointer;
                 background:${_pgFiltro===k?'var(--blue)':'var(--bg3)'};color:${_pgFiltro===k?'#fff':'var(--text)'}">${l}</button>
      `).join('')}
    </div>

    ${!eventosSorted.length
      ? `<div style="text-align:center;padding:48px;color:var(--text3)">
           <div style="font-size:32px;margin-bottom:10px">💳</div>
           <div>${_pgFiltro==='todos'&&!busca
             ? 'Nenhum pagamento autorizado ainda. Acesse a Escala por Evento, calcule a folha e clique em "Autorizar Pagamentos".'
             : 'Nenhum registro encontrado.'}</div>
         </div>`
      : eventosSorted.map(([cid, ev]) => {
          const todosEv   = (D.pagamentosEquipe||[]).filter(p=>p.contratoId===cid);
          const pendEv    = todosEv.filter(p=>p.status==='pendente');
          const _ORD = ['Head Bartender','Coordenador','Bartender','Bar Back','Copeiro'];
          ev.itens.sort((a,b)=>((_ORD.indexOf(a.cargo)<0?99:_ORD.indexOf(a.cargo))-(_ORD.indexOf(b.cargo)<0?99:_ORD.indexOf(b.cargo))));
          const totalEv   = ev.itens.reduce((a,p)=>a+p.total,0);
          const todosPago = pendEv.length === 0;
          const contrato  = (D.contratos||[]).find(c=>c.id===cid);
          const localEv   = contrato?.local || '';
          const convEv    = contrato?.convidados || '';
          const regiaoKey = ev.itens[0]?.regiao || '';
          const regiaoLabel = REGIOES_PAGAMENTO.find(r=>r.key===regiaoKey)?.label || '';
          return `
          <div class="sec" style="margin-bottom:12px">
            <div class="sec-head" style="flex-wrap:wrap;gap:8px">
              <div>
                <span class="sec-title">${ev.nome}</span>
                <span style="font-size:11px;color:var(--text3);margin-left:8px">${fd(ev.data)}</span>
                ${convEv ? `<span style="font-size:11px;color:var(--text3);margin-left:6px">· ${convEv} conv.</span>` : ''}
                ${localEv ? `<span style="font-size:11px;color:var(--text3);margin-left:6px">· ${localEv}</span>` : ''}
                ${regiaoLabel ? `<span class="badge b-blue" style="font-size:9px;margin-left:6px">${regiaoLabel}</span>` : ''}
                ${todosPago && todosEv.length > 0
                  ? `<span class="tag tag-green" style="font-size:9px;margin-left:6px">✅ Todos pagos</span>`
                  : ''}
              </div>
              <div style="display:flex;gap:6px;align-items:center">
                <span style="font-size:12px;font-weight:600;color:var(--green)">${fmtR(totalEv)}</span>
                ${!todosPago
                  ? `<button class="btn-sm btn-primary" style="font-size:10px"
                       onclick="marcarTodosEventoPago('${cid}','pago')">✅ Pagar todos</button>`
                  : `<button class="btn-sm" style="font-size:10px;background:var(--bg3)"
                       onclick="marcarTodosEventoPago('${cid}','pendente')">↩ Desfazer</button>`}
                <button class="btn-sm btn-red" style="font-size:10px"
                  onclick="excluirPagamentosEvento('${cid}')" title="Remover">✕</button>
              </div>
            </div>
            <div style="overflow-x:auto">
              <table style="border-collapse:collapse;font-size:12px;width:100%">
                <thead>
                  <tr style="border-bottom:1px solid var(--border2);font-size:10px;text-transform:uppercase;color:var(--text3)">
                    <th style="padding:6px 10px;text-align:left">Colaborador</th>
                    <th style="padding:6px 10px;text-align:left">Cargo</th>
                    <th style="padding:6px 10px;text-align:left">Nível</th>
                    <th style="padding:6px 10px;text-align:right">Total</th>
                    <th style="padding:6px 10px;text-align:center">Chave PIX</th>
                    <th style="padding:6px 10px;text-align:center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${ev.itens.map(p=>`
                  <tr style="border-bottom:1px solid var(--border);${p.status==='pago'?'opacity:.6':''}">
                    <td style="padding:6px 10px;font-weight:600">${p.nomeColab}</td>
                    <td style="padding:6px 10px;color:var(--text2)">${p.cargo}</td>
                    <td style="padding:6px 10px;color:${p.nivel==='Novato'?'var(--amber)':'var(--green)'}">${p.nivel||'—'}</td>
                    <td style="padding:6px 10px;text-align:right;font-weight:700;color:var(--green)">${fmtR(p.total)}</td>
                    <td style="padding:6px 10px;text-align:center;font-size:10px;color:#4ade80;font-family:monospace">${p.chave_pix||'—'}</td>
                    <td style="padding:6px 10px;text-align:center">
                      <button onclick="marcarPagamentoPago('${p.id}')"
                        style="padding:3px 10px;border-radius:var(--radius);border:1px solid;font-size:10px;cursor:pointer;
                               background:${p.status==='pago'?'#14532d':'var(--bg3)'};
                               border-color:${p.status==='pago'?'var(--green)':'var(--border2)'};
                               color:${p.status==='pago'?'var(--green)':'var(--text3)'}">
                        ${p.status==='pago'?`✅ Pago${p.dataPagamento?' '+fd(p.dataPagamento):''}` : '⏳ Pendente'}
                      </button>
                    </td>
                  </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>`;
        }).join('')}`;
}

function imprimirPagamentosEquipe() {
  const todos = D.pagamentosEquipe || [];
  const busca = (document.getElementById('eq-pg-busca')?.value || '').toLowerCase();

  const lista = todos.filter(p => {
    if (_pgFiltro !== 'todos' && p.status !== _pgFiltro) return false;
    if (busca && !(p.nomeEvento||'').toLowerCase().includes(busca) &&
                 !(p.nomeColab||'').toLowerCase().includes(busca)) return false;
    return true;
  });

  if (!lista.length) { alert('Nenhum registro para imprimir.'); return; }

  const porEvento = {};
  lista.forEach(p => {
    if (!porEvento[p.contratoId]) porEvento[p.contratoId] = { nome: p.nomeEvento, data: p.dataEvento, regiao: p.regiao, itens: [] };
    porEvento[p.contratoId].itens.push(p);
  });

  const fmtR = v => `R$ ${(v||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const fmtD = d => d ? d.split('-').reverse().join('/') : '—';
  const totalGeral       = lista.reduce((a,p)=>a+p.total,0);
  const totalBonus       = lista.reduce((a,p)=>a+(p.valorBonus||0),0);
  const totalHE          = lista.reduce((a,p)=>a+(p.valorHE||0),0);
  const colaboradoresUnicos = new Set(lista.map(p=>p.colaboradorId||p.nomeColab)).size;
  const valorMedio        = lista.length ? totalGeral/colaboradoresUnicos : 0;
  const filtroLabel = _pgFiltro === 'pendente' ? 'Pendentes' : _pgFiltro === 'pago' ? 'Pagos' : 'Todos';

  let corpo = '';
  Object.entries(porEvento).sort((a,b)=>(b[1].data||'').localeCompare(a[1].data||'')).forEach(([cid, ev]) => {
    const contrato    = (D.contratos||[]).find(c=>c.id===cid);
    const regiaoLabel = REGIOES_PAGAMENTO.find(r=>r.key===ev.regiao)?.label || ev.regiao || '';
    const _ORD_IMP = ['Head Bartender','Coordenador','Bartender','Bar Back','Copeiro'];
    ev.itens.sort((a,b)=>((_ORD_IMP.indexOf(a.cargo)<0?99:_ORD_IMP.indexOf(a.cargo))-(_ORD_IMP.indexOf(b.cargo)<0?99:_ORD_IMP.indexOf(b.cargo))));
    const totalEv     = ev.itens.reduce((a,p)=>a+p.total,0);

    corpo += `
      <div class="ev-block">
        <div class="ev-head">
          <div>
            <strong>${ev.nome}</strong>
            <span class="ev-meta">${fmtD(ev.data)}${regiaoLabel?' · '+regiaoLabel:''}${contrato?.convidados?' · '+contrato.convidados+' conv.':''}${contrato?.local?' · '+contrato.local:''}</span>
          </div>
          <strong style="white-space:nowrap">${fmtR(totalEv)}</strong>
        </div>
        <table>
          <thead><tr>
            <th style="width:24%">Colaborador</th>
            <th style="width:13%">Cargo</th>
            <th style="width:8%">Nível</th>
            <th style="text-align:right;width:10%">Valor base</th>
            <th style="text-align:right;width:10%">H. extra</th>
            <th style="text-align:right;width:8%">Bônus</th>
            <th style="text-align:right;color:#1a6b1a;width:10%">Total</th>
            <th style="width:17%">Chave PIX</th>
          </tr></thead>
          <tbody>
            ${ev.itens.map(p=>`
            <tr>
              <td>${p.nomeColab}</td>
              <td>${p.cargo}</td>
              <td>${p.nivel||'—'}</td>
              <td style="text-align:right;white-space:nowrap">${fmtR(p.valorBase||0)}</td>
              <td style="text-align:right;white-space:nowrap">${(p.valorHE&&p.valorHE>0)?'<span style="color:#b45309">'+fmtR(p.valorHE)+(p.horasExtras?' <span style="font-size:9px;color:#999">(+'+p.horasExtras+'h)</span>':'')+'</span>':'—'}</td>
              <td style="text-align:right;white-space:nowrap">${(p.valorBonus&&p.valorBonus>0)?fmtR(p.valorBonus):'—'}</td>
              <td style="text-align:right;font-weight:700;color:#1a6b1a;white-space:nowrap">${fmtR(p.total)}</td>
              <td style="font-family:monospace;font-size:9px;word-break:break-all">${p.chave_pix||'—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  });

  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Pagamentos da Equipe</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#111}
    h2{font-size:15px;margin:0 0 2px;font-weight:700}
    .sub{font-size:10px;color:#666;margin-bottom:12px}
    .totais{display:inline-flex;flex-wrap:wrap;gap:28px;margin:10px 0 18px;border:1px solid #ddd;border-radius:4px;padding:10px 18px;background:#f9f9f9}
    .tot-item{min-width:74px}
    .tot-item .lbl{font-size:10px;color:#666;margin-bottom:2px}
    .tot-item .val{font-weight:700;font-size:14px}
    .tot-item .val.extra{color:#b45309}
    .ev-block{margin-bottom:16px;page-break-inside:avoid}
    .ev-head{display:flex;justify-content:space-between;align-items:center;background:#222;color:#fff;padding:7px 10px;border-radius:3px 3px 0 0;font-size:12px}
    .ev-meta{display:block;font-size:9px;color:#bbb;margin-top:2px;font-weight:400}
    table{width:100%;border-collapse:collapse;margin:0;table-layout:fixed}
    th{background:#f4f4f4;color:#444;padding:4px 6px;text-align:left;font-size:9px;text-transform:uppercase;border:1px solid #ddd;font-weight:600;overflow:hidden}
    td{padding:4px 6px;border:1px solid #eee;font-size:10px;word-break:break-word}
    tr:last-child td{border-bottom:1px solid #ccc}
    .rodape{margin-top:24px;font-size:9px;color:#999;border-top:1px solid #ddd;padding-top:6px}
    @media print{
      body{margin:10px}
      .totais,.ev-head{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    }
  </style>
  </head><body>
  <h2>PAGAMENTOS DA EQUIPE — ${filtroLabel.toUpperCase()}</h2>
  <div class="sub">Impresso em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</div>
  <div class="totais">
    <div class="tot-item"><div class="lbl">Total a pagar</div><div class="val">${fmtR(totalGeral)}</div></div>
    <div class="tot-item"><div class="lbl">Eventos</div><div class="val">${Object.keys(porEvento).length}</div></div>
    <div class="tot-item"><div class="lbl">Colaboradores</div><div class="val">${colaboradoresUnicos}</div></div>
    <div class="tot-item"><div class="lbl">Valor médio</div><div class="val">${fmtR(valorMedio)}</div></div>
    <div class="tot-item"><div class="lbl">H. Extra + Bônus</div><div class="val extra">${fmtR(totalHE+totalBonus)}</div></div>
  </div>
  ${corpo}
  <div class="rodape">Controle e Gestão — Juliana Santos · ${new Date().toLocaleDateString('pt-BR')}</div>
  <script>window.onload=function(){window.print()};<\/script>
  </body></html>`);
  w.document.close();
}

// ═══════════════════════════════════════════════════════════════════════════════
