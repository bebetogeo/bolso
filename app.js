(() => {
  'use strict';

  const VERSAO = '1.7.0';
  const DB_NOME = 'bolso-db';
  const DB_VER = 2;

  const REGRAS_PADRAO = [
    { texto: 'UBER', catId: 'transporte', subId: 'app' },
    { texto: '99APP', catId: 'transporte', subId: 'app' },
    { texto: '99 POP', catId: 'transporte', subId: 'app' },
    { texto: '99 RIDE', catId: 'transporte', subId: 'app' },
    { texto: 'IPIRANGA', catId: 'transporte', subId: 'combustivel' },
    { texto: 'SHELL', catId: 'transporte', subId: 'combustivel' },
    { texto: 'POSTO', catId: 'transporte', subId: 'combustivel' },
    { texto: 'SEM PARAR', catId: 'transporte', subId: 'pedagio' },
    { texto: 'VELOE', catId: 'transporte', subId: 'pedagio' },
    { texto: 'IFOOD', catId: 'alimentacao', subId: 'delivery' },
    { texto: 'RAPPI', catId: 'alimentacao', subId: 'delivery' },
    { texto: 'SUPERMERCADO', catId: 'alimentacao', subId: 'mercado' },
    { texto: 'CARREFOUR', catId: 'alimentacao', subId: 'mercado' },
    { texto: 'PAO DE ACUCAR', catId: 'alimentacao', subId: 'mercado' },
    { texto: 'ASSAI', catId: 'alimentacao', subId: 'mercado' },
    { texto: 'ATACADAO', catId: 'alimentacao', subId: 'mercado' },
    { texto: 'PADARIA', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'PANIFICADORA', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'RESTAURANTE', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'DROGASIL', catId: 'saude', subId: 'farmacia' },
    { texto: 'DROGA RAIA', catId: 'saude', subId: 'farmacia' },
    { texto: 'PACHECO', catId: 'saude', subId: 'farmacia' },
    { texto: 'ARAUJO', catId: 'saude', subId: 'farmacia' },
    { texto: 'UNIMED', catId: 'saude', subId: 'plano' },
    { texto: 'OMINT', catId: 'saude', subId: 'plano' },
    { texto: 'SMART FIT', catId: 'saude', subId: 'academia' },
    { texto: 'ACADEMIA', catId: 'saude', subId: 'academia' },
    { texto: 'NETFLIX', catId: 'assinaturas', subId: 'streaming' },
    { texto: 'SPOTIFY', catId: 'assinaturas', subId: 'streaming' },
    { texto: 'AMAZON PRIME', catId: 'assinaturas', subId: 'streaming' },
    { texto: 'AMAZONPRIME', catId: 'assinaturas', subId: 'streaming' },
    { texto: 'HBOMAX', catId: 'assinaturas', subId: 'streaming' },
    { texto: 'YOUTUBE', catId: 'assinaturas', subId: 'streaming' },
    { texto: 'APPLE.COM', catId: 'assinaturas', subId: 'software' },
    { texto: 'GOOGLE *', catId: 'assinaturas', subId: 'software' },
    { texto: 'CEMIG', catId: 'moradia', subId: 'energia' },
    { texto: 'ENEL', catId: 'moradia', subId: 'energia' },
    { texto: 'COPASA', catId: 'moradia', subId: 'agua' },
    { texto: 'SABESP', catId: 'moradia', subId: 'agua' },
    { texto: 'VIVO', catId: 'moradia', subId: 'internet' },
    { texto: 'CLARO', catId: 'moradia', subId: 'internet' },
    { texto: 'TIM ', catId: 'moradia', subId: 'internet' },
    { texto: 'CONDOMINIO', catId: 'moradia', subId: 'aluguel' },
    { texto: 'MERCADO LIVRE', catId: 'compras', subId: 'online' },
    { texto: 'AMAZON.COM', catId: 'compras', subId: 'online' },
    { texto: 'SHOPEE', catId: 'compras', subId: 'online' },
    { texto: 'PAGAMENTO DE FATURA', catId: 'transf', subId: '' },
    { texto: 'PAGAMENTO FATURA', catId: 'transf', subId: '' },
    { texto: 'PAGTO FATURA', catId: 'transf', subId: '' },
    { texto: 'SALARIO', catId: 'salario', subId: '' },
    { texto: 'PRO LABORE', catId: 'salario', subId: '' }
  ];

  const CATS_PADRAO = [
    {
      id: 'alimentacao', nome: 'Alimentação', tipo: 'gasto', cor: '#0f5257',
      subs: [
        { id: 'mercado', nome: 'Supermercado' },
        { id: 'restaurante', nome: 'Restaurante & Café' },
        { id: 'delivery', nome: 'Delivery' }
      ]
    },
    {
      id: 'moradia', nome: 'Moradia', tipo: 'gasto', cor: '#2a9d8f',
      subs: [
        { id: 'aluguel', nome: 'Aluguel & Condomínio' },
        { id: 'energia', nome: 'Energia' },
        { id: 'agua', nome: 'Água & Gás' },
        { id: 'internet', nome: 'Internet & Celular' }
      ]
    },
    {
      id: 'transporte', nome: 'Transporte', tipo: 'gasto', cor: '#3d7ea6',
      subs: [
        { id: 'combustivel', nome: 'Combustível' },
        { id: 'app', nome: 'Uber & Táxi' },
        { id: 'pedagio', nome: 'Pedágio & Estacionamento' },
        { id: 'manutencao', nome: 'Manutenção & Seguro' }
      ]
    },
    {
      id: 'saude', nome: 'Saúde & Bem-estar', tipo: 'gasto', cor: '#2e9e66',
      subs: [
        { id: 'farmacia', nome: 'Farmácia' },
        { id: 'plano', nome: 'Plano & Consultas' },
        { id: 'academia', nome: 'Academia & Esportes' }
      ]
    },
    {
      id: 'lazer', nome: 'Lazer & Viagens', tipo: 'gasto', cor: '#e08e45',
      subs: [
        { id: 'viagens', nome: 'Viagens' },
        { id: 'passeios', nome: 'Shows & Passeios' }
      ]
    },
    {
      id: 'compras', nome: 'Compras', tipo: 'gasto', cor: '#8e6c8a',
      subs: [
        { id: 'online', nome: 'Compras Online' },
        { id: 'vestuario', nome: 'Roupas & Calçados' },
        { id: 'casa', nome: 'Casa & Eletrônicos' }
      ]
    },
    {
      id: 'assinaturas', nome: 'Assinaturas', tipo: 'gasto', cor: '#5c768d',
      subs: [
        { id: 'streaming', nome: 'Streaming' },
        { id: 'software', nome: 'Apps & Nuvem' }
      ]
    },
    { id: 'outros', nome: 'Outros gastos', tipo: 'gasto', cor: '#8b9999', subs: [] },
    { id: 'salario', nome: 'Salário & Receitas', tipo: 'receita', cor: '#1e824c', subs: [] },
    { id: 'rendimentos', nome: 'Rendimentos & Extras', tipo: 'receita', cor: '#3ca370', subs: [] },
    { id: 'transf', nome: 'Transferência / Fatura', tipo: 'mov', cor: '#7f8c8d', subs: [] }
  ];

  const state = {
    db: null,
    mes: mesAtualStr(),
    histOffset: 0,
    view: 'painel',
    exemplo: false,
    limiteLanc: 60,
    contas: [],
    categorias: [],
    regras: [],
    orcamentos: {},
    lancamentos: [],
    fixasOcultas: [],
    ia: { vocab: {}, catCounts: {}, totalDocs: 0 },
    csvPendente: null,
    installPrompt: null
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const fmtBRL0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const fmtMes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const fmtMesCurto = new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' });

  function moed(v, zero = false) {
    const n = Number(v) || 0;
    return (zero ? fmtBRL0 : fmtBRL).format(n);
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function uid(prefix = 'id') {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  }

  function mesAtualStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function addMes(ym, delta) {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  function labelMes(ym) {
    const [y, m] = ym.split('-').map(Number);
    return fmtMes.format(new Date(Date.UTC(y, m - 1, 1))).replace(' de ', ' ');
  }

  function labelMesCurto(ym) {
    const [y, m] = ym.split('-').map(Number);
    return fmtMesCurto.format(new Date(Date.UTC(y, m - 1, 1))).replace('.', '');
  }

  function norm(s) {
    return String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9\s*]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function parseValor(raw) {
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : NaN;
    let s = String(raw || '').trim().replace(/[R$\s]/g, '');
    if (!s) return NaN;
    const negParen = /^\(.*\)$/.test(s);
    if (negParen) s = s.slice(1, -1);
    const hasComma = s.includes(',');
    const hasDot = s.includes('.');
    if (hasComma && hasDot) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        s = s.replace(/,/g, '');
      }
    } else if (hasComma) {
      s = s.replace(',', '.');
    }
    const n = parseFloat(s);
    if (!Number.isFinite(n)) return NaN;
    return negParen ? -Math.abs(n) : n;
  }

  function parseData(raw) {
    const s = String(raw || '').trim();
    if (!s) return null;
    let m = s.match(/^(\d{4})[-/]?(\d{2})[-/]?(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
    if (m) {
      const y = m[3].length === 2 ? `20${m[3]}` : m[3];
      return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    return null;
  }

  let toastTimer = null;
  function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }

  /* ========================================================================
     IndexedDB
     ======================================================================== */
  function abrirDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NOME, DB_VER);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
        if (!db.objectStoreNames.contains('lancamentos')) {
          const st = db.createObjectStore('lancamentos', { keyPath: 'id' });
          st.createIndex('data', 'data');
          st.createIndex('contaId', 'contaId');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  function kvGet(key, fallback) {
    return new Promise(resolve => {
      const tx = state.db.transaction('kv', 'readonly');
      const req = tx.objectStore('kv').get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : fallback);
      req.onerror = () => resolve(fallback);
    });
  }

  function kvSet(key, val) {
    if (state.exemplo) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const tx = state.db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function dbGetAllLanc() {
    return new Promise(resolve => {
      const tx = state.db.transaction('lancamentos', 'readonly');
      const req = tx.objectStore('lancamentos').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  function dbPutLanc(items) {
    if (state.exemplo) return Promise.resolve();
    const list = Array.isArray(items) ? items : [items];
    return new Promise((resolve, reject) => {
      const tx = state.db.transaction('lancamentos', 'readwrite');
      const st = tx.objectStore('lancamentos');
      list.forEach(item => st.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function dbDelLanc(id) {
    if (state.exemplo) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const tx = state.db.transaction('lancamentos', 'readwrite');
      tx.objectStore('lancamentos').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function carregarDadosReais() {
    const [contas, cats, regras, orc, fixasOcultas, lancs] = await Promise.all([
      kvGet('contas', []),
      kvGet('categorias', null),
      kvGet('regras', []),
      kvGet('orcamentos', {}),
      kvGet('fixasOcultas', []),
      dbGetAllLanc()
    ]);

    state.contas = contas || [];
    state.categorias = (cats && cats.length) ? cats : JSON.parse(JSON.stringify(CATS_PADRAO));
    if (!cats || !cats.length) await kvSet('categorias', state.categorias);
    state.regras = regras || [];
    state.orcamentos = orc || {};
    state.fixasOcultas = fixasOcultas || [];
    state.lancamentos = lancs || [];

    // Revalida saldos iniciais derivados ao carregar
    for (const c of state.contas) {
      recalcularSaldoConta(c);
    }
    treinarIA();
  }

  /* ========================================================================
     Inteligência Local (Regras + Naive Bayes)
     ======================================================================== */
  const STOP_TOKENS = new Set([
    'PIX', 'ENVIADO', 'RECEBIDO', 'COMPRA', 'CARTAO', 'DEBITO', 'CREDITO',
    'PAGAMENTO', 'TRANSFERENCIA', 'TED', 'DOC', 'PARC', 'PARCELA', 'LTDA',
    'EIRELI', 'ME', 'SA', 'BR', 'BRA', 'BELO', 'HORIZONTE', 'SAO', 'PAULO',
    'RIO', 'JANEIRO', 'PAG', 'MP', 'MERCADOPAGO', 'IFD', 'LOJA'
  ]);

  function tokenizar(desc) {
    return norm(desc)
      .split(' ')
      .filter(t => t.length >= 3 && !/^\d+$/.test(t) && !STOP_TOKENS.has(t));
  }

  function treinarIA() {
    const vocab = {};
    const catCounts = {};
    let totalDocs = 0;

    for (const tx of state.lancamentos) {
      if (!tx.catId || tx.catId === 'transf') continue;
      const key = tx.subId ? `${tx.catId}:${tx.subId}` : tx.catId;
      const tokens = tokenizar(tx.desc);
      if (!tokens.length) continue;
      totalDocs++;
      catCounts[key] = (catCounts[key] || 0) + 1;
      for (const tk of tokens) {
        if (!vocab[tk]) vocab[tk] = {};
        vocab[tk][key] = (vocab[tk][key] || 0) + 1;
      }
    }
    state.ia = { vocab, catCounts, totalDocs };
  }

  function classificar(desc, valor) {
    const n = norm(desc);
    for (const r of state.regras) {
      if (r.texto && n.includes(norm(r.texto))) {
        return { catId: r.catId, subId: r.subId || '', origem: 'regra' };
      }
    }
    for (const r of REGRAS_PADRAO) {
      if (n.includes(r.texto)) {
        const existe = state.categorias.find(c => c.id === r.catId);
        if (existe) {
          const subOk = r.subId && (existe.subs || []).some(s => s.id === r.subId) ? r.subId : '';
          return { catId: r.catId, subId: subOk, origem: 'padrao' };
        }
      }
    }
    if (state.ia.totalDocs >= 3) {
      const tokens = tokenizar(desc);
      if (tokens.length) {
        let melhorKey = null;
        let melhorScore = -Infinity;
        const vocabSize = Object.keys(state.ia.vocab).length || 1;

        for (const [key, docCount] of Object.entries(state.ia.catCounts)) {
          const catId = key.split(':')[0];
          const catObj = state.categorias.find(c => c.id === catId);
          if (!catObj) continue;
          if (valor < 0 && catObj.tipo === 'receita') continue;
          if (valor > 0 && catObj.tipo === 'gasto') continue;

          let score = Math.log(docCount / state.ia.totalDocs);
          let hits = 0;
          for (const tk of tokens) {
            const count = (state.ia.vocab[tk] && state.ia.vocab[tk][key]) || 0;
            if (count > 0) hits++;
            score += Math.log((count + 0.5) / (docCount + vocabSize * 0.5));
          }
          if (hits > 0 && score > melhorScore) {
            melhorScore = score;
            melhorKey = key;
          }
        }
        if (melhorKey) {
          const [catId, subId = ''] = melhorKey.split(':');
          return { catId, subId, origem: 'ia' };
        }
      }
    }
    return null;
  }

  /* ========================================================================
     Cálculos Financeiros, Ancoragem de Saldos OFX, Rateio e Recorrências
     ======================================================================== */
  function getCat(id) {
    return state.categorias.find(c => c.id === id) || null;
  }

  function getSub(cat, subId) {
    if (!cat || !subId) return null;
    return (cat.subs || []).find(s => s.id === subId) || null;
  }

  function getConta(id) {
    return state.contas.find(c => c.id === id) || null;
  }

  /**
   * Deriva automaticamente o saldo inicial da conta a partir da âncora OFX mais recente
   * (BALAMT + DTASOF) e valida todos os fechamentos intermediários importados.
   */
  function recalcularSaldoConta(conta) {
    if (!conta || conta.tipo === 'cartao') return { validado: false, diff: 0 };

    const ancoras = Array.isArray(conta.ancoras)
      ? [...conta.ancoras].sort((a, b) => b.data.localeCompare(a.data))
      : [];

    const txsConta = state.lancamentos.filter(t => t.contaId === conta.id && !t.proj);

    if (!conta.saldoManual && ancoras.length > 0) {
      const maisRecente = ancoras[0];
      const somaAteAncora = txsConta
        .filter(t => t.data <= maisRecente.data)
        .reduce((s, t) => s + t.valor, 0);
      conta.saldoInicial = +(maisRecente.saldo - somaAteAncora).toFixed(2);
    }

    if (ancoras.length === 0) {
      conta.conciliado = false;
      conta.diffConciliacao = 0;
      return { validado: false, diff: 0 };
    }

    // Valida todos os pontos de fechamento OFX contra o saldo acumulado
    let maiorDiff = 0;
    for (const anc of ancoras) {
      const somaAte = txsConta
        .filter(t => t.data <= anc.data)
        .reduce((s, t) => s + t.valor, 0);
      const saldoCalc = +((Number(conta.saldoInicial) || 0) + somaAte).toFixed(2);
      const diff = +(saldoCalc - anc.saldo).toFixed(2);
      if (Math.abs(diff) > Math.abs(maiorDiff)) maiorDiff = diff;
    }

    conta.conciliado = Math.abs(maiorDiff) <= 0.02;
    conta.diffConciliacao = maiorDiff;
    return { validado: true, diff: maiorDiff };
  }

  function saldoConta(conta, ateData = null) {
    let total = Number(conta.saldoInicial) || 0;
    for (const tx of state.lancamentos) {
      if (tx.contaId !== conta.id || tx.proj) continue;
      if (ateData && tx.data > ateData) continue;
      total += tx.valor;
    }
    return +total.toFixed(2);
  }

  function resumoSaldosContasMes(ym) {
    const contasCorrentes = state.contas.filter(c => c.tipo !== 'cartao');
    if (!contasCorrentes.length) return null;

    const iniMes = `${ym}-01`;
    const fimMes = `${ym}-31`;
    let saldoInicio = 0;
    let saldoFim = 0;

    for (const c of contasCorrentes) {
      let sIni = Number(c.saldoInicial) || 0;
      let sFim = sIni;
      for (const tx of state.lancamentos) {
        if (tx.contaId !== c.id || tx.proj) continue;
        if (tx.data < iniMes) sIni += tx.valor;
        if (tx.data <= fimMes) sFim += tx.valor;
      }
      saldoInicio += sIni;
      saldoFim += sFim;
    }

    return {
      saldoInicio: +saldoInicio.toFixed(2),
      saldoFim: +saldoFim.toFixed(2)
    };
  }

  function valorLiquidoGasto(tx) {
    if (tx.valor >= 0) return 0;
    const bruto = Math.abs(tx.valor);
    const terceiro = (tx.rateio && tx.rateio.ativo) ? (Number(tx.rateio.terceiro) || 0) : 0;
    return Math.max(0, bruto - terceiro);
  }

  function isMovimentacao(tx) {
    if (tx.abateCatId || tx.quitaRateio) return true;
    const c = getCat(tx.catId);
    return c && c.tipo === 'mov';
  }

  function resumoMes(ym) {
    const lista = state.lancamentos.filter(t => t.data && t.data.startsWith(ym));
    let entrou = 0;
    let qtdEntrou = 0;
    let saiu = 0;
    let qtdSaiu = 0;
    let pendenteProj = 0;
    const porCat = {};
    const porSub = {};

    for (const tx of lista) {
      const cat = getCat(tx.catId);
      if (tx.valor > 0 && tx.abateCatId) {
        porCat[tx.abateCatId] = (porCat[tx.abateCatId] || 0) - tx.valor;
        saiu -= tx.valor;
        continue;
      }
      if (isMovimentacao(tx)) continue;

      if (tx.valor > 0) {
        entrou += tx.valor;
        qtdEntrou++;
      } else if (tx.valor < 0) {
        const liq = valorLiquidoGasto(tx);
        saiu += liq;
        qtdSaiu++;
        if (tx.proj) pendenteProj += liq;
        const cid = cat ? cat.id : '__sem__';
        porCat[cid] = (porCat[cid] || 0) + liq;
        if (cat && tx.subId) {
          const sk = `${cid}:${tx.subId}`;
          porSub[sk] = (porSub[sk] || 0) + liq;
        }
      }
    }

    for (const k of Object.keys(porCat)) {
      if (porCat[k] < 0) porCat[k] = 0;
    }
    saiu = Math.max(0, saiu);

    return {
      lista,
      entrou,
      qtdEntrou,
      saiu,
      qtdSaiu,
      sobra: entrou - saiu,
      pendenteProj,
      porCat,
      porSub
    };
  }

  function faturaMesConta(conta, ym) {
    let total = 0;
    for (const tx of state.lancamentos) {
      if (tx.contaId !== conta.id || !tx.data.startsWith(ym)) continue;
      if (isMovimentacao(tx) && tx.valor > 0) continue;
      if (tx.valor < 0) total += Math.abs(tx.valor);
      else if (tx.abateCatId) total -= tx.valor;
    }
    return Math.max(0, total);
  }

  function detectarFixas(ym) {
    const m1 = addMes(ym, -1);
    const m2 = addMes(ym, -2);
    const m3 = addMes(ym, -3);
    const hist = state.lancamentos.filter(t =>
      t.valor < 0 && !t.proj && !isMovimentacao(t) &&
      (t.data.startsWith(m1) || t.data.startsWith(m2) || t.data.startsWith(m3))
    );

    const grupos = new Map();
    for (const tx of hist) {
      const chave = tokenizar(tx.desc).slice(0, 2).join(' ') || norm(tx.desc).slice(0, 18);
      if (!chave || state.fixasOcultas.includes(chave)) continue;
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave).push(tx);
    }

    const doMes = state.lancamentos.filter(t => t.data.startsWith(ym) && t.valor < 0);
    const resultado = [];

    for (const [chave, itens] of grupos.entries()) {
      const mesesDistintos = new Set(itens.map(i => i.data.slice(0, 7)));
      if (mesesDistintos.size < 2) continue;

      const valores = itens.map(i => valorLiquidoGasto(i)).sort((a, b) => a - b);
      const med = valores[Math.floor(valores.length / 2)];
      if (med <= 0) continue;
      const min = valores[0];
      const max = valores[valores.length - 1];
      if (max > min * 1.45) continue;

      const dias = itens.map(i => Number(i.data.slice(8, 10))).sort((a, b) => a - b);
      const diaPrev = dias[Math.floor(dias.length / 2)];
      const ultimo = itens[itens.length - 1];

      const pagoNoMes = doMes.find(t => {
        const ch = tokenizar(t.desc).slice(0, 2).join(' ') || norm(t.desc).slice(0, 18);
        return ch === chave;
      });

      resultado.push({
        chave,
        desc: ultimo.desc,
        catId: ultimo.catId,
        subId: ultimo.subId,
        valorPrev: med,
        diaPrev,
        pago: Boolean(pagoNoMes),
        valorPago: pagoNoMes ? valorLiquidoGasto(pagoNoMes) : 0
      });
    }

    return resultado.sort((a, b) => a.diaPrev - b.diaPrev);
  }

  /* ========================================================================
     Navegação, Tema e Privacidade
     ======================================================================== */
  function irPara(view, opts = {}) {
    state.view = view;
    if (opts.fCat !== undefined) $('#fCat').value = opts.fCat;
    if (opts.fConta !== undefined) $('#fConta').value = opts.fConta;
    if (opts.fSem !== undefined) $('#fSem').checked = opts.fSem;
    if (opts.busca !== undefined) $('#busca').value = opts.busca;
    state.limiteLanc = 60;

    $$('.view').forEach(sec => {
      sec.hidden = sec.dataset.view !== view;
    });
    $$('.tabs button').forEach(btn => {
      btn.classList.toggle('on', btn.dataset.go === view);
    });
    try { history.replaceState(null, '', `#${view}`); } catch (_) {}
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function aplicarTema(val) {
    if (val === 'claro') document.documentElement.dataset.theme = 'light';
    else if (val === 'escuro') document.documentElement.dataset.theme = 'dark';
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('bolso-tema', val); } catch (_) {}
  }

  function togglePrivacidade(forcar) {
    const ativo = typeof forcar === 'boolean' ? forcar : !document.body.classList.contains('privado');
    document.body.classList.toggle('privado', ativo);
    $('#btnPriv').textContent = ativo ? '🙈' : '👁';
    try { localStorage.setItem('bolso-privado', ativo ? '1' : '0'); } catch (_) {}
  }

  /* ========================================================================
     Renderização Principal
     ======================================================================== */
  function render() {
    $('#mesLabel').textContent = labelMes(state.mes);
    $('#avisoExemplo').hidden = !state.exemplo;

    if (state.view === 'painel') renderPainel();
    else if (state.view === 'lancamentos') renderLancamentos();
    else if (state.view === 'orcamento') renderOrcamento();
    else if (state.view === 'ajustes') renderAjustes();
  }

  function renderPainel() {
    const temDados = state.lancamentos.length > 0;
    $('#vazio').hidden = temDados;
    $('#painel').hidden = !temDados;
    if (!temDados) return;

    const r = resumoMes(state.mes);
    const rAnt = resumoMes(addMes(state.mes, -1));

    const semCat = r.lista.filter(t => !t.catId && !isMovimentacao(t));
    if (semCat.length > 0) {
      const somaSem = semCat.filter(t => t.valor < 0).reduce((acc, t) => acc + valorLiquidoGasto(t), 0);
      $('#avisoRevisar').hidden = false;
      $('#avisoRevisar').innerHTML = `
        <span><b>${semCat.length} ${semCat.length === 1 ? 'lançamento sem categoria' : 'lançamentos sem categoria'}</b> neste mês${somaSem > 0 ? ` (${moed(somaSem)} em gastos)` : ''}.</span>
        <button type="button" class="btn sm" id="btnRevisarMes">Revisar</button>
      `;
      $('#btnRevisarMes').onclick = () => irPara('lancamentos', { fSem: true, fCat: '', fConta: '' });
    } else {
      $('#avisoRevisar').hidden = true;
    }

    const ultBk = localStorage.getItem('bolso-ultimo-backup');
    const diasSemBk = ultBk ? Math.floor((Date.now() - Date.parse(ultBk)) / 86400000) : 999;
    if (!state.exemplo && state.lancamentos.length >= 15 && diasSemBk > 15) {
      $('#avisoBackup').hidden = false;
      $('#avisoBackup').innerHTML = `
        <span>Faça uma cópia de segurança dos seus dados para não perder nada se trocar de aparelho.</span>
        <button type="button" class="btn sm" id="btnIrBackup">Salvar cópia</button>
      `;
      $('#btnIrBackup').onclick = () => irPara('ajustes');
    } else {
      $('#avisoBackup').hidden = true;
    }

    // KPIs
    const sEntrou = moed(r.entrou);
    const sSaiu = moed(r.saiu);
    $('#kEntrou').textContent = sEntrou;
    $('#kEntrou').classList.toggle('val-longo', sEntrou.length > 11);
    $('#kEntrouSub').textContent = r.qtdEntrou === 1 ? '1 entrada' : `${r.qtdEntrou} entradas`;

    $('#kSaiu').textContent = sSaiu;
    $('#kSaiu').classList.toggle('val-longo', sSaiu.length > 11);
    if (rAnt.saiu > 0 && r.saiu > 0) {
      const diffPct = Math.round(((r.saiu - rAnt.saiu) / rAnt.saiu) * 100);
      if (diffPct === 0) $('#kSaiuSub').textContent = `igual a ${labelMesCurto(addMes(state.mes, -1))}`;
      else if (diffPct < 0) $('#kSaiuSub').textContent = `${Math.abs(diffPct)}% a menos que em ${labelMesCurto(addMes(state.mes, -1))}`;
      else $('#kSaiuSub').textContent = `${diffPct}% a mais que em ${labelMesCurto(addMes(state.mes, -1))}`;
    } else {
      $('#kSaiuSub').textContent = r.qtdSaiu === 1 ? '1 gasto' : `${r.qtdSaiu} gastos`;
    }

    $('#kSobra').textContent = moed(r.sobra);
    $('#kSobra').className = `num ${r.sobra >= 0 ? 'pos' : 'neg'}`;
    const saldosMes = resumoSaldosContasMes(state.mes);
    if (saldosMes) {
      $('#kSobraSub').textContent = `caixa: ${moed(saldosMes.saldoInicio)} → ${moed(saldosMes.saldoFim)}`;
    } else if (r.entrou > 0) {
      const pct = Math.round((r.sobra / r.entrou) * 100);
      $('#kSobraSub').textContent = pct >= 0 ? `${pct}% do que entrou` : `gastou ${Math.abs(pct)}% além do que entrou`;
    } else {
      $('#kSobraSub').textContent = r.sobra >= 0 ? 'saldo positivo no mês' : 'saídas maiores que entradas';
    }

    // Fixas e previsão final do mês
    const fixas = detectarFixas(state.mes);
    const fixasPendentes = fixas.filter(f => !f.pago).reduce((acc, f) => acc + f.valorPrev, 0);
    const totalPendente = fixasPendentes + r.pendenteProj;

    if (state.mes >= mesAtualStr() && totalPendente > 0) {
      const prevFinal = r.sobra - totalPendente;
      $('#kpiPrev').hidden = false;
      $('#kPrev').textContent = moed(prevFinal);
      $('#kPrev').className = `num ${prevFinal >= 0 ? 'pos' : 'neg'}`;
      $('#kPrevSub').textContent = `menos ${moed(totalPendente)} pendentes`;
    } else {
      $('#kpiPrev').hidden = true;
    }

    // Contas e cartões (com evolução mensal e status de conferência OFX)
    if (state.contas.length > 0) {
      const mesAtual = mesAtualStr();
      $('#contasStrip').hidden = false;
      $('#contasStrip').innerHTML = state.contas.map(c => {
        const isCartao = c.tipo === 'cartao';
        if (isCartao) {
          const val = faturaMesConta(c, state.mes);
          return `
            <div class="conta-pill" data-conta-id="${esc(c.id)}">
              <span class="cn"><span>${esc(c.nome)}</span></span>
              <span class="cv num">Fatura: ${moed(val)}</span>
            </div>
          `;
        }

        const valAtual = saldoConta(c);
        const valFimMes = saldoConta(c, `${state.mes}-31`);
        const valIniMes = saldoConta(c, `${addMes(state.mes, -1)}-31`);
        const mostrandoPassado = state.mes < mesAtual;
        const valExibir = mostrandoPassado ? valFimMes : valAtual;
        const cls = valExibir >= 0 ? 'pos' : 'neg';

        let badgeHtml = '';
        if (Array.isArray(c.ancoras) && c.ancoras.length > 0) {
          badgeHtml = c.conciliado
            ? `<span class="badge-ok">✓ extrato conferido</span>`
            : `<span class="badge-warn">diferença de ${moed(c.diffConciliacao)}</span>`;
        }

        const subLinha = mostrandoPassado
          ? `início ${moed(valIniMes)} → fim de ${labelMesCurto(state.mes)} · atual ${moed(valAtual)}`
          : `início do mês: ${moed(valIniMes)}`;

        return `
          <div class="conta-pill" data-conta-id="${esc(c.id)}">
            <span class="cn"><span>${esc(c.nome)}</span>${badgeHtml}</span>
            <span class="cv num ${cls}">${moed(valExibir)}</span>
            <span class="csub num">${subLinha}</span>
          </div>
        `;
      }).join('');

      $$('.conta-pill', $('#contasStrip')).forEach(el => {
        el.onclick = () => irPara('lancamentos', { fConta: el.dataset.contaId, fCat: '', fSem: false });
      });
    } else {
      $('#contasStrip').hidden = true;
    }

    // Card de Rateio / Terceiros pendentes
    const rateiosPendentes = state.lancamentos.filter(t =>
      t.valor < 0 && t.rateio && t.rateio.ativo && !t.rateio.quitado && (Number(t.rateio.terceiro) || 0) > 0
    );
    if (rateiosPendentes.length > 0) {
      const totalReceber = rateiosPendentes.reduce((s, t) => s + (Number(t.rateio.terceiro) || 0), 0);
      $('#cardRateio').hidden = false;
      $('#cardRateio').innerHTML = `
        <div class="card-h">
          <h2>Rateio a receber</h2>
          <b class="num pos">${moed(totalReceber)}</b>
        </div>
        <ul class="fixas-lista">
          ${rateiosPendentes.slice(0, 4).map(t => `
            <li data-tx-id="${esc(t.id)}" style="cursor:pointer">
              <span class="fn">
                ${esc(t.desc)}
                <small>${esc(t.rateio.pessoa || 'Terceiros')} · ${t.data.slice(8, 10)}/${t.data.slice(5, 7)}</small>
              </span>
              <span class="fv num">${moed(t.rateio.terceiro)}</span>
            </li>
          `).join('')}
        </ul>
      `;
      $$('li[data-tx-id]', $('#cardRateio')).forEach(li => {
        li.onclick = () => {
          const tx = state.lancamentos.find(x => x.id === li.dataset.txId);
          if (tx) abrirModalLancamento(tx);
        };
      });
    } else {
      $('#cardRateio').hidden = true;
    }

    // Card de Contas fixas e assinaturas
    if (fixas.length > 0) {
      $('#cardFixas').hidden = false;
      $('#cardFixas').innerHTML = `
        <div class="card-h">
          <h2>Contas fixas e assinaturas</h2>
          <span class="mut">${fixasPendentes > 0 ? `faltam ${moed(fixasPendentes)}` : 'tudo pago'}</span>
        </div>
        <ul class="fixas-lista">
          ${fixas.map(f => {
            const c = getCat(f.catId);
            const s = getSub(c, f.subId);
            const catTxt = c ? `${c.nome}${s ? ` · ${s.nome}` : ''}` : '';
            const alta = f.pago && f.valorPago > f.valorPrev * 1.15;
            return `
              <li>
                <span class="fn">
                  ${esc(f.desc)}
                  <small>${f.pago ? 'pago' : `previsto por volta do dia ${String(f.diaPrev).padStart(2, '0')}`}${catTxt ? ` · ${esc(catTxt)}` : ''}</small>
                </span>
                <span class="fv">
                  ${alta ? '<span class="tag-alta">acima</span>' : ''}
                  <span class="num">${moed(f.pago ? f.valorPago : f.valorPrev)}</span>
                  <button type="button" class="x" data-ocultar-fixa="${esc(f.chave)}" title="Não é conta fixa">×</button>
                </span>
              </li>
            `;
          }).join('')}
        </ul>
      `;
      $$('[data-ocultar-fixa]', $('#cardFixas')).forEach(btn => {
        btn.onclick = async e => {
          e.stopPropagation();
          state.fixasOcultas.push(btn.dataset.ocultarFixa);
          await kvSet('fixasOcultas', state.fixasOcultas);
          renderPainel();
        };
      });
    } else {
      $('#cardFixas').hidden = true;
    }

    // Parcelamentos projetados no mês selecionado
    const projMes = r.lista.filter(t => t.proj && t.valor < 0);
    if (projMes.length > 0) {
      const somaProj = projMes.reduce((s, t) => s + valorLiquidoGasto(t), 0);
      $('#cardFuturo').hidden = false;
      $('#cardFuturo').innerHTML = `
        <div class="card-h">
          <h2>Parcelas previstas neste mês</h2>
          <b class="num">${moed(somaProj)}</b>
        </div>
        <ul class="fixas-lista">
          ${projMes.slice(0, 5).map(t => `
            <li data-tx-id="${esc(t.id)}" style="cursor:pointer">
              <span class="fn">${esc(t.desc)}<small>dia ${t.data.slice(8, 10)}${t.parcela ? ` · parcela ${t.parcela.atual}/${t.parcela.total}` : ''}</small></span>
              <span class="fv num">${moed(valorLiquidoGasto(t))}</span>
            </li>
          `).join('')}
        </ul>
      `;
      $$('li[data-tx-id]', $('#cardFuturo')).forEach(li => {
        li.onclick = () => {
          const tx = state.lancamentos.find(x => x.id === li.dataset.txId);
          if (tx) abrirModalLancamento(tx);
        };
      });
    } else {
      $('#cardFuturo').hidden = true;
    }

    // Orçamento do mês
    const totalOrc = Object.values(state.orcamentos).reduce((s, v) => s + (Number(v) || 0), 0);
    if (totalOrc > 0) {
      const pct = Math.min(100, Math.round((r.saiu / totalOrc) * 100));
      const fill = $('#orcFill');
      fill.style.width = `${pct}%`;
      fill.className = `orc-fill ${r.saiu > totalOrc ? 'estourou' : (pct >= 80 ? 'alto' : '')}`;

      const [yy, mm] = state.mes.split('-').map(Number);
      const diasMes = new Date(yy, mm, 0).getDate();
      const hoje = new Date();
      const diaRef = state.mes === mesAtualStr() ? hoje.getDate() : (state.mes < mesAtualStr() ? diasMes : 1);
      $('#orcHoje').style.left = `${Math.min(100, Math.round((diaRef / diasMes) * 100))}%`;

      const restante = totalOrc - r.saiu;
      $('#orcTxt').innerHTML = restante >= 0
        ? `Você gastou <b>${moed(r.saiu)}</b> de <b>${moed(totalOrc)}</b> (${pct}%). Ainda cabem <b>${moed(restante)}</b> neste mês.`
        : `Você gastou <b>${moed(r.saiu)}</b> e passou <b>${moed(Math.abs(restante))}</b> do orçamento de ${moed(totalOrc)}.`;
    } else {
      $('#orcFill').style.width = '0%';
      $('#orcFill').className = 'orc-fill';
      $('#orcHoje').style.left = '0%';
      $('#orcTxt').innerHTML = `Você ainda não definiu limites por categoria. Toque em <b>Ajustar</b> para criar um orçamento.`;
    }

    // Para onde foi o dinheiro
    const entries = Object.entries(r.porCat)
      .filter(([, val]) => val > 0)
      .sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
      $('#cats').innerHTML = `<p class="mut">Nenhum gasto registrado neste mês.</p>`;
    } else {
      const maxGasto = entries[0][1] || 1;
      $('#cats').innerHTML = entries.map(([cid, val]) => {
        const cat = getCat(cid);
        const nome = cat ? cat.nome : 'Sem categoria';
        const limite = Number(state.orcamentos[cid]) || 0;
        const pctTotal = r.saiu > 0 ? Math.round((val / r.saiu) * 100) : 0;
        const pctBar = limite > 0 ? Math.min(100, Math.round((val / limite) * 100)) : Math.round((val / maxGasto) * 100);
        const barCls = cid === '__sem__' ? 'sem' : (limite > 0 && val > limite ? 'estourou' : 'livre');

        const subsHtml = (cat && cat.subs && cat.subs.length)
          ? cat.subs
              .map(s => ({ s, v: r.porSub[`${cid}:${s.id}`] || 0 }))
              .filter(x => x.v > 0)
              .sort((a, b) => b.v - a.v)
              .map(x => `
                <div class="subcat" data-go-cat="${esc(cid)}:${esc(x.s.id)}">
                  <span>${esc(x.s.nome)}</span>
                  <span class="num">${moed(x.v)}</span>
                </div>
              `).join('')
          : '';

        return `
          <div class="cat-bloco">
            <div class="cat" data-go-cat="${esc(cid)}">
              <span class="nome">${esc(nome)}</span>
              <span class="valor">${moed(val)}</span>
              <div class="trilho"><div class="enche ${barCls}" style="width:${pctBar}%"></div></div>
              <div class="det">
                <span>${pctTotal}% dos gastos</span>
                <span>${limite > 0 ? `limite ${moed(limite)}` : ''}</span>
              </div>
            </div>
            ${subsHtml ? `<div class="subcats">${subsHtml}</div>` : ''}
          </div>
        `;
      }).join('');

      $$('[data-go-cat]', $('#cats')).forEach(el => {
        el.onclick = () => {
          const val = el.dataset.goCat;
          if (val === '__sem__') irPara('lancamentos', { fSem: true, fCat: '', fConta: '' });
          else irPara('lancamentos', { fSem: false, fCat: val, fConta: '' });
        };
      });
    }

    renderHistorico();

    const top5 = r.lista
      .filter(t => t.valor < 0 && !isMovimentacao(t))
      .sort((a, b) => valorLiquidoGasto(b) - valorLiquidoGasto(a))
      .slice(0, 5);

    $('#top5').innerHTML = top5.length
      ? top5.map(t => {
          const c = getCat(t.catId);
          return `
            <li data-tx-id="${esc(t.id)}">
              <span class="d">
                ${esc(t.desc)}
                <small>dia ${t.data.slice(8, 10)}${c ? ` · ${esc(c.nome)}` : ''}</small>
              </span>
              <span class="valor">${moed(valorLiquidoGasto(t))}</span>
            </li>
          `;
        }).join('')
      : `<li class="mut">Sem gastos neste mês.</li>`;

    $$('li[data-tx-id]', $('#top5')).forEach(li => {
      li.onclick = () => {
        const tx = state.lancamentos.find(x => x.id === li.dataset.txId);
        if (tx) abrirModalLancamento(tx);
      };
    });
  }

  function renderHistorico() {
    const meses = [];
    for (let i = 5; i >= 0; i--) {
      meses.push(addMes(state.mes, state.histOffset - i));
    }

    const dados = meses.map(ym => ({ ym, ...resumoMes(ym) }));
    const maxVal = Math.max(1, ...dados.map(d => Math.max(d.entrou, d.saiu)));

    const somaCats = {};
    for (const d of dados) {
      for (const [cid, v] of Object.entries(d.porCat)) {
        somaCats[cid] = (somaCats[cid] || 0) + v;
      }
    }
    const topCats = Object.entries(somaCats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cid]) => cid);

    const medEntrou = dados.reduce((s, d) => s + d.entrou, 0) / 6;
    const medSaiu = dados.reduce((s, d) => s + d.saiu, 0) / 6;

    $('#histCard').innerHTML = `
      <div class="card-h">
        <h2>Últimos 6 meses</h2>
        <span class="mut">toque num mês para abrir</span>
      </div>
      <div class="hist-wrap">
        <button type="button" class="hist-nav-btn" id="histAnt" aria-label="Meses anteriores">‹</button>
        <div class="hist">
          ${dados.map(d => {
            const hEnt = Math.round((d.entrou / maxVal) * 82);
            const segs = topCats.map(cid => {
              const v = d.porCat[cid] || 0;
              if (!v) return '';
              const h = Math.max(2, Math.round((v / maxVal) * 82));
              const cor = (getCat(cid) && getCat(cid).cor) || '#8b9999';
              return `<span class="s-seg" style="height:${h}px;background:${cor}"></span>`;
            }).join('');
            const outrosV = Object.entries(d.porCat)
              .filter(([cid]) => !topCats.includes(cid))
              .reduce((s, [, v]) => s + v, 0);
            const segOutro = outrosV > 0
              ? `<span class="s-seg" style="height:${Math.max(2, Math.round((outrosV / maxVal) * 82))}px;background:#95a5a6"></span>`
              : '';

            return `
              <div class="hcol ${d.ym === state.mes ? 'atual' : ''}" data-ym="${d.ym}">
                <span class="ve num">${d.entrou > 0 ? moed(d.entrou, true).replace('R$', '') : ''}</span>
                <div class="hbars">
                  <div class="e" style="height:${hEnt}px"></div>
                  <div class="s-stack">${segs}${segOutro}</div>
                </div>
                <span class="vs num">${d.saiu > 0 ? moed(d.saiu, true).replace('R$', '') : ''}</span>
                <span class="m">${labelMesCurto(d.ym)}</span>
              </div>
            `;
          }).join('')}
        </div>
        <button type="button" class="hist-nav-btn" id="histProx" aria-label="Próximos meses">›</button>
      </div>
      <div class="leg">
        <span><i style="background:var(--bar-2)"></i>Entrou</span>
        ${topCats.map(cid => {
          const c = getCat(cid);
          return `<span><i style="background:${c ? c.cor : '#8b9999'}"></i>${esc(c ? c.nome : 'Sem cat.')}</span>`;
        }).join('')}
      </div>
      <div class="hist-resumo">
        <span>Média entradas: <b class="num">${moed(medEntrou)}</b></span>
        <span>Média gastos: <b class="num">${moed(medSaiu)}</b></span>
      </div>
    `;

    $('#histAnt').onclick = () => { state.histOffset -= 3; renderHistorico(); };
    $('#histProx').onclick = () => { state.histOffset += 3; renderHistorico(); };
    $$('.hcol', $('#histCard')).forEach(col => {
      col.onclick = () => {
        state.mes = col.dataset.ym;
        state.histOffset = 0;
        render();
      };
    });
  }

  /* ========================================================================
     View: Lançamentos e Triagem Rápida
     ======================================================================== */
  function popularFiltros() {
    const fCat = $('#fCat');
    const atualCat = fCat.value;
    let optsCat = `<option value="">Todas as categorias</option>`;
    for (const c of state.categorias) {
      optsCat += `<option value="${esc(c.id)}">${esc(c.nome)}</option>`;
      for (const s of (c.subs || [])) {
        optsCat += `<option value="${esc(c.id)}:${esc(s.id)}">↳ ${esc(c.nome)} · ${esc(s.nome)}</option>`;
      }
    }
    fCat.innerHTML = optsCat;
    fCat.value = atualCat;

    const fConta = $('#fConta');
    const atualConta = fConta.value;
    fConta.innerHTML = `<option value="">Todas as contas</option>` +
      state.contas.map(c => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join('');
    fConta.value = atualConta;
  }

  function renderLancamentos() {
    popularFiltros();
    const busca = norm($('#busca').value);
    const fCat = $('#fCat').value;
    const fConta = $('#fConta').value;
    const fSem = $('#fSem').checked;

    $('#barTriagem').hidden = !fSem;

    const filtrados = state.lancamentos
      .filter(t => t.data && t.data.startsWith(state.mes))
      .filter(t => {
        if (fSem) return !t.catId && !isMovimentacao(t);
        if (fCat) {
          if (fCat.includes(':')) {
            const [cid, sid] = fCat.split(':');
            return t.catId === cid && t.subId === sid;
          }
          return t.catId === fCat;
        }
        return true;
      })
      .filter(t => !fConta || t.contaId === fConta)
      .filter(t => {
        if (!busca) return true;
        return norm(t.desc).includes(busca) ||
          norm(t.notas).includes(busca) ||
          moed(Math.abs(t.valor)).includes($('#busca').value.trim());
      })
      .sort((a, b) => b.data.localeCompare(a.data) || (b.criadoEm || 0) - (a.criadoEm || 0));

    const somaLiquida = filtrados.reduce((s, t) => {
      if (isMovimentacao(t) && !t.abateCatId) return s;
      if (t.valor < 0) return s - valorLiquidoGasto(t);
      return s + t.valor;
    }, 0);

    $('#lancResumo').textContent = `${filtrados.length} ${filtrados.length === 1 ? 'lançamento' : 'lançamentos'} · saldo ${moed(somaLiquida)}`;

    const visiveis = filtrados.slice(0, state.limiteLanc);
    $('#lancMais').hidden = filtrados.length <= state.limiteLanc;

    if (!visiveis.length) {
      $('#lanc').innerHTML = `<li class="vazia">Nenhum lançamento encontrado neste filtro.</li>`;
      return;
    }

    const catsGastoRapido = state.categorias.filter(c => c.tipo === 'gasto').slice(0, 4);

    $('#lanc').innerHTML = visiveis.map(t => {
      const cat = getCat(t.catId);
      const sub = getSub(cat, t.subId);
      const conta = getConta(t.contaId);
      const mov = isMovimentacao(t);
      const valCls = t.valor > 0 ? 'pos' : (mov ? '' : 'neg');
      const dia = t.data.slice(8, 10);
      const mesAbrev = labelMesCurto(t.data.slice(0, 7));

      let tagHtml = '';
      if (t.abateCatId) {
        const cAb = getCat(t.abateCatId);
        tagHtml = `<span class="tag mov">Abate ${esc(cAb ? cAb.nome : 'gasto')}</span>`;
      } else if (mov) {
        tagHtml = `<span class="tag mov">${esc(cat ? cat.nome : 'Não conta')}</span>`;
      } else if (cat) {
        tagHtml = `<span class="tag">${esc(cat.nome)}${sub ? ` · ${esc(sub.nome)}` : ''}</span>`;
      } else {
        tagHtml = `<span class="tag sem">Sem categoria</span>`;
      }

      const parcHtml = t.parcela ? `<span class="parc-tag">${t.parcela.atual}/${t.parcela.total}</span>` : '';
      const rateioHtml = (t.rateio && t.rateio.ativo)
        ? `<span class="parc-tag">Rateio ${moed(t.rateio.terceiro)}</span>`
        : '';

      let triagemHtml = '';
      if (fSem && !t.catId) {
        const sug = classificar(t.desc, t.valor);
        const sugCat = sug ? getCat(sug.catId) : null;
        if (t.valor < 0) {
          const chips = [];
          if (sugCat) {
            chips.push(`<button type="button" class="qchip qchip-ia" data-qcat="${esc(sugCat.id)}:${esc(sug.subId || '')}">✦ ${esc(sugCat.nome)}</button>`);
          }
          for (const cg of catsGastoRapido) {
            if (sugCat && cg.id === sugCat.id) continue;
            chips.push(`<button type="button" class="qchip" data-qcat="${esc(cg.id)}:">${esc(cg.nome)}</button>`);
          }
          chips.push(`<button type="button" class="qchip qchip-rateio" data-qrateio="1">Rateio / Terceiros</button>`);
          chips.push(`<button type="button" class="qchip qchip-out" data-qedit="1">Outra…</button>`);
          triagemHtml = `<div class="qcats">${chips.join('')}</div>`;
        } else {
          const catsRec = state.categorias.filter(c => c.tipo === 'receita');
          triagemHtml = `
            <div class="qcats">
              ${catsRec.map(cr => `<button type="button" class="qchip" data-qcat="${esc(cr.id)}:">${esc(cr.nome)}</button>`).join('')}
              <button type="button" class="qchip qchip-rateio" data-qabate="1">Abater gasto / Rateio</button>
              <button type="button" class="qchip qchip-out" data-qedit="1">Outra…</button>
            </div>
          `;
        }
      }

      return `
        <li class="${t.proj ? 'proj' : ''}" data-tx-id="${esc(t.id)}">
          <div class="dia"><b>${dia}</b>${mesAbrev}</div>
          <div class="desc">${esc(t.desc)}</div>
          <div class="valor ${valCls}">${t.valor > 0 ? '+' : ''}${moed(t.valor)}</div>
          <div class="meta">
            <div class="meta-esq">${tagHtml}${parcHtml}${rateioHtml}</div>
            <span class="ct">${esc(conta ? conta.nome : '')}</span>
          </div>
          ${triagemHtml}
        </li>
      `;
    }).join('');

    $$('#lanc li[data-tx-id]').forEach(li => {
      const tx = state.lancamentos.find(x => x.id === li.dataset.txId);
      if (!tx) return;

      li.onclick = e => {
        if (e.target.closest('.qcats')) return;
        abrirModalLancamento(tx);
      };

      $$('[data-qcat]', li).forEach(btn => {
        btn.onclick = async e => {
          e.stopPropagation();
          const [cid, sid = ''] = btn.dataset.qcat.split(':');
          tx.catId = cid;
          tx.subId = sid;
          await dbPutLanc(tx);
          treinarIA();
          toast('Categoria salva');
          renderLancamentos();
        };
      });

      const btnRateio = $('[data-qrateio]', li);
      if (btnRateio) {
        btnRateio.onclick = e => {
          e.stopPropagation();
          abrirModalLancamento(tx, { abrirRateio: true });
        };
      }

      const btnAbate = $('[data-qabate]', li);
      if (btnAbate) {
        btnAbate.onclick = e => {
          e.stopPropagation();
          abrirModalLancamento(tx, { abrirAbate: true });
        };
      }

      const btnEdit = $('[data-qedit]', li);
      if (btnEdit) {
        btnEdit.onclick = e => {
          e.stopPropagation();
          abrirModalLancamento(tx);
        };
      }
    });
  }

  /* ========================================================================
     Modal de Lançamento
     ======================================================================== */
  function abrirModalLancamento(tx = null, opts = {}) {
    const novo = !tx;
    const item = tx ? JSON.parse(JSON.stringify(tx)) : {
      id: uid('tx'),
      data: `${state.mes}-${String(Math.min(28, new Date().getDate())).padStart(2, '0')}`,
      desc: '',
      valor: -0,
      contaId: state.contas[0] ? state.contas[0].id : '',
      catId: '',
      subId: '',
      notas: '',
      criadoEm: Date.now()
    };

    const tipoInicial = item.abateCatId ? 'abate' : (item.valor > 0 ? 'receita' : (isMovimentacao(item) ? 'mov' : 'gasto'));
    const valAbs = Math.abs(item.valor || 0);

    $('#dlgTitulo').textContent = novo ? 'Novo lançamento' : 'Editar lançamento';
    $('#dlgDesc').textContent = novo ? 'Registre uma entrada, gasto ou transferência manual.' : `${item.data.split('-').reverse().join('/')}`;
    $('#dlgExtra').hidden = novo;
    $('#dlgExtra').textContent = 'Apagar';

    const contasOpts = state.contas.length
      ? state.contas.map(c => `<option value="${esc(c.id)}" ${c.id === item.contaId ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')
      : `<option value="">Carteira / Geral</option>`;

    const catsOpts = `<option value="">Sem categoria</option>` +
      state.categorias.map(c => `<option value="${esc(c.id)}" ${c.id === item.catId ? 'selected' : ''}>${esc(c.nome)}</option>`).join('');

    const catsGastoOpts = state.categorias
      .filter(c => c.tipo === 'gasto')
      .map(c => `<option value="${esc(c.id)}" ${c.id === item.abateCatId ? 'selected' : ''}>${esc(c.nome)}</option>`)
      .join('');

    const rateioAtivo = Boolean((item.rateio && item.rateio.ativo) || opts.abrirRateio);
    const rateioTerc = (item.rateio && item.rateio.terceiro) ? item.rateio.terceiro : (valAbs > 0 ? +(valAbs / 2).toFixed(2) : 0);

    $('#dlgCorpo').innerHTML = `
      <div class="grid2">
        <label>Tipo
          <select id="dTipo">
            <option value="gasto" ${tipoInicial === 'gasto' && !opts.abrirAbate ? 'selected' : ''}>Gasto (-)</option>
            <option value="receita" ${tipoInicial === 'receita' && !opts.abrirAbate ? 'selected' : ''}>Entrada (+)</option>
            <option value="abate" ${tipoInicial === 'abate' || opts.abrirAbate ? 'selected' : ''}>Abater gasto / Estorno</option>
            <option value="mov" ${tipoInicial === 'mov' ? 'selected' : ''}>Não conta (transf.)</option>
          </select>
        </label>
        <label>Valor (R$)
          <input id="dValor" inputmode="decimal" placeholder="0,00" value="${valAbs > 0 ? valAbs.toFixed(2).replace('.', ',') : ''}" required>
        </label>
      </div>
      <label>Descrição
        <input id="dDesc" maxlength="120" placeholder="Ex.: Supermercado, Pix, Aluguel" value="${esc(item.desc)}" required>
      </label>
      <div class="grid2">
        <label>Data
          <input type="date" id="dData" value="${esc(item.data)}" required>
        </label>
        <label>Conta ou cartão
          <select id="dConta">${contasOpts}</select>
        </label>
      </div>
      <div class="grid2" id="dCatWrap">
        <label>Categoria
          <select id="dCat">${catsOpts}</select>
        </label>
        <label id="dSubWrap">Subcategoria
          <select id="dSub"></select>
        </label>
      </div>
      <label id="dAbateWrap" hidden>Qual categoria este valor abate?
        <select id="dAbateCat">${catsGastoOpts}</select>
      </label>
      ${novo ? `
        <label id="dParcWrap">Parcelamento
          <select id="dParc">
            <option value="1">À vista (1x)</option>
            ${Array.from({ length: 23 }, (_, i) => `<option value="${i + 2}">${i + 2}x parcelas</option>`).join('')}
          </select>
        </label>
      ` : ''}
      <div id="dRateioBox">
        <label class="chk">
          <input type="checkbox" id="dRateioChk" ${rateioAtivo ? 'checked' : ''}>
          Dividir com alguém / Pago para terceiros (rateio)
        </label>
        <div id="dRateioCampos" ${rateioAtivo ? '' : 'hidden'} style="margin-top:8px;display:flex;flex-direction:column;gap:8px">
          <div class="grid2">
            <label>Parte da outra pessoa (R$)
              <input id="dRateioVal" inputmode="decimal" value="${rateioTerc > 0 ? rateioTerc.toFixed(2).replace('.', ',') : ''}">
            </label>
            <label>Quem vai reembolsar?
              <input id="dRateioPessoa" maxlength="40" placeholder="Ex.: Ana, Família" value="${esc((item.rateio && item.rateio.pessoa) || '')}">
            </label>
          </div>
          <label class="chk">
            <input type="checkbox" id="dRateioQuitado" ${item.rateio && item.rateio.quitado ? 'checked' : ''}>
            Já foi reembolsado
          </label>
          <div class="split-preview" id="dRateioPrev"></div>
        </div>
      </div>
      <label>Observação (opcional)
        <input id="dNotas" maxlength="160" placeholder="Detalhes extras" value="${esc(item.notas || '')}">
      </label>
    `;

    function atualizarSubs() {
      const cat = getCat($('#dCat').value);
      const subs = (cat && cat.subs) || [];
      $('#dSubWrap').hidden = subs.length === 0;
      $('#dSub').innerHTML = `<option value="">Geral</option>` +
        subs.map(s => `<option value="${esc(s.id)}" ${s.id === item.subId ? 'selected' : ''}>${esc(s.nome)}</option>`).join('');
    }

    function atualizarVisibilidade() {
      const tp = $('#dTipo').value;
      $('#dCatWrap').hidden = tp === 'abate';
      $('#dAbateWrap').hidden = tp !== 'abate';
      if ($('#dParcWrap')) $('#dParcWrap').hidden = tp !== 'gasto';
      $('#dRateioBox').hidden = tp !== 'gasto';
      atualizarPreviewRateio();
    }

    function atualizarPreviewRateio() {
      const chk = $('#dRateioChk').checked;
      $('#dRateioCampos').hidden = !chk;
      if (!chk) return;
      const tot = Math.abs(parseValor($('#dValor').value) || 0);
      const terc = Math.min(tot, Math.max(0, parseValor($('#dRateioVal').value) || 0));
      const meu = Math.max(0, tot - terc);
      $('#dRateioPrev').innerHTML = `Seu gasto real: <b>${moed(meu)}</b> · A receber: <b>${moed(terc)}</b>`;
    }

    $('#dCat').onchange = atualizarSubs;
    $('#dTipo').onchange = atualizarVisibilidade;
    $('#dRateioChk').onchange = atualizarPreviewRateio;
    $('#dValor').oninput = () => {
      if ($('#dRateioChk').checked && !$('#dRateioVal').dataset.editado) {
        const tot = Math.abs(parseValor($('#dValor').value) || 0);
        $('#dRateioVal').value = (tot / 2).toFixed(2).replace('.', ',');
      }
      atualizarPreviewRateio();
    };
    $('#dRateioVal').oninput = () => {
      $('#dRateioVal').dataset.editado = '1';
      atualizarPreviewRateio();
    };

    atualizarSubs();
    atualizarVisibilidade();

    $('#dlgExtra').onclick = async () => {
      await dbDelLanc(item.id);
      state.lancamentos = state.lancamentos.filter(x => x.id !== item.id);
      const ct = getConta(item.contaId);
      if (ct) {
        recalcularSaldoConta(ct);
        await kvSet('contas', state.contas);
      }
      treinarIA();
      $('#dlg').close();
      toast('Lançamento apagado');
      render();
    };

    $('#dlgForm').onsubmit = async e => {
      e.preventDefault();
      const tp = $('#dTipo').value;
      const val = Math.abs(parseValor($('#dValor').value));
      if (!Number.isFinite(val) || val <= 0) {
        toast('Informe um valor válido');
        return;
      }

      let contaId = $('#dConta').value;
      if (!contaId && state.contas.length === 0) {
        const novaConta = { id: uid('ct'), nome: 'Conta Principal', tipo: 'conta', saldoInicial: 0 };
        state.contas.push(novaConta);
        await kvSet('contas', state.contas);
        contaId = novaConta.id;
      }

      const sinal = (tp === 'receita' || tp === 'abate') ? 1 : -1;
      item.valor = sinal * val;
      item.desc = $('#dDesc').value.trim();
      item.data = $('#dData').value;
      item.contaId = contaId;
      item.notas = $('#dNotas').value.trim();
      item.proj = false;

      if (tp === 'abate') {
        item.abateCatId = $('#dAbateCat').value;
        item.catId = 'transf';
        item.subId = '';
      } else {
        item.abateCatId = '';
        item.catId = tp === 'mov' && !$('#dCat').value ? 'transf' : $('#dCat').value;
        item.subId = $('#dSubWrap').hidden ? '' : $('#dSub').value;
      }

      if (tp === 'gasto' && $('#dRateioChk').checked) {
        const terc = Math.min(val, Math.max(0, parseValor($('#dRateioVal').value) || 0));
        item.rateio = {
          ativo: true,
          terceiro: terc,
          pessoa: $('#dRateioPessoa').value.trim(),
          quitado: $('#dRateioQuitado').checked
        };
      } else {
        item.rateio = null;
      }

      const nParc = novo && $('#dParc') ? Number($('#dParc').value) : 1;
      const salvarLista = [];

      if (novo && nParc > 1) {
        const grupo = uid('grp');
        const valParc = +(val / nParc).toFixed(2);
        for (let p = 1; p <= nParc; p++) {
          const dtP = `${addMes(item.data.slice(0, 7), p - 1)}-${item.data.slice(8, 10)}`;
          salvarLista.push({
            ...item,
            id: p === 1 ? item.id : uid('tx'),
            data: dtP,
            valor: -valParc,
            proj: p > 1,
            parcela: { atual: p, total: nParc, grupo }
          });
        }
      } else {
        salvarLista.push(item);
      }

      await dbPutLanc(salvarLista);
      for (const s of salvarLista) {
        const idx = state.lancamentos.findIndex(x => x.id === s.id);
        if (idx >= 0) state.lancamentos[idx] = s;
        else state.lancamentos.push(s);
      }
      const ct = getConta(contaId);
      if (ct) {
        recalcularSaldoConta(ct);
        await kvSet('contas', state.contas);
      }
      treinarIA();
      $('#dlg').close();
      toast(nParc > 1 ? `${nParc} parcelas lançadas` : 'Lançamento salvo');
      render();
    };

    $('#dlg').showModal();
  }

  /* ========================================================================
     Importação de Arquivos (OFX e CSV)
     ======================================================================== */
  async function lerTextoArquivo(file) {
    const buf = await file.arrayBuffer();
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch (_) {
      return new TextDecoder('windows-1252').decode(buf);
    }
  }

  function parseOFX(texto, nomeArquivo) {
    const isCartao = /<CREDITCARDMSGSRSV1>|<CCSTMTRS>/i.test(texto);
    const acctIdMatch = texto.match(/<ACCTID>([^<\r\n]+)/i);
    const orgMatch = texto.match(/<ORG>([^<\r\n]+)/i);
    const ledgerMatch = texto.match(/<LEDGERBAL>[\s\S]*?<\/LEDGERBAL>/i);
    const balMatch = ledgerMatch ? ledgerMatch[0].match(/<BALAMT>([^<\r\n]+)/i) : texto.match(/<BALAMT>([^<\r\n]+)/i);
    const dtAsofMatch = ledgerMatch ? ledgerMatch[0].match(/<DTASOF>([^<\r\n]+)/i) : texto.match(/<DTASOF>([^<\r\n]+)/i);
    const dtEndMatch = texto.match(/<DTEND>([^<\r\n]+)/i);

    const acctId = acctIdMatch ? acctIdMatch[1].trim() : '';
    const org = orgMatch ? orgMatch[1].trim() : nomeArquivo.replace(/\.ofx$/i, '');
    const nomeConta = acctId ? `${org} · ${acctId.slice(-4)}` : org;
    const saldoFinal = balMatch ? parseValor(balMatch[1]) : NaN;

    const blocos = texto.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || [];
    const itens = [];

    for (const b of blocos) {
      const getTag = tag => {
        const m = b.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i'));
        return m ? m[1].trim() : '';
      };
      const dt = parseData(getTag('DTPOSTED'));
      const val = parseValor(getTag('TRNAMT'));
      const memo = getTag('MEMO');
      const name = getTag('NAME');
      const fitid = getTag('FITID');
      const desc = (memo && name && memo !== name) ? `${name} - ${memo}` : (memo || name || 'Lançamento OFX');

      if (!dt || !Number.isFinite(val) || val === 0) continue;
      itens.push({ data: dt, desc, valor: val, fitid });
    }

    const maxDataItem = itens.map(i => i.data).sort().pop() || '';
    const dtAsof = (dtAsofMatch ? parseData(dtAsofMatch[1]) : null) ||
      (dtEndMatch ? parseData(dtEndMatch[1]) : null) ||
      maxDataItem;

    return { nomeConta, isCartao, acctId, saldoFinal, dtAsof, itens };
  }

  function splitCSVLinha(linha, sep) {
    const res = [];
    let cur = '';
    let emAspas = false;
    for (let i = 0; i < linha.length; i++) {
      const ch = linha[i];
      if (ch === '"') {
        if (emAspas && linha[i + 1] === '"') { cur += '"'; i++; }
        else emAspas = !emAspas;
      } else if (ch === sep && !emAspas) {
        res.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    res.push(cur.trim());
    return res;
  }

  function parseCSVBruto(texto) {
    const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (linhas.length < 2) return null;
    const sep = (linhas[0].match(/;/g) || []).length >= (linhas[0].match(/,/g) || []).length ? ';' : ',';
    const matriz = linhas.map(l => splitCSVLinha(l, sep));
    const headers = matriz[0];
    const rows = matriz.slice(1).filter(r => r.some(Boolean));
    return { headers, rows };
  }

  async function processarArquivos(files) {
    const resEl = $('#importRes');
    resEl.innerHTML = '';

    for (const file of files) {
      const texto = await lerTextoArquivo(file);
      if (/<OFX>/i.test(texto) || /\.ofx$/i.test(file.name)) {
        const ofx = parseOFX(texto, file.name);
        if (!ofx.itens.length) {
          resEl.innerHTML += `<div class="res erro"><b>${esc(file.name)}</b>: nenhum lançamento encontrado no OFX.</div>`;
          continue;
        }
        let conta = state.contas.find(c => (ofx.acctId && c.acctId === ofx.acctId) || norm(c.nome) === norm(ofx.nomeConta));
        if (!conta) {
          conta = {
            id: uid('ct'),
            nome: ofx.nomeConta,
            tipo: ofx.isCartao ? 'cartao' : 'conta',
            acctId: ofx.acctId,
            saldoInicial: 0,
            saldoManual: false,
            ancoras: []
          };
          state.contas.push(conta);
        }

        const { novos, repetidos } = await importarItens(ofx.itens, conta.id);

        // Registra âncora de fechamento OFX e recalcula o saldo inicial automaticamente
        if (!ofx.isCartao && Number.isFinite(ofx.saldoFinal) && ofx.dtAsof) {
          if (!Array.isArray(conta.ancoras)) conta.ancoras = [];
          const idxAnc = conta.ancoras.findIndex(a => a.data === ofx.dtAsof);
          if (idxAnc >= 0) conta.ancoras[idxAnc].saldo = ofx.saldoFinal;
          else conta.ancoras.push({ data: ofx.dtAsof, saldo: ofx.saldoFinal });
        }

        const check = recalcularSaldoConta(conta);
        await kvSet('contas', state.contas);

        let infoSaldo = '';
        if (!ofx.isCartao && Number.isFinite(ofx.saldoFinal)) {
          const dtBr = ofx.dtAsof ? ofx.dtAsof.split('-').reverse().join('/') : '';
          infoSaldo = `<br><span class="mut">Saldo inicial calculado: <b>${moed(conta.saldoInicial)}</b> · Fechamento${dtBr ? ` (${dtBr})` : ''}: <b>${moed(ofx.saldoFinal)}</b></span>`;
          if (check.validado && !conta.conciliado) {
            infoSaldo += `<br><span class="badge-warn">Diferença de ${moed(check.diff)} entre os extratos — verifique se falta importar algum mês intermediário.</span>`;
          }
        }

        resEl.innerHTML += `
          <div class="res">
            <b>${esc(file.name)}</b> → ${esc(conta.nome)}<br>
            <span class="tag-n">${novos} novos</span> · ${repetidos} repetidos ignorados${infoSaldo}
          </div>
        `;
      } else {
        const csv = parseCSVBruto(texto);
        if (!csv || !csv.rows.length) {
          resEl.innerHTML += `<div class="res erro"><b>${esc(file.name)}</b>: arquivo vazio ou formato não reconhecido.</div>`;
          continue;
        }
        abrirMapeadorCSV(file.name, csv);
        break;
      }
    }
    render();
  }

  function abrirMapeadorCSV(nomeArquivo, csv) {
    state.csvPendente = { nomeArquivo, ...csv };
    $('#csvMap').hidden = false;
    $('#csvNome').textContent = `Arquivo: ${nomeArquivo} (${csv.rows.length} linhas)`;

    const optsCols = csv.headers.map((h, i) => `<option value="${i}">${esc(h || `Coluna ${i + 1}`)}</option>`).join('');
    $('#mData').innerHTML = optsCols;
    $('#mDesc').innerHTML = optsCols;
    $('#mValor').innerHTML = optsCols;
    $('#mDeb').innerHTML = `<option value="-1">Não (mesma coluna com sinal)</option>` + optsCols;

    csv.headers.forEach((h, i) => {
      const nh = norm(h);
      if (nh.includes('DATA') || nh === 'DATE') $('#mData').value = String(i);
      if (nh.includes('DESC') || nh.includes('HISTORICO') || nh.includes('TITLE') || nh.includes('ESTABELECIMENTO')) $('#mDesc').value = String(i);
      if (nh === 'VALOR' || nh === 'AMOUNT' || nh.includes('CREDITO')) $('#mValor').value = String(i);
      if (nh.includes('DEBITO') || nh.includes('SAIDA')) $('#mDeb').value = String(i);
    });

    const cartoesExistentes = state.contas.filter(c => c.tipo === 'cartao');
    $('#mConta').innerHTML = `<option value="__nova__">+ Criar nova conta / cartão</option>` +
      state.contas.map(c => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join('');

    if (/fatura|cartao/i.test(nomeArquivo) && cartoesExistentes.length === 1) {
      $('#mConta').value = cartoesExistentes[0].id;
    }

    $('#mNome').value = /fatura/i.test(nomeArquivo) ? 'Cartão de Crédito' : nomeArquivo.replace(/\.[^.]+$/, '');
    $('#mInv').checked = /fatura|nubank|cartao/i.test(nomeArquivo);

    const atualizarPrev = () => {
      $('#mNomeL').hidden = $('#mConta').value !== '__nova__';
      const iData = Number($('#mData').value);
      const iDesc = Number($('#mDesc').value);
      const iVal = Number($('#mValor').value);
      const iDeb = Number($('#mDeb').value);
      const inv = $('#mInv').checked ? -1 : 1;

      const amostra = csv.rows.slice(0, 4).map(r => {
        const dt = parseData(r[iData]) || '—';
        const dc = r[iDesc] || '—';
        let v = parseValor(r[iVal]);
        if (iDeb >= 0 && Number.isFinite(parseValor(r[iDeb])) && parseValor(r[iDeb]) !== 0) {
          v = -Math.abs(parseValor(r[iDeb]));
        } else if (Number.isFinite(v)) {
          v = v * inv;
        }
        return `<tr><td>${dt}</td><td>${esc(dc.slice(0, 32))}</td><td class="num">${Number.isFinite(v) ? moed(v) : '—'}</td></tr>`;
      }).join('');

      $('#csvPrev').innerHTML = `<table><thead><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr></thead><tbody>${amostra}</tbody></table>`;
    };

    ['#mData', '#mDesc', '#mValor', '#mDeb', '#mConta', '#mInv'].forEach(sel => {
      $(sel).onchange = atualizarPrev;
    });
    atualizarPrev();

    $('#csvCancel').onclick = () => {
      $('#csvMap').hidden = true;
      state.csvPendente = null;
    };

    $('#csvOk').onclick = async () => {
      const iData = Number($('#mData').value);
      const iDesc = Number($('#mDesc').value);
      const iVal = Number($('#mValor').value);
      const iDeb = Number($('#mDeb').value);
      const inv = $('#mInv').checked ? -1 : 1;

      let contaId = $('#mConta').value;
      if (contaId === '__nova__') {
        const nomeCt = $('#mNome').value.trim() || 'Conta Importada';
        const nova = {
          id: uid('ct'),
          nome: nomeCt,
          tipo: /cartao|fatura/i.test(nomeCt) ? 'cartao' : 'conta',
          saldoInicial: 0
        };
        state.contas.push(nova);
        await kvSet('contas', state.contas);
        contaId = nova.id;
      }

      const itens = [];
      for (const r of csv.rows) {
        const dt = parseData(r[iData]);
        const desc = (r[iDesc] || '').trim();
        let v = parseValor(r[iVal]);
        if (iDeb >= 0 && Number.isFinite(parseValor(r[iDeb])) && parseValor(r[iDeb]) !== 0) {
          v = -Math.abs(parseValor(r[iDeb]));
        } else if (Number.isFinite(v)) {
          v = v * inv;
        }
        if (!dt || !desc || !Number.isFinite(v) || v === 0) continue;
        itens.push({ data: dt, desc, valor: v, fitid: '' });
      }

      const { novos, repetidos } = await importarItens(itens, contaId);
      const ct = getConta(contaId);
      if (ct) {
        recalcularSaldoConta(ct);
        await kvSet('contas', state.contas);
      }
      $('#csvMap').hidden = true;
      state.csvPendente = null;
      $('#importRes').innerHTML += `
        <div class="res">
          <b>${esc(nomeArquivo)}</b><br>
          <span class="tag-n">${novos} novos</span> · ${repetidos} repetidos ignorados
        </div>
      `;
      render();
    };
  }

  async function importarItens(itens, contaId) {
    const assinaturas = new Set(state.lancamentos.map(t =>
      t.fitid ? `${t.contaId}|${t.fitid}` : `${t.contaId}|${t.data}|${t.valor.toFixed(2)}|${norm(t.desc)}`
    ));

    const novosLista = [];
    let repetidos = 0;

    for (const it of itens) {
      const sig = it.fitid ? `${contaId}|${it.fitid}` : `${contaId}|${it.data}|${it.valor.toFixed(2)}|${norm(it.desc)}`;
      if (assinaturas.has(sig)) {
        repetidos++;
        continue;
      }
      assinaturas.add(sig);

      const sug = classificar(it.desc, it.valor);
      const aplicarAuto = sug && (sug.origem === 'regra' || sug.origem === 'padrao');

      novosLista.push({
        id: uid('tx'),
        data: it.data,
        desc: it.desc,
        valor: +it.valor.toFixed(2),
        contaId,
        fitid: it.fitid || '',
        catId: aplicarAuto ? sug.catId : '',
        subId: aplicarAuto ? sug.subId : '',
        criadoEm: Date.now()
      });
    }

    if (novosLista.length) {
      await dbPutLanc(novosLista);
      state.lancamentos.push(...novosLista);
      const ultimoMes = novosLista.map(x => x.data.slice(0, 7)).sort().pop();
      if (ultimoMes) state.mes = ultimoMes;
    }

    return { novos: novosLista.length, repetidos };
  }

  /* ========================================================================
     View: Orçamento
     ======================================================================== */
  function renderOrcamento() {
    const catsGasto = state.categorias.filter(c => c.tipo === 'gasto');
    const m1 = addMes(state.mes, -1);
    const m2 = addMes(state.mes, -2);
    const m3 = addMes(state.mes, -3);
    const r1 = resumoMes(m1).porCat;
    const r2 = resumoMes(m2).porCat;
    const r3 = resumoMes(m3).porCat;

    const medias = {};
    for (const c of catsGasto) {
      const vals = [r1[c.id], r2[c.id], r3[c.id]].filter(v => v > 0);
      medias[c.id] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    }

    $('#orcLista').innerHTML = catsGasto.map(c => {
      const atual = Number(state.orcamentos[c.id]) || '';
      return `
        <div class="orc-l">
          <div>
            <b>${esc(c.nome)}</b>
            <span class="sug">${medias[c.id] > 0 ? `média recente: ${moed(medias[c.id], true)}` : 'sem histórico'}</span>
          </div>
          <input type="number" min="0" step="10" placeholder="Sem limite" data-orc-cat="${esc(c.id)}" value="${atual}">
        </div>
      `;
    }).join('');

    const atualizarTotal = () => {
      const tot = Object.values(state.orcamentos).reduce((s, v) => s + (Number(v) || 0), 0);
      $('#orcTotal').textContent = moed(tot);
    };
    atualizarTotal();

    $$('[data-orc-cat]', $('#orcLista')).forEach(inp => {
      inp.onchange = async () => {
        const v = Math.max(0, Number(inp.value) || 0);
        if (v > 0) state.orcamentos[inp.dataset.orcCat] = v;
        else delete state.orcamentos[inp.dataset.orcCat];
        await kvSet('orcamentos', state.orcamentos);
        atualizarTotal();
        toast('Orçamento atualizado');
      };
    });

    $('#orcSugTudo').onclick = async () => {
      let preenchidos = 0;
      for (const c of catsGasto) {
        if (medias[c.id] > 0) {
          state.orcamentos[c.id] = Math.ceil(medias[c.id] / 10) * 10;
          preenchidos++;
        }
      }
      if (!preenchidos) {
        toast('Importe extratos anteriores para calcular a média');
        return;
      }
      await kvSet('orcamentos', state.orcamentos);
      renderOrcamento();
      toast('Limites preenchidos pela média');
    };
  }

  /* ========================================================================
     View: Ajustes
     ======================================================================== */
  function renderAjustes() {
    $('#ver').textContent = VERSAO;
    $('#tema').value = localStorage.getItem('bolso-tema') || 'auto';

    $('#contas').innerHTML = state.contas.length
      ? state.contas.map(c => {
          const val = c.tipo === 'cartao' ? faturaMesConta(c, state.mes) : saldoConta(c);
          const orig = c.tipo !== 'cartao' && Array.isArray(c.ancoras) && c.ancoras.length > 0
            ? (c.saldoManual ? ' · saldo manual' : ' · saldo auto (OFX)')
            : '';
          return `
            <li data-edit-conta="${esc(c.id)}">
              <div>
                <b>${esc(c.nome)}</b>
                <small>${c.tipo === 'cartao' ? 'Cartão de crédito' : 'Conta corrente'} · ${c.tipo === 'cartao' ? `fatura ${moed(val)}` : `saldo ${moed(val)}`}${orig}</small>
              </div>
              <span class="seta">›</span>
            </li>
          `;
        }).join('')
      : `<li class="mut">Nenhuma conta cadastrada ainda.</li>`;

    $$('[data-edit-conta]', $('#contas')).forEach(li => {
      li.onclick = () => abrirModalConta(getConta(li.dataset.editConta));
    });

    $('#rCat').innerHTML = state.categorias.map(c => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join('');
    const atualizarRSub = () => {
      const cat = getCat($('#rCat').value);
      const subs = (cat && cat.subs) || [];
      $('#rSub').hidden = subs.length === 0;
      $('#rSub').innerHTML = `<option value="">Geral</option>` +
        subs.map(s => `<option value="${esc(s.id)}">${esc(s.nome)}</option>`).join('');
    };
    $('#rCat').onchange = atualizarRSub;
    atualizarRSub();

    $('#regras').innerHTML = state.regras.map((r, idx) => {
      const c = getCat(r.catId);
      const s = getSub(c, r.subId);
      return `
        <li>
          <div>
            <b>${esc(r.texto)}</b>
            <small>→ ${esc(c ? c.nome : 'Categoria removida')}${s ? ` · ${esc(s.nome)}` : ''}</small>
          </div>
          <button type="button" class="x" data-del-regra="${idx}" aria-label="Remover regra">×</button>
        </li>
      `;
    }).join('');

    $$('[data-del-regra]', $('#regras')).forEach(btn => {
      btn.onclick = async () => {
        state.regras.splice(Number(btn.dataset.delRegra), 1);
        await kvSet('regras', state.regras);
        renderAjustes();
      };
    });

    $('#iaStatus').textContent = `Aprendizado ativo: ${state.ia.totalDocs} lançamentos analisados (${Object.keys(state.ia.vocab).length} palavras-chave).`;

    $('#regrasPadraoT').textContent = `Ver ${REGRAS_PADRAO.length} regras automáticas embutidas`;
    $('#regrasPadrao').innerHTML = REGRAS_PADRAO.map(r => {
      const c = getCat(r.catId);
      const s = getSub(c, r.subId);
      return `<li><div><b>${esc(r.texto)}</b><small>→ ${esc(c ? c.nome : r.catId)}${s ? ` · ${esc(s.nome)}` : ''}</small></div></li>`;
    }).join('');

    $('#cats-lista').innerHTML = state.categorias.map(c => {
      const tipoTxt = c.tipo === 'gasto' ? 'Gasto' : (c.tipo === 'receita' ? 'Entrada' : 'Não conta');
      const nSubs = (c.subs || []).length;
      return `
        <li data-edit-cat="${esc(c.id)}">
          <div>
            <b>${esc(c.nome)}</b>
            <small>${tipoTxt}${nSubs > 0 ? ` · ${nSubs} ${nSubs === 1 ? 'subcategoria' : 'subcategorias'}` : ''}</small>
          </div>
          <span class="seta">›</span>
        </li>
      `;
    }).join('');

    $$('[data-edit-cat]', $('#cats-lista')).forEach(li => {
      li.onclick = () => abrirModalCategoria(getCat(li.dataset.editCat));
    });

    const ultBk = localStorage.getItem('bolso-ultimo-backup');
    $('#bkInfo').textContent = ultBk
      ? `Última cópia salva em ${new Date(ultBk).toLocaleDateString('pt-BR')}.`
      : 'Nenhuma cópia salva neste aparelho ainda.';
  }

  function abrirModalConta(conta) {
    if (!conta) return;
    const temAncora = Array.isArray(conta.ancoras) && conta.ancoras.length > 0;
    $('#dlgTitulo').textContent = 'Editar conta';
    $('#dlgDesc').textContent = temAncora
      ? 'O saldo inicial é calculado automaticamente pelos extratos OFX, mas você pode ajustar se precisar.'
      : 'Ajuste o nome, tipo ou saldo inicial desta conta.';
    $('#dlgExtra').hidden = false;
    $('#dlgExtra').textContent = 'Remover conta';

    $('#dlgCorpo').innerHTML = `
      <label>Nome
        <input id="ecNome" maxlength="40" value="${esc(conta.nome)}" required>
      </label>
      <div class="grid2">
        <label>Tipo
          <select id="ecTipo">
            <option value="conta" ${conta.tipo === 'conta' ? 'selected' : ''}>Conta corrente</option>
            <option value="cartao" ${conta.tipo === 'cartao' ? 'selected' : ''}>Cartão de crédito</option>
          </select>
        </label>
        <label>Saldo inicial (R$)
          <input id="ecSaldo" inputmode="decimal" placeholder="Automático pelo OFX" value="${(Number(conta.saldoInicial) || 0).toFixed(2).replace('.', ',')}">
        </label>
      </div>
      ${temAncora && conta.saldoManual ? `
        <button type="button" class="btn sm" id="ecAutoSaldo">Recalcular automaticamente pelo extrato OFX</button>
      ` : ''}
    `;

    const saldoOriginal = Number(conta.saldoInicial) || 0;

    if ($('#ecAutoSaldo')) {
      $('#ecAutoSaldo').onclick = async () => {
        conta.saldoManual = false;
        recalcularSaldoConta(conta);
        await kvSet('contas', state.contas);
        $('#dlg').close();
        toast('Saldo recalculado pelo extrato');
        renderAjustes();
      };
    }

    $('#dlgExtra').onclick = async () => {
      state.contas = state.contas.filter(c => c.id !== conta.id);
      await kvSet('contas', state.contas);
      $('#dlg').close();
      toast('Conta removida');
      renderAjustes();
    };

    $('#dlgForm').onsubmit = async e => {
      e.preventDefault();
      conta.nome = $('#ecNome').value.trim() || conta.nome;
      conta.tipo = $('#ecTipo').value;
      const novoSaldo = parseValor($('#ecSaldo').value);
      if (Number.isFinite(novoSaldo) && Math.abs(novoSaldo - saldoOriginal) > 0.009) {
        conta.saldoInicial = novoSaldo;
        conta.saldoManual = true;
      }
      recalcularSaldoConta(conta);
      await kvSet('contas', state.contas);
      $('#dlg').close();
      toast('Conta atualizada');
      renderAjustes();
    };

    $('#dlg').showModal();
  }

  function abrirModalCategoria(cat) {
    if (!cat) return;
    const subs = JSON.parse(JSON.stringify(cat.subs || []));

    $('#dlgTitulo').textContent = 'Editar categoria';
    $('#dlgDesc').textContent = 'Edite o nome ou organize subcategorias.';
    $('#dlgExtra').hidden = CATS_PADRAO.some(p => p.id === cat.id);
    $('#dlgExtra').textContent = 'Excluir';

    $('#dlgCorpo').innerHTML = `
      <div class="grid2">
        <label>Nome
          <input id="catEditNome" maxlength="40" value="${esc(cat.nome)}" required>
        </label>
        <label>Tipo
          <select id="catEditTipo">
            <option value="gasto" ${cat.tipo === 'gasto' ? 'selected' : ''}>Gasto</option>
            <option value="receita" ${cat.tipo === 'receita' ? 'selected' : ''}>Entrada</option>
            <option value="mov" ${cat.tipo === 'mov' ? 'selected' : ''}>Não conta</option>
          </select>
        </label>
      </div>
      <div class="sub-box">
        <span class="sub-box-tit">Subcategorias</span>
        <ul class="sub-lista" id="subListaModal"></ul>
        <div class="row">
          <input id="novaSubNome" placeholder="Nova subcategoria" maxlength="36">
          <button type="button" class="btn sm" id="btnAddSub">Adicionar</button>
        </div>
      </div>
    `;

    const renderSubsModal = () => {
      $('#subListaModal').innerHTML = subs.length
        ? subs.map((s, idx) => `
            <li>
              <span>${esc(s.nome)}</span>
              <button type="button" class="x" data-rm-sub="${idx}">×</button>
            </li>
          `).join('')
        : `<li class="vazio-sub">Nenhuma subcategoria ainda.</li>`;

      $$('[data-rm-sub]', $('#subListaModal')).forEach(btn => {
        btn.onclick = () => {
          subs.splice(Number(btn.dataset.rmSub), 1);
          renderSubsModal();
        };
      });
    };
    renderSubsModal();

    $('#btnAddSub').onclick = () => {
      const nome = $('#novaSubNome').value.trim();
      if (!nome) return;
      subs.push({ id: uid('sub'), nome });
      $('#novaSubNome').value = '';
      renderSubsModal();
    };

    $('#dlgExtra').onclick = async () => {
      state.categorias = state.categorias.filter(c => c.id !== cat.id);
      await kvSet('categorias', state.categorias);
      $('#dlg').close();
      toast('Categoria excluída');
      renderAjustes();
    };

    $('#dlgForm').onsubmit = async e => {
      e.preventDefault();
      cat.nome = $('#catEditNome').value.trim() || cat.nome;
      cat.tipo = $('#catEditTipo').value;
      cat.subs = subs;
      await kvSet('categorias', state.categorias);
      $('#dlg').close();
      toast('Categoria salva');
      renderAjustes();
    };

    $('#dlg').showModal();
  }

  /* ========================================================================
     Modo Exemplo
     ======================================================================== */
  function ativarExemplo() {
    state.exemplo = true;
    const ym = mesAtualStr();
    const ymAnt = addMes(ym, -1);

    state.contas = [
      { id: 'ex_cc', nome: 'Bradesco · conta final 4821', tipo: 'conta', saldoInicial: 1933.76 },
      { id: 'ex_ccard', nome: 'Santander · cartão final 7730', tipo: 'cartao', saldoInicial: 0 }
    ];
    state.categorias = JSON.parse(JSON.stringify(CATS_PADRAO));
    state.orcamentos = { alimentacao: 1200, moradia: 1800, transporte: 600, saude: 450, lazer: 500, assinaturas: 150 };
    state.fixasOcultas = [];

    state.lancamentos = [
      { id: 'ex1', data: `${ym}-05`, desc: 'SALARIO MENSAL', valor: 4800.00, contaId: 'ex_cc', catId: 'salario', subId: '' },
      { id: 'ex2', data: `${ym}-06`, desc: 'ALUGUEL E CONDOMINIO', valor: -1650.00, contaId: 'ex_cc', catId: 'moradia', subId: 'aluguel' },
      { id: 'ex3', data: `${ym}-08`, desc: 'SUPERMERCADO VERDEMAR', valor: -487.35, contaId: 'ex_ccard', catId: 'alimentacao', subId: 'mercado' },
      { id: 'ex4', data: `${ym}-10`, desc: 'POSTO IPIRANGA SAVASSI', valor: -215.00, contaId: 'ex_ccard', catId: 'transporte', subId: 'combustivel' },
      { id: 'ex5', data: `${ym}-11`, desc: 'JANTAR COM AMIGOS', valor: -240.00, contaId: 'ex_ccard', catId: 'alimentacao', subId: 'restaurante', rateio: { ativo: true, terceiro: 120.00, pessoa: 'Ana', quitado: false } },
      { id: 'ex6', data: `${ym}-12`, desc: 'DROGASIL BH', valor: -138.90, contaId: 'ex_ccard', catId: 'saude', subId: 'farmacia' },
      { id: 'ex7', data: `${ym}-13`, desc: 'COMPRA ONLINE LIVROS', valor: -73.51, contaId: 'ex_ccard', catId: '', subId: '' },
      { id: 'ex8', data: `${ym}-14`, desc: 'IFOOD *HAMBURGUERIA', valor: -82.08, contaId: 'ex_ccard', catId: 'alimentacao', subId: 'delivery' },
      { id: 'ex9', data: `${ym}-15`, desc: 'VIVO FIBRA INTERNET', valor: -119.90, contaId: 'ex_cc', catId: 'moradia', subId: 'internet' },
      { id: 'ex10', data: `${ym}-16`, desc: 'SMART FIT ACADEMIA', valor: -129.90, contaId: 'ex_ccard', catId: 'saude', subId: 'academia' },
      { id: 'ex11', data: `${ym}-18`, desc: 'PARCELA NOTEBOOK 2/6', valor: -450.00, contaId: 'ex_ccard', catId: 'compras', subId: 'casa', parcela: { atual: 2, total: 6, grupo: 'ex_g1' } },
      { id: 'ex12', data: `${ym}-20`, desc: 'UBER *VIAGEM', valor: -46.80, contaId: 'ex_ccard', catId: 'transporte', subId: 'app' },
      { id: 'ex13', data: `${ym}-22`, desc: 'SPOTIFY FAMILIA', valor: -34.90, contaId: 'ex_ccard', catId: 'assinaturas', subId: 'streaming' },
      { id: 'ex14', data: `${ym}-25`, desc: 'PIX -> MARIANA COSTA', valor: -249.62, contaId: 'ex_cc', catId: 'lazer', subId: 'passeios' },
      { id: 'ex20', data: `${ymAnt}-05`, desc: 'SALARIO MENSAL', valor: 4800.00, contaId: 'ex_cc', catId: 'salario', subId: '' },
      { id: 'ex21', data: `${ymAnt}-06`, desc: 'ALUGUEL E CONDOMINIO', valor: -1650.00, contaId: 'ex_cc', catId: 'moradia', subId: 'aluguel' },
      { id: 'ex22', data: `${ymAnt}-14`, desc: 'IFOOD *HAMBURGUERIA', valor: -68.50, contaId: 'ex_ccard', catId: 'alimentacao', subId: 'delivery' },
      { id: 'ex23', data: `${ymAnt}-15`, desc: 'VIVO FIBRA INTERNET', valor: -119.90, contaId: 'ex_cc', catId: 'moradia', subId: 'internet' },
      { id: 'ex24', data: `${ymAnt}-16`, desc: 'SMART FIT ACADEMIA', valor: -129.90, contaId: 'ex_ccard', catId: 'saude', subId: 'academia' },
      { id: 'ex25', data: `${ymAnt}-18`, desc: 'PARCELA NOTEBOOK 1/6', valor: -450.00, contaId: 'ex_ccard', catId: 'compras', subId: 'casa', parcela: { atual: 1, total: 6, grupo: 'ex_g1' } },
      { id: 'ex26', data: `${ymAnt}-22`, desc: 'SPOTIFY FAMILIA', valor: -34.90, contaId: 'ex_ccard', catId: 'assinaturas', subId: 'streaming' },
      { id: 'ex27', data: `${ymAnt}-24`, desc: 'SUPERMERCADO VERDEMAR', valor: -540.00, contaId: 'ex_ccard', catId: 'alimentacao', subId: 'mercado' },
      { id: 'ex28', data: `${ymAnt}-25`, desc: 'PIX -> MARIANA COSTA', valor: -250.00, contaId: 'ex_cc', catId: 'lazer', subId: 'passeios' }
    ];

    state.mes = ym;
    treinarIA();
    render();
  }

  /* ========================================================================
     Backup, Exportação CSV e Instalação PWA
     ======================================================================== */
  function baixarArquivo(nome, conteudo, mime) {
    const blob = new Blob([conteudo], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function salvarBackup() {
    const payload = {
      app: 'Bolso',
      versao: VERSAO,
      exportadoEm: new Date().toISOString(),
      contas: state.contas,
      categorias: state.categorias,
      regras: state.regras,
      orcamentos: state.orcamentos,
      fixasOcultas: state.fixasOcultas,
      lancamentos: state.lancamentos
    };
    const hoje = new Date().toISOString().slice(0, 10);
    baixarArquivo(`bolso-backup-${hoje}.json`, JSON.stringify(payload, null, 2), 'application/json');
    try { localStorage.setItem('bolso-ultimo-backup', new Date().toISOString()); } catch (_) {}
    toast('Cópia de segurança salva');
    renderAjustes();
  }

  async function restaurarBackup(file) {
    try {
      const txt = await file.text();
      const data = JSON.parse(txt);
      if (!data || !Array.isArray(data.lancamentos)) {
        toast('Arquivo de cópia inválido');
        return;
      }
      state.exemplo = false;
      state.contas = data.contas || [];
      state.categorias = (data.categorias && data.categorias.length) ? data.categorias : JSON.parse(JSON.stringify(CATS_PADRAO));
      state.regras = data.regras || [];
      state.orcamentos = data.orcamentos || {};
      state.fixasOcultas = data.fixasOcultas || [];
      state.lancamentos = data.lancamentos || [];

      for (const c of state.contas) recalcularSaldoConta(c);

      await Promise.all([
        kvSet('contas', state.contas),
        kvSet('categorias', state.categorias),
        kvSet('regras', state.regras),
        kvSet('orcamentos', state.orcamentos),
        kvSet('fixasOcultas', state.fixasOcultas)
      ]);

      await new Promise((resolve, reject) => {
        const tx = state.db.transaction('lancamentos', 'readwrite');
        const st = tx.objectStore('lancamentos');
        st.clear();
        state.lancamentos.forEach(item => st.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      treinarIA();
      toast('Cópia restaurada com sucesso');
      irPara('painel');
    } catch (_) {
      toast('Não foi possível ler o arquivo');
    }
  }

  function exportarCSV() {
    const linhas = ['Data;Descricao;Valor;Conta;Categoria;Subcategoria;Observacao'];
    const ordenados = [...state.lancamentos].sort((a, b) => a.data.localeCompare(b.data));
    for (const t of ordenados) {
      const ct = getConta(t.contaId);
      const cat = getCat(t.catId);
      const sub = getSub(cat, t.subId);
      const cols = [
        t.data,
        `"${String(t.desc || '').replace(/"/g, '""')}"`,
        t.valor.toFixed(2).replace('.', ','),
        `"${String(ct ? ct.nome : '').replace(/"/g, '""')}"`,
        `"${String(cat ? cat.nome : '').replace(/"/g, '""')}"`,
        `"${String(sub ? sub.nome : '').replace(/"/g, '""')}"`,
        `"${String(t.notas || '').replace(/"/g, '""')}"`
      ];
      linhas.push(cols.join(';'));
    }
    const hoje = new Date().toISOString().slice(0, 10);
    baixarArquivo(`bolso-lancamentos-${hoje}.csv`, '\uFEFF' + linhas.join('\r\n'), 'text/csv;charset=utf-8');
    toast('CSV exportado');
  }

  /* ========================================================================
     Inicialização e Eventos
     ======================================================================== */
  async function init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }

    if (localStorage.getItem('bolso-privado') === '1') {
      togglePrivacidade(true);
    }

    state.db = await abrirDB();
    await carregarDadosReais();

    $('#mesAnt').onclick = () => { state.mes = addMes(state.mes, -1); state.histOffset = 0; render(); };
    $('#mesProx').onclick = () => { state.mes = addMes(state.mes, 1); state.histOffset = 0; render(); };
    $('#btnNovoTop').onclick = () => abrirModalLancamento(null);
    $('#btnPriv').onclick = () => togglePrivacidade();

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-go]');
      if (btn) irPara(btn.dataset.go);
    });

    $('#btnExemplo').onclick = () => ativarExemplo();
    $('#sairExemplo').onclick = async () => {
      state.exemplo = false;
      await carregarDadosReais();
      render();
    };

    $('#busca').oninput = () => { state.limiteLanc = 60; renderLancamentos(); };
    $('#fCat').onchange = () => { state.limiteLanc = 60; renderLancamentos(); };
    $('#fConta').onchange = () => { state.limiteLanc = 60; renderLancamentos(); };
    $('#fSem').onchange = () => { state.limiteLanc = 60; renderLancamentos(); };
    $('#btnNovo').onclick = () => abrirModalLancamento(null);
    $('#lancMais').onclick = () => { state.limiteLanc += 60; renderLancamentos(); };

    const drop = $('#drop');
    const arq = $('#arquivo');
    arq.onchange = () => {
      if (arq.files && arq.files.length) processarArquivos(Array.from(arq.files));
      arq.value = '';
    };
    drop.ondragover = e => { e.preventDefault(); drop.classList.add('sobre'); };
    drop.ondragleave = () => drop.classList.remove('sobre');
    drop.ondrop = e => {
      e.preventDefault();
      drop.classList.remove('sobre');
      if (e.dataTransfer && e.dataTransfer.files.length) {
        processarArquivos(Array.from(e.dataTransfer.files));
      }
    };

    $('#tema').onchange = e => aplicarTema(e.target.value);

    $('#rAdd').onclick = async () => {
      const texto = $('#rTexto').value.trim();
      const catId = $('#rCat').value;
      const subId = $('#rSub').hidden ? '' : $('#rSub').value;
      if (!texto || !catId) return;
      state.regras.push({ texto, catId, subId });
      await kvSet('regras', state.regras);
      $('#rTexto').value = '';
      toast('Regra criada');
      renderAjustes();
    };

    $('#cAdd').onclick = async () => {
      const nome = $('#cNome').value.trim();
      const tipo = $('#cTipo').value;
      if (!nome) return;
      state.categorias.push({ id: uid('cat'), nome, tipo, cor: '#0f5257', subs: [] });
      await kvSet('categorias', state.categorias);
      $('#cNome').value = '';
      toast('Categoria criada');
      renderAjustes();
    };

    $('#bkSalvar').onclick = salvarBackup;
    $('#bkRestaurar').onchange = e => {
      if (e.target.files && e.target.files[0]) restaurarBackup(e.target.files[0]);
      e.target.value = '';
    };
    $('#csvExport').onclick = exportarCSV;

    $('#apagar').onclick = async () => {
      if ($('#apagarConf').value.trim().toUpperCase() !== 'APAGAR') {
        toast('Digite APAGAR para confirmar');
        return;
      }
      state.exemplo = false;
      state.contas = [];
      state.categorias = JSON.parse(JSON.stringify(CATS_PADRAO));
      state.regras = [];
      state.orcamentos = {};
      state.fixasOcultas = [];
      state.lancamentos = [];
      await Promise.all([
        kvSet('contas', []),
        kvSet('categorias', state.categorias),
        kvSet('regras', []),
        kvSet('orcamentos', {}),
        kvSet('fixasOcultas', [])
      ]);
      await new Promise(resolve => {
        const tx = state.db.transaction('lancamentos', 'readwrite');
        tx.objectStore('lancamentos').clear();
        tx.oncomplete = () => resolve();
      });
      $('#apagarConf').value = '';
      treinarIA();
      toast('Todos os dados foram apagados');
      irPara('painel');
    };

    $('#dlgCancel').onclick = () => $('#dlg').close();

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      state.installPrompt = e;
      if (localStorage.getItem('bolso-instalar-oculto') !== '1') {
        $('#cardInstalar').hidden = false;
      }
    });

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (isIOS && !isStandalone && localStorage.getItem('bolso-instalar-oculto') !== '1') {
      $('#cardInstalar').hidden = false;
      $('#instalarTxt').innerHTML = 'No Safari do iPhone, toque em <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.';
      $('#btnInstalar').hidden = true;
    }

    $('#btnInstalar').onclick = async () => {
      if (!state.installPrompt) return;
      state.installPrompt.prompt();
      await state.installPrompt.userChoice;
      state.installPrompt = null;
      $('#cardInstalar').hidden = true;
    };

    $('#btnOcultarInstalar').onclick = () => {
      $('#cardInstalar').hidden = true;
      try { localStorage.setItem('bolso-instalar-oculto', '1'); } catch (_) {}
    };

    const hashView = location.hash.replace('#', '');
    const viewsValidas = ['painel', 'lancamentos', 'importar', 'orcamento', 'ajustes'];
    irPara(viewsValidas.includes(hashView) ? hashView : 'painel');
  }

  init();
})();
