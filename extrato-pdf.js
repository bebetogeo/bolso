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
    // Sem senha (cancelou): o pdf.js não encerra a leitura sozinho, então ela termina aqui com o erro de senha.
    let desistiu;
    const cancelado = new Promise((_, rejeitar) => { desistiu = rejeitar; });
    tarefa.onPassword = async (atualizar, motivo) => {
      const senha = pedirSenha ? await pedirSenha(motivo === lib.PasswordResponses.INCORRECT_PASSWORD) : null;
      if (senha == null || senha === '') {
        const err = new Error('PDF com senha não aberto');
        err.name = 'PasswordException';
        desistiu(err);
        tarefa.destroy();
      } else {
        atualizar(senha);
      }
    };
    const doc = await Promise.race([tarefa.promise, cancelado]);
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
      else if (/^SALDOS?\b/.test(n)) cols.push({ tipo: 'saldo', x: it.x, c });
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
    const [a, b] = partes.map(p => p.join(' ').replace(/\s+/g, ' ').trim()
      .replace(/(\D)\d{2}\/\d{2}$/, '$1').trim()); // planilha do Itaú: "PIX TRANSF ANTONIO04/11"
    if (a && b) return RE_TIPO.test(norm(a)) ? `${b} · ${a}` : `${a} · ${b}`;
    return a || b || '';
  }

  /**
   * Descrição do Nubank ("Transferência enviada pelo Pix - FULANO - •••.123.456-•• - BANCO (0341) Agência...")
   * no mesmo jeito das outras: "FULANO · Transferência enviada pelo Pix". Usada no PDF e no CSV do Nubank.
   */
  function limparNubank(desc) {
    const s = String(desc || '').replace(/\s+/g, ' ').trim();
    const partes = s.split(' - ').map(p => p.trim());
    if (partes.length < 2 || !/^(Transfer|Pagamento|Compra|Pix|Resgate|Aplica|Dep[oó]sito|Estorno|Reembolso|Saque|Recarga|D[eé]bito|Cr[eé]dito)/i.test(partes[0])) return s;
    // "Estorno - Compra no débito via NuPay - Zé Delivery": limpa a compra que veio de volta e marca o estorno
    // ("Zé Delivery · Estorno - Compra no débito via NuPay"); funciona também com Pix (CPF e banco no fim).
    if (/^Estorno$/i.test(partes[0]) && partes.length >= 3 && /^(Compra|Transfer|Pagamento|Pix)/i.test(partes[1])) {
      const dentro = limparNubank(partes.slice(1).join(' - '));
      const i = dentro.indexOf(' · ');
      return i > 0 ? `${dentro.slice(0, i)} · Estorno - ${dentro.slice(i + 3)}` : `Estorno - ${dentro}`;
    }
    const nome = partes[1];
    if (!nome || /^[\d•.\/-]+$/.test(nome)) return partes[0];
    return `${nome} · ${partes[0]}`;
  }

  // [padrão, nome, id, código do banco (o mesmo BANKID do OFX), site]
  const BANCOS = [
    [/\bITAU\b/, 'Itaú', 'itau', '341', /itau\.com\.br/], [/BANCO DO BRASIL|\bBB\b/, 'Banco do Brasil', 'bb', '1', /\bbb\.com\.br/],
    [/BRADESCO/, 'Bradesco', 'bradesco', '237', /bradesco\.com\.br/], [/SANTANDER/, 'Santander', 'santander', '33', /santander\.com\.br/],
    [/CAIXA ECONOMICA|\bCAIXA\b/, 'Caixa', 'caixa', '104', /caixa\.gov\.br/], [/NU PAGAMENTOS|NUBANK/, 'Nubank', 'nubank', '260', /nubank\.com\.br/],
    [/BANCO INTER\b|\bINTER\b/, 'Inter', 'inter', '77', /bancointer\.com\.br|\binter\.co\b/], [/SICOOB/, 'Sicoob', 'sicoob', '756', /sicoob\.com\.br/],
    [/SICREDI/, 'Sicredi', 'sicredi', '748', /sicredi\.com\.br/], [/\bC6\b/, 'C6 Bank', 'c6', '336', /c6bank\.com\.br/],
    [/\bXP\b/, 'XP', 'xp', '348', /\bxpi?\.com\.br/], [/MERCADO PAGO/, 'Mercado Pago', 'mercadopago', '323', /mercadopago\.com\.br/],
    [/PICPAY/, 'PicPay', 'picpay', '380', /picpay\.com/]
  ];

  /**
   * O banco do extrato. Os nomes de outros bancos aparecem nos Pix (o extrato do Nubank cita "ITAÚ UNIBANCO"
   * em cada transferência), então vale primeiro o site do banco, depois o topo da 1ª página, por último o texto todo.
   */
  function detectarBanco(linhas) {
    const tudo = linhas.map(textoLinha).join('\n');
    const topo = norm(linhas.slice(0, 12).map(textoLinha).join('\n'));
    const b = BANCOS.find(x => x[4].test(tudo.toLowerCase()))
      || BANCOS.find(([re]) => re.test(topo))
      || BANCOS.find(([re]) => re.test(norm(tudo)));
    return b ? { nome: b[1], id: b[2], codigo: b[3] } : { nome: 'Extrato', id: 'pdf', codigo: '' };
  }

  const MESES = { JAN: '01', FEV: '02', MAR: '03', ABR: '04', MAI: '05', JUN: '06', JUL: '07', AGO: '08', SET: '09', OUT: '10', NOV: '11', DEZ: '12' };
  const diaAntes = d => new Date(Date.parse(`${d}T12:00:00Z`) - 864e5).toISOString().slice(0, 10);

  /**
   * Extrato do Nubank: a data vem como "01 ABR 2026" e abre o dia; "Total de entradas" / "Total de saídas"
   * dizem o sinal dos lançamentos que vêm embaixo (os valores não têm sinal); "Saldo do dia" fecha o dia (PJ).
   */
  function lerNubank(linhas) {
    let dentro = false;
    let data = null;
    let sinal = 0;
    let atual = null;
    const itens = [];
    const saldos = {};
    const fechar = () => {
      if (atual) {
        const tipo = atual.partes[0].join(' ');
        const resto = atual.partes[1].join(' ');
        const desc = limparNubank(resto ? `${tipo} - ${resto}` : tipo);
        if (desc && atual.valor) itens.push({ data: atual.data, desc, valor: atual.valor, fitid: '', parcela: '', ordem: itens.length });
      }
      atual = null;
    };
    const RODAPE = /^(TEM ALGUMA DUVIDA|METROPOLITANAS|CASO A SOLUCAO|DISPONIVEIS EM|EXTRATO GERADO|O SALDO LIQUIDO|NAO NOS RESPONSAB|ASSEGURAMOS|NU FINANCEIRA|INVESTIMENTO|CNPJ|PAGAMENTO$)/;
    for (const l of linhas) {
      const n = norm(textoLinha(l));
      if (!dentro) {
        if (n === 'MOVIMENTACOES') dentro = true;
        continue;
      }
      if (RODAPE.test(n)) continue;
      const md = /^(\d{2}) (JAN|FEV|MAR|ABR|MAI|JUN|JUL|AGO|SET|OUT|NOV|DEZ) (\d{4})\b/.exec(n);
      let resto = l.itens;
      if (md) {
        fechar();
        data = `${md[3]}-${MESES[md[2]]}-${md[1]}`;
        resto = l.itens.filter(i => i.x >= 110);
      }
      const tn = norm(resto.map(i => i.s).join(' '));
      if (/^TOTAL DE ENTRADAS/.test(tn)) { fechar(); sinal = 1; continue; }
      if (/^TOTAL DE SAIDAS/.test(tn)) { fechar(); sinal = -1; continue; }
      const dinheiro = resto.filter(i => i.x > 440 && lerValor(i.s) !== null);
      const texto = resto.filter(i => !dinheiro.includes(i));
      if (/^SALDO DO DIA/.test(tn) && dinheiro.length && data) {
        fechar();
        saldos[data] = lerValor(dinheiro[dinheiro.length - 1].s);
        continue;
      }
      if (dinheiro.length && texto.length && data && sinal) {
        fechar();
        const v = Math.abs(lerValor(dinheiro[dinheiro.length - 1].s));
        atual = { data, valor: Math.round(sinal * v * 100) / 100, partes: [[texto[0].s], texto.slice(1).map(i => i.s)], col2: texto[1] ? texto[1].x : texto[0].x + 140 };
        continue;
      }
      // continuação da descrição (na coluna do nome), inclusive na página seguinte
      if (!dinheiro.length && atual && texto.length && Math.abs(texto[0].x - atual.col2) < 15) atual.partes[1].push(...texto.map(i => i.s));
    }
    fechar();

    // Resumo do período: saldo inicial (fim do dia anterior ao início) e final.
    const MES_LONGO = { JANEIRO: '01', FEVEREIRO: '02', MARCO: '03', ABRIL: '04', MAIO: '05', JUNHO: '06', JULHO: '07', AGOSTO: '08', SETEMBRO: '09', OUTUBRO: '10', NOVEMBRO: '11', DEZEMBRO: '12' };
    const textoN = linhas.slice(0, 20).map(l => norm(textoLinha(l)));
    const per = textoN.map(t => /(\d{2}) DE ([A-Z]+) DE (\d{4}) A (\d{2}) DE ([A-Z]+) DE (\d{4})/.exec(t)).find(Boolean);
    const valorDa = re => {
      const num = l => l.itens.filter(i => lerValor(i.s.replace(/^\+/, '')) !== null).pop();
      const l = linhas.slice(0, 20).find(x => re.test(norm(textoLinha(x))) && num(x));
      return l ? lerValor(num(l).s.replace(/^\+/, '')) : null;
    };
    if (per && MES_LONGO[per[2]] && MES_LONGO[per[5]]) {
      const ini = valorDa(/^SALDO INICIAL/);
      const fim = valorDa(/^SALDO FINAL DO PERIODO/);
      if (ini !== null) saldos[diaAntes(`${per[3]}-${MES_LONGO[per[2]]}-${per[1]}`)] = ini;
      if (fim !== null) saldos[`${per[6]}-${MES_LONGO[per[5]]}-${per[4]}`] = fim;
    }
    return { itens, saldos, decrescente: false, rendimento: valorDa(/^RENDIMENTO LIQUIDO/) };
  }

  const iso = (d, m, y) => `${y}-${m}-${d}`;

  /**
   * Interpreta as linhas: { chaveConta, nomeConta, tipoConta, itens, saldos, saldoExtrato, saldoExtratoData, conferido }.
   * Ignora "Lançamentos futuros"/agendamentos e linhas de saldo (que viram conferência).
   */
  /** Extrato em tabela (Itaú no PDF e na planilha, e o jeito mais comum dos bancos). */
  function lerTabela(linhas, limite, anoRef) {
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

    return { itens, saldos, decrescente };
  }

  function interpretar(linhas, nomeArquivo = '') {
    const tudo = linhas.map(textoLinha).join('\n');
    const banco = detectarBanco(linhas);
    // "agência: 9630 conta: 0007334-5" (no Itaú a palavra agência fica numa linha e o número na outra)
    const agcc = /\b(\d{4})(?:-\d)?\s*(?:\/|CONTA(?:\s+CORRENTE)?:?)\s*(\d[\d.]{3,}-?[\dXx]?)/i.exec(tudo);
    const ag = agcc || /AG[EÊ]NCIA:?\s*(\d{3,5})/i.exec(tudo);
    const cc = agcc ? [null, agcc[2]] : /CONTA(?:\s+CORRENTE)?:?\s*(\d[\d.]*-?[\dXx]?)/i.exec(tudo);
    const emit = /(?:EMITIDO EM|ATUALIZA[CÇ][AÃ]O):?\s*(\d{2})\/(\d{2})\/(\d{4})/i.exec(tudo);
    const periodo = /(\d{2})\/(\d{2})\/(\d{4})\s*(?:at[eé]|a)\s*(\d{2})\/(\d{2})\/(\d{4})/i.exec(tudo);
    const limite = emit ? iso(emit[1], emit[2], emit[3]) : periodo ? iso(periodo[4], periodo[5], periodo[6]) : null;
    const anoRef = Number((limite || new Date().toISOString()).slice(0, 4));

    // O Nubank não tem tabela com cabeçalho: tem leitor próprio.
    const nubank = banco.id === 'nubank' && linhas.some(l => norm(textoLinha(l)) === 'MOVIMENTACOES');
    const { itens, saldos, decrescente, rendimento } = nubank ? lerNubank(linhas) : lerTabela(linhas, limite, anoRef);

    // O Nubank soma o rendimento da conta no saldo sem listar o lançamento (nem no PDF nem no CSV).
    // Se o que falta entre os saldos for exatamente o "Rendimento líquido" do resumo, cria esses lançamentos.
    if (rendimento > 0) {
      const ds = Object.keys(saldos).sort();
      const faltas = [];
      for (let i = 1; i < ds.length; i++) {
        const soma = itens.filter(t => t.data > ds[i - 1] && t.data <= ds[i]).reduce((x, t) => x + t.valor, 0);
        const dif = Math.round((saldos[ds[i]] - saldos[ds[i - 1]] - soma) * 100) / 100;
        if (dif > 0) faltas.push([ds[i], dif]);
      }
      const total = faltas.reduce((x, f) => x + f[1], 0);
      if (faltas.length && Math.abs(total - rendimento) < 0.015) {
        for (const [d, v] of faltas) itens.push({ data: d, desc: 'Rendimento da conta · Nubank', valor: v, fitid: '', parcela: '', ordem: itens.length });
      }
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
      codBanco: banco.codigo,
      agencia: ag ? ag[1] : '',
      numeroConta: numConta,
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

  /* ---------------------------------------------------------------- planilhas (XLS/XLSX)
     Lidas com o SheetJS (vendor/xlsx.full.min.js, carregado só quando precisa). Cada linha da planilha
     vira uma "linha" como as do PDF, com as colunas lado a lado, e passa pelo mesmo leitor de tabela. */
  let sheetjs = null;
  function carregarSheetJS() {
    if (g.XLSX) return Promise.resolve(g.XLSX);
    if (!sheetjs) {
      sheetjs = new Promise((ok, erro) => {
        const s = document.createElement('script');
        s.src = new URL('vendor/xlsx.full.min.js', document.baseURI).href;
        s.onload = () => ok(g.XLSX);
        s.onerror = () => { sheetjs = null; erro(new Error('não foi possível carregar o leitor de planilhas')); };
        document.head.appendChild(s);
      });
    }
    return sheetjs;
  }

  const fmtValor = n => (n < 0 ? '-' : '') + Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtData = d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

  async function lerLinhasPlanilha(file) {
    const XLSX = await carregarSheetJS();
    const wb = XLSX.read(new Uint8Array(await file.arrayBuffer()), { type: 'array', cellDates: true });
    const aba = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(aba, { header: 1, raw: true, defval: '' });
    return rows.map((r, i) => {
      // número de agência/conta fica como está; os outros números viram "1.234,56"
      const ident = /AG[EÊ]NCIA|CONTA/i.test(String(r[0] || ''));
      const itens = [];
      r.forEach((v, c) => {
        let s = v instanceof Date ? fmtData(v)
          : typeof v === 'number' ? (ident ? String(v) : fmtValor(v))
          : String(v == null ? '' : v).trim();
        if (s) itens.push({ x: c * 100, x2: c * 100 + 90, s });
      });
      return { pag: 1, y: i * 20, itens };
    }).filter(l => l.itens.length);
  }

  const ehPlanilha = file => /\.(xlsx?|ods)$/i.test(file.name);

  async function ler(file, pedirSenha) {
    const linhas = ehPlanilha(file) ? await lerLinhasPlanilha(file) : await lerLinhas(file, pedirSenha);
    return interpretar(linhas, file.name);
  }

  g.BolsoPDF = { ler, lerLinhas, lerLinhasPlanilha, interpretar, lerValor, limparNubank, ehPlanilha };
})(window);
