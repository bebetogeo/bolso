(() => {
  'use strict';

  const VERSAO = '1.7.2';
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
    { texto: 'SACOLAO', catId: 'alimentacao', subId: 'mercado' },
    { texto: 'MERCADO', catId: 'alimentacao', subId: 'mercado' },
    { texto: 'GRANEL', catId: 'alimentacao', subId: 'mercado' },
    { texto: 'CARNE', catId: 'alimentacao', subId: 'mercado' },
    { texto: 'PANIFICADORA', catId: 'alimentacao', subId: 'mercado' },
    { texto: 'PADARIA', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'RESTAURANTE', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'LANCHONETE', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'SORVETERIA', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'MARMITARIA', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'CAFE', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'BAR ', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'CHOPP', catId: 'alimentacao', subId: 'restaurante' },
    { texto: 'DROGASIL', catId: 'saude', subId: 'farmacia' },
    { texto: 'DROGA RAIA', catId: 'saude', subId: 'farmacia' },
    { texto: 'DROGA ', catId: 'saude', subId: 'farmacia' },
    { texto: 'RAIA', catId: 'saude', subId: 'farmacia' },
    { texto: 'PACHECO', catId: 'saude', subId: 'farmacia' },
    { texto: 'ARAUJO', catId: 'saude', subId: 'farmacia' },
    { texto: 'FARMACIA', catId: 'saude', subId: 'farmacia' },
    { texto: 'UNIMED', catId: 'saude', subId: 'plano' },
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
    { texto: 'ALUGUEL', catId: 'moradia', subId: 'aluguel' },
    { texto: 'MERCADO LIVRE', catId: 'compras', subId: 'online' },
    { texto: 'AMAZON.COM', catId: 'compras', subId: 'online' },
    { texto: 'AMAZON COM BR', catId: 'compras', subId: 'online' },
    { texto: 'SHOPEE', catId: 'compras', subId: 'online' },
    { texto: 'SHPP BRASIL', catId: 'compras', subId: 'online' },
    { texto: 'PAGAMENTO DE FATURA', catId: 'transf', subId: '' },
    { texto: 'PAGAMENTO FATURA', catId: 'transf', subId: '' },
    { texto: 'PAGTO FATURA', catId: 'transf', subId: '' },
    { texto: 'PAGAMENTO DE CARTAO', catId: 'transf', subId: '' },
    { texto: 'PIX-ENVIO DEVOLVIDO', catId: 'transf', subId: '' },
    { texto: 'PIX - REJEITADO', catId: 'transf', subId: '' },
    { texto: 'RESGATE', catId: 'transf', subId: '' },
    { texto: 'APLICACAO', catId: 'transf', subId: '' },
    { texto: 'RENDIMENTO AUTOMATICO', catId: 'rendimentos', subId: '' },
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
    csvFila: [],
    csvAtual: null,
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

  function hojeStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
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
    if (!list.length) return Promise.resolve();
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

  function dbDelLancPorConta(contaId) {
    if (state.exemplo) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const tx = state.db.transaction('lancamentos', 'readwrite');
      const store = tx.objectStore('lancamentos');
      const req = store.openCursor();
      req.onsuccess = e => {
        const cur = e.target.result;
        if (!cur) return;
        if (cur.value && cur.value.contaId === contaId) cur.delete();
        cur.continue();
      };
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

    let contasAtualizadas = false;
    for (const c of state.contas) {
      if (recalcularSaldoInicialPorExtrato(c)) contasAtualizadas = true;
    }
    if (contasAtualizadas) await kvSet('contas', state.contas);

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
    // 1. Regras do usuário
    for (const r of state.regras) {
      if (r.texto && n.includes(norm(r.texto))) {
        return { catId: r.catId, subId: r.subId || '', origem: 'regra' };
      }
    }
    // 2. Regras padrão
    for (const r of REGRAS_PADRAO) {
      if (n.includes(r.texto)) {
        const existe = state.categorias.find(c => c.id === r.catId);
        if (existe) {
          const subOk = r.subId && (existe.subs || []).some(s => s.id === r.subId) ? r.subId : '';
          return { catId: r.catId, subId: subOk, origem: 'padrao' };
        }
      }
    }
    // 3. Naive Bayes treinado com escolhas anteriores
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
            const countTk = (state.ia.vocab[tk] && state.ia.vocab[tk][key]) || 0;
            if (countTk > 0) hits++;
            score += Math.log((countTk + 0.5) / (docCount + 0.5 * vocabSize));
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

  function getCat(catId) {
    return state.categorias.find(c => c.id === catId) || null;
  }

  function labelCat(catId, subId = '') {
    const c = getCat(catId);
    if (!c) return 'Sem categoria';
    if (subId && Array.isArray(c.subs)) {
      const s = c.subs.find(x => x.id === subId);
      if (s) return `${c.nome} · ${s.nome}`;
    }
    return c.nome;
  }

  function getConta(contaId) {
    return state.contas.find(c => c.id === contaId) || null;
  }

  /* ========================================================================
     Cálculos Financeiros, Rateio / Abate e Recorrências
     ======================================================================== */
  function valorLiquidoGasto(tx) {
    const bruto = Math.abs(Number(tx.valor) || 0);
    const abatido = Math.min(bruto, Math.max(0, Number(tx.abatido) || 0));
    return round2(Math.max(0, bruto - abatido));
  }

  function valorLiquidoEntrada(tx) {
    const bruto = Math.max(0, Number(tx.valor) || 0);
    const usado = Math.min(bruto, Math.max(0, Number(tx.usadoAbate) || 0));
    return round2(Math.max(0, bruto - usado));
  }

  function lancamentosDoMes(ym) {
    return state.lancamentos.filter(tx => (tx.data || '').startsWith(ym));
  }

  function resumoMes(ym) {
    const lista = lancamentosDoMes(ym);
    let entrou = 0;
    let saiu = 0;
    let qtdEntrou = 0;
    let qtdSaiu = 0;
    let semCat = 0;
    const porCat = {};
    const porSub = {};

    for (const tx of lista) {
      const cat = getCat(tx.catId);
      if (!cat && tx.valor < 0) semCat++;
      if (cat && cat.tipo === 'mov') continue;

      if (tx.valor > 0) {
        const liq = valorLiquidoEntrada(tx);
        if (liq > 0) {
          entrou = round2(entrou + liq);
          qtdEntrou++;
        }
      } else if (tx.valor < 0) {
        const liq = valorLiquidoGasto(tx);
        saiu = round2(saiu + liq);
        qtdSaiu++;
        const cid = cat ? cat.id : 'outros';
        porCat[cid] = round2((porCat[cid] || 0) + liq);
        if (cat && tx.subId) {
          const sk = `${cid}:${tx.subId}`;
          porSub[sk] = round2((porSub[sk] || 0) + liq);
        }
      }
    }

    return {
      lista,
      entrou,
      saiu,
      sobra: round2(entrou - saiu),
      qtdEntrou,
      qtdSaiu,
      semCat,
      porCat,
      porSub
    };
  }

  function recalcularSaldoInicialPorExtrato(conta) {
    if (!conta || conta.tipo === 'cartao' || conta.saldoInicialManual) return false;
    if (typeof conta.saldoExtrato !== 'number' || !Number.isFinite(conta.saldoExtrato)) return false;

    const dtRef = conta.saldoExtratoData || '';
    const somaAteExtrato = state.lancamentos
      .filter(tx => tx.contaId === conta.id && (!dtRef || (tx.data && tx.data <= dtRef)))
      .reduce((acc, tx) => acc + (Number(tx.valor) || 0), 0);

    const novoIni = round2(conta.saldoExtrato - somaAteExtrato);
    if (Math.abs((Number(conta.saldoInicial) || 0) - novoIni) >= 0.005) {
      conta.saldoInicial = novoIni;
      return true;
    }
    return false;
  }

  function calcularSaldoConta(conta) {
    const ini = Number(conta.saldoInicial) || 0;
    const soma = state.lancamentos
      .filter(tx => tx.contaId === conta.id)
      .reduce((acc, tx) => acc + (Number(tx.valor) || 0), 0);
    return round2(ini + soma);
  }

  function detectarFixas(ym) {
    const meses = [addMes(ym, -3), addMes(ym, -2), addMes(ym, -1), ym];
    const grupos = new Map();

    for (const m of meses) {
      const doMes = lancamentosDoMes(m).filter(tx => {
        if (tx.valor >= 0) return false;
        const c = getCat(tx.catId);
        return Boolean(c && c.tipo === 'gasto');
      });
      const vistosNoMes = new Set();
      for (const tx of doMes) {
        const tokens = tokenizar(tx.desc).slice(0, 3);
        const chave = tokens.length ? tokens.join(' ') : norm(tx.desc).slice(0, 22);
        if (!chave || state.fixasOcultas.includes(chave)) continue;
        if (vistosNoMes.has(chave)) continue;
        vistosNoMes.add(chave);

        if (!grupos.has(chave)) {
          grupos.set(chave, { chave, nome: tx.desc, catId: tx.catId, itens: {} });
        }
        grupos.get(chave).itens[m] = tx;
      }
    }

    const fixas = [];
    for (const g of grupos.values()) {
      const mesesPresentes = Object.keys(g.itens);
      if (mesesPresentes.length < 2) continue;

      const vals = mesesPresentes.map(m => Math.abs(g.itens[m].valor));
      const media = vals.reduce((a, b) => a + b, 0) / vals.length;
      const atualTx = g.itens[ym] || null;
      const refTx = atualTx || g.itens[mesesPresentes[mesesPresentes.length - 1]];
      const valorAtual = atualTx ? Math.abs(atualTx.valor) : round2(media);
      const dia = Number((refTx.data || '').slice(8, 10)) || 10;
      const alta = atualTx && media > 0 && valorAtual > media * 1.12 && (valorAtual - media)
