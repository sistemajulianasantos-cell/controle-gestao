// ─── SEGURANÇA — GESTÃO DE SENHAS E MFA ──────────────────────────────────────
// O login é só por senha (sem campo de usuário): cada senha cadastrada é uma
// "pessoa". Desde 2026-09-30 cada entrada guarda também o NOME de quem usa
// ({ p:'perfil', n:'nome', mfa? }) — antes só tinha o perfil e não dava pra
// saber de quem era cada senha. Entrada antiga (só 'perfil' em texto)
// continua funcionando; ganha nome quando ela preencher.

const _SEG_ROTULOS = { admin: 'Administrador', financeiro: 'Financeiro', operacional: 'Operacional' };

function rSeguranca() {
  if (!verificarAcesso('seguranca')) return;
  _segRender();
}

// Entrada sempre como objeto { p, n, mfa } (converte o formato antigo)
function _segEntry(hash) {
  const e = (D.senhas || {})[hash];
  if (!e) return null;
  return typeof e === 'string' ? { p: e, n: '' } : { p: e.p, n: e.n || '', mfa: e.mfa || '' };
}

// Grava sem campos vazios (mfa/n só quando existem)
function _segGravarEntry(hash, e) {
  const obj = { p: e.p };
  if (e.n)   obj.n   = e.n;
  if (e.mfa) obj.mfa = e.mfa;
  D.senhas[hash] = obj;
}

function _segEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ── Renderização principal ────────────────────────────────────────────────────
function _segRender() {
  const el = document.getElementById('page-seguranca');
  if (!el) return;

  const senhas = D.senhas || {};
  const campo  = 'padding:6px 8px;background:var(--bg);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:13px';
  const euNome = (typeof nomeUsuarioDaSenha === 'function') ? nomeUsuarioDaSenha(senhaHashAtual) : '';

  const linhas = Object.keys(senhas).map(hash => {
    const e = _segEntry(hash);
    const souEu = typeof senhaHashAtual !== 'undefined' && hash === senhaHashAtual;
    const mfaTag = e.mfa
      ? `<span style="background:#1a3a1a;color:#4ade80;padding:2px 8px;border-radius:4px;font-size:11px">MFA ativo</span>`
      : `<span style="background:#2a2a1a;color:#facc15;padding:2px 8px;border-radius:4px;font-size:11px">Sem MFA</span>`;
    const btnMfa = e.mfa
      ? `<button class="btn btn-sm" onclick="_segRemoverMFA('${hash}')">Desativar MFA</button>`
      : `<button class="btn btn-sm" onclick="_segIniciarSetupMFA('${hash}')">Ativar MFA</button>`;
    return `<tr${souEu ? ' style="background:var(--bg3)"' : ''}>
      <td style="padding:8px 12px">
        <input type="text" value="${_segEsc(e.n)}" placeholder="Nome de quem usa esta senha" maxlength="60"
          onchange="_segSetNome('${hash}',this.value)" style="${campo};width:100%;min-width:180px">
        ${souEu ? '<div style="font-size:11px;color:var(--green);margin-top:3px">Você está usando esta senha</div>' : ''}
      </td>
      <td style="padding:8px 12px">
        <select onchange="_segSetPerfil('${hash}',this.value)" style="${campo}">
          ${Object.entries(_SEG_ROTULOS).map(([k, v]) => `<option value="${k}"${e.p === k ? ' selected' : ''}>${v}</option>`).join('')}
        </select>
      </td>
      <td style="padding:8px 12px">${mfaTag}</td>
      <td style="padding:8px 12px">
        <div style="display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap">
          <button class="btn btn-sm" onclick="_segAbrirTrocaSenha('${hash}')">Trocar senha</button>
          ${btnMfa}
          <button class="btn btn-sm" style="color:#F7625A;border-color:#F7625A40" onclick="_segExcluirSenha('${hash}')">Excluir</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    <div class="sec-head"><h2 style="margin:0 0 4px">Segurança</h2><p style="margin:0;color:var(--text3);font-size:13px">Usuários, senhas e autenticação em dois fatores</p></div>

    ${senhaHashAtual ? `
    <div class="card" style="margin-bottom:20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <div style="font-size:13px;color:var(--text2)">Você entrou como <strong style="color:var(--text)">${_segEsc(euNome || 'usuário sem nome')}</strong> · ${_SEG_ROTULOS[perfilAtual] || perfilAtual}</div>
      <button class="btn btn-sm" style="margin-left:auto" onclick="_segAbrirTrocaSenha('${senhaHashAtual}')">Trocar minha senha</button>
    </div>` : ''}

    <!-- Tabela de usuários/senhas -->
    <div class="card" style="margin-bottom:20px">
      <div style="font-size:14px;font-weight:600;margin-bottom:4px">Usuários cadastrados</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:14px">O login é só pela senha — cada senha é de uma pessoa. Dê um nome a cada uma para saber de quem é.</div>
      ${Object.keys(senhas).length === 0
        ? `<p style="color:var(--text3);font-size:13px">Nenhuma senha cadastrada.</p>`
        : `<table class="tbl" style="width:100%">
             <thead><tr>
               <th style="text-align:left;padding:8px 12px">Usuário</th>
               <th style="text-align:left;padding:8px 12px">Perfil</th>
               <th style="text-align:left;padding:8px 12px">MFA</th>
               <th></th>
             </tr></thead>
             <tbody>${linhas}</tbody>
           </table>`}
    </div>

    <!-- Adicionar usuário -->
    <div class="card" style="margin-bottom:20px">
      <div style="font-size:14px;font-weight:600;margin-bottom:14px">Adicionar usuário</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:10px;align-items:end">
        <div>
          <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:4px">Nome</label>
          <input id="seg-novo-nome" type="text" placeholder="Ex: Juliana" maxlength="60" style="${campo};width:100%;padding:8px 10px;box-sizing:border-box">
        </div>
        <div>
          <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:4px">Perfil</label>
          <select id="seg-novo-perfil" style="${campo};width:100%;padding:8px 10px">
            ${Object.entries(_SEG_ROTULOS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:4px">Senha</label>
          <input id="seg-nova-senha" type="password" placeholder="Mínimo 8 caracteres" maxlength="64"
            oninput="_segValidarInput('seg-nova-senha','seg-requisitos')"
            style="${campo};width:100%;padding:8px 10px;box-sizing:border-box">
        </div>
        <button class="btn btn-primary" onclick="_segAdicionarSenha()">Adicionar</button>
      </div>
      <div id="seg-requisitos" style="margin-top:8px;font-size:11px;color:var(--text3);min-height:16px"></div>
    </div>

    <!-- Informações de política -->
    <div class="card" style="background:var(--blue-bg);border-color:var(--blue-dim)">
      <div style="font-size:13px;font-weight:600;color:var(--blue);margin-bottom:8px">Política de senhas</div>
      <ul style="margin:0;padding-left:18px;font-size:12px;color:var(--text2);line-height:1.8">
        <li>Mínimo de 8 caracteres</li>
        <li>Pelo menos 1 letra maiúscula e 1 minúscula</li>
        <li>Pelo menos 1 número</li>
        <li>Sessão encerra por inatividade após 30 minutos</li>
        <li>Bloqueio após 3 tentativas incorretas consecutivas</li>
      </ul>
    </div>

    <!-- Modal Trocar senha -->
    <div class="modal-overlay" id="seg-troca-modal">
      <div class="modal" style="width:420px">
        <div class="modal-head">
          <span class="modal-title" id="seg-troca-titulo">Trocar senha</span>
          <button class="modal-close" onclick="closeM('seg-troca-modal')">×</button>
        </div>
        <div style="padding:20px">
          <div style="margin-bottom:12px">
            <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:4px">Nova senha</label>
            <input id="seg-troca-nova" type="password" maxlength="64" placeholder="Mínimo 8 caracteres"
              oninput="_segValidarInput('seg-troca-nova','seg-troca-req')"
              style="${campo};width:100%;padding:8px 10px;box-sizing:border-box">
            <div id="seg-troca-req" style="margin-top:6px;font-size:11px;color:var(--text3);min-height:16px"></div>
          </div>
          <div style="margin-bottom:12px">
            <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:4px">Repita a nova senha</label>
            <input id="seg-troca-conf" type="password" maxlength="64"
              onkeydown="if(event.key==='Enter')_segConfirmarTrocaSenha()"
              style="${campo};width:100%;padding:8px 10px;box-sizing:border-box">
          </div>
          <div id="seg-troca-erro" style="color:#F7625A;font-size:12px;min-height:16px;margin-bottom:8px"></div>
          <div class="form-actions">
            <button class="btn" onclick="closeM('seg-troca-modal')">Cancelar</button>
            <button class="btn btn-primary" onclick="_segConfirmarTrocaSenha()">Salvar nova senha</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal MFA Setup -->
    <div class="modal-overlay" id="seg-mfa-modal">
      <div class="modal" style="width:460px">
        <div class="modal-head">
          <span class="modal-title">Configurar Autenticação em Dois Fatores</span>
          <button class="modal-close" onclick="closeM('seg-mfa-modal')">×</button>
        </div>
        <div style="padding:20px">
          <p style="font-size:13px;color:var(--text2);margin:0 0 16px">
            Escaneie o QR code com Google Authenticator, Authy ou outro app TOTP. Em seguida, confirme com o código gerado.
          </p>
          <div id="seg-qr-container" style="display:flex;justify-content:center;margin-bottom:16px"></div>
          <div style="background:var(--bg);border:1px solid var(--border2);border-radius:6px;padding:10px;margin-bottom:16px;text-align:center">
            <div style="font-size:11px;color:var(--text3);margin-bottom:4px">Chave manual (Base32)</div>
            <div id="seg-mfa-secret-display" style="font-family:monospace;font-size:13px;color:var(--text);letter-spacing:2px;word-break:break-all"></div>
          </div>
          <div style="margin-bottom:16px">
            <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:6px">Código de verificação (6 dígitos)</label>
            <input id="seg-mfa-verify-input" type="text" inputmode="numeric" maxlength="6" placeholder="000000"
              style="width:100%;padding:10px;background:var(--bg);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:20px;letter-spacing:6px;text-align:center;box-sizing:border-box"
              onkeydown="if(event.key==='Enter')_segConfirmarMFA()">
            <div id="seg-mfa-erro" style="color:#F7625A;font-size:12px;min-height:16px;margin-top:4px"></div>
          </div>
          <div class="form-actions">
            <button class="btn" onclick="closeM('seg-mfa-modal')">Cancelar</button>
            <button class="btn btn-primary" onclick="_segConfirmarMFA()">Ativar MFA</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ── Validação em tempo real ───────────────────────────────────────────────────
function _segValidarInput(inputId, reqId) {
  const senha = document.getElementById(inputId).value;
  const req   = document.getElementById(reqId);
  if (!req || !senha) { if (req) req.textContent = ''; return; }
  const erros = validarPoliticaSenha(senha);
  if (erros.length === 0) {
    req.style.color = '#4ade80';
    req.textContent = 'Senha válida';
  } else {
    req.style.color = '';
    req.textContent = erros.join(' · ');
  }
}

// Quantas senhas de Administrador existem (não deixa ficar sem nenhuma)
function _segQtdAdmins() {
  return Object.keys(D.senhas || {}).filter(h => _segEntry(h).p === 'admin').length;
}

// ── Nome / perfil ─────────────────────────────────────────────────────────────
async function _segSetNome(hash, nome) {
  const e = _segEntry(hash);
  if (!e) return;
  e.n = String(nome || '').trim();
  _segGravarEntry(hash, e);
  await window.svFirebase('senhas');
  alert2('Nome salvo', 'success');
  if (hash === senhaHashAtual && typeof aplicarPerfil === 'function') aplicarPerfil(perfilAtual);
}

async function _segSetPerfil(hash, perfil) {
  const e = _segEntry(hash);
  if (!e || e.p === perfil) return;
  if (e.p === 'admin' && _segQtdAdmins() <= 1) {
    alert2('Precisa ficar pelo menos um Administrador', 'error');
    _segRender();
    return;
  }
  if (hash === senhaHashAtual && perfil !== 'admin'
      && !confirm('Você vai tirar o perfil de Administrador da SUA senha e perder o acesso a esta tela. Continuar?')) {
    _segRender();
    return;
  }
  e.p = perfil;
  _segGravarEntry(hash, e);
  await window.svFirebase('senhas');
  alert2('Perfil alterado — vale a partir do próximo login dessa pessoa', 'success');
  _segRender();
}

// ── Adicionar usuário ─────────────────────────────────────────────────────────
async function _segAdicionarSenha() {
  const nome   = (document.getElementById('seg-novo-nome').value || '').trim();
  const perfil = document.getElementById('seg-novo-perfil').value;
  const senha  = document.getElementById('seg-nova-senha').value;

  if (!nome) { alert2('Informe o nome de quem vai usar a senha', 'error'); return; }
  const erros = validarPoliticaSenha(senha);
  if (erros.length > 0) {
    alert2('Senha não atende à política: ' + erros[0], 'error');
    return;
  }

  const hash = await hashSenha(senha);
  if ((D.senhas || {})[hash]) {
    alert2('Esta senha já está em uso — escolha outra', 'error');
    return;
  }

  if (!D.senhas) D.senhas = {};
  _segGravarEntry(hash, { p: perfil, n: nome });
  await window.svFirebase('senhas');
  alert2('Usuário adicionado', 'success');
  _segRender();
}

// ── Trocar senha ──────────────────────────────────────────────────────────────
// A senha É a chave (hash) — trocar = gravar a entrada (nome, perfil, MFA)
// no hash novo e apagar o antigo.
let _segTrocaHash = null;

function _segAbrirTrocaSenha(hash) {
  const e = _segEntry(hash);
  if (!e) return;
  _segTrocaHash = hash;
  document.getElementById('seg-troca-titulo').textContent = 'Trocar senha — ' + (e.n || _SEG_ROTULOS[e.p] || e.p);
  ['seg-troca-nova', 'seg-troca-conf'].forEach(id => { document.getElementById(id).value = ''; });
  document.getElementById('seg-troca-req').textContent = '';
  document.getElementById('seg-troca-erro').textContent = '';
  openM('seg-troca-modal');
  setTimeout(() => document.getElementById('seg-troca-nova').focus(), 50);
}

async function _segConfirmarTrocaSenha() {
  const hashAntigo = _segTrocaHash;
  const e = hashAntigo ? _segEntry(hashAntigo) : null;
  const erroEl = document.getElementById('seg-troca-erro');
  if (!e) return;
  const nova = document.getElementById('seg-troca-nova').value;
  const conf = document.getElementById('seg-troca-conf').value;

  const erros = validarPoliticaSenha(nova);
  if (erros.length) { erroEl.textContent = erros[0]; return; }
  if (nova !== conf) { erroEl.textContent = 'As duas senhas não são iguais'; return; }

  const hashNovo = await hashSenha(nova);
  if (hashNovo === hashAntigo) { erroEl.textContent = 'A nova senha é igual à atual'; return; }
  if ((D.senhas || {})[hashNovo]) { erroEl.textContent = 'Esta senha já está em uso — escolha outra'; return; }

  _segGravarEntry(hashNovo, e);
  delete D.senhas[hashAntigo];
  if (senhaHashAtual === hashAntigo) senhaHashAtual = hashNovo;
  _segTrocaHash = null;
  await window.svFirebase('senhas');
  closeM('seg-troca-modal');
  alert2('Senha trocada' + (e.n ? ' — ' + e.n : ''), 'success');
  _segRender();
}

// ── Excluir senha ─────────────────────────────────────────────────────────────
async function _segExcluirSenha(hash) {
  const restantes = Object.keys(D.senhas || {}).length;
  if (restantes <= 1) {
    alert2('Não é possível excluir a única senha cadastrada', 'error');
    return;
  }
  const e = _segEntry(hash);
  if (e.p === 'admin' && _segQtdAdmins() <= 1) {
    alert2('Não é possível excluir o único Administrador', 'error');
    return;
  }
  if (hash === senhaHashAtual) {
    alert2('Esta é a senha que você está usando agora — entre com outra para excluí-la', 'error');
    return;
  }
  if (!confirm('Excluir o usuário ' + (e.n ? '"' + e.n + '"' : 'sem nome (' + (_SEG_ROTULOS[e.p] || e.p) + ')') + '? A senha dele deixa de funcionar. Esta ação não pode ser desfeita.')) return;

  delete D.senhas[hash];
  await window.svFirebase('senhas');
  alert2('Usuário excluído', 'success');
  _segRender();
}

// ── Setup MFA ─────────────────────────────────────────────────────────────────
let _segMfaTemp = null; // { hash, secret }

function _segIniciarSetupMFA(hash) {
  const e = _segEntry(hash);
  if (!e) return;
  const secret = _totpGerarSecret();
  _segMfaTemp  = { hash, secret };

  const label  = encodeURIComponent(`Controle e Gestão (${e.n || e.p})`);
  const issuer = encodeURIComponent('ControleGestao');
  const uri    = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;

  document.getElementById('seg-mfa-verify-input').value = '';
  document.getElementById('seg-mfa-erro').textContent   = '';
  document.getElementById('seg-mfa-secret-display').textContent = secret;

  const qrDiv = document.getElementById('seg-qr-container');
  qrDiv.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(qrDiv, { text: uri, width: 160, height: 160, colorDark: '#E8EAF0', colorLight: '#161A26' });
  } else {
    // Fallback: link clicável para app de autenticação
    qrDiv.innerHTML = `<a href="${uri}" style="font-size:12px;color:var(--blue)">Abrir no app autenticador</a>`;
  }

  openM('seg-mfa-modal');
}

async function _segConfirmarMFA() {
  if (!_segMfaTemp) return;
  const codigo = document.getElementById('seg-mfa-verify-input').value.trim();
  if (!/^\d{6}$/.test(codigo)) {
    document.getElementById('seg-mfa-erro').textContent = 'Código de 6 dígitos inválido';
    return;
  }
  const ok = await _totpVerificar(_segMfaTemp.secret, codigo);
  if (!ok) {
    document.getElementById('seg-mfa-erro').textContent = 'Código incorreto. Tente novamente.';
    return;
  }

  const e = _segEntry(_segMfaTemp.hash);
  e.mfa = _segMfaTemp.secret;
  _segGravarEntry(_segMfaTemp.hash, e);
  _segMfaTemp = null;

  await window.svFirebase('senhas');
  closeM('seg-mfa-modal');
  alert2('MFA ativado com sucesso', 'success');
  _segRender();
}

// ── Remover MFA ───────────────────────────────────────────────────────────────
async function _segRemoverMFA(hash) {
  if (!confirm('Desativar o MFA para esta senha?')) return;
  const e = _segEntry(hash);
  e.mfa = '';
  _segGravarEntry(hash, e); // mantém o nome (antes voltava a só 'perfil')
  await window.svFirebase('senhas');
  alert2('MFA desativado', 'success');
  _segRender();
}
