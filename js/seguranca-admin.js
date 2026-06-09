// ─── SEGURANÇA — GESTÃO DE SENHAS E MFA ──────────────────────────────────────

function rSeguranca() {
  if (!verificarAcesso('seguranca')) return;
  _segRender();
}

// ── Renderização principal ────────────────────────────────────────────────────
function _segRender() {
  const el = document.getElementById('page-seguranca');
  if (!el) return;

  const senhas  = D.senhas || {};
  const rotulos = { admin: 'Administrador', financeiro: 'Financeiro', operacional: 'Operacional' };

  // Agrupa entradas por perfil
  const grupos = {};
  for (const [hash, entry] of Object.entries(senhas)) {
    const perfil = typeof entry === 'string' ? entry : entry.p;
    const temMfa = typeof entry === 'object' && !!entry.mfa;
    if (!grupos[perfil]) grupos[perfil] = [];
    grupos[perfil].push({ hash, temMfa });
  }

  const linhas = Object.entries(senhas).map(([hash, entry]) => {
    const perfil = typeof entry === 'string' ? entry : entry.p;
    const temMfa = typeof entry === 'object' && !!entry.mfa;
    const rot    = rotulos[perfil] || perfil;
    const mfaTag = temMfa
      ? `<span style="background:#1a3a1a;color:#4ade80;padding:2px 8px;border-radius:4px;font-size:11px">MFA ativo</span>`
      : `<span style="background:#2a2a1a;color:#facc15;padding:2px 8px;border-radius:4px;font-size:11px">Sem MFA</span>`;
    const btnMfa = temMfa
      ? `<button class="btn btn-sm" onclick="_segRemoverMFA('${hash}')">Desativar MFA</button>`
      : `<button class="btn btn-sm" onclick="_segIniciarSetupMFA('${hash}','${perfil}')">Ativar MFA</button>`;
    return `<tr>
      <td style="padding:10px 12px;color:var(--text2)">${rot}</td>
      <td style="padding:10px 12px;font-size:11px;color:var(--text3);font-family:monospace">${hash.slice(0,12)}…</td>
      <td style="padding:10px 12px">${mfaTag}</td>
      <td style="padding:10px 12px;text-align:right;display:flex;gap:6px;justify-content:flex-end">
        ${btnMfa}
        <button class="btn btn-sm" style="color:#F7625A;border-color:#F7625A40" onclick="_segExcluirSenha('${hash}')">Excluir</button>
      </td>
    </tr>`;
  }).join('');

  el.innerHTML = `
    <div class="sec-head"><h2 style="margin:0 0 4px">Segurança</h2><p style="margin:0;color:var(--text3);font-size:13px">Gestão de senhas e autenticação em dois fatores</p></div>

    <!-- Tabela de senhas -->
    <div class="card" style="margin-bottom:20px">
      <div style="font-size:14px;font-weight:600;margin-bottom:14px">Senhas cadastradas</div>
      ${Object.keys(senhas).length === 0
        ? `<p style="color:var(--text3);font-size:13px">Nenhuma senha cadastrada.</p>`
        : `<table class="tbl" style="width:100%">
             <thead><tr>
               <th style="text-align:left;padding:8px 12px">Perfil</th>
               <th style="text-align:left;padding:8px 12px">Hash (prévia)</th>
               <th style="text-align:left;padding:8px 12px">MFA</th>
               <th></th>
             </tr></thead>
             <tbody>${linhas}</tbody>
           </table>`}
    </div>

    <!-- Adicionar senha -->
    <div class="card" style="margin-bottom:20px">
      <div style="font-size:14px;font-weight:600;margin-bottom:14px">Adicionar nova senha</div>
      <div style="display:grid;grid-template-columns:1fr 1fr auto;gap:10px;align-items:end">
        <div>
          <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:4px">Perfil</label>
          <select id="seg-novo-perfil" style="width:100%;padding:8px 10px;background:var(--bg);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:13px">
            <option value="admin">Administrador</option>
            <option value="financeiro">Financeiro</option>
            <option value="operacional">Operacional</option>
          </select>
        </div>
        <div>
          <label style="font-size:12px;color:var(--text3);display:block;margin-bottom:4px">Senha</label>
          <input id="seg-nova-senha" type="password" placeholder="Mínimo 8 caracteres" maxlength="64"
            oninput="_segValidarInput()"
            style="width:100%;padding:8px 10px;background:var(--bg);border:1px solid var(--border2);border-radius:6px;color:var(--text);font-size:13px;box-sizing:border-box">
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
function _segValidarInput() {
  const senha = document.getElementById('seg-nova-senha').value;
  const req   = document.getElementById('seg-requisitos');
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

// ── Adicionar senha ───────────────────────────────────────────────────────────
async function _segAdicionarSenha() {
  const perfil = document.getElementById('seg-novo-perfil').value;
  const senha  = document.getElementById('seg-nova-senha').value;

  const erros = validarPoliticaSenha(senha);
  if (erros.length > 0) {
    alert2('Senha não atende à política: ' + erros[0], 'error');
    return;
  }

  const hash = await hashSenha(senha);
  if ((D.senhas || {})[hash]) {
    alert2('Esta senha já está cadastrada', 'error');
    return;
  }

  if (!D.senhas) D.senhas = {};
  D.senhas[hash] = perfil;
  await window.svFirebase('senhas');
  alert2('Senha adicionada com sucesso', 'success');
  document.getElementById('seg-nova-senha').value = '';
  _segRender();
}

// ── Excluir senha ─────────────────────────────────────────────────────────────
async function _segExcluirSenha(hash) {
  const restantes = Object.keys(D.senhas || {}).length;
  if (restantes <= 1) {
    alert2('Não é possível excluir a única senha cadastrada', 'error');
    return;
  }
  if (!confirm('Excluir esta senha? Esta ação não pode ser desfeita.')) return;

  delete D.senhas[hash];
  await window.svFirebase('senhas');
  alert2('Senha excluída', 'success');
  _segRender();
}

// ── Setup MFA ─────────────────────────────────────────────────────────────────
let _segMfaTemp = null; // { hash, secret }

function _segIniciarSetupMFA(hash, perfil) {
  const secret = _totpGerarSecret();
  _segMfaTemp  = { hash, secret };

  const label  = encodeURIComponent(`Controle e Gestão (${perfil})`);
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

  const entry = D.senhas[_segMfaTemp.hash];
  const perfil = typeof entry === 'string' ? entry : entry.p;
  D.senhas[_segMfaTemp.hash] = { p: perfil, mfa: _segMfaTemp.secret };
  _segMfaTemp = null;

  await window.svFirebase('senhas');
  closeM('seg-mfa-modal');
  alert2('MFA ativado com sucesso', 'success');
  _segRender();
}

// ── Remover MFA ───────────────────────────────────────────────────────────────
async function _segRemoverMFA(hash) {
  if (!confirm('Desativar o MFA para esta senha?')) return;
  const entry  = D.senhas[hash];
  const perfil = typeof entry === 'string' ? entry : entry.p;
  D.senhas[hash] = perfil;
  await window.svFirebase('senhas');
  alert2('MFA desativado', 'success');
  _segRender();
}
