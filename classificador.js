/* Bolso — classificador local (Naive Bayes), separado do app para poder ser medido.
   Aprende com os lançamentos que ela já classificou e sugere a categoria de um novo.
   Nada sai do aparelho: tudo roda aqui, com os dados que já estão no IndexedDB. */
(function (g) {
  'use strict';

  function norm(s) {
    return String(s || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9\s*]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Palavras que aparecem em qualquer lançamento e não dizem nada sobre a categoria.
  const STOP = new Set((
    'PIX ENVIADO ENVIADA RECEBIDO RECEBIDA COMPRA COMPRAS COM CARTAO DEBITO CREDITO PAGAMENTO PAGTO PGTO ' +
    'BOLETO TRANSFERENCIA TRANSF TED DOC TEV PARC PARCELA LTDA EIRELI BRA BELO HORIZONTE SAO PAULO ' +
    'RIO JANEIRO PAG MERCADOPAGO IFD LOJA PARA DAS DOS COBRANCA REFERENTE AUTOMATICO'
  ).split(' '));
  // Para o texto das regras, só as palavras genéricas acima (nome de loja precisa continuar específico).
  const STOP_REGRA = new Set(STOP);
  (' ' +
    // Palavras de nome de empresa: aparecem em lojas de tudo quanto é tipo e levavam a sugestões erradas
    // (medido com os lançamentos da Ana: sem elas a ✦ em loja nova foi de 95% para 100% de acerto).
    'INSTITUICAO SERVICOS SERVICO PAGAMENTOS COMERCIO BRASIL EMPRESA ONLINE TECNOLOGIA PRODUTOS ' +
    'SOLUCOES PARTICIPACOES ADMINISTRADORA'
  ).split(' ').filter(Boolean).forEach(w => STOP.add(w));

  /** Palavras da descrição que servem de pista (sem números soltos nem palavras genéricas). */
  function tokens(desc) {
    return norm(desc).replace(/\*/g, ' ').split(' ')
      .filter(t => t.length >= 3 && !/^\d+$/.test(t) && !STOP.has(t));
  }

  // Tipo do lançamento, pelo jeito que o banco escreve.
  const TIPOS = [
    [/\bPIX\b.*\bENVIAD|\bPIX ENVIO\b/, 'pix-enviado'],
    [/\bPIX\b.*\bRECEBID/, 'pix-recebido'],
    [/\bBOLETO\b/, 'boleto'],
    [/\bCOMPRA COM CARTAO\b|\bCOMPRA NO DEBITO\b/, 'debito'],
    [/\bRENDIMENTO/, 'rendimento'],
    [/\bTARIFA\b|\bCESTA\b/, 'tarifa']
  ];
  const FAIXAS = [20, 50, 100, 250, 500, 1000, 2500];

  /**
   * Pistas além das palavras: tipo (Pix enviado, boleto...), faixa de valor com o sentido (entrou/saiu)
   * e se é cartão de crédito ou conta. Ex.: Pix recebido de R$ 3.500 é bem diferente de um Pix de R$ 30.
   */
  function pistas(tx) {
    const n = norm(tx.desc);
    const tipo = (TIPOS.find(([re]) => re.test(n)) || [null, 'outro'])[1];
    const v = Math.abs(Number(tx.valor) || 0);
    const faixa = FAIXAS.findIndex(f => v < f);
    return [
      `#tipo:${tipo}`,
      `#faixa:${faixa < 0 ? FAIXAS.length : faixa}${tx.valor > 0 ? '+' : '-'}`,
      `#conta:${tx.cartao ? 'cartao' : 'banco'}`,
      `#tipo-faixa:${tipo}:${faixa < 0 ? FAIXAS.length : faixa}`
    ];
  }

  /** Exemplos: [{ desc, valor, cartao, key }], key = "categoria" ou "categoria:sub". */
  function treinar(exemplos, opcoes = {}) {
    const usarPistas = opcoes.pistas !== false;
    const vocab = {};
    const counts = {};
    const palavras = {};
    let total = 0;
    for (const ex of exemplos) {
      const ws = tokens(ex.desc);
      if (!ws.length && !usarPistas) continue;
      const feats = usarPistas ? ws.concat(pistas(ex)) : ws;
      total++;
      counts[ex.key] = (counts[ex.key] || 0) + 1;
      for (const f of feats) {
        if (!vocab[f]) vocab[f] = {};
        vocab[f][ex.key] = (vocab[f][ex.key] || 0) + 1;
        palavras[ex.key] = (palavras[ex.key] || 0) + 1;
      }
    }
    return { vocab, counts, palavras, total, usarPistas, tamanho: Object.keys(vocab).length || 1 };
  }

  /**
   * Categoria mais provável para tx, com a confiança (probabilidade da 1ª) e a folga sobre a 2ª.
   * Só considera categorias que tenham pelo menos uma palavra em comum com a descrição
   * (as pistas sozinhas não bastam para sugerir) e as que `permitida(key)` aceitar.
   */
  function prever(modelo, tx, permitida = () => true) {
    if (!modelo || modelo.total < 3) return null;
    const ws = tokens(tx.desc);
    if (!ws.length) return null;
    const feats = modelo.usarPistas ? ws.concat(pistas(tx)) : ws;
    const notas = [];
    for (const [key, n] of Object.entries(modelo.counts)) {
      if (!permitida(key)) continue;
      if (!ws.some(w => modelo.vocab[w] && modelo.vocab[w][key])) continue;
      let s = Math.log(n / modelo.total);
      const den = (modelo.palavras[key] || 0) + modelo.tamanho;
      for (const f of feats) s += Math.log((((modelo.vocab[f] && modelo.vocab[f][key]) || 0) + 1) / den);
      notas.push([key, s]);
    }
    if (!notas.length) return null;
    notas.sort((a, b) => b[1] - a[1]);
    const max = notas[0][1];
    const soma = notas.reduce((a, [, s]) => a + Math.exp(s - max), 0);
    const conf = 1 / soma;
    const seg = notas.length > 1 ? Math.exp(notas[1][1] - max) / soma : 0;
    return { key: notas[0][0], conf, folga: conf - seg };
  }

  /**
   * Texto da regra criada quando ela classifica: as 2 primeiras palavras do nome da loja ou pessoa
   * (a parte antes do " · "), sem números. Só o nome, e não o tipo do lançamento:
   * medido com os lançamentos da Ana, as regras pegam 36 lançamentos de categoria errada em vez de 99.
   */
  function textoRegra(desc, palavras = 2) {
    const nome = String(desc || '').split(' · ')[0];
    const ws = norm(nome).replace(/\*/g, ' ').split(' ')
      .filter(t => t && !/^\d+$/.test(t) && !STOP_REGRA.has(t));
    return ws.length ? ws.slice(0, palavras).join(' ') : norm(desc).slice(0, 24);
  }

  /**
   * Categorias para os botões rápidos: as mais usadas em lançamentos do mesmo tipo e faixa de valor
   * (ex.: compra no débito até R$ 50), caindo para o mesmo tipo e depois para o mesmo sentido.
   * Medido com os lançamentos da Ana: a categoria certa fica entre os 3 botões em 78% dos casos (antes, 67%).
   * exemplos: [{ desc, valor, cartao, catId }]
   */
  function botoes(exemplos, tx, permitida = () => true) {
    const [tipo, faixa] = pistas(tx);
    const sinal = Math.sign(tx.valor);
    const doSentido = exemplos.filter(x => Math.sign(x.valor) === sinal);
    let base = doSentido.filter(x => { const p = pistas(x); return p[0] === tipo && p[1] === faixa; });
    if (base.length < 3) base = doSentido.filter(x => pistas(x)[0] === tipo);
    if (base.length < 3) base = doSentido;
    const cont = {};
    for (const x of base) cont[x.catId] = (cont[x.catId] || 0) + 1;
    const ordem = Object.entries(cont).sort((a, b) => b[1] - a[1]).map(e => e[0]).filter(permitida);
    // completa com as do mesmo sentido, para nunca faltar botão
    const todos = {};
    for (const x of doSentido) todos[x.catId] = (todos[x.catId] || 0) + 1;
    for (const [cid] of Object.entries(todos).sort((a, b) => b[1] - a[1])) if (!ordem.includes(cid) && permitida(cid)) ordem.push(cid);
    return ordem;
  }

  g.BolsoIA = { norm, tokens, pistas, treinar, prever, textoRegra, botoes };
})(typeof window !== 'undefined' ? window : globalThis);
