// ─── ASSOCIAÇÕES ENTRE ITENS (aplicação na Folha de Separação) ─────────────
// "Segue outro item" é uma base de cálculo da tabela única de Cálculo
// (Separação → Cálculos): a regra tem base:'associado', principal:<nome>,
// valor:<quantos>, ref:<a cada>. A quantidade real depende da quantidade do
// principal na folha, então é resolvida aqui, depois das outras regras.
//
// Regra de ouro: o acessório só existe se o principal existe neste evento.
// Se nenhum coquetel/regra trouxe o principal, o acessório é removido da
// folha (antes ele caía no Kit Base na quantidade mínima mesmo sem o
// principal — ex: bico da angostura sem nenhum coquetel usar angostura).
//
// (A antiga aba "Associações" e o array D.associacoes foram absorvidos pela
// tabela de Cálculo em 2026-08-28 — ver migrarRegrasBaseCalculo em regras.js.)

function aplicarAssociacoesSeparacao(todosItens) {
  if (!todosItens) return;
  var regras = (D.regrasItens || []).filter(function(r) { return r.base === 'associado' && r.principal; });
  if (!regras.length) return;

  // Mesmo insumo? Casa por nome exato e, se não bater, pelo id do Cadastro de
  // Insumos (resolve principal cadastrado com o nome oficial e ficha usando um
  // apelido, ou vice-versa).
  function mesmoInsumo(a, b) {
    var A = (a || '').toUpperCase(), B = (b || '').toUpperCase();
    if (!A || !B) return false;
    if (A === B) return true;
    if (typeof buscarInsumoPorNome === 'function') {
      var ia = buscarInsumoPorNome(a), ib = buscarInsumoPorNome(b);
      if (ia && ib && ia.id === ib.id) return true;
    }
    return false;
  }

  function linhaDoItem(nome) {
    var achou = null;
    Object.keys(todosItens).forEach(function(cat) {
      (todosItens[cat] || []).forEach(function(x) {
        if (mesmoInsumo(x.item, nome)) achou = x;
      });
    });
    return achou;
  }

  function removerItem(nome) {
    Object.keys(todosItens).forEach(function(c) {
      todosItens[c] = (todosItens[c] || []).filter(function(x) {
        return !mesmoInsumo(x.item, nome);
      });
    });
  }

  // 2 passadas: cobre uma associação que aponta pra outro acessório
  // (acessório B segue acessório A, que segue o principal P).
  for (var passo = 0; passo < 2; passo++) {
    regras.forEach(function(r) {
      if (mesmoInsumo(r.item, r.principal)) return; // regra apontando pra si mesma
      var quantos = parseFloat(r.valor) || 1;
      var aCada = parseFloat(r.ref) || 1;
      var min = parseFloat(r.min) || 0;

      var principal = linhaDoItem(r.principal);

      // Principal não está neste evento (nenhum coquetel ou regra o trouxe) →
      // o acessório também não vai. Se o principal está mas com quantidade 0
      // (usado num coquetel, sem regra de proporção), o acessório ainda entra
      // no mínimo.
      if (!principal) {
        removerItem(r.item);
        return;
      }

      var qp = principal.qtd || 0;
      var qtd = Math.max(min, Math.ceil(qp * quantos / aCada));

      var cat = (typeof categoriaAtualDoInsumo === 'function')
        ? categoriaAtualDoInsumo(r.item, r.cat || 'MATERIAL')
        : (r.cat || 'MATERIAL');

      // Existe só numa categoria — tira de qualquer outra onde tenha entrado.
      removerItem(r.item);

      if (!todosItens[cat]) todosItens[cat] = [];
      todosItens[cat].push({
        item: r.item,
        qtd: qtd,
        travado: true,
        associadoA: r.principal,
        assocQuantos: quantos, assocACada: aCada, assocMin: min,
        // Acompanha o principal: aparece junto dele na Conferência (mesmos
        // coquetéis), em vez de cair solto no Kit Base.
        doCardapio: !!principal.doCardapio,
        coqueteis: (principal.coqueteis || []).slice(),
        soSeCardapio: false, obs: '', semFicha: false,
      });
    });
  }
}
