(() => {
  'use strict';

  const VERSAO = '1.8.1';
  const DB_NOME = 'bolso-db';
  const DB_VER = 2;

  // Regras embutidas. O texto casa no começo de uma palavra ("UBER" pega "DL*UBERRIDES");
  // com "=" no fim, só a palavra inteira ("MERCADO=" não pega "MERCADOPAGO").
  // As mais longas são testadas primeiro, então "MERCADO LIVRE" ganha de "MERCADO".
  const REGRAS_POR_CAT = {
    'transporte:app': 'UBER|99APP|99 POP|99 RIDE|99 TAXI|CABIFY',
    'transporte:combustivel': 'IPIRANGA|SHELL|POSTO=|AUTO POSTO|PETROBRAS|COMBUST',
    'transporte:pedagio': 'SEM PARAR|VELOE|CONECTCAR|ESTACIONAMENTO|ESTAPAR|PEDAGIO',
    'transporte:manutencao': 'OFICINA|BORRACHARIA|AUTO PECAS|LAVA JATO',
    'alimentacao:delivery': 'IFOOD|IFD=|RAPPI|ZE DELIVERY|AIQFOME|UBER EATS',
    'alimentacao:mercado': 'SUPERMERC|HIPERMERC|MERCADO=|MERCEARIA|MERCADINHO|SACOLAO|HORTIFRUTI|ATACADAO|ASSAI|CARREFOUR|PAO DE ACUCAR|VERDEMAR|SUPER NOSSO|EPA=|MART MINAS|ACOUGUE|GRANEL|PANIFICADORA',
    'alimentacao:restaurante': 'PADARIA|RESTAURANTE|LANCHONETE|LANCHES|SORVETERIA|MARMITARIA|CAFE=|CAFETERIA|BAR=|BOTECO|CHOPP|PIZZARIA|HAMBURG|BURGER|MCDONALD|OUTBACK|SUBWAY|BISCOITO DE QUEIJO',
    'saude:farmacia': 'DROGASIL|DROGA RAIA|RAIA|DROGARIA|FARMACIA|DROGARIAS PACHECO|ARAUJO LOJA|PAGUE MENOS|PANVEL',
    'saude:plano': 'UNIMED|OMINT|AMIL=|HAPVIDA|SULAMERICA SAUDE|BRADESCO SAUDE|LABORATORIO|HERMES PARDINI|CLINICA|ODONTO|HOSPITAL',
    'saude:academia': 'SMART FIT|SMARTFIT|ACADEMIA|GYMPASS|WELLHUB|TOTALPASS|PILATES',
    'assinaturas:streaming': 'NETFLIX|SPOTIFY|AMAZON PRIME|AMAZONPRIME|HBOMAX|HELPHBOMAX|DISNEY|GLOBOPLAY|YOUTUBE|DEEZER|PARAMOUNT',
    'assinaturas:software': 'APPLE COM|GOOGLE=|ICLOUD|MICROSOFT|CHATGPT|OPENAI|CANVA',
    'moradia:energia': 'CEMIG|ENEL=|CPFL|LIGHT=|ENERGISA|EQUATORIAL|NEOENERGIA|COELBA|COPEL|CELESC',
    'moradia:agua': 'COPASA|SABESP|SANEPAR|CEDAE|EMBASA|GASMIG|COMGAS|ULTRAGAZ|LIQUIGAS',
    'moradia:internet': 'VIVO=|CLARO=|TIM=|OI MOVEL|NET SERVICOS',
    'moradia:aluguel': 'CONDOMINIO|ALUGUEL|IMOBILIARIA|QUINTOANDAR',
    'compras:online': 'MERCADO LIVRE|MERCADOLIVRE|AMAZON COM|AMAZON MARKETPLACE|SHOPEE|SHPP|SHEIN|ALIEXPRESS|MAGALU|AMERICANAS',
    'compras:vestuario': 'RENNER|RIACHUELO|C A MODAS|CEA=|ZARA=|HERING|CENTAURO|NETSHOES',
    'compras:casa': 'LEROY|TOK STOK|CASAS BAHIA|FAST SHOP|KABUM',
    'lazer:passeios': 'CINEMA|CINEMARK|INGRESSO|SYMPLA|EVENTIM|TEATRO|MUSEU',
    'lazer:viagens': 'BOOKING|AIRBNB|HOTEL|POUSADA|DECOLAR|LATAM|GOL LINHAS|AZUL LINHAS',
    'educacao': 'ESCOLA|COLEGIO|EDUCACAO|FACULDADE|UNIVERSIDADE|CURSO|UDEMY|ALURA|DUOLINGO|LIVRARIA|PAPELARIA',
    'pets': 'PET SHOP|PETSHOP|PETZ|COBASI|PETLOVE|VETERIN|AGROPET',
    'tarifas': 'TARIFA|ANUIDADE|IOF=|JUROS=|MULTA=|IPTU|IPVA|DARF|DETRAN|LICENCIAMENTO|CARTORIO',
    'cuidados': 'SALAO|CABELEIR|BARBEARIA|MANICURE|ESMALTERIA|ESTETICA|DEPILACAO|BOTICARIO|NATURA=|SEPHORA',
    'transf': 'PAGAMENTO DE FATURA|PAGAMENTO FATURA|PAGTO FATURA|PGTO FATURA|FATURA CARTAO|PAGAMENTO DE CARTAO|PAGAMENTO CARTAO|DEBITO AUTOMATICO CARTAO|OUROCARD|FATURA XP|BB RENDE FACIL|RENDE FACIL|RESGATE|APLICACAO|APLIC INVEST|RESG INVEST|TESOURO DIRETO',
    'rendimentos': 'RENDIMENTO|JUROS SOBRE CAPITAL|DIVIDENDO|ESTORNO|DEVOLUCAO PIX|PIX ENVIO DEVOLVIDO|PIX REJEITADO|CASHBACK',
    'salario': 'SALARIO|PRO LABORE|PROVENTOS|FOLHA DE PAGAMENTO'
  };
  const REGRAS_PADRAO = Object.entries(REGRAS_POR_CAT)
    .flatMap(([alvo, lista]) => lista.split('|').map(t => {
      const [catId, subId = ''] = alvo.split(':');
      const inteira = t.endsWith('=');
      return { texto: inteira ? t.slice(0, -1) : t, inteira, catId, subId };
    }))
    .sort((a, b) => b.texto.length - a.texto.length);
  // Testada depois de todas as outras: Pix enviado para uma pessoa vai para "Pix e transferências".
  const REGRAS_GENERICAS = [{ texto: 'PIX ENVIADO', inteira: false, catId: 'pix', subId: '', sinal: -1 }];

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
    { id: 'educacao', nome: 'Educação', tipo: 'gasto', cor: '#4f6fb3', subs: [] },
    { id: 'cuidados', nome: 'Cuidados pessoais', tipo: 'gasto', cor: '#c46b8f', subs: [] },
    { id: 'pets', nome: 'Pets', tipo: 'gasto', cor: '#b08a4f', subs: [] },
    { id: 'tarifas', nome: 'Tarifas & impostos', tipo: 'gasto', cor: '#9a6b4f', subs: [] },
    { id: 'pix', nome: 'Pix e transferências', tipo: 'gasto', cor: '#6d8a96', subs: [] },
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

    await migrar();
    treinarIA();

    const mudados = new Set(conciliarTransferencias());
    for (const tx of state.lancamentos) {
      if (tx.catId) continue;
      const sug = classificarPorRegra(tx.desc, tx.valor);
      if (sug) {
        Object.assign(tx, { catId: sug.catId, subId: sug.subId, catOrigem: 'regra' });
        mudados.add(tx);
      }
    }
    if (mudados.size) {
      await dbPutLanc([...mudados]);
      treinarIA();
    }

    let contasAtualizadas = false;
    for (const c of state.contas) {
      if (recalcularSaldoInicialPorExtrato(c)) contasAtualizadas = true;
    }
    if (contasAtualizadas) await kvSet('contas', state.contas);
  }

  /* ========================================================================
     Migração de dados de versões anteriores (roda uma vez por aparelho)
     ======================================================================== */
  const MIGRACAO = 2;

  // Arquivos que dizem ser windows-1252 mas vêm em UTF-8 (o OFX da XP) ficavam com "automÃ¡tico".
  const BYTE_1252 = (() => {
    const dec = new TextDecoder('windows-1252');
    const m = new Map();
    for (let b = 0; b < 256; b++) m.set(dec.decode(Uint8Array.of(b)), b);
    return m;
  })();
  function consertarAcentos(s) {
    if (!/[ÃÂ][\u0080-ÿ‘-›€ŒœŠšŸŽžƒˆ˜]/.test(s)) return s;
    try {
      const bytes = Uint8Array.from([...s].map(ch => {
        if (!BYTE_1252.has(ch)) throw new Error('fora do 1252');
        return BYTE_1252.get(ch);
      }));
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      return s;
    }
  }

  async function migrar() {
    if (state.exemplo || (await kvGet('migracao', 0)) >= MIGRACAO) return;

    // Categorias que a versão 1.7 não tinha (Educação, Pets, Tarifas, Cuidados pessoais, Pix)
    for (const c of CATS_PADRAO) {
      if (getCat(c.id)) continue;
      const iOutros = state.categorias.findIndex(x => x.id === 'outros');
      state.categorias.splice(iOutros >= 0 ? iOutros : state.categorias.length, 0, JSON.parse(JSON.stringify(c)));
    }

    for (const tx of state.lancamentos) {
      tx.desc = limparDescricao(consertarAcentos(tx.desc));
      // Não dá para saber quais categorias ela escolheu e quais o app chutou: ela decide no aviso do painel.
      if (tx.catId && !tx.catOrigem) tx.catOrigem = 'antigo';
    }
    for (const c of state.contas) {
      if (typeof c.saldoExtrato === 'number' && c.saldoExtratoData) {
        c.saldos = { ...(c.saldos || {}), [c.saldoExtratoData]: c.saldoExtrato };
      }
    }

    await kvSet('categorias', state.categorias);
    await kvSet('contas', state.contas);
    await dbPutLanc(state.lancamentos);
    await kvSet('migracao', MIGRACAO);
  }

  /** Apaga as categorias de origem desconhecida e reaplica só as regras. */
  async function refazerClassificacaoAntiga() {
    let comRegra = 0;
    let semCat = 0;
    for (const tx of state.lancamentos) {
      if (tx.catOrigem !== 'antigo') continue;
      const sug = classificarPorRegra(tx.desc, tx.valor);
      tx.catId = sug ? sug.catId : '';
      tx.subId = sug ? sug.subId : '';
      tx.catOrigem = sug ? 'regra' : '';
      if (sug) comRegra++; else semCat++;
    }
    conciliarTransferencias();
    await dbPutLanc(state.lancamentos);
    treinarIA();
    toast(`${comRegra} classificados por regra · ${semCat} ficaram para você revisar`);
    render();
  }

  async function manterClassificacaoAntiga() {
    for (const tx of state.lancamentos) if (tx.catOrigem === 'antigo') tx.catOrigem = 'usuario';
    await dbPutLanc(state.lancamentos);
    treinarIA();
    render();
  }

  /* ========================================================================
     Inteligência Local (Regras + Titularidade + Naive Bayes)
     ======================================================================== */
  // Palavras que aparecem em qualquer lançamento ("Compra com Cartão", "Pagamento de Boleto") e
  // por isso não dizem nada sobre a categoria. Sem elas, o aprendizado não chuta tudo para a mesma.
  const STOP_TOKENS = new Set((
    'PIX ENVIADO ENVIADA RECEBIDO RECEBIDA COMPRA COMPRAS COM CARTAO DEBITO CREDITO PAGAMENTO PAGTO PGTO ' +
    'BOLETO TRANSFERENCIA TRANSF TED DOC TEV PARC PARCELA LTDA EIRELI BRA BELO HORIZONTE SAO PAULO ' +
    'RIO JANEIRO PAG MERCADOPAGO IFD LOJA PARA DAS DOS COBRANCA REFERENTE AUTOMATICO'
  ).split(' '));

  function tokenizar(desc) {
    return norm(desc)
      .replace(/\*/g, ' ')
      .split(' ')
      .filter(t => t.length >= 3 && !/^\d+$/.test(t) && !STOP_TOKENS.has(t));
  }

  // Origem da categoria de um lançamento: 'usuario' (ela escolheu), 'regra' (regra dela ou embutida),
  // 'auto' (transferência conciliada pelo app) ou 'antigo' (veio de versão anterior, origem desconhecida).
  const ORIGENS_CONFIAVEIS = new Set(['usuario', 'regra']);

  function treinarIA() {
    const vocab = {};
    const catCounts = {};
    let totalDocs = 0;

    for (const tx of state.lancamentos) {
      if (!tx.catId || tx.catId === 'transf' || !ORIGENS_CONFIAVEIS.has(tx.catOrigem)) continue;
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
      if (partes.length >= 2 && partes.slice(0, 2).every(p => descNorm.includes(p))) return true;
    }
    return false;
  }

  // Texto da descrição com espaços nas pontas, para casar regras no começo das palavras.
  const textoBusca = desc => ` ${norm(desc).replace(/\*/g, ' ').replace(/\s+/g, ' ').trim()} `;
  function casaRegra(alvo, texto, inteira) {
    const t = norm(texto).replace(/\*/g, ' ').replace(/\s+/g, ' ').trim();
    return Boolean(t) && alvo.includes(` ${t}${inteira ? ' ' : ''}`);
  }
  // Categoria de gasto não serve para dinheiro que entrou, e vice-versa.
  const tipoCombina = (cat, valor) => cat.tipo === 'mov' || (valor < 0 ? cat.tipo === 'gasto' : cat.tipo === 'receita');

  /** Regras dela, Pix para a própria titular e regras embutidas. Não chuta: devolve null se nada casar. */
  function classificarPorRegra(desc, valor) {
    const alvo = textoBusca(desc);
    for (const r of state.regras) {
      const c = getCat(r.catId);
      if (c && r.texto && casaRegra(alvo, r.texto, false)) return { catId: r.catId, subId: r.subId || '', origem: 'regra' };
    }
    if (pareceMesmaTitularidade(norm(desc)) && getCat('transf')) return { catId: 'transf', subId: '', origem: 'regra' };
    for (const r of [...REGRAS_PADRAO, ...REGRAS_GENERICAS]) {
      if (r.sinal && Math.sign(valor) !== r.sinal) continue;
      if (!casaRegra(alvo, r.texto, r.inteira)) continue;
      const c = getCat(r.catId);
      if (!c || !tipoCombina(c, valor)) continue;
      const subOk = r.subId && (c.subs || []).some(x => x.id === r.subId) ? r.subId : '';
      return { catId: r.catId, subId: subOk, origem: 'regra' };
    }
    return null;
  }

  /** Sugestão para a triagem: a regra, se houver; senão o palpite do aprendizado (nunca gravado sozinho). */
  function classificar(desc, valor) {
    const porRegra = classificarPorRegra(desc, valor);
    if (porRegra || state.ia.totalDocs < 3) return porRegra;
    const tokens = tokenizar(desc);
    if (!tokens.length) return null;
    const vocabSize = Object.keys(state.ia.vocab).length || 1;
    let melhorKey = null;
    let melhorScore = -Infinity;
    for (const [key, docCount] of Object.entries(state.ia.catCounts)) {
      const catObj = getCat(key.split(':')[0]);
      if (!catObj || !tipoCombina(catObj, valor)) continue;
      let score = Math.log(docCount / state.ia.totalDocs);
      let hits = 0;
      for (const tk of tokens) {
        const n = (state.ia.vocab[tk] && state.ia.vocab[tk][key]) || 0;
        if (n > 0) hits++;
        score += Math.log((n + 0.5) / (docCount + 0.5 * vocabSize));
      }
      if (hits > 0 && score > melhorScore) {
        melhorScore = score;
        melhorKey = key;
      }
    }
    if (!melhorKey) return null;
    const [catId, subId = ''] = melhorKey.split(':');
    return { catId, subId, origem: 'ia' };
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

  const ehCartao = contaId => getConta(contaId)?.tipo === 'cartao';
  const ehMov = tx => getCat(tx.catId)?.tipo === 'mov';
  const RE_FATURA = /FATURA|OUROCARD|CARTAO DE CREDITO|PAGAMENTO (DE )?CARTAO/;
  /** Pagamento da fatura do cartão saindo da conta: não é gasto novo, mas é dinheiro que saiu do banco. */
  const ehPagamentoFatura = tx =>
    tx.valor < 0 && ehMov(tx) && !ehCartao(tx.contaId) && (tx.ehFatura || RE_FATURA.test(norm(tx.desc)));

  /**
   * Dois olhares sobre o mês:
   * - Entrou / Saiu / Sobrou: o que passou nas contas bancárias, igual ao extrato. Transferências entre
   *   as próprias contas e aplicações/resgates ficam fora (movLiq); a fatura do cartão entra no Saiu
   *   no dia em que foi paga.
   * - porCat / gastos: para onde foi o dinheiro, com as compras do cartão na data da compra.
   */
  function resumoMes(ym) {
    const lista = lancamentosDoMes(ym);
    const r = {
      lista, entrou: 0, saiu: 0, qtdEntrou: 0, qtdSaiu: 0, fatura: 0, movLiq: 0,
      compCartao: 0, gastos: 0, semCat: 0, porCat: {}, porSub: {}
    };

    for (const tx of lista) {
      const cat = getCat(tx.catId);
      const mov = ehMov(tx);
      const cartao = ehCartao(tx.contaId);

      if (!cartao) {
        if (mov && !ehPagamentoFatura(tx)) {
          r.movLiq += tx.valor;
        } else if (tx.valor > 0) {
          r.entrou += tx.valor;
          r.qtdEntrou++;
        } else {
          r.saiu -= tx.valor;
          r.qtdSaiu++;
          if (ehPagamentoFatura(tx)) r.fatura -= tx.valor;
        }
      } else if (tx.valor < 0 && !mov) {
        r.compCartao -= tx.valor;
      }

      if (tx.valor < 0 && !mov) {
        const liq = valorLiquidoGasto(tx);
        const cid = cat ? cat.id : '__sem';
        if (!cat) r.semCat++;
        r.gastos += liq;
        r.porCat[cid] = (r.porCat[cid] || 0) + liq;
        if (cat && tx.subId) r.porSub[`${cid}:${tx.subId}`] = (r.porSub[`${cid}:${tx.subId}`] || 0) + liq;
      }
    }

    for (const k of ['entrou', 'saiu', 'fatura', 'movLiq', 'compCartao', 'gastos']) r[k] = round2(r[k]);
    for (const k of Object.keys(r.porCat)) r.porCat[k] = round2(r.porCat[k]);
    for (const k of Object.keys(r.porSub)) r.porSub[k] = round2(r.porSub[k]);
    r.sobra = round2(r.entrou - r.saiu);
    return r;
  }

  function recalcularSaldoInicialPorExtrato(conta) {
    if (!conta || conta.tipo === 'cartao' || conta.saldoInicialManual) return false;
    if (typeof conta.saldoExtrato !== 'number' || !Number.isFinite(conta.saldoExtrato)) return false;
    const dtRef = conta.saldoExtratoData || '9999-12-31';
    const novoIni = round2(conta.saldoExtrato - somaConta(conta.id, dtRef));
    if (Math.abs((Number(conta.saldoInicial) || 0) - novoIni) >= 0.005) {
      conta.saldoInicial = novoIni;
      return true;
    }
    return false;
  }

  /** Soma dos lançamentos da conta até a data (inclusive). */
  function somaConta(contaId, ate = '9999-12-31') {
    return state.lancamentos
      .filter(tx => tx.contaId === contaId && tx.data <= ate)
      .reduce((acc, tx) => acc + (Number(tx.valor) || 0), 0);
  }

  const saldoEm = (conta, data) => round2((Number(conta.saldoInicial) || 0) + somaConta(conta.id, data));
  const calcularSaldoConta = conta => saldoEm(conta, '9999-12-31');
  const fimDoMes = ym => {
    const [y, m] = ym.split('-').map(Number);
    return `${ym}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, '0')}`;
  };
  const vespera = ym => fimDoMes(addMes(ym, -1));

  /** Saldo informado pelo banco (OFX) dentro do mês: o mais recente. */
  function saldoExtratoNoMes(conta, ym) {
    const datas = Object.keys(conta.saldos || {}).filter(d => d.startsWith(ym)).sort();
    const d = datas.pop();
    return d ? { data: d, valor: conta.saldos[d] } : null;
  }

  function detectarFixas(ym) {
    const anteriores = [addMes(ym, -3), addMes(ym, -2), addMes(ym, -1)];
    const grupos = new Map();

    for (const m of [...anteriores, ym]) {
      for (const tx of lancamentosDoMes(m)) {
        const c = getCat(tx.catId);
        if (tx.valor >= 0 || !c || c.tipo !== 'gasto' || c.id === 'pix') continue;
        const chave = tokenizar(tx.desc).slice(0, 3).join(' ');
        if (!chave || state.fixasOcultas.includes(chave)) continue;
        if (!grupos.has(chave)) grupos.set(chave, { chave, catId: tx.catId, porMes: {} });
        (grupos.get(chave).porMes[m] ||= []).push(tx);
      }
    }

    const fixas = [];
    for (const g of grupos.values()) {
      // Conta fixa: aparece em pelo menos 2 dos 3 meses anteriores, uma vez só por mês, com valor parecido.
      if (anteriores.filter(m => g.porMes[m]).length < 2) continue;
      const listas = Object.values(g.porMes);
      if (listas.some(l => l.length > 1)) continue;
      const vals = listas.map(l => Math.abs(l[0].valor));
      const media = vals.reduce((a, b) => a + b, 0) / vals.length;
      const tolerancia = ['moradia', 'assinaturas', 'educacao', 'saude'].includes(g.catId) ? 0.35 : 0.15;
      if (media > 0 && (Math.max(...vals) - Math.min(...vals)) / media > tolerancia) continue;

      const atualTx = g.porMes[ym] ? g.porMes[ym][0] : null;
      const refTx = atualTx || g.porMes[anteriores.filter(m => g.porMes[m]).pop()][0];
      const valorAtual = atualTx ? Math.abs(atualTx.valor) : round2(media);
      fixas.push({
        chave: g.chave,
        nome: refTx.desc,
        catId: refTx.catId,
        dia: Number(refTx.data.slice(8, 10)) || 10,
        pago: Boolean(atualTx),
        valor: valorAtual,
        media: round2(media),
        alta: Boolean(atualTx) && valorAtual > media * 1.12 && valorAtual - media >= 5
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

  const RE_TRANSF = /PIX|TED|DOC|TEV|TRANSF|FATURA|PAGAMENTO|RESGATE|APLIC/;

  /**
   * Marca como "Transferência / Fatura" a saída de uma conta que entra em outra (mesmo valor, até 3 dias)
   * e o pagamento que bate com o total de compras do cartão no mês. Nunca mexe no que ela classificou.
   * Devolve os lançamentos alterados.
   */
  function conciliarTransferencias() {
    if (!getCat('transf')) return [];
    const livre = tx => tx.catOrigem !== 'usuario' && RE_TRANSF.test(norm(tx.desc));
    const dia = tx => Date.parse(`${tx.data}T12:00:00Z`) / 86400000;
    const mudados = new Set();
    const marcar = (tx, fatura = false) => {
      if (tx.catId === 'transf' && (!fatura || tx.ehFatura)) return;
      Object.assign(tx, { catId: 'transf', subId: '', catOrigem: 'auto' });
      if (fatura) tx.ehFatura = true;
      mudados.add(tx);
    };

    // 1. Saída numa conta com entrada de mesmo valor em outra
    const entradas = state.lancamentos.filter(b => b.valor > 0 && livre(b));
    const usadas = new Set();
    for (const a of state.lancamentos) {
      if (a.valor >= 0 || !livre(a)) continue;
      const par = entradas
        .filter(b => !usadas.has(b.id) && b.contaId !== a.contaId &&
          Math.abs(b.valor + a.valor) <= 0.02 && Math.abs(dia(b) - dia(a)) <= 3)
        .sort((x, y) => Math.abs(dia(x) - dia(a)) - Math.abs(dia(y) - dia(a)))[0];
      if (!par) continue;
      usadas.add(par.id);
      marcar(a, ehCartao(par.contaId));
      marcar(par);
    }

    // 2. Pagamento na conta que bate com o total de compras do cartão no mês (ou no mês seguinte)
    for (const cc of state.contas.filter(c => c.tipo === 'cartao')) {
      const porMes = new Map();
      for (const tx of state.lancamentos) {
        if (tx.contaId !== cc.id || tx.valor >= 0 || ehMov(tx)) continue;
        const ym = tx.data.slice(0, 7);
        porMes.set(ym, round2((porMes.get(ym) || 0) - tx.valor));
      }
      for (const [ym, total] of porMes) {
        if (total < 10) continue;
        const pgto = state.lancamentos.find(tx =>
          tx.valor < 0 && !ehCartao(tx.contaId) && livre(tx) &&
          [ym, addMes(ym, 1)].includes(tx.data.slice(0, 7)) && Math.abs(total + tx.valor) <= 0.05);
        if (pgto) marcar(pgto, true);
      }
    }
    return [...mudados];
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
  function irParaLancamentos({ cat = '', conta = '', sem = false } = {}) {
    $('#fCat').value = cat;
    $('#fConta').value = conta;
    $('#fSem').checked = sem;
    $('#busca').value = '';
    irPara('lancamentos');
  }

  function aviso(id, html, botoes) {
    const el = $(id);
    el.hidden = !html;
    if (!html) return;
    el.innerHTML = `<span>${html}</span><span class="row">${botoes.map((b, i) =>
      `<button type="button" class="${i ? 'lnk' : 'btn sm'}" data-i="${i}">${esc(b.txt)}</button>`).join('')}</span>`;
    $$('button[data-i]', el).forEach(btn => { btn.onclick = botoes[Number(btn.dataset.i)].acao; });
  }

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

    const antigos = state.lancamentos.filter(tx => tx.catOrigem === 'antigo').length;
    aviso('#avisoRefazer', antigos
      ? `<b>A classificação automática melhorou.</b> ${antigos} lançamentos foram classificados pela versão anterior, que errava bastante (boletos da escola em Saúde, por exemplo). Refazer apaga essas categorias e reaplica só as regras; o que não tiver regra volta para você classificar.`
      : '', [
      { txt: 'Refazer agora', acao: refazerClassificacaoAntiga },
      { txt: 'Manter como está', acao: manterClassificacaoAntiga }
    ]);

    aviso('#avisoRevisar', res.semCat
      ? `Você tem <b>${res.semCat}</b> ${res.semCat === 1 ? 'gasto sem categoria' : 'gastos sem categoria'} neste mês.`
      : '', [{ txt: 'Classificar agora', acao: () => irParaLancamentos({ sem: true }) }]);

    const ultBk = Number(localStorage.getItem('bolso-ultimo-backup') || 0);
    const diasSemBk = ultBk ? Math.floor((Date.now() - ultBk) / 86400000) : 999;
    aviso('#avisoBackup', !state.exemplo && state.lancamentos.length >= 25 && diasSemBk > 30
      ? (ultBk ? `Última cópia de segurança há ${diasSemBk} dias.` : 'Você ainda não salvou uma cópia de segurança dos seus dados.')
      : '', [{ txt: 'Salvar cópia', acao: exportarBackup }]);

    $('#kEntrou').textContent = moed(res.entrou);
    $('#kSaiu').textContent = moed(res.saiu);
    // Os totais somam todas as contas bancárias; o nome delas fica à vista para não parecer só uma.
    const apelido = c => /BRASIL/i.test(c.nome) ? 'BB'
      : c.nome.replace(/\s*\(.*\)$/, '').replace(/^Banco\s+/i, '').replace(/\s+S\.?A\.?$/i, '');
    const contasBanco = state.contas.filter(c => c.tipo !== 'cartao').map(apelido);
    const somaDe = contasBanco.length > 1 ? ` · soma de ${contasBanco.join(' + ')}` : '';
    $('#kEntrouSub').textContent = res.qtdEntrou
      ? `${res.qtdEntrou} ${res.qtdEntrou === 1 ? 'entrada' : 'entradas'}${somaDe}`
      : 'Nenhuma entrada no mês';
    $('#kSaiuSub').textContent = res.fatura > 0
      ? `inclui a fatura do cartão (${moed(res.fatura)})${somaDe}`
      : `${res.qtdSaiu} ${res.qtdSaiu === 1 ? 'saída' : 'saídas'}${somaDe}`;

    const elSobra = $('#kSobra');
    elSobra.textContent = moed(res.sobra);
    elSobra.className = 'num ' + (res.sobra >= 0 ? 'pos' : 'neg');
    const variacao = round2(res.sobra + res.movLiq);
    $('#kSobraSub').textContent = Math.abs(res.movLiq) < 0.01
      ? 'É quanto o saldo das contas mudou no mês'
      : `Saldo das contas mudou ${moed(variacao)}: inclui ${moed(Math.abs(res.movLiq))} ${res.movLiq < 0 ? 'aplicados ou enviados para outras contas suas' : 'resgatados ou vindos de outras contas suas'}`;

    const fixas = detectarFixas(state.mes);
    const futuros = parcelasFuturasNoMes(state.mes);
    const pendFixas = fixas.filter(f => !f.pago).reduce((acc, f) => acc + f.valor, 0);
    const pendParc = futuros.filter(f => !f.real).reduce((acc, f) => acc + f.valor, 0);
    $('#kpiPrev').hidden = !(ehMesAtual && pendFixas + pendParc > 0);
    if (!$('#kpiPrev').hidden) {
      const prevFinal = round2(res.sobra - pendFixas - pendParc);
      $('#kPrev').textContent = moed(prevFinal);
      $('#kPrev').className = 'num ' + (prevFinal >= 0 ? 'pos' : 'neg');
      $('#kPrevSub').textContent = `Considerando ${moed(pendFixas + pendParc)} em contas fixas e parcelas que ainda vão vencer`;
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

  /** Uma linha por conta: saldo no início e no fim do mês, e se bate com o saldo que o banco informou. */
  function renderContasStrip() {
    const el = $('#contasStrip');
    el.hidden = !state.contas.length;
    const ym = state.mes;
    const dataBR = d => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

    el.innerHTML = state.contas.map(c => {
      const doMes = lancamentosDoMes(ym).filter(tx => tx.contaId === c.id);
      if (c.tipo === 'cartao') {
        const compras = doMes.filter(tx => tx.valor < 0 && !ehMov(tx)).reduce((acc, tx) => acc - tx.valor, 0);
        const pagamentos = doMes.filter(tx => tx.valor > 0 && ehMov(tx)).reduce((acc, tx) => acc + tx.valor, 0);
        return `
          <div class="conta-pill" data-conta="${esc(c.id)}">
            <div class="cn"><span>💳 ${esc(c.nome)}</span><span class="csub">compras no mês</span></div>
            <div class="cv num">${moed(compras)}</div>
            ${pagamentos ? `<div class="csub">Fatura paga no mês: ${moed(pagamentos)}</div>` : ''}
          </div>`;
      }
      // Conta bancária: a evolução do saldo mês a mês, como no extrato (até 6 meses, terminando no mês aberto).
      const meses = state.lancamentos
        .filter(tx => tx.contaId === c.id && tx.data.slice(0, 7) <= ym)
        .map(tx => tx.data.slice(0, 7));
      const lista = [...new Set(meses)].sort().slice(-6);
      if (!lista.includes(ym)) lista.push(ym);
      const n = v => moed(v).replace(/R\$\s?/, '');
      const linhas = lista.map(m => {
        const doM = lancamentosDoMes(m).filter(tx => tx.contaId === c.id);
        const ate = m === mesAtualStr() ? hojeStr() : fimDoMes(m);
        const ent = doM.filter(tx => tx.valor > 0).reduce((acc, tx) => acc + tx.valor, 0);
        const sai = doM.filter(tx => tx.valor < 0).reduce((acc, tx) => acc - tx.valor, 0);
        const final = saldoEm(c, ate);
        const ext = saldoExtratoNoMes(c, m);
        const confere = ext && Math.abs(saldoEm(c, ext.data) - ext.valor) < 0.01;
        const titulo = ext ? `Extrato do banco em ${dataBR(ext.data)}: ${moed(ext.valor)}` : 'Sem saldo do banco neste mês';
        return `
          <tr data-mes="${m}" class="${m === ym ? 'atual' : ''}">
            <th>${esc(labelMesCurto(m))}${m === mesAtualStr() ? `<small>até ${dataBR(ate)}</small>` : ''}</th>
            <td>${n(saldoEm(c, vespera(m)))}</td>
            <td class="pos">+${n(ent)}</td>
            <td>−${n(sai)}</td>
            <td class="${final < 0 ? 'neg' : ''}" title="${esc(titulo)}">${n(final)}${ext ? (confere ? ' <span class="badge-ok">✓</span>' : ' <span class="badge-warn">≠</span>') : ''}</td>
          </tr>`;
      }).join('');
      const ext = saldoExtratoNoMes(c, ym);
      const nota = !ext ? 'Importe o extrato deste mês para conferir com o saldo do banco.'
        : Math.abs(saldoEm(c, ext.data) - ext.valor) < 0.01
          ? `✓ Saldo igual ao do extrato do banco em ${dataBR(ext.data)}.`
          : `O extrato do banco em ${dataBR(ext.data)} diz ${moed(ext.valor)}; aqui está ${moed(saldoEm(c, ext.data))}. Falta importar algum período ou há lançamento duplicado.`;
      return `
        <div class="conta-pill conta-tab">
          <div class="cn"><span>🏦 ${esc(c.nome)}</span><button type="button" class="lnk" data-conta="${esc(c.id)}">Ver lançamentos</button></div>
          <div class="tab-scroll"><table class="tab-saldo num">
            <thead><tr><th>Mês</th><th>Saldo inicial</th><th>Entradas</th><th>Saídas</th><th>Saldo final</th></tr></thead>
            <tbody>${linhas}</tbody>
          </table></div>
          <div class="csub">${nota}</div>
        </div>`;
    }).join('');

    $$('.conta-pill[data-conta], button[data-conta]', el).forEach(b => {
      b.onclick = () => irParaLancamentos({ conta: b.dataset.conta });
    });
    $$('tr[data-mes]', el).forEach(tr => {
      tr.onclick = () => { state.mes = tr.dataset.mes; render(); };
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
    if (res.porCat.__sem) catsGasto.push({ id: '__sem', nome: 'Sem categoria', cor: '#d99b26', subs: [] });
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
      const pctTotal = res.gastos > 0 ? Math.round((valor / res.gastos) * 100) : 0;
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
    }).join('') + (res.compCartao > 0 ? `
      <p class="mut nota-cartao">Inclui ${moed(res.compCartao)} de compras no cartão, na data da compra. No “Saiu” lá em cima entra o pagamento da fatura${res.fatura ? ` (${moed(res.fatura)})` : ''}, que é o que sai da conta.</p>` : '');

    $$('[data-cat]', el).forEach(node => {
      node.onclick = () => node.dataset.cat === '__sem'
        ? irParaLancamentos({ sem: true })
        : irParaLancamentos({ cat: node.dataset.cat });
    });
  }

  function renderHistoricoCard() {
    const el = $('#histCard');
    const baseMes = addMes(mesAtualStr(), state.histOffset);
    const dados = [-5, -4, -3, -2, -1, 0].map(i => {
      const mes = addMes(baseMes, i);
      return { mes, ...resumoMes(mes) };
    });
    const maxBarra = Math.max(...dados.map(d => Math.max(d.entrou, d.saiu)), 1);
    const curto = v => (v > 0 ? moed(v, true).replace(/R\$\s?/, '') : '');
    const altura = v => (v > 0 ? Math.max(3, Math.round((v / maxBarra) * 80)) : 0);

    const comDados = dados.filter(d => d.entrou > 0 || d.saiu > 0);
    const n = Math.max(1, comDados.length);
    const medEnt = comDados.reduce((a, d) => a + d.entrou, 0) / n;
    const medSai = comDados.reduce((a, d) => a + d.saiu, 0) / n;

    el.innerHTML = `
      <div class="card-h"><h2>Últimos 6 meses</h2><span class="mut">Toque num mês</span></div>
      <div class="hist-wrap">
        <button type="button" class="hist-nav-btn" id="histAnt" aria-label="Meses anteriores">‹</button>
        <div class="hist">${dados.map(d => `
          <div class="hcol ${d.mes === state.mes ? 'atual' : ''}" data-mes="${d.mes}" title="Entrou ${moed(d.entrou)} · Saiu ${moed(d.saiu)}">
            <span class="ve num">${curto(d.entrou)}</span>
            <div class="hbars">
              <div class="e" style="height:${altura(d.entrou)}px"></div>
              <div class="s-stack"><i class="s-seg" style="height:${altura(d.saiu)}px;background:var(--bar)"></i></div>
            </div>
            <span class="vs num">${curto(d.saiu)}</span>
            <span class="m">${esc(labelMesCurto(d.mes))}</span>
          </div>`).join('')}
        </div>
        <button type="button" class="hist-nav-btn" id="histProx" aria-label="Próximos meses">›</button>
      </div>
      <div class="leg"><span><i style="background:var(--bar-2)"></i>Entrou</span><span><i style="background:var(--bar)"></i>Saiu</span></div>
      <div class="hist-resumo">
        <span>Média entrou: <b class="num pos">${moed(medEnt, true)}</b></span>
        <span>Média saiu: <b class="num">${moed(medSai, true)}</b></span>
      </div>`;

    $('#histAnt', el).onclick = () => { state.histOffset--; renderHistoricoCard(); };
    $('#histProx', el).onclick = () => { state.histOffset++; renderHistoricoCard(); };
    $$('.hcol', el).forEach(col => {
      col.onclick = () => { state.mes = col.dataset.mes; render(); };
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

  /** Até 3 botões: a sugestão (✦) e as categorias que ela mais usa para esse tipo de lançamento. */
  function sugerirChipsTriagem(tx, usoPorSinal) {
    const chips = [];
    const add = (catId, subId, label, cls) => {
      if (!chips.some(c => c.catId === catId && c.subId === subId)) chips.push({ catId, subId, label, cls });
    };
    const sug = classificar(tx.desc, tx.valor);
    if (sug) add(sug.catId, sug.subId || '', `✦ ${labelCat(sug.catId, sug.subId)}`, 'qchip qchip-ia');
    const uso = usoPorSinal[tx.valor > 0 ? 1 : -1];
    state.categorias
      .filter(c => c.tipo !== 'mov' && tipoCombina(c, tx.valor) && (c.id !== 'pix' || / PIX /.test(textoBusca(tx.desc))))
      .sort((a, b) => (uso[b.id] || 0) - (uso[a.id] || 0))
      .forEach(c => { if (chips.length < 3) add(c.id, '', c.nome, 'qchip'); });
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
    const usoPorSinal = { 1: {}, '-1': {} };
    for (const t of state.lancamentos) {
      if (t.catId && ORIGENS_CONFIAVEIS.has(t.catOrigem)) {
        const u = usoPorSinal[t.valor > 0 ? 1 : -1];
        u[t.catId] = (u[t.catId] || 0) + 1;
      }
    }
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
        const chips = sugerirChipsTriagem(tx, usoPorSinal);
        chipsHtml = `
          <div class="qcats">
            ${chips.map(ch => `<button type="button" class="${ch.cls}" data-qcat="${esc(ch.catId)}" data-qsub="${esc(ch.subId)}">${esc(ch.label)}</button>`).join('')}
            <button type="button" class="qchip qchip-out" data-qmais="1">Outra…</button>
          </div>
        `;
      } else if (tx.valor >= 5 && cat.tipo !== 'mov' && (tx.usadoAbate || 0) === 0 && fSem) {
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
          tx.catOrigem = 'usuario';
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
  /** UTF-8 se o arquivo for UTF-8 válido; senão windows-1252 (não confia no CHARSET do cabeçalho). */
  async function lerArquivoTexto(file) {
    const buf = await file.arrayBuffer();
    let txt;
    try {
      txt = new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch {
      txt = new TextDecoder('windows-1252').decode(buf);
    }
    return txt.replace(/^﻿/, '');
  }

  // No OFX do BB, NAME é o tipo ("Compra com Cartão") e MEMO a loja ou pessoa, com data, hora e CPF/CNPJ na frente.
  const RE_TIPO_BANCO = /^(COMPRA COM CARTAO|COMPRA NO DEBITO|PIX ENVIADO|PIX RECEBIDO|PIX|PAGAMENTO DE BOLETO|PAGAMENTO|TED|DOC|TRANSFERENCIA|SAQUE|DEPOSITO)\b/;
  function limparContraparte(s) {
    return String(s || '')
      .replace(/^\s*\d{2}\/\d{2}(\/\d{2,4})?\s+\d{2}:\d{2}\s*/, '')
      .replace(/^\s*[\d.\/-]{8,}\s+/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function limparDescOFX(name, memo) {
    const n = limparContraparte(name);
    const m = limparContraparte(memo);
    if (!n && !m) return 'Lançamento OFX';
    if (!n) return m;
    if (!m || norm(n) === norm(m)) return n;
    return RE_TIPO_BANCO.test(norm(n)) ? `${m} · ${n}` : `${n} · ${m}`;
  }

  /** Mesma limpeza para descrições salvas por versões anteriores ("Pix - Enviado · 04/09 00:14 50.085.213 NOME"). */
  function limparDescricao(desc) {
    const partes = String(desc || '').split(' · ');
    return partes.length === 2 ? limparDescOFX(partes[0], partes[1]) : (limparContraparte(desc) || desc);
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
      const desc = String(r[iDesc] || '').replace(/\s+/g, ' ').trim();
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
      const data = saldoExtratoData || hojeStr();
      conta.saldos = { ...(conta.saldos || {}), [data]: saldoExtrato };
      if (!conta.saldoExtratoData || data >= conta.saldoExtratoData) {
        conta.saldoExtrato = saldoExtrato;
        conta.saldoExtratoData = data;
        conta.saldoInicialManual = false;
      }
    }

    const chavesExistentes = new Set();
    const fitidsExistentes = new Set();
    for (const tx of state.lancamentos) {
      if (tx.contaId !== conta.id) continue;
      if (tx.fitid) fitidsExistentes.add(`${tx.fitid}|${tx.data}|${Math.round(tx.valor * 100)}`);
      if (tx.hashImport) chavesExistentes.add(tx.hashImport);
    }

    const occNoArquivo = new Map();
    const novos = [];
    let duplicados = 0;

    for (const it of itens) {
      const centavos = Math.round(it.valor * 100);
      const baseKey = `${conta.id}|${it.data}|${norm(it.desc)}|${centavos}`;
      const occ = (occNoArquivo.get(baseKey) || 0) + 1;
      occNoArquivo.set(baseKey, occ);
      const hashImport = `${baseKey}#${occ}`;
      // Alguns bancos repetem o FITID em lançamentos diferentes: compara junto com data e valor.
      const chaveFit = it.fitid ? `${it.fitid}|${it.data}|${centavos}` : '';

      if (chaveFit ? fitidsExistentes.has(chaveFit) : chavesExistentes.has(hashImport)) {
        duplicados++;
        continue;
      }
      if (chaveFit) fitidsExistentes.add(chaveFit);
      chavesExistentes.add(hashImport);

      const sug = classificarPorRegra(it.desc, it.valor);
      novos.push({
        id: uid('tx'),
        contaId: conta.id,
        data: it.data,
        desc: it.desc,
        valor: it.valor,
        catId: sug ? sug.catId : '',
        subId: sug ? sug.subId : '',
        catOrigem: sug ? 'regra' : '',
        parcela: it.parcela || '',
        fitid: it.fitid || '',
        hashImport
      });
    }

    state.lancamentos.push(...novos);
    const conciliados = conciliarTransferencias();
    for (const c of state.contas) recalcularSaldoInicialPorExtrato(c);

    await kvSet('contas', state.contas);
    await dbPutLanc([...new Set([...novos, ...conciliados])]);
    treinarIA();

    if (novos.length) state.mes = novos.map(x => x.data).sort().pop().slice(0, 7);

    return {
      novos: novos.length,
      duplicados,
      autoClassificados: novos.filter(x => x.catId).length,
      paresTransf: conciliados.length,
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
        ${res.paresTransf ? ` · ${res.paresTransf} transferências ou pagamentos de fatura reconhecidos` : ''}
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
      if (r.gastos > 0) {
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
    // Lançamento que veio do extrato: data, valor, conta e sentido (entrou/saiu) são os do banco.
    const importado = Boolean(tx && (tx.fitid || tx.hashImport));
    const trava = importado ? 'disabled' : '';
    const tipos = !importado ? ['gasto', 'receita', 'mov'] : tx.valor > 0 ? ['receita', 'mov'] : ['gasto', 'mov'];
    const tipoIni = tx
      ? (getCat(tx.catId)?.tipo === 'mov' ? 'mov' : tx.valor > 0 ? 'receita' : 'gasto')
      : 'gasto';

    const contaOpts = state.contas.length
      ? state.contas.map(c => `<option value="${esc(c.id)}" ${tx && tx.contaId === c.id ? 'selected' : ''}>${esc(c.nome)}</option>`).join('')
      : `<option value="__padrao__">Carteira / Conta Principal</option>`;

    abrirModal({
      titulo: novo ? 'Novo lançamento' : 'Editar lançamento',
      desc: [
        importado ? `Veio do extrato de ${getConta(tx.contaId)?.nome || 'uma conta'}: data, valor e conta são os do banco.` : '',
        tx && tx.abatido > 0 ? `Já possui ${moed(tx.abatido)} abatidos por reembolso.` : ''
      ].filter(Boolean).join(' '),
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
          <label>Data<input type="date" id="dlData" required ${trava} value="${esc(tx ? tx.data : hojeStr())}"></label>
          <label>Valor (R$)<input type="number" id="dlValor" inputmode="decimal" step="0.01" min="0.01" required ${trava} value="${tx ? Math.abs(tx.valor).toFixed(2) : ''}"></label>
        </div>
        <label>Descrição<input id="dlDesc" maxlength="100" required placeholder="Ex.: Supermercado, Salário, Pix..." value="${esc(tx ? tx.desc : '')}"></label>
        <div class="grid2">
          <label>Tipo
            <select id="dlTipo">
              ${tipos.map(t => `<option value="${t}" ${tipoIni === t ? 'selected' : ''}>${{ gasto: 'Gasto (saída)', receita: 'Entrada (receita)', mov: 'Não conta (transf./fatura)' }[t]}</option>`).join('')}
            </select>
          </label>
          <label>Conta ou cartão<select id="dlConta" ${trava}>${contaOpts}</select></label>
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

        // "Não conta" mantém o sentido: um Pix recebido de você mesma continua sendo entrada.
        const sinal = importado ? Math.sign(tx.valor)
          : tipo === 'receita' ? 1 : tipo === 'gasto' ? -1 : (tx ? Math.sign(tx.valor) || -1 : -1);
        const valorFinal = importado ? tx.valor : round2(sinal * absVal);

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
              catOrigem: 'usuario',
              parcela: nParc > 1 ? `${p}/${nParc}` : '',
              rateioEsperado: p === 1 && rat > 0 ? round2(rat) : 0
            });
          }
          state.lancamentos.push(...criados);
          await dbPutLanc(criados);
          state.mes = data.slice(0, 7);
        } else {
          const contaAntigaId = tx.contaId;
          if (tx.catId !== catId || tx.subId !== subId) tx.catOrigem = 'usuario';
          if (!importado) {
            tx.data = data;
            tx.valor = valorFinal;
            tx.contaId = contaId;
          }
          tx.desc = desc;
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
        if (!txEntrada.catId) Object.assign(txEntrada, { catId: 'transf', subId: '', catOrigem: 'usuario' });

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
          const mudados = state.lancamentos.filter(tx => !tx.catId && pareceMesmaTitularidade(norm(tx.desc)));
          for (const tx of mudados) Object.assign(tx, { catId: 'transf', subId: '', catOrigem: 'regra' });
          await dbPutLanc(mudados);
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
  function baixar(nome, conteudo, tipo) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    a.download = nome;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

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
    baixar(`bolso-backup-${hojeStr()}.json`, JSON.stringify(payload), 'application/json');
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
    baixar(`bolso-lancamentos-${hojeStr()}.csv`, '\uFEFF' + linhas.join('\r\n'), 'text/csv;charset=utf-8');
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

    for (const tx of lancs) if (tx.catId) tx.catOrigem = 'usuario';
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
