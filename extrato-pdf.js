/* Bolso — leitor de extrato em PDF.
   O texto é extraído aqui mesmo, com o pdf.js (Mozilla) guardado em vendor/; nada sai do aparelho.
   Feito a partir do extrato do Itaú (app e site), mas tenta qualquer banco que mostre uma tabela com
   Data · Descrição · Valor (e, se houver, Saldo). */
(function (g) {
  'use strict';

  let pdfjs = null;
  async function carregarPdfjs() {
    if (!pdfjs) {
      pdfjs = await import(new URL('vendor/pdf.min.js', document.baseURI).href);
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('vendor/pdf.worker.min.js', document.baseURI).href;
    }
    return pdfjs;
  }

  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Linhas de cada página, de cima para baixo: [{ pag, y, itens: [{ x, x2, s }] }].
   * Pede a senha (alguns bancos protegem o PDF) com `pedirSenha(errou)`.
   */
  async function lerLinhas(file, pedirSenha) {
    const lib = await carregarPdfjs();
    const tarefa = lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false });
    tarefa.onPassword = (atualizar, motivo) => {
      const senha = pedirSenha ? pedirSenha(motivo === lib.PasswordResponses.INCORRECT_PASSWORD) : null;
      if (senha == null) tarefa.destroy(); else atualizar(senha);
    };
    const doc = await tarefa.promise;
    const linhas = [];
    try {
      for (let p = 1; p <= doc.numPages; p++) {
        const pag = await doc.getPage(p);
        const alt = pag.getViewport({ scale: 1 }).height;
        const { items } = await pag.getTextContent();
        const pedacos = items
          .filter(it => it.str && it.str.trim())
          .map(it => ({ x: it.transform[4], x2: it.transform[4] + (it.width || 0), y: alt - it.transform[5], s: it.str.trim() }))
          .sort((a, b) => a.y - b.y || a.x - b.x);
        let atual = null;
        for (const it of pedacos) {
          // Mesma linha: até 3 pt de diferença (no Itaú o valor fica 1 pt acima da data).
          if (!atual || it.y - atual.y > 3) { atual = { pag: p, y: it.y, itens: [] }; linhas.push(atual); }
          atual.itens.push(it);
        }
        for (const l of linhas) if (l.pag === p) l.itens.sort((a, b) => a.x - b.x);
      }
    } finally {
      doc.destroy();
    }
    return linhas;
  }

  const RE_DATA = /^(\d{2})\/(\d{2})(?:\/(\d{2}|\d{4}))?$/;
  const RE_VALOR = /^(?:R\$\s?)?(\(?-?\s?(?:R\$\s?)?\d{1,3}(?:\.\d{3})*,\d{2}\)?)\s?(\(?[-+]\)?|[CD])?$/i;

  function lerValor(s) {
    const m = RE_VALOR.exec(String(s).trim());
    if (!m) return null;
    let corpo = m[1].replace(/[R$\s]/g, '');
    const neg = /^\(.*\)$/.test(corpo) || corpo.includes('-') || /^\(?-\)?$/.test(m[2] || '') || /^D$/i.test(m[2] || '');
    corpo = corpo.replace(/[()\-]/g, '').replace(/\./g, '').replace(',', '.');
    const n = Number(corpo);
    return Number.isFinite(n) ? (neg ? -n : n) : null;
  }

  const textoLinha = l => l.itens.map(i => i.s).join(' ');

  /** Cabeçalho da tabela: a linha com "Data" e "Valor"/"Saldo"/"Débito"/"Crédito". */
  function lerCabecalho(l) {
    const cols = [];
    for (const it of l.itens) {
      const n = norm(it.s);
      const c = (it.x + it.x2) / 2;
      if (/^DATA\b/.test(n)) cols.push({ tipo: 'data', x: it.x, c });
      else if (/^SALDO\b/.test(n)) cols.push({ tipo: 'saldo', x: it.x, c });
      else if (/^(VALOR|VLR|MONTANTE)\b/.test(n)) cols.push({ tipo: 'valor', x: it.x, c });
      else if (/^(DEBITO|SAIDA)/.test(n)) cols.push({ tipo: 'debito', x: it.x, c });
      else if (/^(CREDITO|ENTRADA)/.test(n)) cols.push({ tipo: 'credito', x: it.x, c });
      // o Itaú parte "Descrição" em pedaços ("Descriç", "ã", "o")
      else if (/^(DESCRI|HISTOR|LANCAMENTO|MOVIMENT|DETALHE)/.test(n)) cols.push({ tipo: 'texto', x: it.x, c });
    }
    const temData = cols.some(c => c.tipo === 'data');
    const temValor = cols.some(c => ['valor', 'saldo', 'debito', 'credito'].includes(c.tipo));
    if (!temData || !temValor) return null;
    return {
      dinheiro: cols.filter(c => ['valor', 'saldo', 'debito', 'credito'].includes(c.tipo)),
      textos: cols.filter(c => c.tipo === 'texto').sort((a, b) => a.x - b.x)
    };
  }

  // Tipo do lançamento como o banco escreve: vai depois do nome da loja ou pessoa, como no OFX do BB.
  const RE_TIPO = /^(PIX|PAGAMENTO|PAGTO|PGTO|TED|DOC|TEV|TRANSF|TRANSFERENCIA|COMPRA|DEBITO|CREDITO|SAQUE|DEPOSITO|SAIDA|ENTRADA|RESGATE|APLICACAO|RENDIMENTO|TARIFA|ESTORNO|DEVOLUCAO|BOLETO)/;

  function montarDescricao(partes) {
    const [a, b] = partes.map(p => p.join(' ').replace(/\s+/g, ' ').trim());
    if (a && b) return RE_TIPO.test(norm(a)) ? `${b} · ${a}` : `${a} · ${b}`;
    return a || b || '';
  }

  function detectarBanco(txt) {
    const n = norm(txt);
    const bancos = [
      [/\bITAU\b/, 'Itaú', 'itau'], [/BANCO DO BRASIL|\bBB\b/, 'Banco do Brasil', 'bb'], [/BRADESCO/, 'Bradesco', 'bradesco'],
      [/SANTANDER/, 'Santander', 'santander'], [/CAIXA ECONOMICA|\bCAIXA\b/, 'Caixa', 'caixa'],
      [/NU PAGAMENTOS|NUBANK/, 'Nubank', 'nubank'], [/BANCO INTER\b|\bINTER\b/, 'Inter', 'inter'],
      [/SICOOB/, 'Sicoob', 'sicoob'], [/SICREDI/, 'Sicredi', 'sicredi'], [/\bC6\b/, 'C6 Bank', 'c6'],
      [/\bXP\b/, 'XP', 'xp'], [/MERCADO PAGO/, 'Mercado Pago', 'mercadopago'], [/PICPAY/, 'PicPay', 'picpay']
    ];
    const b = bancos.find(([re]) => re.test(n));
    return b ? { nome: b[1], id: b[2] } : { nome: 'Extrato PDF', id: 'pdf' };
  }

  const iso = (d, m, y) => `${y}-${m}-${d}`;

  /**
   * Interpreta as linhas: { chaveConta, nomeConta, tipoConta, itens, saldos, saldoExtrato, saldoExtratoData, conferido }.
   * Ignora "Lançamentos futuros"/agendamentos e linhas de saldo (que viram conferência).
   */
  function interpretar(linhas, nomeArquivo = '') {
    const tudo = linhas.map(textoLinha).join('\n');
    const banco = detectarBanco(tudo);
    // "agência: 9630 conta: 0007334-5" (no Itaú a palavra agência fica numa linha e o número na outra)
    const agcc = /\b(\d{4})(?:-\d)?\s*(?:\/|CONTA(?:\s+CORRENTE)?:?)\s*(\d[\d.]{3,}-?[\dXx]?)/i.exec(tudo);
    const ag = agcc || /AG[EÊ]NCIA:?\s*(\d{3,5})/i.exec(tudo);
    const cc = agcc ? [null, agcc[2]] : /CONTA(?:\s+CORRENTE)?:?\s*(\d[\d.]*-?[\dXx]?)/i.exec(tudo);
    const emit = /EMITIDO EM:?\s*(\d{2})\/(\d{2})\/(\d{4})/i.exec(tudo);
    const periodo = /(\d{2})\/(\d{2})\/(\d{4})\s*(?:at[eé]|a)\s*(\d{2})\/(\d{2})\/(\d{4})/i.exec(tudo);
    const limite = emit ? iso(emit[1], emit[2], emit[3]) : periodo ? iso(periodo[4], periodo[5], periodo[6]) : null;
    const anoRef = Number((limite || new Date().toISOString()).slice(0, 4));

    const dataDe = s => {
      const m = RE_DATA.exec(s);
      if (!m || Number(m[1]) > 31 || Number(m[2]) > 12) return null;
      if (m[3]) return iso(m[1], m[2], m[3].length === 2 ? `20${m[3]}` : m[3]);
      // Sem ano: o ano do extrato, ou o anterior se a data ficaria depois da emissão.
      let d = iso(m[1], m[2], String(anoRef));
      if (limite && d > limite) d = iso(m[1], m[2], String(anoRef - 1));
      return d;
    };

    let cab = null;
    let pular = false;
    const linhasTx = [];
    let atual = null;
    let pendente = null; // valor que veio numa linha logo antes da data

    const fechar = () => { if (atual) linhasTx.push(atual); atual = null; };

    for (const l of linhas) {
      const n = norm(textoLinha(l));
      const h = lerCabecalho(l);
      if (h) { cab = h; fechar(); continue; }
      if (/LANCAMENTOS FUTUROS|SAIDAS FUTURAS|ENTRADAS FUTURAS|AGENDAMENTOS|PROGRAMADOS/.test(n)) { fechar(); pular = true; continue; }
      if (/^(LANCAMENTOS|MOVIMENTACOES|EXTRATO( DE)? (CONTA|MOVIMENTACAO).*)$/.test(n)) { fechar(); pular = false; continue; }
      if (/^(POSICAO CONSOLIDADA|LIMITES|INFORMACOES ADICIONAIS|AVISO|TOTAL\b)/.test(n)) { fechar(); continue; }

      const primeiro = l.itens[0];
      const data = primeiro && dataDe(primeiro.s);
      const resto = data ? l.itens.slice(1) : l.itens;
      const dinheiro = [];
      const texto = [];
      for (const it of resto) {
        const v = lerValor(it.s);
        if (v !== null && (!cab || it.x >= Math.min(...cab.dinheiro.map(c => c.x)) - 60)) dinheiro.push({ ...it, v });
        else texto.push(it);
      }

      if (data) {
        fechar();
        if (pular) continue;
        atual = { data, partes: [[], []], dinheiro: [], pag: l.pag, y: l.y };
        if (pendente && pendente.pag === l.pag && l.y - pendente.y < 12) atual.dinheiro.push(...pendente.dinheiro);
        pendente = null;
      } else if (!atual || pular) {
        if (!pular && dinheiro.length && !texto.length) pendente = { pag: l.pag, y: l.y, dinheiro };
        continue;
      } else if (l.pag !== atual.pag || l.y - atual.y > 40) {
        // longe demais da linha da data: não é continuação da descrição
        fechar();
        continue;
      }
      atual.dinheiro.push(...dinheiro);
      for (const it of texto) {
        // Duas colunas de texto (Itaú: tipo em "Lançamentos", nome em "Descrição")
        const col = cab && cab.textos.length > 1 && it.x >= cab.textos[1].x - 4 ? 1 : 0;
        atual.partes[col].push(it.s);
      }
    }
    fechar();

    // Classifica cada número pela coluna mais perto (valor, saldo, débito, crédito).
    const colDe = it => {
      if (!cab) return null;
      const c = (it.x + it.x2) / 2;
      return cab.dinheiro.reduce((m, col) => (Math.abs(col.c - c) < Math.abs(m.c - c) ? col : m)).tipo;
    };

    const itens = [];
    const saldosLinha = []; // [{ data, valor, ordem }]
    linhasTx.forEach((r, ordem) => {
      const desc = montarDescricao(r.partes);
      const ehSaldo = /^SALDO\b|\bSALDO (ANTERIOR|DO DIA|FINAL|TOTAL|EM C)/.test(norm(desc)) || /^S A L D O/.test(desc.toUpperCase());
      let valor = null;
      let saldo = null;
      for (const d of r.dinheiro) {
        const tipo = colDe(d);
        if (tipo === 'saldo') saldo = d.v;
        else if (tipo === 'debito') valor = -Math.abs(d.v);
        else if (tipo === 'credito') valor = Math.abs(d.v);
        else if (tipo === 'valor') valor = d.v;
        else if (valor === null) valor = d.v; // sem cabeçalho: o 1º número é o valor, o 2º o saldo
        else saldo = d.v;
      }
      if (ehSaldo || (!desc && valor === null)) {
        const v = saldo !== null ? saldo : valor;
        if (v !== null) saldosLinha.push({ data: r.data, valor: v, ordem, dia: true });
        return;
      }
      if (valor === null || valor === 0 || !desc) return;
      if (limite && r.data > limite) return; // agendado
      itens.push({ data: r.data, desc, valor: Math.round(valor * 100) / 100, fitid: '', parcela: '', ordem });
      if (saldo !== null) saldosLinha.push({ data: r.data, valor: saldo, ordem });
    });

    // Saldo no fim de cada dia. Linhas só de saldo (Itaú) valem direto; saldo ao lado de cada lançamento vale
    // o do último lançamento do dia, conforme o extrato esteja do mais novo para o mais antigo ou o contrário.
    const decrescente = itens.length > 1 && itens[0].data > itens[itens.length - 1].data;
    const saldos = {};
    const doDia = new Set();
    const diaAntes = d => new Date(Date.parse(`${d}T12:00:00Z`) - 864e5).toISOString().slice(0, 10);
    for (const s of saldosLinha) {
      if (s.dia) {
        // Linha de saldo que vem "antes" dos lançamentos do mesmo dia (abaixo deles num extrato do mais novo
        // para o mais antigo) é o saldo anterior: vale para o fim do dia anterior.
        const antes = itens.some(t => t.data === s.data && (decrescente ? t.ordem < s.ordem : t.ordem > s.ordem));
        const d = antes ? diaAntes(s.data) : s.data;
        saldos[d] = s.valor; doDia.add(d);
        continue;
      }
      if (doDia.has(s.data)) continue;
      if (!(s.data in saldos) || !decrescente) saldos[s.data] = s.valor;
    }

    // Conferência: saldo de um dia + lançamentos até o próximo saldo = próximo saldo.
    // O Itaú mostra saldo negativo só em vermelho, sem o "-": o sinal sai da conta, a partir do saldo mais recente.
    const datas = Object.keys(saldos).sort();
    const somaEntre = (a, b) => itens.filter(t => t.data > a && t.data <= b).reduce((x, t) => x + t.valor, 0);
    const bate = (a, b) => Math.abs(a - b) < 0.005;
    let ok = 0;
    let erros = 0;
    for (let i = datas.length - 1; i > 0; i--) {
      const esperado = saldos[datas[i]] - somaEntre(datas[i - 1], datas[i]);
      const v = saldos[datas[i - 1]];
      if (bate(v, esperado)) ok++;
      else if (bate(-v, esperado)) { saldos[datas[i - 1]] = -v; ok++; }
      else erros++;
    }

    itens.sort((a, b) => a.data.localeCompare(b.data) || (decrescente ? b.ordem - a.ordem : a.ordem - b.ordem));
    for (const t of itens) delete t.ordem;

    const numConta = cc ? cc[1] : '';
    const ultima = datas[datas.length - 1] || null;
    return {
      banco: banco.nome,
      chaveConta: `pdf:${banco.id}:${ag ? ag[1] : ''}:${numConta || nomeArquivo}:ck`,
      nomeConta: `${banco.nome}${numConta ? ` (${numConta})` : ''}`,
      tipoConta: 'corrente',
      itens,
      saldos,
      saldoExtrato: ultima ? saldos[ultima] : null,
      saldoExtratoData: ultima,
      conferido: { ok, erros },
      temTexto: linhas.length > 0
    };
  }

  async function ler(file, pedirSenha) {
    const linhas = await lerLinhas(file, pedirSenha);
    return interpretar(linhas, file.name);
  }

  g.BolsoPDF = { ler, lerLinhas, interpretar, lerValor };
})(window);
