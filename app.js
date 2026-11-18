(() => {
  'use strict';

  const VERSAO = '1.7.3';
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
    { texto: 'PAGAMENTO CARTAO', catId: 'transf', subId: '' },
    { texto: 'DEBITO AUTOMATICO CARTAO', catId: 'transf', subId: '' },
    { texto: 'DEBITO CARTAO', catId: 'transf', subId: '' },
    { texto: 'FATURA CARTAO', catId: 'transf', subId: '' },
    { texto: 'FATURA XP', catId: 'transf', subId: '' },
    { texto: 'OUROCARD', catId: 'transf', subId: '' },
    { texto: 'PIX-ENVIO DEVOLVIDO', catId: 'transf', subId: '' },
    { texto: 'PIX - REJEITADO', catId: 'transf', subId: '' },
    { texto: 'DEVOLUCAO PIX', catId: 'transf', subId: '' },
    { texto: 'ESTORNO', catId: 'transf', subId: '' },
    { texto: 'BB RENDE FACIL', catId: 'transf', subId: '' },
    { texto: 'RENDE FACIL', catId: 'transf', subId: '' },
    { texto: 'RESGATE', catId: 'transf', subId: '' },
    { texto: 'APLICACAO', catId: 'transf', subId: '' },
    { texto: 'APLIC.INVEST', catId: 'transf', subId: '' },
    { texto: 'RESG.INVEST', catId: 'transf', subId: '' },
    { texto: 'RENDIMENTO AUTOMATICO', catId: 'rendimentos', subId: '' },
    { texto: 'JUROS SOBRE CAPITAL', catId: 'rendimentos', subId: '' },
    { texto: 'DIVIDENDO', catId: 'rendimentos', subId: '' },
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

    treinarIA();

    let lancsModificados = false;
    for (const tx of state.lancamentos) {
      if (!tx.catId) {
        const sug = classificar(tx.desc, tx.valor);
        if (sug && (sug.origem === 'regra' || sug.origem === 'padrao' || sug.origem === 'titular')) {
          tx.catId = sug.catId;
          tx.subId = sug.subId || '';
          lancsModificados = true;
        }
      }
    }

    const paresConciliados = conciliarTransferencias();
    if (lancsModificados || paresConciliados > 0) {
      await dbPutLanc(state.lancamentos);
      treinarIA();
    }

    let contasAtualizadas = false;
    for (const c of state.contas) {
      if (recalcularSaldoInicialPorExtrato(c)) contasAtualizadas = true;
    }
    if (contasAtualizadas) await kvSet('contas', state.contas);
  }

  /* ========================================================================
     Inteligência Local (Regras + Titularidade + Naive Bayes)
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

  function pareceMesmaTitularidade(descNorm) {
    if (!/(PIX|TED|DOC|TRANSF|ENVIO|RECEB)/.test(descNorm)) return false;
    for (const c of state.contas) {
      if (!c.titular) continue;
      const partes = norm(c.titular).split(' ').filter(p => p.length >= 4);
      if (partes.length >= 2 && partes.slice(0, 2).every(p => descNorm.includes(p))) {
        return true;
      }
    }
    return false;
  }

  function classificar(desc, valor) {
    const n = norm(desc);
    // 1. Regras do usuário
    for (const r of state.regras) {
      if (r.texto && n.includes(norm(r.texto))) {
        return { catId: r.catId, subId: r.subId || '', origem: 'regra' };
      }
    }
    // 2. Transferência para mesma titularidade detectada pelo titular da conta
    if (pareceMesmaTitularidade(n) && state.categorias.some(c => c.id === 'transf')) {
      return { catId: 'transf', subId: '', origem: 'titular' };
    }
    // 3. Regras padrão
    for (const r of REGRAS_PADRAO) {
      if (n.includes(r.texto)) {
        const existe = state.categorias.find(c => c.id === r.catId);
        if (existe) {
          const subOk = r.subId && (existe.subs || []).some(s => s.id === r.subId) ? r.subId : '';
          return { catId: r.catId, subId: subOk, origem: 'padrao' };
        }
      }
    }
    // 4. Naive Bayes treinado com escolhas anteriores
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
      const minV = Math.min(...vals);
      const maxV = Math.max(...vals);
      // Exige valores consistentes entre meses (evita compras avulsas no mesmo comércio)
      if (media > 0 && (maxV - minV) / media > 0.45 && g.catId !== 'moradia' && g.catId !== 'assinaturas') {
        continue;
      }

      const atualTx = g.itens[ym] || null;
      const refTx = atualTx || g.itens[mesesPresentes[mesesPresentes.length - 1]];
      const valorAtual = atualTx ? Math.abs(atualTx.valor) : round2(media);
      const dia = Number((refTx.data || '').slice(8, 10)) || 10;
      const alta = atualTx && media > 0 && valorAtual > media * 1.12 && (valorAtual - media) >= 5;

      fixas.push({
        chave: g.chave,
        nome: refTx.desc,
        catId: refTx.catId,
        dia,
        pago: Boolean(atualTx),
        valor: valorAtual,
        media: round2(media),
        alta
      });
    }

    return fixas.sort((a, b) => (a.pago === b.pago ? a.dia - b.dia : a.pago ? 1 : -1));
  }

  function parcelasFuturasNoMes(ym) {
    const jaNoMes = lancamentosDoMes(ym);
    const futuros = [];
    const hoje = hojeStr();

    for (const tx of jaNoMes) {
      if (tx.data > hoje && tx.valor < 0) {
        futuros.push({
          id: tx.id,
          data: tx.data,
          desc: tx.desc,
          valor: Math.abs(tx.valor),
          catId: tx.catId,
          parcela: tx.parcela || '',
          real: true
        });
      }
    }

    const [yAlvo, mAlvo] = ym.split('-').map(Number);
    const idxAlvo = yAlvo * 12 + (mAlvo - 1);

    for (const tx of state.lancamentos) {
      if (!tx.parcela || tx.valor >= 0) continue;
      const pm = String(tx.parcela).match(/^(\d+)\s*(?:\/|de)\s*(\d+)$/i);
      if (!pm) continue;
      const atual = Number(pm[1]);
      const total = Number(pm[2]);
      if (total <= 1 || atual >= total) continue;

      const [yt, mt] = (tx.data || '').split('-').map(Number);
      if (!yt || !mt) continue;
      const diffMeses = idxAlvo - (yt * 12 + (mt - 1));
      const parcAlvo = atual + diffMeses;
      if (diffMeses <= 0 || parcAlvo > total) continue;

      const chaveNorm = norm(tx.desc).slice(0, 20);
      const existe = jaNoMes.some(x =>
        Math.abs(Math.abs(x.valor) - Math.abs(tx.valor)) < 0.05 &&
        norm(x.desc).slice(0, 20) === chaveNorm
      );
      if (existe) continue;

      const dia = (tx.data || '2026-01-10').slice(8, 10);
      futuros.push({
        id: `proj_${tx.id}_${parcAlvo}`,
        data: `${ym}-${dia}`,
        desc: tx.desc,
        valor: Math.abs(tx.valor),
        catId: tx.catId,
        parcela: `${parcAlvo}/${total}`,
        real: false
      });
    }

    return futuros.sort((a, b) => a.data.localeCompare(b.data));
  }

  function conciliarTransferencias() {
    if (!state.categorias.some(c => c.id === 'transf')) return 0;
    let pares = 0;
    const usadas = new Set();

    // 1. Pareamento exato de saída em uma conta com entrada de mesmo valor em outra conta (até 5 dias)
    for (const a of state.lancamentos) {
      if (a.valor >= 0 || usadas.has(a.id)) continue;
      const tA = Date.parse(a.data + 'T12:00:00Z');
      if (!Number.isFinite(tA)) continue;

      const candidatos = state.lancamentos.filter(b => {
        if (b.id === a.id || usadas.has(b.id)) return false;
        if (b.contaId === a.contaId || b.valor <= 0) return false;
        if (Math.abs(Math.abs(a.valor) - b.valor) > 0.02) return false;
        const tB = Date.parse(b.data + 'T12:00:00Z');
        return Number.isFinite(tB) && Math.abs(tA - tB) <= 5 * 86400000;
      });

      if (!candidatos.length) continue;

      candidatos.sort((x, y) => {
        const dx = Math.abs(Date.parse(x.data + 'T12:00:00Z') - tA);
        const dy = Math.abs(Date.parse(y.data + 'T12:00:00Z') - tA);
        return dx - dy;
      });

      const match = candidatos[0];
      usadas.add(a.id);
      usadas.add(match.id);
      if (a.catId !== 'transf' || match.catId !== 'transf') {
        a.catId = 'transf';
        a.subId = '';
        match.catId = 'transf';
        match.subId = '';
        pares++;
      }
    }

    // 2. Pareamento de pagamento de fatura na conta corrente com o total mensal de um cartão de crédito
    const cartoes = state.contas.filter(c => c.tipo === 'cartao');
    for (const cc of cartoes) {
      const porMes = new Map();
      for (const tx of state.lancamentos) {
        if (tx.contaId !== cc.id || tx.valor >= 0) continue;
        const c = getCat(tx.catId);
        if (c && c.tipo === 'mov') continue;
        const ym = (tx.data || '').slice(0, 7);
        if (!ym) continue;
        porMes.set(ym, round2((porMes.get(ym) || 0) + Math.abs(tx.valor)));
      }

      for (const [ym, totalFatura] of porMes.entries()) {
        if (totalFatura < 10) continue;
        const mesesBusca = [ym, addMes(ym, 1)];
        const pgto = state.lancamentos.find(tx => {
          if (usadas.has(tx.id) || tx.valor >= 0) return false;
          const ct = getConta(tx.contaId);
          if (!ct || ct.tipo === 'cartao') return false;
          if (!mesesBusca.includes((tx.data || '').slice(0, 7))) return false;
          if (Math.abs(Math.abs(tx.valor) - totalFatura) > 0.05) return false;
          return /FATURA|CARTAO|OUROCARD|PAGAMENTO|DEBITO|CREDITO|XP|NUBANK|ITAU|BRADESCO|SANTANDER|INTER|BTG/.test(norm(tx.desc));
        });

        if (pgto) {
          usadas.add(pgto.id);
          if (pgto.catId !== 'transf') {
            pgto.catId = 'transf';
            pgto.subId = '';
            pares++;
          }
        }
      }
    }

    return pares;
  }

  /* ========================================================================
     Renderização Geral e Navegação
     ======================================================================== */
  function irPara(view) {
    state.view = view;
    $$('.view').forEach(sec => {
      sec.hidden = sec.dataset.view !== view;
    });
    $$('.tabs button').forEach(btn => {
      btn.classList.toggle('on', btn.dataset.go === view);
    });
    const navMes = $('#mesNav');
    if (navMes) {
      navMes.style.visibility = (view === 'importar' || view === 'ajustes') ? 'hidden' : 'visible';
    }
    render();
  }

  function render() {
    const lbl = $('#mesLabel');
    if (lbl) lbl.textContent = labelMes(state.mes);

    const avisoEx = $('#avisoExemplo');
    if (avisoEx) avisoEx.hidden = !state.exemplo;

    if (state.view === 'painel') renderPainel();
    else if (state.view === 'lancamentos') renderLancamentos();
    else if (state.view === 'orcamento') renderOrcamento();
    else if (state.view === 'ajustes') renderAjustes();
  }

  /* ========================================================================
     Renderização: Painel do Mês
     ======================================================================== */
  function renderPainel() {
    const vazio = $('#vazio');
    const painel = $('#painel');
    if (!state.exemplo && state.lancamentos.length === 0) {
      vazio.hidden = false;
      painel.hidden = true;
      return;
    }
    vazio.hidden = true;
    painel.hidden = false;

    const res = resumoMes(state.mes);
    const ehMesAtual = state.mes === mesAtualStr();

    const avRev = $('#avisoRevisar');
    if (res.semCat > 0) {
      avRev.hidden = false;
      avRev.innerHTML = `
        <span>Você tem <b>${res.semCat}</b> ${res.semCat === 1 ? 'gasto sem categoria' : 'gastos sem categoria'} neste mês.</span>
        <button type="button" class="btn sm" id="btnTriagemRapida">Classificar agora</button>
      `;
      $('#btnTriagemRapida', avRev).onclick = () => {
        $('#fSem').checked = true;
        $('#fCat').value = '';
        $('#fConta').value = '';
        $('#busca').value = '';
        irPara('lancamentos');
      };
    } else {
      avRev.hidden = true;
    }

    const avBk = $('#avisoBackup');
    const ultBk = Number(localStorage.getItem('bolso-ultimo-backup') || 0);
    const diasSemBk = ultBk ? Math.floor((Date.now() - ultBk) / 86400000) : 999;
    if (!state.exemplo && state.lancamentos.length >= 25 && diasSemBk > 20) {
      avBk.hidden = false;
      avBk.innerHTML = `
        <span>${ultBk ? `Última cópia de segurança há ${diasSemBk} dias.` : 'Você ainda não salvou uma cópia de segurança dos seus dados.'}</span>
        <button type="button" class="btn sm" id="btnBkAviso">Salvar cópia</button>
      `;
      $('#btnBkAviso', avBk).onclick = exportarBackup;
    } else {
      avBk.hidden = true;
    }

    const sEntrou = moed(res.entrou);
    const sSaiu = moed(res.saiu);
    const elEntrou = $('#kEntrou');
    const elSaiu = $('#kSaiu');
    elEntrou.textContent = sEntrou;
    elSaiu.textContent = sSaiu;
    elEntrou.classList.toggle('val-longo', sEntrou.length >= 13);
    elSaiu.classList.toggle('val-longo', sSaiu.length >= 13);

    $('#kEntrouSub').textContent = res.qtdEntrou
      ? `${res.qtdEntrou} ${res.qtdEntrou === 1 ? 'entrada' : 'entradas'}`
      : 'Nenhuma entrada no mês';
    $('#kSaiuSub').textContent = res.qtdSaiu
      ? `${res.qtdSaiu} ${res.qtdSaiu === 1 ? 'gasto' : 'gastos'}`
      : 'Nenhum gasto no mês';

    const elSobra = $('#kSobra');
    elSobra.textContent = moed(res.sobra);
    elSobra.className = 'num ' + (res.sobra >= 0 ? 'pos' : 'neg');
    if (res.entrou > 0) {
      const pct = Math.round((res.sobra / res.entrou) * 100);
      $('#kSobraSub').textContent = res.sobra >= 0
        ? `Você guardou ${pct}% do que entrou`
        : `Gastou ${Math.abs(pct)}% além do que entrou`;
    } else {
      $('#kSobraSub').textContent = res.sobra >= 0 ? 'Saldo positivo' : 'Saídas maiores que entradas';
    }

    const fixas = detectarFixas(state.mes);
    const fixasPendentes = fixas.filter(f => !f.pago);
    const futuros = parcelasFuturasNoMes(state.mes);

    const kpiPrev = $('#kpiPrev');
    if (ehMesAtual && (fixasPendentes.length > 0 || futuros.length > 0)) {
      const pendenteFixas = fixasPendentes.reduce((acc, f) => acc + f.valor, 0);
      const pendenteParc = futuros.filter(f => !f.real).reduce((acc, f) => acc + f.valor, 0);
      const prevFinal = round2(res.sobra - pendenteFixas - pendenteParc);
      kpiPrev.hidden = false;
      const elPrev = $('#kPrev');
      elPrev.textContent = moed(prevFinal);
      elPrev.className = 'num ' + (prevFinal >= 0 ? 'pos' : 'neg');
      $('#kPrevSub').textContent = `Considerando ${moed(pendenteFixas + pendenteParc)} em contas fixas e parcelas a vencer`;
    } else {
      kpiPrev.hidden = true;
    }

    renderContasStrip();
    renderRateioCard();
    renderFixasCard(fixas);
    renderFuturoCard(futuros);
    renderOrcamentoCard(res, ehMesAtual);
    renderCategoriasCard(res);
    renderHistoricoCard();
    renderTop5Card(res);
  }

  function renderContasStrip() {
    const el = $('#contasStrip');
    if (!state.contas.length) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    el.innerHTML = state.contas.map(c => {
      const ehCartao = c.tipo === 'cartao';
      if (ehCartao) {
        const gastoMes = state.lancamentos
          .filter(tx => {
            if (tx.contaId !== c.id || !(tx.data || '').startsWith(state.mes) || tx.valor >= 0) return false;
            const cat = getCat(tx.catId);
            return !cat || cat.tipo !== 'mov';
          })
          .reduce((acc, tx) => acc + Math.abs(tx.valor), 0);
        const fecha = c.fechaDia ? ` · fecha dia ${c.fechaDia}` : '';
        return `
          <div class="conta-pill" data-conta="${esc(c.id)}">
            <div class="cn"><span>💳 ${esc(c.nome)}</span><span class="csub">Fatura no mês${fecha}</span></div>
            <div class="cv num">${moed(gastoMes)}</div>
          </div>
        `;
      } else {
        const saldoCalc = calcularSaldoConta(c);
        let badge = '';
        if (typeof c.saldoExtrato === 'number' && Number.isFinite(c.saldoExtrato)) {
          const diff = round2(saldoCalc - c.saldoExtrato);
          if (Math.abs(diff) < 0.05) {
            badge = `<span class="badge-ok">✓ Conferido com extrato</span>`;
          } else {
            badge = `<span class="badge-warn" title="Extrato: ${moed(c.saldoExtrato)}">Extrato: ${moed(c.saldoExtrato)}</span>`;
          }
        }
        return `
          <div class="conta-pill" data-conta="${esc(c.id)}">
            <div class="cn"><span>🏦 ${esc(c.nome)}</span>${badge}</div>
            <div class="cv num ${saldoCalc >= 0 ? 'pos' : 'neg'}">${moed(saldoCalc)}</div>
          </div>
        `;
      }
    }).join('');

    $$('.conta-pill', el).forEach(pill => {
      pill.onclick = () => {
        $('#fConta').value = pill.dataset.conta;
        $('#fCat').value = '';
        $('#fSem').checked = false;
        $('#busca').value = '';
        irPara('lancamentos');
      };
    });
  }

  function renderRateioCard() {
    const el = $('#cardRateio');
    const pendentes = state.lancamentos.filter(tx =>
      tx.valor < 0 && Number(tx.rateioEsperado) > (Number(tx.abatido) || 0) + 0.01
    );
    if (!pendentes.length) {
      el.hidden = true;
      return;
    }
    const totalFalta = pendentes.reduce((acc, tx) =>
      acc + (Number(tx.rateioEsperado) - (Number(tx.abatido) || 0)), 0
    );
    el.hidden = false;
    el.innerHTML = `
      <div class="card-h">
        <h2>Rateios a receber</h2>
        <span class="num pos" style="font-weight:700">${moed(totalFalta)}</span>
      </div>
      <p class="mut">Gastos divididos aguardando reembolso. Quando o Pix entrar, toque em <b>Rateio / Abater</b> na entrada para abater o valor.</p>
      <ul class="fixas-lista">
        ${pendentes.slice(0, 4).map(tx => {
          const falta = round2(Number(tx.rateioEsperado) - (Number(tx.abatido) || 0));
          return `
            <li data-id="${esc(tx.id)}" style="cursor:pointer">
              <span class="fn">${esc(tx.desc)}<small>${tx.data.slice(8, 10)}/${tx.data.slice(5, 7)} · ${esc(labelCat(tx.catId, tx.subId))}</small></span>
              <span class="fv num pos">+ ${moed(falta)}</span>
            </li>
          `;
        }).join('')}
      </ul>
    `;
    $$('li[data-id]', el).forEach(li => {
      li.onclick = () => {
        const tx = state.lancamentos.find(x => x.id === li.dataset.id);
        if (tx) abrirModalLancamento(tx);
      };
    });
  }

  function renderFixasCard(fixas) {
    const el = $('#cardFixas');
    if (!fixas.length) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    const totalFixas = fixas.reduce((acc, f) => acc + f.valor, 0);
    el.innerHTML = `
      <div class="card-h">
        <h2>Contas fixas e assinaturas</h2>
        <span class="mut num">${moed(totalFixas)}</span>
      </div>
      <ul class="fixas-lista">
        ${fixas.map(f => `
          <li>
            <span class="fn">
              <span>${esc(f.nome)}</span>
              <small>${f.pago ? '✓ Lançado neste mês' : `Previsto perto do dia ${f.dia}`} · ${esc(labelCat(f.catId))}</small>
            </span>
            <span class="fv num ${f.pago ? '' : 'apag'}">
              ${f.alta ? '<span class="tag-alta">↑ acima da média</span>' : ''}
              ${moed(f.valor)}
              <button type="button" class="x" data-ocultar="${esc(f.chave)}" title="Não é conta fixa">×</button>
            </span>
          </li>
        `).join('')}
      </ul>
    `;
    $$('button[data-ocultar]', el).forEach(btn => {
      btn.onclick = async e => {
        e.stopPropagation();
        const ch = btn.dataset.ocultar;
        if (!state.fixasOcultas.includes(ch)) {
          state.fixasOcultas.push(ch);
          await kvSet('fixasOcultas', state.fixasOcultas);
        }
        renderPainel();
      };
    });
  }

  function renderFuturoCard(futuros) {
    const el = $('#cardFuturo');
    if (!futuros.length) {
      el.hidden = true;
      return;
    }
    el.hidden = false;
    const tot = futuros.reduce((acc, f) => acc + f.valor, 0);
    el.innerHTML = `
      <div class="card-h">
        <h2>Próximos lançamentos e parcelas</h2>
        <span class="mut num">${moed(tot)}</span>
      </div>
      <ul class="fixas-lista">
        ${futuros.slice(0, 6).map(f => `
          <li>
            <span class="fn">
              <span>${esc(f.desc)} ${f.parcela ? `<span class="parc-tag">${esc(f.parcela)}</span>` : ''}</span>
              <small>Dia ${f.data.slice(8, 10)}/${f.data.slice(5, 7)} · ${f.real ? 'Agendado' : 'Parcela prevista'}</small>
            </span>
            <span class="fv num">${moed(f.valor)}</span>
          </li>
        `).join('')}
      </ul>
    `;
  }

  function renderOrcamentoCard(res, ehMesAtual) {
    const catsOrc = Object.entries(state.orcamentos).filter(([, v]) => Number(v) > 0);
    const bar = $('#orcFill');
    const hojeEl = $('#orcHoje');
    const txt = $('#orcTxt');

    if (!catsOrc.length) {
      bar.style.width = '0%';
      bar.className = 'orc-fill';
      hojeEl.hidden = true;
      txt.innerHTML = `Você ainda não definiu limites mensais. <button type="button" class="lnk" data-go="orcamento">Definir orçamento</button>`;
      const b = $('button[data-go="orcamento"]', txt);
      if (b) b.onclick = () => irPara('orcamento');
      return;
    }

    const totalOrc = catsOrc.reduce((acc, [, v]) => acc + Number(v), 0);
    const gastoOrc = catsOrc.reduce((acc, [cid]) => acc + (res.porCat[cid] || 0), 0);
    const pct = totalOrc > 0 ? Math.round((gastoOrc / totalOrc) * 100) : 0;

    bar.style.width = `${Math.min(100, pct)}%`;
    bar.className = 'orc-fill' + (pct > 100 ? ' estourou' : pct >= 85 ? ' alto' : '');

    if (ehMesAtual) {
      const now = new Date();
      const diasMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const pctDia = Math.min(98, Math.max(2, Math.round((now.getDate() / diasMes) * 100)));
      hojeEl.hidden = false;
      hojeEl.style.left = `${pctDia}%`;
    } else {
      hojeEl.hidden = true;
    }

    const restante = round2(totalOrc - gastoOrc);
    if (restante >= 0) {
      txt.innerHTML = `Você usou <b class="num">${moed(gastoOrc)}</b> de <b class="num">${moed(totalOrc)}</b> (${pct}%). Ainda restam <b class="num pos">${moed(restante)}</b> nas categorias com limite.`;
    } else {
      txt.innerHTML = `Você usou <b class="num">${moed(gastoOrc)}</b> de <b class="num">${moed(totalOrc)}</b> (${pct}%), passando <b class="num neg">${moed(Math.abs(restante))}</b> do planejado.`;
    }
  }

  function renderCategoriasCard(res) {
    const el = $('#cats');
    const catsGasto = state.categorias.filter(c => c.tipo === 'gasto');
    const itens = catsGasto
      .map(c => ({
        cat: c,
        valor: res.porCat[c.id] || 0,
        limite: Number(state.orcamentos[c.id]) || 0
      }))
      .filter(x => x.valor > 0 || x.limite > 0)
      .sort((a, b) => b.valor - a.valor);

    if (!itens.length) {
      el.innerHTML = `<p class="mut">Nenhum gasto registrado neste mês.</p>`;
      return;
    }

    const maxVal = Math.max(...itens.map(x => Math.max(x.valor, x.limite)), 1);

    el.innerHTML = itens.map(({ cat, valor, limite }) => {
      const pctTotal = res.saiu > 0 ? Math.round((valor / res.saiu) * 100) : 0;
      let widthPct = 0;
      let cls = 'enche';
      let detDir = '';

      if (limite > 0) {
        const pctLim = Math.round((valor / limite) * 100);
        widthPct = Math.min(100, pctLim);
        if (pctLim > 100) cls += ' estourou';
        else if (pctLim >= 85) cls += ' sem';
        detDir = `${pctLim}% do limite (${moed(limite, true)})`;
      } else {
        widthPct = Math.min(100, Math.round((valor / maxVal) * 100));
        cls += ' livre';
        detDir = 'Sem limite';
      }

      const subs = (cat.subs || [])
        .map(s => ({ sub: s, v: res.porSub[`${cat.id}:${s.id}`] || 0 }))
        .filter(x => x.v > 0)
        .sort((a, b) => b.v - a.v);

      const subsHtml = subs.length ? `
        <div class="subcats">
          ${subs.map(({ sub, v }) => `
            <div class="subcat" data-cat="${esc(cat.id)}:${esc(sub.id)}">
              <span>${esc(sub.nome)}</span>
              <span class="num">${moed(v)}</span>
            </div>
          `).join('')}
        </div>
      ` : '';

      return `
        <div class="cat-bloco">
          <div class="cat" data-cat="${esc(cat.id)}">
            <span class="nome">${esc(cat.nome)}</span>
            <span class="valor">${moed(valor)}</span>
            <div class="trilho"><div class="${cls}" style="width:${widthPct}%;${limite === 0 ? `background:${esc(cat.cor || 'var(--pri)')}` : ''}"></div></div>
            <div class="det"><span>${pctTotal}% dos gastos</span><span>${detDir}</span></div>
          </div>
          ${subsHtml}
        </div>
      `;
    }).join('');

    $$('[data-cat]', el).forEach(node => {
      node.onclick = () => {
        $('#fCat').value = node.dataset.cat;
        $('#fConta').value = '';
        $('#fSem').checked = false;
        $('#busca').value = '';
        irPara('lancamentos');
      };
    });
  }

  function renderHistoricoCard() {
    const el = $('#histCard');
    const baseMes = addMes(mesAtualStr(), state.histOffset);
    const meses = [];
    for (let i = -5; i <= 0; i++) meses.push(addMes(baseMes, i));

    const dados = meses.map(m => ({ mes: m, ...resumoMes(m) }));
    const maxBarra = Math.max(...dados.map(d => Math.max(d.entrou, d.saiu)), 1);

    const somaCats = {};
    for (const d of dados) {
      for (const [cid, v] of Object.entries(d.porCat)) {
        somaCats[cid] = (somaCats[cid] || 0) + v;
      }
    }
    const topCats = Object.entries(somaCats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cid]) => getCat(cid))
      .filter(Boolean);
    const topCatIds = new Set(topCats.map(c => c.id));

    const colsHtml = dados.map(d => {
      const hEnt = d.entrou > 0 ? Math.max(4, Math.round((d.entrou / maxBarra) * 80)) : 0;
      const segs = [];
      for (const c of topCats) {
        const v = d.porCat[c.id] || 0;
        if (v > 0) segs.push({ cor: c.cor || '#0f5257', h: Math.max(2, Math.round((v / maxBarra) * 80)) });
      }
      const outrosV = Object.entries(d.porCat)
        .filter(([cid]) => !topCatIds.has(cid))
        .reduce((acc, [, v]) => acc + v, 0);
      if (outrosV > 0) segs.push({ cor: '#8b9999', h: Math.max(2, Math.round((outrosV / maxBarra) * 80)) });

      return `
        <div class="hcol ${d.mes === state.mes ? 'atual' : ''}" data-mes="${d.mes}">
          <span class="ve num">${d.entrou > 0 ? moed(d.entrou, true).replace('R$\u00a0', '').replace('R$ ', '') : ''}</span>
          <div class="hbars">
            <div class="e" style="height:${hEnt}px" title="Entrou: ${moed(d.entrou)}"></div>
            <div class="s-stack" title="Saiu: ${moed(d.saiu)}">
              ${segs.map(s => `<i class="s-seg" style="height:${s.h}px;background:${esc(s.cor)}"></i>`).join('')}
            </div>
          </div>
          <span class="vs num">${d.saiu > 0 ? moed(d.saiu, true).replace('R$\u00a0', '').replace('R$ ', '') : ''}</span>
          <span class="m">${esc(labelMesCurto(d.mes))}</span>
        </div>
      `;
    }).join('');

    const comDados = dados.filter(d => d.entrou > 0 || d.saiu > 0);
    const nCom = Math.max(1, comDados.length);
    const medEnt = comDados.reduce((a, b) => a + b.entrou, 0) / nCom;
    const medSai = comDados.reduce((a, b) => a + b.saiu, 0) / nCom;

    el.innerHTML = `
      <div class="card-h">
        <h2>Últimos 6 meses</h2>
        <span class="mut">Toque num mês</span>
      </div>
      <div class="hist-wrap">
        <button type="button" class="hist-nav-btn" id="histAnt" aria-label="Meses anteriores">‹</button>
        <div class="hist">${colsHtml}</div>
        <button type="button" class="hist-nav-btn" id="histProx" aria-label="Próximos meses">›</button>
      </div>
      <div class="leg">
        <span><i style="background:var(--bar-2)"></i>Entrou</span>
        ${topCats.map(c => `<span><i style="background:${esc(c.cor)}"></i>${esc(c.nome)}</span>`).join('')}
        <span><i style="background:#8b9999"></i>Outros</span>
      </div>
      <div class="hist-resumo">
        <span>Média entrou: <b class="num pos">${moed(medEnt, true)}</b></span>
        <span>Média saiu: <b class="num">${moed(medSai, true)}</b></span>
      </div>
    `;

    $('#histAnt', el).onclick = () => { state.histOffset--; renderHistoricoCard(); };
    $('#histProx', el).onclick = () => { state.histOffset++; renderHistoricoCard(); };
    $$('.hcol', el).forEach(col => {
      col.onclick = () => {
        state.mes = col.dataset.mes;
        render();
      };
    });
  }

  function renderTop5Card(res) {
    const el = $('#top5');
    const gastos = res.lista
      .filter(tx => {
        if (tx.valor >= 0) return false;
        const c = getCat(tx.catId);
        return !c || c.tipo === 'gasto';
      })
      .sort((a, b) => valorLiquidoGasto(b) - valorLiquidoGasto(a))
      .slice(0, 5);

    if (!gastos.length) {
      el.innerHTML = `<li style="cursor:default;color:var(--mut)">Nenhum gasto neste mês.</li>`;
      return;
    }

    el.innerHTML = gastos.map(tx => {
      const liq = valorLiquidoGasto(tx);
      const dia = `${tx.data.slice(8, 10)}/${tx.data.slice(5, 7)}`;
      return `
        <li data-id="${esc(tx.id)}">
          <span class="d">
            <span>${esc(tx.desc)}</span>
            <small>${dia} · ${esc(labelCat(tx.catId, tx.subId))}${tx.abatido > 0 ? ` · abatido ${moed(tx.abatido)}` : ''}</small>
          </span>
          <span class="valor">${moed(liq)}</span>
        </li>
      `;
    }).join('');

    $$('li[data-id]', el).forEach(li => {
      li.onclick = () => {
        const tx = state.lancamentos.find(x => x.id === li.dataset.id);
        if (tx) abrirModalLancamento(tx);
      };
    });
  }

  /* ========================================================================
     Renderização: Lançamentos e Modo Triagem
     ======================================================================== */
  function popularFiltrosLancamentos() {
    const fCat = $('#fCat');
    const valCat = fCat.value;
    let optsCat = `<option value="">Todas as categorias</option>`;
    for (const c of state.categorias) {
      optsCat += `<option value="${esc(c.id)}">${esc(c.nome)}</option>`;
      for (const s of (c.subs || [])) {
        optsCat += `<option value="${esc(c.id)}:${esc(s.id)}">↳ ${esc(c.nome)} · ${esc(s.nome)}</option>`;
      }
    }
    fCat.innerHTML = optsCat;
    fCat.value = valCat;

    const fConta = $('#fConta');
    const valConta = fConta.value;
    fConta.innerHTML = `<option value="">Todas as contas</option>` +
      state.contas.map(c => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join('');
    fConta.value = valConta;
  }

  function sugerirChipsTriagem(tx) {
    const chips = [];
    const vistos = new Set();

    const sug = classificar(tx.desc, tx.valor);
    if (sug && sug.catId) {
      const key = sug.subId ? `${sug.catId}:${sug.subId}` : sug.catId;
      vistos.add(key);
      chips.push({
        label: `✦ ${labelCat(sug.catId, sug.subId)}`,
        catId: sug.catId,
        subId: sug.subId || '',
        cls: 'qchip qchip-ia'
      });
    }

    const tipoAlvo = tx.valor > 0 ? 'receita' : 'gasto';
    for (const c of state.categorias) {
      if (c.tipo !== tipoAlvo) continue;
      if (vistos.has(c.id)) continue;
      vistos.add(c.id);
      chips.push({ label: c.nome, catId: c.id, subId: '', cls: 'qchip' });
      if (chips.length >= 3) break;
    }

    if (state.categorias.some(c => c.id === 'transf')) {
      chips.push({ label: 'Transf. / Fatura', catId: 'transf', subId: '', cls: 'qchip qchip-out' });
    }
    return chips;
  }

  function renderLancamentos() {
    popularFiltrosLancamentos();

    const busca = norm($('#busca').value);
    const buscaNum = parseValor($('#busca').value);
    const fCat = $('#fCat').value;
    const fConta = $('#fConta').value;
    const fSem = $('#fSem').checked;

    const filtrados = lancamentosDoMes(state.mes)
      .filter(tx => {
        if (fSem && tx.catId) return false;
        if (fConta && tx.contaId !== fConta) return false;
        if (fCat) {
          if (fCat.includes(':')) {
            const [cid, sid] = fCat.split(':');
            if (tx.catId !== cid || tx.subId !== sid) return false;
          } else if (tx.catId !== fCat) {
            return false;
          }
        }
        if (busca) {
          const bateTexto = norm(tx.desc).includes(busca) || norm(labelCat(tx.catId, tx.subId)).includes(busca);
          const bateValor = Number.isFinite(buscaNum) && Math.abs(Math.abs(tx.valor) - Math.abs(buscaNum)) < 0.05;
          if (!bateTexto && !bateValor) return false;
        }
        return true;
      })
      .sort((a, b) => (b.data || '').localeCompare(a.data || '') || String(b.id).localeCompare(String(a.id)));

    const totEnt = filtrados
      .filter(x => x.valor > 0 && getCat(x.catId)?.tipo !== 'mov')
      .reduce((a, b) => a + valorLiquidoEntrada(b), 0);
    const totSai = filtrados
      .filter(x => x.valor < 0 && getCat(x.catId)?.tipo !== 'mov')
      .reduce((a, b) => a + valorLiquidoGasto(b), 0);
    $('#lancResumo').textContent = `${filtrados.length} ${filtrados.length === 1 ? 'lançamento' : 'lançamentos'} · +${moed(totEnt, true)} / -${moed(totSai, true)}`;

    const temSemCat = filtrados.some(x => !x.catId);
    $('#barTriagem').hidden = !(fSem || temSemCat);

    const visiveis = filtrados.slice(0, state.limiteLanc);
    const maisBtn = $('#lancMais');
    maisBtn.hidden = filtrados.length <= state.limiteLanc;

    const ul = $('#lanc');
    if (!visiveis.length) {
      ul.innerHTML = `<li class="vazia">Nenhum lançamento encontrado neste mês com os filtros atuais.</li>`;
      return;
    }

    const hoje = hojeStr();
    ul.innerHTML = visiveis.map(tx => {
      const dia = tx.data ? tx.data.slice(8, 10) : '--';
      const mesC = tx.data ? labelMesCurto(tx.data.slice(0, 7)) : '';
      const cat = getCat(tx.catId);
      const conta = getConta(tx.contaId);
      const tagCls = !cat ? 'tag sem' : cat.tipo === 'mov' ? 'tag mov' : 'tag';
      const tagTxt = cat ? labelCat(tx.catId, tx.subId) : 'Sem categoria';
      const ehFuturo = tx.data > hoje;

      let extraInfo = '';
      if (tx.abatido > 0) extraInfo += ` · abatido ${moed(tx.abatido)}`;
      if (tx.usadoAbate > 0) extraInfo += ` · abateu ${moed(tx.usadoAbate)}`;
      if (tx.rateioEsperado > (tx.abatido || 0)) extraInfo += ` · rateio pend. ${moed(tx.rateioEsperado - (tx.abatido || 0))}`;

      let chipsHtml = '';
      if (!cat) {
        const chips = sugerirChipsTriagem(tx);
        chipsHtml = `
          <div class="qcats">
            ${chips.map(ch => `<button type="button" class="${ch.cls}" data-qcat="${esc(ch.catId)}" data-qsub="${esc(ch.subId)}">${esc(ch.label)}</button>`).join('')}
            ${tx.valor > 0 ? `<button type="button" class="qchip qchip-rateio" data-qrateio="1">Rateio / Abater</button>` : ''}
            <button type="button" class="qchip qchip-out" data-qmais="1">Mais…</button>
          </div>
        `;
      } else if (tx.valor > 0 && cat.tipo !== 'mov' && (tx.usadoAbate || 0) === 0 && fSem) {
        chipsHtml = `
          <div class="qcats">
            <button type="button" class="qchip qchip-rateio" data-qrateio="1">Rateio / Abater</button>
          </div>
        `;
      }

      return `
        <li data-id="${esc(tx.id)}" class="${ehFuturo ? 'proj' : ''}">
          <div class="dia"><b>${dia}</b><span>${esc(mesC)}</span></div>
          <div class="desc">${esc(tx.desc)}</div>
          <div class="valor ${tx.valor > 0 ? 'pos' : ''}">${tx.valor > 0 ? '+ ' : ''}${moed(tx.valor)}</div>
          <div class="meta">
            <div class="meta-esq">
              <span class="${tagCls}">${esc(tagTxt)}${esc(extraInfo)}</span>
              ${tx.parcela ? `<span class="parc-tag">${esc(tx.parcela)}</span>` : ''}
            </div>
            <span class="ct">${esc(conta ? conta.nome : '')}</span>
          </div>
          ${chipsHtml}
        </li>
      `;
    }).join('');

    $$('li[data-id]', ul).forEach(li => {
      const tx = state.lancamentos.find(x => x.id === li.dataset.id);
      if (!tx) return;

      li.onclick = e => {
        if (e.target.closest('button')) return;
        abrirModalLancamento(tx);
      };

      $$('button[data-qcat]', li).forEach(btn => {
        btn.onclick = async e => {
          e.stopPropagation();
          tx.catId = btn.dataset.qcat;
          tx.subId = btn.dataset.qsub || '';
          await dbPutLanc(tx);
          treinarIA();
          toast(`Classificado em ${labelCat(tx.catId, tx.subId)}`);
          render();
        };
      });

      const btnRat = $('button[data-qrateio]', li);
      if (btnRat) {
        btnRat.onclick = e => {
          e.stopPropagation();
          abrirModalRateioEntrada(tx);
        };
      }

      const btnMais = $('button[data-qmais]', li);
      if (btnMais) {
        btnMais.onclick = e => {
          e.stopPropagation();
          abrirModalLancamento(tx);
        };
      }
    });
  }

  /* ========================================================================
     Importação OFX e CSV
     ======================================================================== */
  async function lerArquivoTexto(file) {
    const buf = await file.arrayBuffer();
    let txt = new TextDecoder('utf-8').decode(buf);
    if (txt.includes('\uFFFD') || /CHARSET:\s*1252|ISO-8859-1/i.test(txt.slice(0, 400))) {
      txt = new TextDecoder('windows-1252').decode(buf);
    }
    return txt.replace(/^\uFEFF/, '');
  }

  function limparDescOFX(name, memo) {
    const n = String(name || '').trim();
    const m = String(memo || '').trim();
    if (!n && !m) return 'Lançamento OFX';
    if (!n) return m;
    if (!m || norm(n) === norm(m)) return n;
    if (/^(COMPRA COM CARTAO|PIX - ENVIADO|PIX - RECEBIDO|PAGAMENTO|DEBITO|CREDITO)/i.test(norm(n))) {
      return `${m} · ${n}`;
    }
    return `${n} · ${m}`;
  }

  function parseOFX(txt, fileName) {
    const tagVal = (block, tag) => {
      const m = block.match(new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i'));
      return m ? m[1].trim() : '';
    };

    const org = tagVal(txt, 'ORG') || fileName.replace(/\.ofx$/i, '');
    const bankId = tagVal(txt, 'BANKID');
    const acctId = tagVal(txt, 'ACCTID') || 'principal';
    const acctType = tagVal(txt, 'ACCTTYPE').toUpperCase();
    const isCard = acctType === 'CREDITCARD' || /CREDITCARDMSGSRSV1/i.test(txt);

    const ledgerBlock = (txt.match(/<LEDGERBAL>[\s\S]*?<\/LEDGERBAL>/i) || [txt])[0];
    const balAmtRaw = tagVal(ledgerBlock, 'BALAMT') || tagVal(txt, 'BALAMT');
    const dtAsofRaw = tagVal(ledgerBlock, 'DTASOF') || tagVal(txt, 'DTASOF');
    const balAmt = balAmtRaw ? parseValor(balAmtRaw) : NaN;
    const dtAsof = dtAsofRaw ? parseData(dtAsofRaw) : null;

    const chaveConta = `ofx:${bankId}:${acctId}:${isCard ? 'cc' : 'ck'}`;
    const nomeConta = isCard
      ? `Cartão ${org}${acctId !== 'principal' ? ` (${acctId.slice(-4)})` : ''}`
      : `${org}${acctId !== 'principal' ? ` (${acctId})` : ''}`;

    const blocos = txt.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || [];
    const itens = [];

    for (const b of blocos) {
      const dt = parseData(tagVal(b, 'DTPOSTED'));
      let val = parseValor(tagVal(b, 'TRNAMT'));
      if (!dt || !Number.isFinite(val) || val === 0) continue;
      val = round2(val);

      const fitid = tagVal(b, 'FITID');
      const name = tagVal(b, 'NAME');
      const memo = tagVal(b, 'MEMO');
      const desc = limparDescOFX(name, memo);

      itens.push({
        data: dt,
        desc,
        valor: val,
        fitid: fitid || '',
        parcela: ''
      });
    }

    return {
      chaveConta,
      nomeConta,
      tipoConta: isCard ? 'cartao' : 'corrente',
      saldoExtrato: Number.isFinite(balAmt) ? round2(balAmt) : null,
      saldoExtratoData: dtAsof,
      itens
    };
  }

  function splitCSVLine(line, delim) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delim && !inQuotes) {
        out.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  }

  function parseCSVBruto(txt) {
    const linhas = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (linhas.length < 2) return null;

    const candDelims = [';', ',', '\t'];
    let delim = ';';
    let maxCols = 0;
    for (const d of candDelims) {
      const cols = splitCSVLine(linhas[0], d).length;
      if (cols > maxCols) {
        maxCols = cols;
        delim = d;
      }
    }
    if (maxCols < 2) return null;

    const rows = linhas.map(l => splitCSVLine(l, delim));
    const firstRow = rows[0];
    const hasHeader = firstRow.some(c => /data|date|desc|estab|hist|lanc|valor|amount|parcela/i.test(norm(c)));
    const headers = hasHeader ? firstRow : firstRow.map((_, idx) => `Coluna ${idx + 1}`);
    const dataRows = hasHeader ? rows.slice(1) : rows;

    return { headers, rows: dataRows };
  }

  function sugerirNomeContaCSV(fileName) {
    let base = fileName.replace(/\.(csv|txt)$/i, '');
    base = base.replace(/[-_ ]?\d{4}[-_]\d{2}(?:[-_]\d{2})?/g, '');
    base = base.replace(/[-_ ]?\d{2}[-_]\d{4}/g, '');
    base = base.replace(/[-_ ]+$/g, '').trim();
    if (!base || /^fatura$/i.test(base)) return 'Cartão de Crédito';
    return base.charAt(0).toUpperCase() + base.slice(1);
  }

  function abrirMapeamentoCSV(fileName, parsed) {
    const { headers, rows } = parsed;
    const hNorm = headers.map(norm);

    let idxData = hNorm.findIndex(h => /DATA|DATE|DT/.test(h));
    let idxDesc = hNorm.findIndex(h => /ESTABELECIMENTO|DESCRICAO|HISTORICO|TITULO|LANCAMENTO|MEMO|NAME/.test(h));
    let idxVal = hNorm.findIndex(h => /VALOR|AMOUNT|QUANTIA|CREDITO/.test(h));
    let idxDeb = hNorm.findIndex(h => /DEBITO|SAIDA/.test(h));
    let idxParc = hNorm.findIndex(h => /PARCELA/.test(h));

    if (idxData < 0) idxData = 0;
    if (idxDesc < 0) idxDesc = Math.min(1, headers.length - 1);
    if (idxVal < 0) idxVal = Math.min(2, headers.length - 1);

    const optsCols = headers.map((h, i) => `<option value="${i}">${esc(h)}</option>`).join('');
    $('#mData').innerHTML = optsCols;
    $('#mDesc').innerHTML = optsCols;
    $('#mValor').innerHTML = optsCols;
    $('#mDeb').innerHTML = `<option value="-1">Não (mesma coluna)</option>` + optsCols;

    $('#mData').value = String(idxData);
    $('#mDesc').value = String(idxDesc);
    $('#mValor').value = String(idxVal);
    $('#mDeb').value = String(idxDeb >= 0 && idxDeb !== idxVal ? idxDeb : -1);

    const pareceFatura = /FATURA|CARTAO|CARD/i.test(norm(fileName)) || idxParc >= 0 || hNorm.some(h => /ESTABELECIMENTO|PORTADOR/.test(h));
    const sampleVals = rows.slice(0, 12).map(r => parseValor(r[idxVal])).filter(Number.isFinite);
    const maioriaPos = sampleVals.filter(v => v > 0).length > sampleVals.length / 2;
    $('#mInv').checked = pareceFatura && maioriaPos && idxDeb < 0;

    const mConta = $('#mConta');
    const contaCartaoExistente = pareceFatura ? state.contas.find(c => c.tipo === 'cartao') : null;
    mConta.innerHTML = `<option value="__nova__">+ Criar nova conta / cartão</option>` +
      state.contas.map(c => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join('');

    if (contaCartaoExistente) {
      mConta.value = contaCartaoExistente.id;
      $('#mNomeL').hidden = true;
    } else {
      mConta.value = '__nova__';
      $('#mNomeL').hidden = false;
      $('#mNome').value = sugerirNomeContaCSV(fileName);
    }

    state.csvAtual = { fileName, parsed, idxParc, pareceFatura };
    $('#csvNome').textContent = `Arquivo: ${fileName} (${rows.length} linhas)`;
    $('#csvMap').hidden = false;
    atualizarPreviewCSV();
  }

  function extrairItensCSVAtual() {
    if (!state.csvAtual) return [];
    const { parsed, idxParc } = state.csvAtual;
    const iData = Number($('#mData').value);
    const iDesc = Number($('#mDesc').value);
    const iVal = Number($('#mValor').value);
    const iDeb = Number($('#mDeb').value);
    const inv = $('#mInv').checked;

    const itens = [];
    for (const r of parsed.rows) {
      const dt = parseData(r[iData]);
      const desc = String(r[iDesc] || '').trim();
      if (!dt || !desc) continue;

      let val = NaN;
      if (iDeb >= 0) {
        const vCred = parseValor(r[iVal]);
        const vDeb = parseValor(r[iDeb]);
        if (Number.isFinite(vDeb) && vDeb !== 0) val = -Math.abs(vDeb);
        else if (Number.isFinite(vCred) && vCred !== 0) val = Math.abs(vCred);
      } else {
        val = parseValor(r[iVal]);
        if (Number.isFinite(val) && inv) val = -val;
      }

      if (!Number.isFinite(val) || val === 0) continue;
      val = round2(val);

      let parcela = '';
      if (idxParc >= 0 && r[idxParc]) {
        const rawP = String(r[idxParc]).trim();
        const m = rawP.match(/(\d+)\s*(?:\/|de)\s*(\d+)/i);
        if (m && Number(m[2]) > 1) parcela = `${Number(m[1])}/${Number(m[2])}`;
      }

      itens.push({ data: dt, desc, valor: val, fitid: '', parcela });
    }
    return itens;
  }

  function atualizarPreviewCSV() {
    const itens = extrairItensCSVAtual().slice(0, 5);
    const prev = $('#csvPrev');
    if (!itens.length) {
      prev.innerHTML = `<p class="mut" style="color:var(--neg)">Nenhuma linha válida encontrada com essas colunas.</p>`;
      return;
    }
    prev.innerHTML = `
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr></thead>
        <tbody>
          ${itens.map(x => `
            <tr>
              <td>${x.data.slice(8, 10)}/${x.data.slice(5, 7)}/${x.data.slice(0, 4)}</td>
              <td>${esc(x.desc)} ${x.parcela ? `(${esc(x.parcela)})` : ''}</td>
              <td class="num ${x.valor > 0 ? 'pos' : ''}">${x.valor > 0 ? '+ ' : ''}${moed(x.valor)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  async function importarItens({ conta, itens, saldoExtrato = null, saldoExtratoData = null }) {
    if (typeof saldoExtrato === 'number' && Number.isFinite(saldoExtrato)) {
      if (!conta.saldoExtratoData || !saldoExtratoData || saldoExtratoData >= conta.saldoExtratoData) {
        conta.saldoExtrato = saldoExtrato;
        conta.saldoExtratoData = saldoExtratoData || hojeStr();
        conta.saldoInicialManual = false;
      }
    }

    const chavesExistentes = new Set();
    const fitidsExistentes = new Set();
    for (const tx of state.lancamentos) {
      if (tx.contaId !== conta.id) continue;
      if (tx.fitid) fitidsExistentes.add(tx.fitid);
      if (tx.hashImport) chavesExistentes.add(tx.hashImport);
    }

    const occNoArquivo = new Map();
    const novos = [];
    let duplicados = 0;
    let autoClassificados = 0;

    for (const it of itens) {
      const centavos = Math.round(it.valor * 100);
      const baseKey = `${conta.id}|${it.data}|${norm(it.desc)}|${centavos}`;
      const occ = (occNoArquivo.get(baseKey) || 0) + 1;
      occNoArquivo.set(baseKey, occ);
      const hashImport = `${baseKey}#${occ}`;

      if (it.fitid) {
        if (fitidsExistentes.has(it.fitid)) {
          duplicados++;
          continue;
        }
        fitidsExistentes.add(it.fitid);
      } else {
        if (chavesExistentes.has(hashImport)) {
          duplicados++;
          continue;
        }
      }
      chavesExistentes.add(hashImport);

      const sug = classificar(it.desc, it.valor);
      if (sug && sug.catId) autoClassificados++;

      novos.push({
        id: uid('tx'),
        contaId: conta.id,
        data: it.data,
        desc: it.desc,
        valor: it.valor,
        catId: sug ? sug.catId : '',
        subId: sug ? (sug.subId || '') : '',
        parcela: it.parcela || '',
        fitid: it.fitid || '',
        hashImport
      });
    }

    state.lancamentos.push(...novos);
    const paresTransf = conciliarTransferencias();
    for (const c of state.contas) {
      recalcularSaldoInicialPorExtrato(c);
    }

    await kvSet('contas', state.contas);
    await dbPutLanc(state.lancamentos);
    treinarIA();

    if (novos.length) {
      const maxData = novos.map(x => x.data).sort().pop();
      if (maxData) state.mes = maxData.slice(0, 7);
    }

    return {
      novos: novos.length,
      duplicados,
      autoClassificados,
      paresTransf,
      contaNome: conta.nome
    };
  }

  function adicionarResultadoImport(fileName, res, erro = '') {
    const box = $('#importRes');
    const div = document.createElement('div');
    if (erro) {
      div.className = 'res erro';
      div.innerHTML = `<b>${esc(fileName)}</b><br>${esc(erro)}`;
    } else {
      div.className = 'res';
      div.innerHTML = `
        <b>${esc(fileName)}</b> <span class="tag-n">${esc(res.contaNome)}</span><br>
        <b>${res.novos}</b> ${res.novos === 1 ? 'lançamento importado' : 'lançamentos importados'}
        ${res.duplicados ? ` · ${res.duplicados} repetidos ignorados` : ''}
        ${res.autoClassificados ? ` · ${res.autoClassificados} classificados sozinhos` : ''}
        ${res.paresTransf ? ` · ${res.paresTransf} transferência(s)/fatura(s) conciliada(s)` : ''}
      `;
    }
    box.prepend(div);
  }

  async function processarArquivosImport(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    for (const file of files) {
      try {
        const txt = await lerArquivoTexto(file);
        const ehOFX = /\.ofx$/i.test(file.name) || /<OFX>|<STMTTRN>/i.test(txt);

        if (ehOFX) {
          const parsed = parseOFX(txt, file.name);
          if (!parsed.itens.length) {
            adicionarResultadoImport(file.name, null, 'Nenhum lançamento encontrado neste arquivo OFX.');
            continue;
          }
          let conta = state.contas.find(c => c.chaveOfx === parsed.chaveConta);
          if (!conta) {
            conta = {
              id: uid('ct'),
              chaveOfx: parsed.chaveConta,
              nome: parsed.nomeConta,
              tipo: parsed.tipoConta,
              saldoInicial: 0,
              fechaDia: parsed.tipoConta === 'cartao' ? 20 : null
            };
            state.contas.push(conta);
          }
          const res = await importarItens({
            conta,
            itens: parsed.itens,
            saldoExtrato: parsed.saldoExtrato,
            saldoExtratoData: parsed.saldoExtratoData
          });
          adicionarResultadoImport(file.name, res);
        } else {
          const parsed = parseCSVBruto(txt);
          if (!parsed) {
            adicionarResultadoImport(file.name, null, 'Não foi possível ler colunas válidas neste CSV.');
            continue;
          }
          state.csvFila.push({ fileName: file.name, parsed });
        }
      } catch (err) {
        adicionarResultadoImport(file.name, null, `Erro ao ler arquivo: ${err.message || err}`);
      }
    }

    avancarFilaCSV();
    render();
  }

  function avancarFilaCSV() {
    if (!state.csvAtual && state.csvFila.length > 0) {
      const prox = state.csvFila.shift();
      abrirMapeamentoCSV(prox.fileName, prox.parsed);
    }
  }

  /* ========================================================================
     Orçamento e Ajustes
     ======================================================================== */
  function media3MesesCat(catId) {
    const meses = [addMes(state.mes, -3), addMes(state.mes, -2), addMes(state.mes, -1)];
    let soma = 0;
    let qtd = 0;
    for (const m of meses) {
      const r = resumoMes(m);
      if (r.saiu > 0) {
        soma += r.porCat[catId] || 0;
        qtd++;
      }
    }
    if (!qtd) return 0;
    return Math.round((soma / qtd) / 10) * 10;
  }

  function renderOrcamento() {
    const cats = state.categorias.filter(c => c.tipo === 'gasto');
    const box = $('#orcLista');
    box.innerHTML = cats.map(c => {
      const val = Number(state.orcamentos[c.id]) || '';
      const sug = media3MesesCat(c.id);
      return `
        <div class="orc-l">
          <div>
            <b>${esc(c.nome)}</b>
            <span class="sug">${sug > 0 ? `Média recente: ${moed(sug, true)}/mês` : 'Sem histórico anterior'}</span>
          </div>
          <input type="number" inputmode="decimal" min="0" step="10" placeholder="Sem limite" data-orc="${esc(c.id)}" value="${val}">
        </div>
      `;
    }).join('');

    const atualizarTotal = () => {
      const tot = Object.values(state.orcamentos).reduce((a, b) => a + (Number(b) || 0), 0);
      $('#orcTotal').textContent = moed(tot);
    };
    atualizarTotal();

    $$('input[data-orc]', box).forEach(inp => {
      inp.onchange = async () => {
        const cid = inp.dataset.orc;
        const v = Math.max(0, Number(inp.value) || 0);
        if (v > 0) state.orcamentos[cid] = v;
        else delete state.orcamentos[cid];
        await kvSet('orcamentos', state.orcamentos);
        atualizarTotal();
        toast('Orçamento atualizado');
      };
    });
  }

  function atualizarSelectSubRegra() {
    const rCat = $('#rCat');
    const rSub = $('#rSub');
    const c = getCat(rCat.value);
    if (c && Array.isArray(c.subs) && c.subs.length) {
      rSub.hidden = false;
      rSub.innerHTML = `<option value="">Qualquer subcategoria</option>` +
        c.subs.map(s => `<option value="${esc(s.id)}">${esc(s.nome)}</option>`).join('');
    } else {
      rSub.hidden = true;
      rSub.innerHTML = '';
    }
  }

  function renderAjustes() {
    $('#ver').textContent = VERSAO;

    const temaSalvo = localStorage.getItem('bolso-tema') || 'auto';
    $('#tema').value = temaSalvo;

    const ulContas = $('#contas');
    if (!state.contas.length) {
      ulContas.innerHTML = `<li style="cursor:default"><span class="mut">Nenhuma conta cadastrada ainda.</span></li>`;
    } else {
      ulContas.innerHTML = state.contas.map(c => {
        const tipoLbl = c.tipo === 'cartao' ? 'Cartão de crédito' : c.tipo === 'poupanca' ? 'Poupança' : 'Conta corrente';
        const info = c.tipo === 'cartao'
          ? `Fecha dia ${c.fechaDia || 20}`
          : `Saldo atual: ${moed(calcularSaldoConta(c))}`;
        return `
          <li data-conta-id="${esc(c.id)}">
            <div>
              <b>${esc(c.nome)}</b>
              <small>${tipoLbl} · ${info}</small>
            </div>
            <span class="seta">›</span>
          </li>
        `;
      }).join('');
      $$('li[data-conta-id]', ulContas).forEach(li => {
        li.onclick = () => {
          const c = getConta(li.dataset.contaId);
          if (c) abrirModalConta(c);
        };
      });
    }

    const ulRegras = $('#regras');
    if (!state.regras.length) {
      ulRegras.innerHTML = `<li><span class="mut">Nenhuma regra personalizada criada ainda.</span></li>`;
    } else {
      ulRegras.innerHTML = state.regras.map((r, idx) => `
        <li>
          <div>
            <b>${esc(r.texto)}</b>
            <small>→ ${esc(labelCat(r.catId, r.subId))}</small>
          </div>
          <button type="button" class="x" data-del-regra="${idx}" title="Remover regra">×</button>
        </li>
      `).join('');
      $$('button[data-del-regra]', ulRegras).forEach(btn => {
        btn.onclick = async () => {
          state.regras.splice(Number(btn.dataset.delRegra), 1);
          await kvSet('regras', state.regras);
          renderAjustes();
          toast('Regra removida');
        };
      });
    }

    $('#rCat').innerHTML = state.categorias.map(c => `<option value="${esc(c.id)}">${esc(c.nome)}</option>`).join('');
    atualizarSelectSubRegra();

    const vocabCount = Object.keys(state.ia.vocab).length;
    $('#iaStatus').textContent = state.ia.totalDocs >= 3
      ? `Aprendizado ativo: ${state.ia.totalDocs} lançamentos analisados (${vocabCount} palavras-chave).`
      : `Classifique pelo menos 3 lançamentos para ativar as sugestões inteligentes.`;

    $('#regrasPadraoT').textContent = `Ver ${REGRAS_PADRAO.length} regras automáticas embutidas`;
    $('#regrasPadrao').innerHTML = REGRAS_PADRAO.map(r => `
      <li>
        <span><b>${esc(r.texto)}</b></span>
        <span class="mut">${esc(labelCat(r.catId, r.subId))}</span>
      </li>
    `).join('');

    const ulCats = $('#cats-lista');
    ulCats.innerHTML = state.categorias.map(c => {
      const subsTxt = (c.subs && c.subs.length)
        ? c.subs.map(s => s.nome).join(', ')
        : 'Sem subcategorias';
      return `
        <li data-cat-edit="${esc(c.id)}">
          <div>
            <b>${esc(c.nome)}</b>
            <small>${esc(subsTxt)}</small>
          </div>
          <span class="seta">›</span>
        </li>
      `;
    }).join('');
    $$('li[data-cat-edit]', ulCats).forEach(li => {
      li.onclick = () => {
        const c = getCat(li.dataset.catEdit);
        if (c) abrirModalCategoria(c);
      };
    });

    const ultBk = Number(localStorage.getItem('bolso-ultimo-backup') || 0);
    $('#bkInfo').textContent = ultBk
      ? `Última cópia salva em ${new Date(ultBk).toLocaleDateString('pt-BR')}.`
      : 'Nenhuma cópia salva neste navegador ainda.';
  }

  /* ========================================================================
     Modais (Lançamento, Rateio/Abate, Conta, Categoria)
     ======================================================================== */
  function abrirModal({ titulo, desc = '', html, okTexto = 'Salvar', extraTexto = '', onExtra = null, onOk, onOpen = null }) {
    const dlg = $('#dlg');
    $('#dlgTitulo').textContent = titulo;
    $('#dlgDesc').textContent = desc;
    $('#dlgDesc').hidden = !desc;
    $('#dlgCorpo').innerHTML = html;
    $('#dlgOk').textContent = okTexto;

    const btnExtra = $('#dlgExtra');
    if (extraTexto) {
      btnExtra.hidden = false;
      btnExtra.textContent = extraTexto;
      btnExtra.onclick = async () => {
        if (onExtra) await onExtra();
        dlg.close();
      };
    } else {
      btnExtra.hidden = true;
      btnExtra.onclick = null;
    }

    $('#dlgCancel').onclick = () => dlg.close();
    $('#dlgForm').onsubmit = async e => {
      e.preventDefault();
      const ok = await onOk();
      if (ok !== false) dlg.close();
    };

    dlg.showModal();
    if (onOpen) onOpen();
  }

  function abrirModalLancamento(tx = null) {
    const novo = !tx;
    const tipoIni = tx
      ? (getCat(tx.catId)?.tipo === 'mov' ? 'mov' : tx.valor > 0 ? 'receita' : 'gasto')
      : 'gasto';

    const contaOpts = state.contas.length
      ? state.contas.map(c => `<option value="${esc(c.id)}" ${tx && tx.contaId === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')
      : `<option value="__padrao__">Carteira / Conta Principal</option>`;

    abrirModal({
      titulo: novo ? 'Novo lançamento' : 'Editar lançamento',
      desc: tx && tx.abatido > 0 ? `Já possui ${moed(tx.abatido)} abatidos por reembolso.` : '',
      extraTexto: novo ? '' : 'Excluir',
      onExtra: novo ? null : async () => {
        const ct = getConta(tx.contaId);
        state.lancamentos = state.lancamentos.filter(x => x.id !== tx.id);
        await dbDelLanc(tx.id);
        if (ct && recalcularSaldoInicialPorExtrato(ct)) {
          await kvSet('contas', state.contas);
        }
        treinarIA();
        toast('Lançamento excluído');
        render();
      },
      html: `
        <div class="grid2">
          <label>Data<input type="date" id="dlData" required value="${esc(tx ? tx.data : hojeStr())}"></label>
          <label>Valor (R$)<input type="number" id="dlValor" inputmode="decimal" step="0.01" min="0.01" required value="${tx ? Math.abs(tx.valor).toFixed(2) : ''}"></label>
        </div>
        <label>Descrição<input id="dlDesc" maxlength="100" required placeholder="Ex.: Supermercado, Salário, Pix..." value="${esc(tx ? tx.desc : '')}"></label>
        <div class="grid2">
          <label>Tipo
            <select id="dlTipo">
              <option value="gasto" ${tipoIni === 'gasto' ? 'selected' : ''}>Gasto (saída)</option>
              <option value="receita" ${tipoIni === 'receita' ? 'selected' : ''}>Entrada (receita)</option>
              <option value="mov" ${tipoIni === 'mov' ? 'selected' : ''}>Não conta (transf./fatura)</option>
            </select>
          </label>
          <label>Conta ou cartão<select id="dlConta">${contaOpts}</select></label>
        </div>
        <div class="grid2">
          <label>Categoria<select id="dlCat"></select></label>
          <label id="dlSubWrap">Subcategoria<select id="dlSub"></select></label>
        </div>
        ${novo ? `
          <label>Parcelas
            <select id="dlParc">
              <option value="1">À vista (1x)</option>
              ${Array.from({ length: 23 }, (_, i) => `<option value="${i + 2}">${i + 2}x</option>`).join('')}
            </select>
          </label>
        ` : ''}
        <label id="dlRatWrap">Valor a receber de rateio (opcional)
          <input type="number" id="dlRat" inputmode="decimal" step="0.01" min="0" placeholder="0,00" value="${tx && tx.rateioEsperado ? Number(tx.rateioEsperado).toFixed(2) : ''}">
        </label>
        <label class="chk"><input type="checkbox" id="dlRegra"> Criar regra automática para lançamentos parecidos</label>
      `,
      onOpen: () => {
        const dlTipo = $('#dlTipo');
        const dlCat = $('#dlCat');
        const dlSub = $('#dlSub');
        const dlSubWrap = $('#dlSubWrap');
        const dlRatWrap = $('#dlRatWrap');

        const syncSubs = () => {
          const c = getCat(dlCat.value);
          if (c && c.subs && c.subs.length) {
            dlSubWrap.hidden = false;
            dlSub.innerHTML = `<option value="">Geral</option>` +
              c.subs.map(s => `<option value="${esc(s.id)}" ${tx && tx.subId === s.id ? 'selected' : ''}>${esc(s.nome)}</option>`).join('');
          } else {
            dlSubWrap.hidden = true;
            dlSub.innerHTML = '';
          }
        };

        const syncCats = () => {
          const t = dlTipo.value;
          dlRatWrap.hidden = t !== 'gasto';
          const list = state.categorias.filter(c => c.tipo === t);
          dlCat.innerHTML = list.map(c => `<option value="${esc(c.id)}" ${tx && tx.catId === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('');
          if (tx && tx.catId && list.some(c => c.id === tx.catId)) dlCat.value = tx.catId;
          syncSubs();
        };

        dlTipo.onchange = syncCats;
        dlCat.onchange = syncSubs;
        syncCats();
      },
      onOk: async () => {
        const data = $('#dlData').value;
        const absVal = Math.abs(parseValor($('#dlValor').value));
        const desc = $('#dlDesc').value.trim();
        const tipo = $('#dlTipo').value;
        const catId = $('#dlCat').value;
        const subId = $('#dlSub').value || '';
        const rat = Math.max(0, parseValor($('#dlRat').value) || 0);
        if (!data || !Number.isFinite(absVal) || absVal <= 0 || !desc) return false;

        let contaId = $('#dlConta').value;
        if (contaId === '__padrao__') {
          const ct = { id: uid('ct'), nome: 'Conta Principal', tipo: 'corrente', saldoInicial: 0 };
          state.contas.push(ct);
          contaId = ct.id;
          await kvSet('contas', state.contas);
        }

        const sinal = tipo === 'receita' ? 1 : -1;
        const valorFinal = round2(sinal * absVal);

        if (novo) {
          const nParc = Number($('#dlParc')?.value || 1);
          const criados = [];
          for (let p = 1; p <= nParc; p++) {
            const dtP = p === 1 ? data : `${addMes(data.slice(0, 7), p - 1)}-${data.slice(8, 10)}`;
            criados.push({
              id: uid('tx'),
              contaId,
              data: dtP,
              desc,
              valor: valorFinal,
              catId,
              subId,
              parcela: nParc > 1 ? `${p}/${nParc}` : '',
              rateioEsperado: p === 1 && rat > 0 ? round2(rat) : 0
            });
          }
          state.lancamentos.push(...criados);
          await dbPutLanc(criados);
          state.mes = data.slice(0, 7);
        } else {
          const contaAntigaId = tx.contaId;
          tx.data = data;
          tx.desc = desc;
          tx.valor = valorFinal;
          tx.contaId = contaId;
          tx.catId = catId;
          tx.subId = subId;
          tx.rateioEsperado = tipo === 'gasto' ? round2(rat) : 0;
          await dbPutLanc(tx);

          let mudouConta = false;
          for (const cid of new Set([contaAntigaId, contaId])) {
            const ct = getConta(cid);
            if (ct && recalcularSaldoInicialPorExtrato(ct)) mudouConta = true;
          }
          if (mudouConta) await kvSet('contas', state.contas);
        }

        if ($('#dlRegra').checked) {
          const tokens = tokenizar(desc);
          const chave = tokens.length ? tokens.slice(0, 2).join(' ') : norm(desc).slice(0, 24);
          if (chave && !state.regras.some(r => norm(r.texto) === chave)) {
            state.regras.push({ texto: chave, catId, subId });
            await kvSet('regras', state.regras);
          }
        }

        treinarIA();
        toast(novo ? 'Lançamento salvo' : 'Alterações salvas');
        render();
      }
    });
  }

  function abrirModalRateioEntrada(txEntrada) {
    const gastosCandidatos = state.lancamentos
      .filter(x => x.valor < 0 && valorLiquidoGasto(x) > 0.05)
      .sort((a, b) => {
        const aPend = (Number(a.rateioEsperado) > (Number(a.abatido) || 0)) ? 1 : 0;
        const bPend = (Number(b.rateioEsperado) > (Number(b.abatido) || 0)) ? 1 : 0;
        if (aPend !== bPend) return bPend - aPend;
        return (b.data || '').localeCompare(a.data || '');
      })
      .slice(0, 40);

    if (!gastosCandidatos.length) {
      toast('Nenhum gasto disponível para abater');
      return;
    }

    const dispEntrada = valorLiquidoEntrada(txEntrada);

    abrirModal({
      titulo: 'Rateio / Abater gasto',
      desc: `Entrada: ${txEntrada.desc} (${moed(dispEntrada)})`,
      html: `
        <label>Escolha o gasto que será abatido
          <select id="rtAlvo">
            ${gastosCandidatos.map(g => {
              const liq = valorLiquidoGasto(g);
              const pend = Number(g.rateioEsperado) > (Number(g.abatido) || 0) ? ' [Rateio pendente]' : '';
              return `<option value="${esc(g.id)}">${g.data.slice(8, 10)}/${g.data.slice(5, 7)} · ${esc(g.desc)} (${moed(liq)})${pend}</option>`;
            }).join('')}
          </select>
        </label>
        <label>Valor a abater (R$)
          <input type="number" id="rtValor" inputmode="decimal" step="0.01" min="0.01" max="${dispEntrada}" value="${dispEntrada.toFixed(2)}">
        </label>
        <div class="split-preview" id="rtPrev"></div>
      `,
      onOpen: () => {
        const syncPrev = () => {
          const alvo = state.lancamentos.find(x => x.id === $('#rtAlvo').value);
          const v = Math.min(dispEntrada, Math.max(0, parseValor($('#rtValor').value) || 0));
          if (!alvo) return;
          const novoGasto = round2(Math.max(0, valorLiquidoGasto(alvo) - v));
          $('#rtPrev').innerHTML = `O gasto <b>${esc(alvo.desc)}</b> passará a contar como <b class="num">${moed(novoGasto)}</b> no orçamento e esta entrada não inflará suas receitas.`;
        };
        $('#rtAlvo').onchange = syncPrev;
        $('#rtValor').oninput = syncPrev;
        syncPrev();
      },
      onOk: async () => {
        const alvo = state.lancamentos.find(x => x.id === $('#rtAlvo').value);
        if (!alvo) return false;
        const maxAbate = Math.min(dispEntrada, valorLiquidoGasto(alvo));
        const v = round2(Math.min(maxAbate, Math.max(0, parseValor($('#rtValor').value) || 0)));
        if (v <= 0) return false;

        alvo.abatido = round2((Number(alvo.abatido) || 0) + v);
        txEntrada.usadoAbate = round2((Number(txEntrada.usadoAbate) || 0) + v);
        if (!txEntrada.catId) txEntrada.catId = 'transf';

        await dbPutLanc([alvo, txEntrada]);
        toast(`Abatido ${moed(v)} em ${alvo.desc}`);
        render();
      }
    });
  }

  function abrirModalConta(conta) {
    const temExtrato = typeof conta.saldoExtrato === 'number' && Number.isFinite(conta.saldoExtrato);

    abrirModal({
      titulo: 'Editar conta ou cartão',
      desc: temExtrato && conta.tipo !== 'cartao'
        ? `Último extrato (${conta.saldoExtratoData || 'OFX'}): ${moed(conta.saldoExtrato)}`
        : '',
      extraTexto: 'Excluir conta',
      onExtra: async () => {
        state.contas = state.contas.filter(c => c.id !== conta.id);
        state.lancamentos = state.lancamentos.filter(tx => tx.contaId !== conta.id);
        await kvSet('contas', state.contas);
        await dbDelLancPorConta(conta.id);
        treinarIA();
        toast('Conta e lançamentos removidos');
        render();
      },
      html: `
        <label>Nome<input id="ctNome" maxlength="40" required value="${esc(conta.nome)}"></label>
        <label>Titular da conta (opcional, ajuda a detectar Pix entre suas contas)
          <input id="ctTitular" maxlength="60" placeholder="Ex.: Antonio Roberto" value="${esc(conta.titular || '')}">
        </label>
        <label>Tipo
          <select id="ctTipo">
            <option value="corrente" ${conta.tipo === 'corrente' ? 'selected' : ''}>Conta corrente</option>
            <option value="poupanca" ${conta.tipo === 'poupanca' ? 'selected' : ''}>Poupança / Investimento</option>
            <option value="cartao" ${conta.tipo === 'cartao' ? 'selected' : ''}>Cartão de crédito</option>
          </select>
        </label>
        <label id="ctSaldoWrap">Saldo inicial (R$)
          <input type="number" id="ctSaldo" inputmode="decimal" step="0.01" value="${Number(conta.saldoInicial || 0).toFixed(2)}">
        </label>
        ${temExtrato ? `<label class="chk" id="ctAutoWrap"><input type="checkbox" id="ctAutoExtrato" ${!conta.saldoInicialManual ? 'checked' : ''}> Ajustar saldo inicial automaticamente pelo extrato OFX</label>` : ''}
        <label id="ctFechaWrap">Dia de fechamento da fatura
          <input type="number" id="ctFecha" min="1" max="31" value="${conta.fechaDia || 20}">
        </label>
      `,
      onOpen: () => {
        const sync = () => {
          const cc = $('#ctTipo').value === 'cartao';
          $('#ctSaldoWrap').hidden = cc;
          $('#ctFechaWrap').hidden = !cc;
          const autoWrap = $('#ctAutoWrap');
          if (autoWrap) autoWrap.hidden = cc;
        };
        $('#ctTipo').onchange = sync;
        sync();
      },
      onOk: async () => {
        const nome = $('#ctNome').value.trim();
        if (!nome) return false;
        conta.nome = nome;
        conta.titular = $('#ctTitular').value.trim();
        conta.tipo = $('#ctTipo').value;
        if (conta.tipo === 'cartao') {
          conta.fechaDia = Math.min(31, Math.max(1, Number($('#ctFecha').value) || 20));
        } else {
          const autoChk = $('#ctAutoExtrato');
          if (autoChk && autoChk.checked) {
            conta.saldoInicialManual = false;
            recalcularSaldoInicialPorExtrato(conta);
          } else {
            const novoSaldo = round2(parseValor($('#ctSaldo').value) || 0);
            if (Math.abs(novoSaldo - (Number(conta.saldoInicial) || 0)) >= 0.005) {
              conta.saldoInicialManual = true;
            }
            conta.saldoInicial = novoSaldo;
          }
        }
        if (conta.titular) {
          for (const tx of state.lancamentos) {
            if (!tx.catId && pareceMesmaTitularidade(norm(tx.desc))) {
              tx.catId = 'transf';
              tx.subId = '';
            }
          }
          await dbPutLanc(state.lancamentos);
        }
        await kvSet('contas', state.contas);
        toast('Conta atualizada');
        render();
      }
    });
  }

  function abrirModalCategoria(cat) {
    const ehPadrao = CATS_PADRAO.some(c => c.id === cat.id);
    if (!Array.isArray(cat.subs)) cat.subs = [];

    abrirModal({
      titulo: 'Editar categoria',
      extraTexto: ehPadrao ? '' : 'Excluir',
      onExtra: ehPadrao ? null : async () => {
        state.categorias = state.categorias.filter(c => c.id !== cat.id);
        for (const tx of state.lancamentos) {
          if (tx.catId === cat.id) {
            tx.catId = '';
            tx.subId = '';
          }
        }
        await kvSet('categorias', state.categorias);
        await dbPutLanc(state.lancamentos);
        toast('Categoria excluída');
        render();
      },
      html: `
        <label>Nome<input id="edCatNome" maxlength="40" required value="${esc(cat.nome)}"></label>
        <div class="grid2">
          <label>Tipo
            <select id="edCatTipo">
              <option value="gasto" ${cat.tipo === 'gasto' ? 'selected' : ''}>Gasto</option>
              <option value="receita" ${cat.tipo === 'receita' ? 'selected' : ''}>Entrada</option>
              <option value="mov" ${cat.tipo === 'mov' ? 'selected' : ''}>Não conta</option>
            </select>
          </label>
          <label>Cor<input type="color" id="edCatCor" value="${esc(cat.cor || '#0f5257')}" style="padding:4px;height:42px"></label>
        </div>
        <div class="sub-box">
          <span class="sub-box-tit">Subcategorias</span>
          <ul class="sub-lista" id="edSubLista"></ul>
          <div class="row">
            <input id="edNovaSub" placeholder="Nova subcategoria" maxlength="35">
            <button type="button" class="btn sm" id="edAddSub">Adicionar</button>
          </div>
        </div>
      `,
      onOpen: () => {
        const renderSubs = () => {
          const ul = $('#edSubLista');
          if (!cat.subs.length) {
            ul.innerHTML = `<li class="vazio-sub">Nenhuma subcategoria ainda.</li>`;
            return;
          }
          ul.innerHTML = cat.subs.map((s, idx) => `
            <li>
              <span>${esc(s.nome)}</span>
              <button type="button" class="x" data-del-sub="${idx}" title="Remover">×</button>
            </li>
          `).join('');
          $$('button[data-del-sub]', ul).forEach(b => {
            b.onclick = () => {
              cat.subs.splice(Number(b.dataset.delSub), 1);
              renderSubs();
            };
          });
        };
        renderSubs();

        $('#edAddSub').onclick = () => {
          const nomeSub = $('#edNovaSub').value.trim();
          if (!nomeSub) return;
          cat.subs.push({ id: uid('sub'), nome: nomeSub });
          $('#edNovaSub').value = '';
          renderSubs();
        };
      },
      onOk: async () => {
        const nome = $('#edCatNome').value.trim();
        if (!nome) return false;
        cat.nome = nome;
        cat.tipo = $('#edCatTipo').value;
        cat.cor = $('#edCatCor').value || '#0f5257';
        await kvSet('categorias', state.categorias);
        toast('Categoria salva');
        render();
      }
    });
  }

  /* ========================================================================
     Backup, Exportação CSV e Dados de Exemplo
     ======================================================================== */
  function exportarBackup() {
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
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bolso-backup-${hojeStr()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    localStorage.setItem('bolso-ultimo-backup', String(Date.now()));
    toast('Cópia de segurança salva');
    render();
  }

  async function restaurarBackup(file) {
    try {
      const txt = await file.text();
      const data = JSON.parse(txt);
      if (!data || !Array.isArray(data.lancamentos) || !Array.isArray(data.categorias)) {
        toast('Arquivo de cópia inválido');
        return;
      }
      state.exemplo = false;
      state.contas = data.contas || [];
      state.categorias = data.categorias;
      state.regras = data.regras || [];
      state.orcamentos = data.orcamentos || {};
      state.fixasOcultas = data.fixasOcultas || [];
      state.lancamentos = data.lancamentos;

      conciliarTransferencias();
      for (const c of state.contas) {
        recalcularSaldoInicialPorExtrato(c);
      }

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
      toast(`Cópia restaurada (${state.lancamentos.length} lançamentos)`);
      irPara('painel');
    } catch {
      toast('Não foi possível ler o arquivo de cópia');
    }
  }

  function exportarCSV() {
    const linhas = ['Data;Descricao;Valor;Categoria;Subcategoria;Conta;Parcela'];
    for (const tx of state.lancamentos) {
      const c = getCat(tx.catId);
      const s = c && c.subs ? c.subs.find(x => x.id === tx.subId) : null;
      const ct = getConta(tx.contaId);
      linhas.push([
        tx.data,
        `"${String(tx.desc || '').replace(/"/g, '""')}"`,
        Number(tx.valor).toFixed(2).replace('.', ','),
        `"${c ? c.nome : ''}"`,
        `"${s ? s.nome : ''}"`,
        `"${ct ? ct.nome : ''}"`,
        tx.parcela || ''
      ].join(';'));
    }
    const blob = new Blob(['\uFEFF' + linhas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `bolso-lancamentos-${hojeStr()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('CSV exportado');
  }

  function ativarExemplo() {
    state.exemplo = true;
    state.mes = mesAtualStr();
    state.contas = [
      { id: 'ex_cc', nome: 'Conta Principal', tipo: 'corrente', saldoInicial: 3420 },
      { id: 'ex_card', nome: 'Cartão Nubank', tipo: 'cartao', saldoInicial: 0, fechaDia: 20 }
    ];
    state.categorias = JSON.parse(JSON.stringify(CATS_PADRAO));
    state.orcamentos = {
      alimentacao: 1600,
      moradia: 2400,
      transporte: 600,
      saude: 450,
      lazer: 500,
      compras: 400
    };

    const lancs = [];
    for (let i = -3; i <= 0; i++) {
      const ym = addMes(state.mes, i);
      lancs.push(
        { id: uid('ex'), contaId: 'ex_cc', data: `${ym}-05`, desc: 'Salário Mensal', valor: 7800, catId: 'salario', subId: '' },
        { id: uid('ex'), contaId: 'ex_cc', data: `${ym}-10`, desc: 'Aluguel e Condomínio', valor: -1950, catId: 'moradia', subId: 'aluguel' },
        { id: uid('ex'), contaId: 'ex_cc', data: `${ym}-12`, desc: 'Cemig Energia', valor: -165.40, catId: 'moradia', subId: 'energia' },
        { id: uid('ex'), contaId: 'ex_cc', data: `${ym}-15`, desc: 'Vivo Fibra Internet', valor: -119.90, catId: 'moradia', subId: 'internet' },
        { id: uid('ex'), contaId: 'ex_card', data: `${ym}-04`, desc: 'Supermercado Verdemar', valor: -542.80, catId: 'alimentacao', subId: 'mercado' },
        { id: uid('ex'), contaId: 'ex_card', data: `${ym}-14`, desc: 'Sacolão e Padaria', valor: -238.50, catId: 'alimentacao', subId: 'mercado' },
        { id: uid('ex'), contaId: 'ex_card', data: `${ym}-16`, desc: 'Restaurante Sabores', valor: -146.00, catId: 'alimentacao', subId: 'restaurante', rateioEsperado: i === 0 ? 73.00 : 0 },
        { id: uid('ex'), contaId: 'ex_card', data: `${ym}-08`, desc: 'Uber Viagens', valor: -84.30, catId: 'transporte', subId: 'app' },
        { id: uid('ex'), contaId: 'ex_card', data: `${ym}-11`, desc: 'Posto Ipiranga', valor: -210.00, catId: 'transporte', subId: 'combustivel' },
        { id: uid('ex'), contaId: 'ex_card', data: `${ym}-07`, desc: 'Drogasil Farmácia', valor: -94.20, catId: 'saude', subId: 'farmacia' },
        { id: uid('ex'), contaId: 'ex_card', data: `${ym}-09`, desc: 'Academia Smart Fit', valor: -139.90, catId: 'saude', subId: 'academia' },
        { id: uid('ex'), contaId: 'ex_card', data: `${ym}-13`, desc: 'Spotify & Streaming', valor: -44.80, catId: 'assinaturas', subId: 'streaming' }
      );
    }
    lancs.push({ id: uid('ex'), contaId: 'ex_cc', data: `${state.mes}-17`, desc: 'PIX ENVIADO CAFETERIA CENTRAL', valor: -32.50, catId: '', subId: '' });

    state.lancamentos = lancs;
    treinarIA();
    render();
  }

  /* ========================================================================
     PWA / Instalação e Eventos Globais
     ======================================================================== */
  function configurarPWA() {
    if ('serviceWorker' in navigator) {
      let recarregando = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (recarregando) return;
        recarregando = true;
        window.location.reload();
      });
      navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.update().catch(() => {});
      }).catch(() => {});
    }

    const oculto = localStorage.getItem('bolso-ocultar-instalar') === '1';
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      state.installPrompt = e;
      if (!oculto && !standalone) {
        $('#cardInstalar').hidden = false;
      }
    });

    if (isIOS && !standalone && !oculto) {
      $('#cardInstalar').hidden = false;
      $('#instalarTxt').innerHTML = 'No Safari, toque em <b>Compartilhar</b> (ícone de seta para cima) e depois em <b>Adicionar à Tela de Início</b>.';
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
      localStorage.setItem('bolso-ocultar-instalar', '1');
      $('#cardInstalar').hidden = true;
    };
  }

  function bindEventos() {
    $$('[data-go]').forEach(el => {
      el.onclick = () => irPara(el.dataset.go);
    });

    $('#mesAnt').onclick = () => { state.mes = addMes(state.mes, -1); state.limiteLanc = 60; render(); };
    $('#mesProx').onclick = () => { state.mes = addMes(state.mes, 1); state.limiteLanc = 60; render(); };

    $('#btnNovoTop').onclick = () => abrirModalLancamento(null);
    $('#btnNovo').onclick = () => abrirModalLancamento(null);

    if (localStorage.getItem('bolso-privado') === '1') {
      document.body.classList.add('privado');
    }
    $('#btnPriv').onclick = () => {
      const on = document.body.classList.toggle('privado');
      localStorage.setItem('bolso-privado', on ? '1' : '0');
    };

    $('#btnExemplo').onclick = ativarExemplo;
    $('#sairExemplo').onclick = async () => {
      state.exemplo = false;
      state.mes = mesAtualStr();
      await carregarDadosReais();
      render();
    };

    $('#busca').oninput = () => { state.limiteLanc = 60; renderLancamentos(); };
    $('#fCat').onchange = () => { state.limiteLanc = 60; renderLancamentos(); };
    $('#fConta').onchange = () => { state.limiteLanc = 60; renderLancamentos(); };
    $('#fSem').onchange = () => { state.limiteLanc = 60; renderLancamentos(); };
    $('#lancMais').onclick = () => { state.limiteLanc += 60; renderLancamentos(); };

    const drop = $('#drop');
    const arq = $('#arquivo');
    arq.onchange = () => {
      processarArquivosImport(arq.files);
      arq.value = '';
    };
    drop.ondragover = e => { e.preventDefault(); drop.classList.add('sobre'); };
    drop.ondragleave = () => drop.classList.remove('sobre');
    drop.ondrop = e => {
      e.preventDefault();
      drop.classList.remove('sobre');
      processarArquivosImport(e.dataTransfer.files);
    };

    ['#mData', '#mDesc', '#mValor', '#mDeb', '#mInv'].forEach(sel => {
      $(sel).onchange = atualizarPreviewCSV;
    });
    $('#mConta').onchange = () => {
      $('#mNomeL').hidden = $('#mConta').value !== '__nova__';
    };
    $('#csvCancel').onclick = () => {
      state.csvAtual = null;
      $('#csvMap').hidden = true;
      avancarFilaCSV();
    };
    $('#csvOk').onclick = async () => {
      if (!state.csvAtual) return;
      const itens = extrairItensCSVAtual();
      if (!itens.length) {
        toast('Nenhuma linha válida para importar');
        return;
      }
      let conta = null;
      if ($('#mConta').value === '__nova__') {
        const nome = $('#mNome').value.trim() || sugerirNomeContaCSV(state.csvAtual.fileName);
        conta = {
          id: uid('ct'),
          nome,
          tipo: state.csvAtual.pareceFatura ? 'cartao' : 'corrente',
          saldoInicial: 0,
          fechaDia: state.csvAtual.pareceFatura ? 20 : null
        };
        state.contas.push(conta);
      } else {
        conta = getConta($('#mConta').value);
      }

      const fileName = state.csvAtual.fileName;
      state.csvAtual = null;
      $('#csvMap').hidden = true;

      const res = await importarItens({ conta, itens });
      adicionarResultadoImport(fileName, res);
      avancarFilaCSV();
      render();
    };

    $('#orcSugTudo').onclick = async () => {
      let preenchidos = 0;
      for (const c of state.categorias.filter(x => x.tipo === 'gasto')) {
        const sug = media3MesesCat(c.id);
        if (sug > 0) {
          state.orcamentos[c.id] = sug;
          preenchidos++;
        }
      }
      if (!preenchidos) {
        toast('Ainda não há histórico suficiente para calcular médias');
        return;
      }
      await kvSet('orcamentos', state.orcamentos);
      renderOrcamento();
      toast('Orçamento preenchido pela média');
    };

    $('#tema').onchange = () => {
      const v = $('#tema').value;
      localStorage.setItem('bolso-tema', v);
      if (v === 'claro') document.documentElement.dataset.theme = 'light';
      else if (v === 'escuro') document.documentElement.dataset.theme = 'dark';
      else delete document.documentElement.dataset.theme;
    };

    $('#rCat').onchange = atualizarSelectSubRegra;
    $('#rAdd').onclick = async () => {
      const texto = $('#rTexto').value.trim();
      const catId = $('#rCat').value;
      const subId = $('#rSub').hidden ? '' : ($('#rSub').value || '');
      if (!texto || !catId) return;
      state.regras.push({ texto, catId, subId });
      await kvSet('regras', state.regras);
      $('#rTexto').value = '';
      renderAjustes();
      toast('Regra criada');
    };

    $('#cAdd').onclick = async () => {
      const nome = $('#cNome').value.trim();
      const tipo = $('#cTipo').value;
      if (!nome) return;
      state.categorias.push({
        id: uid('cat'),
        nome,
        tipo,
        cor: '#0f5257',
        subs: []
      });
      await kvSet('categorias', state.categorias);
      $('#cNome').value = '';
      renderAjustes();
      toast('Categoria criada');
    };

    $('#bkSalvar').onclick = exportarBackup;
    $('#bkRestaurar').onchange = e => {
      const f = e.target.files && e.target.files[0];
      if (f) restaurarBackup(f);
      e.target.value = '';
    };
    $('#csvExport').onclick = exportarCSV;

    $('#apagar').onclick = async () => {
      if ($('#apagarConf').value.trim().toUpperCase() !== 'APAGAR') {
        toast('Digite APAGAR para confirmar');
        return;
      }
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
  }

  async function init() {
    state.db = await abrirDB();
    await carregarDadosReais();
    bindEventos();
    configurarPWA();
    irPara('painel');
  }

  init();
})();
