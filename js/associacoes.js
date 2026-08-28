// ─── ASSOCIAÇÕES ENTRE ITENS (aplicação na Folha de Separação) ─────────────
// "Segue outro item" é uma base de cálculo da tabela única de Cálculo
// (Separação → Cálculos): a regra tem base:'associado', principal:<nome>,
// valor:<quantos>, ref:<a cada>. A quantidade real depende da quantidade do
// principal na folha, então é resolvida aqui, depois das outras regras.
//
// (A antiga aba "Associações" e o array D.associacoes foram absorvidos pela
// tabela de Cálculo em 2026-08-28 — ver migrarRegrasBaseCalculo em regras.js.)

function aplicarAssociacoesSeparacao(todosItens) {
  if (!todosItens) return;
  var regras = (D.regrasItens || []).filter(function(r) { return r.base === 'associado' && r.principal; });
  if (!regras.length) return;

  function qtdDoItem(nome) {
    var alvo = (nome || '').toUpperCase();
    var q = null;
    Object.keys(todosItens).forEach(function(cat) {
      (todosItens[cat] || []).forEach(function(x) {
        if ((x.item || '').toUpperCase() === alvo) q = x.qtd || 0;
      });
    });
    return q;
  }

  regras.forEach(function(r) {
    var quantos = parseFloat(r.valor) || 1;
    var aCada = parseFloat(r.ref) || 1;
    var min = parseFloat(r.min) || 0;
    var qp = qtdDoItem(r.principal);
    var qtd = Math.max(min, qp == null ? 0 : Math.ceil(qp * quantos / aCada));

    var cat = (typeof categoriaAtualDoInsumo === 'function')
      ? categoriaAtualDoInsumo(r.item, r.cat || 'MATERIAL')
      : (r.cat || 'MATERIAL');

    // Tira o acessório de qualquer outra categoria onde outra regra o tenha
    // colocado — ele passa a existir só onde a associação manda.
    Object.keys(todosItens).forEach(function(c2) {
      if (c2 === cat) return;
      todosItens[c2] = (todosItens[c2] || []).filter(function(x) {
        return (x.item || '').toUpperCase() !== (r.item || '').toUpperCase();
      });
    });

    if (!todosItens[cat]) todosItens[cat] = [];
    var ex = todosItens[cat].find(function(x) {
      return (x.item || '').toUpperCase() === (r.item || '').toUpperCase();
    });
    var dados = {
      qtd: qtd, travado: true, associadoA: r.principal,
      assocQuantos: quantos, assocACada: aCada, assocMin: min,
    };
    if (ex) {
      Object.assign(ex, dados);
    } else {
      todosItens[cat].push(Object.assign({
        item: r.item, doCardapio: false, coqueteis: [],
        soSeCardapio: false, obs: '', semFicha: false,
      }, dados));
    }
  });
}
