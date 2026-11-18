(() => {
  'use strict';

  const VERSAO = '2.1.2';
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
  function resumoMes(ym, diaMax = 31) {
    const lista = lancamentosDoMes(ym).filter(tx => Number(tx.data.slice(8, 10)) <= diaMax);
    const r = {
      lista, entrou: 0, saiu: 0, qtdEntrou: 0, qtdSaiu: 0, rendimentos: 0, fatura: 0, movLiq: 0,
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
          // Rendimento automático diário (centavos) não é "uma entrada" para quem lê o painel.
          if (tx.catId === 'rendimentos' && /RENDIMENTO/.test(norm(tx.desc))) r.rendimentos += tx.valor;
          else r.qtdEntrou++;
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

    for (const k of ['entrou', 'saiu', 'rendimentos', 'fatura', 'movLiq', 'compCartao', 'gastos']) r[k] = round2(r[k]);
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
  function irParaLancamentos({ cat = '', conta = '', sem = false, tipo = '' } = {}) {
    state.fTipo = tipo;
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

    const antigos = state.lancamentos.filter(tx => tx.catOrigem === 'antigo').length;
    aviso('#avisoRefazer', antigos
      ? `<b>A classificação automática melhorou.</b> ${antigos} lançamentos foram classificados pela versão anterior, que errava bastante (boletos da escola em Saúde, por exemplo). Refazer apaga essas categorias e reaplica só as regras; o que não tiver regra volta para você classificar.`
      : '', [
      { txt: 'Refazer agora', acao: refazerClassificacaoAntiga },
      { txt: 'Manter como está', acao: manterClassificacaoAntiga }
    ]);

    const ultBk = Number(localStorage.getItem('bolso-ultimo-backup') || 0);
    const diasSemBk = ultBk ? Math.floor((Date.now() - ultBk) / 86400000) : 999;
    aviso('#avisoBackup', !state.exemplo && state.lancamentos.length >= 25 && diasSemBk > 30
      ? (ultBk ? `Última cópia de segurança há ${diasSemBk} dias.` : 'Você ainda não salvou uma cópia de segurança dos seus dados.')
      : '', [{ txt: 'Salvar cópia', acao: exportarBackup }]);

    aviso('#avisoRevisar', res.semCat
      ? `<b>${res.semCat} ${res.semCat === 1 ? 'gasto' : 'gastos'}</b> sem categoria`
      : '', [{ txt: 'Classificar agora', acao: () => irParaLancamentos({ sem: true }) }]);

    const meses = mesesDoPainel();
    const cores = coresCategorias(meses);
    renderSaldoCard(meses);
    renderEntrouSaiu(res);
    renderContasStrip();
    renderRateioCard();
    renderFuturoCard(parcelasFuturasNoMes(state.mes));
    renderHistoricoCard(meses, cores);
    renderCategoriasCard(res, cores);
    renderOrcamentoCard(res, state.mes === mesAtualStr());
  }

  /* ---------- Saldo das contas: o box do topo, as tabelas mês a mês e o gráfico usam as mesmas contas ---------- */
  const contasBanco = () => state.contas.filter(c => c.tipo !== 'cartao');
  const saldoTotalEm = data => round2(contasBanco().reduce((acc, c) => acc + saldoEm(c, data), 0));
  const ateNoMes = m => (m === mesAtualStr() ? hojeStr() : fimDoMes(m));
  const dataBR = d => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
  const semRS = v => moed(v).replace(/R\$\s?/, '');
  const apelido = c => /BRASIL/i.test(c.nome) ? 'BB'
    : c.nome.replace(/\s*\(.*\)$/, '').replace(/^Banco\s+/i, '').replace(/\s+S\.?A\.?$/i, '');
  const nomeCurto = c => c.nome.replace(/\s*\(.*\)$/, '').replace(/\s+S\.?A\.?$/i, '');

  /**
   * Uma linha da tabela: saldo no início, entradas, saídas e saldo no fim do mês.
   * Sem conta = soma das contas bancárias; as transferências entre elas se anulam e ficam de fora.
   */
  function linhaSaldo(m, conta = null) {
    if (conta) {
      const doM = lancamentosDoMes(m).filter(tx => tx.contaId === conta.id);
      const ext = saldoExtratoNoMes(conta, m);
      return {
        m,
        ini: saldoEm(conta, vespera(m)),
        ent: round2(doM.filter(tx => tx.valor > 0).reduce((acc, tx) => acc + tx.valor, 0)),
        sai: round2(doM.filter(tx => tx.valor < 0).reduce((acc, tx) => acc - tx.valor, 0)),
        fim: saldoEm(conta, ateNoMes(m)),
        ext,
        confere: Boolean(ext) && Math.abs(saldoEm(conta, ext.data) - ext.valor) < 0.01
      };
    }
    const r = resumoMes(m);
    return {
      m,
      ini: saldoTotalEm(vespera(m)),
      ent: round2(r.entrou + Math.max(r.movLiq, 0)),
      sai: round2(r.saiu + Math.max(-r.movLiq, 0)),
      fim: saldoTotalEm(ateNoMes(m))
    };
  }

  /** Até 6 meses com lançamento, terminando no mês aberto. */
  function mesesDoPainel() {
    // Começa no primeiro mês com extrato bancário (compras antigas do cartão sozinhas não abrem um mês).
    const bancos = new Set(contasBanco().map(c => c.id));
    const base = bancos.size ? state.lancamentos.filter(tx => bancos.has(tx.contaId)) : state.lancamentos;
    const primeiro = base.reduce((min, tx) => (tx.data < min ? tx.data : min), '9999').slice(0, 7);
    const lista = [];
    for (let i = 5; i >= 0; i--) {
      const m = addMes(state.mes, -i);
      if (m >= primeiro) lista.push(m);
    }
    return lista.length ? lista : [state.mes];
  }

  /**
   * Cor de cada categoria pelo peso nos meses do painel: a maior fica com a 1ª cor da paleta, e assim por diante.
   * Cores bem diferentes entre si e as mesmas no gráfico e na lista. Da 8ª em diante, cinza ("Outros").
   */
  const PALETA = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)', 'var(--c7)'];
  function coresCategorias(meses) {
    const soma = {};
    for (const m of meses) {
      for (const [cid, v] of Object.entries(resumoMes(m).porCat)) if (cid !== '__sem') soma[cid] = (soma[cid] || 0) + v;
    }
    const mapa = { __sem: 'var(--c-sem)' };
    Object.entries(soma).sort((a, b) => b[1] - a[1]).forEach(([cid], i) => { mapa[cid] = PALETA[i] || 'var(--c-out)'; });
    return mapa;
  }
  const corDe = (cores, cid) => cores[cid] || 'var(--c-out)';
  /** Cor de uma categoria em qualquer tela: gastos com a paleta do painel, entradas em verde, movimentações em cinza. */
  function corCategoria(cores, cid) {
    const c = getCat(cid);
    if (!c) return 'var(--aviso-fg)';
    if (c.tipo === 'receita') return 'var(--pos)';
    if (c.tipo === 'mov') return 'var(--mut)';
    return corDe(cores, cid);
  }
  const mesNome = m => labelMes(m).split(' ')[0];
  const milhar = v => (v >= 0 ? '+' : '−') + (Math.abs(v) / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' mil';

  /** Bloco roxo do topo: quanto ela tem nas contas, quanto mudou no mês e a linha do saldo nos últimos meses. */
  function renderSaldoCard(meses) {
    const el = $('#cardSaldo');
    const bancos = contasBanco();
    el.hidden = !bancos.length;
    if (!bancos.length) return;
    const l = linhaSaldo(state.mes);
    const dif = round2(l.fim - l.ini);
    // Saldo no fim de cada mês (o mês aberto, até hoje): um ponto por mês, com o valor em cima e o mês embaixo.
    const pontos = meses.map(m => linhaSaldo(m).fim);
    const lo = Math.min(...pontos);
    const hi = Math.max(...pontos);
    const y = v => (hi === lo ? 52 : Math.round(30 + (1 - (v - lo) / (hi - lo)) * 44));
    // Desenha na largura real do bloco: no computador a linha estica, mas o texto fica do tamanho do celular.
    const largura = Math.max(260, Math.round((el.clientWidth || 300) - 32));
    const x = i => Math.round(26 + (i / Math.max(1, pontos.length - 1)) * (largura - 52));
    const curto = v => (Math.abs(v) >= 1000
      ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
      : Math.round(v).toLocaleString('pt-BR'));
    const grafico = pontos.length < 2 ? '' : `
      <svg class="spark" viewBox="0 0 ${largura} 104" width="${largura}" height="104" aria-hidden="true">
        <polyline points="${pontos.map((v, i) => `${x(i)},${y(v)}`).join(' ')}"/>
        ${pontos.map((v, i) => `
          <circle cx="${x(i)}" cy="${y(v)}" r="4.5" class="${i === pontos.length - 1 ? 'pt-ult' : 'pt'}"/>
          <text x="${x(i)}" y="${y(v) - 11}" class="pt-v">${curto(v)}</text>
          <text x="${x(i)}" y="98" class="pt-m">${esc(labelMesCurto(meses[i]))}</text>`).join('')}
      </svg>`;
    el.innerHTML = `
      <div class="cd-top"><span class="cd-lb">Dinheiro nas contas</span>${bancos.length > 1 ? `<span class="cd-lb">${bancos.map(apelido).join(' + ')}</span>` : ''}</div>
      <p class="saldo-big num">${moed(l.fim)}</p>
      <span class="pilula ${dif < 0 ? 'p-neg' : 'p-pos'} num">${dif < 0 ? '−' : '+'}${moed(Math.abs(dif))} ${state.mes === mesAtualStr() ? 'neste mês' : `em ${mesNome(state.mes).toLowerCase()}`}</span>
      ${grafico}`;
  }

  function renderEntrouSaiu(res) {
    const el = $('#cardES');
    const ant = resumoMes(addMes(state.mes, -1));
    let comp = '';
    if (ant.saiu > 0) {
      const pct = Math.round((res.saiu / ant.saiu - 1) * 100);
      comp = Math.abs(pct) < 3 ? `igual a ${labelMesCurto(addMes(state.mes, -1))}` : `${Math.abs(pct)}% ${pct > 0 ? 'acima' : 'abaixo'} de ${labelMesCurto(addMes(state.mes, -1))}`;
    }
    el.innerHTML = `
      <button type="button" class="cd cd-ent" data-tipo="ent"><span class="cd-lb">Entrou</span><span class="es-v num">${moed(res.entrou, true)}</span>
        <span class="cd-lb">${res.qtdEntrou} ${res.qtdEntrou === 1 ? 'entrada' : 'entradas'}${res.rendimentos > 0 ? ' + rendimentos' : ''}</span></button>
      <button type="button" class="cd cd-sai" data-tipo="sai"><span class="cd-lb">Saiu</span><span class="es-v num">${moed(res.saiu, true)}</span>
        <span class="cd-lb">${comp || `${res.qtdSaiu} ${res.qtdSaiu === 1 ? 'saída' : 'saídas'}`}</span></button>`;
    $$('[data-tipo]', el).forEach(b => { b.onclick = () => irParaLancamentos({ tipo: b.dataset.tipo }); });
  }

  /**
   * Fatura do cartão, olhando a partir do mês aberto:
   * - aberta: o que ainda vai ser pago. Se a última fatura importada não foi paga, é ela; se já foi,
   *   são as compras feitas depois dela (a próxima fatura, que pode estar incompleta até ser importada).
   * - ultima: a última fatura importada e quando foi paga.
   * Sem faturas importadas por arquivo (nome com o vencimento), usa o ciclo pelo dia de fechamento.
   */
  function faturaDoCartao(c, ym) {
    const doCartao = state.lancamentos.filter(tx => tx.contaId === c.id && !ehMov(tx));
    const total = lista => round2(lista.reduce((acc, tx) => acc - tx.valor, 0));
    const nomeMes = v => labelMes(v.slice(0, 7)).split(' ')[0].toLowerCase();
    const vencs = [...new Set(doCartao.map(tx => tx.fatura).filter(Boolean))].filter(v => v <= fimDoMes(addMes(ym, 1))).sort();

    if (vencs.length) {
      const venc = vencs.pop();
      const itens = doCartao.filter(tx => tx.fatura === venc);
      const valor = total(itens);
      const dia = d => Date.parse(`${d}T12:00:00Z`) / 86400000;
      const perto = tx => dia(tx.data) - dia(venc) <= 10 && dia(venc) - dia(tx.data) <= 25;
      const pgto = state.lancamentos.find(tx => perto(tx) && tx.data <= ateNoMes(ym) && (
        (ehPagamentoFatura(tx) && Math.abs(tx.valor + valor) <= 0.05) ||
        (tx.contaId === c.id && tx.valor > 0 && ehMov(tx) && Math.abs(tx.valor - valor) <= 0.05)));
      const ultima = { venc, valor, pgto, titulo: `fatura de ${nomeMes(venc)}` };
      if (!pgto) return { aberta: { valor, venc, completa: true, titulo: `Fatura de ${nomeMes(venc)} · vence ${dataBR(venc)}` }, ultima: null };

      const ultimaCompra = itens.map(tx => tx.data).sort().pop() || venc;
      const depois = doCartao.filter(tx => !tx.fatura && tx.data > ultimaCompra && tx.data <= ateNoMes(ym));
      const proxVenc = `${addMes(venc.slice(0, 7), 1)}-${venc.slice(8, 10)}`;
      return {
        aberta: { valor: total(depois), venc: proxVenc, completa: false, n: depois.length, desde: ultimaCompra,
          titulo: `Fatura de ${nomeMes(proxVenc)} · vence ${dataBR(proxVenc)}` },
        ultima
      };
    }

    const diaF = Math.min(Number(c.fechaDia) || 20, 28);
    const fecha = m => `${m}-${String(diaF).padStart(2, '0')}`;
    const ate = ym === mesAtualStr() && hojeStr() > fecha(ym) ? fecha(addMes(ym, 1)) : fecha(ym);
    const de = fecha(addMes(ate.slice(0, 7), -1));
    const itens = doCartao.filter(tx => tx.data > de && tx.data <= ate);
    return { aberta: { valor: total(itens), venc: '', completa: false, ciclo: true, titulo: `Fatura que fecha ${dataBR(ate)}` }, ultima: null };
  }

  /** Contas em linhas (nome à esquerda, valor à direita): bancos com o saldo e o cartão com a fatura em aberto. */
  function renderContasStrip() {
    const el = $('#contasStrip');
    el.hidden = !state.contas.length;
    if (!state.contas.length) return;
    const linhas = state.contas.map(c => {
      if (c.tipo === 'cartao') {
        const { aberta, ultima } = faturaDoCartao(c, state.mes);
        const sub = aberta.completa ? `a pagar até ${dataBR(aberta.venc)}`
          : ultima ? `fatura aberta · última paga em ${dataBR(ultima.pgto.data)}` : 'fatura aberta';
        return `<button type="button" class="cr" data-conta="${esc(c.id)}"><span>${esc(nomeCurto(c))}<small>${sub}</small></span><span class="cr-v num">${moed(aberta.valor)}</span></button>`;
      }
      const l = linhaSaldo(state.mes, c);
      const ok = l.ext ? (l.confere ? '<small class="ok">✓ igual ao extrato</small>' : '<small class="ng">diferente do extrato</small>') : '';
      return `<button type="button" class="cr" data-conta="${esc(c.id)}"><span>${esc(nomeCurto(c))}${ok}</span><span class="cr-v num ${l.fim < 0 ? 'neg' : ''}">${moed(l.fim)}</span></button>`;
    }).join('');
    el.innerHTML = `<span class="cd-lb">Contas</span>${linhas}`;
    $$('[data-conta]', el).forEach(b => { b.onclick = () => irParaLancamentos({ conta: b.dataset.conta }); });
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

    $('#cardOrc').hidden = !catsOrc.length;
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

  /** Para onde foi: barra única colorida e lista por categoria; tocar abre as subcategorias. */
  function renderCategoriasCard(res, cores) {
    const el = $('#cardCats');
    const itens = Object.entries(res.porCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    if (!itens.length) {
      el.innerHTML = `<p class="cd-tt">Para onde foi</p><p class="cd-lb">Nenhum gasto neste mês.</p>`;
      return;
    }
    const tot = itens.reduce((a, [, v]) => a + v, 0);
    const maior = itens[0][1];
    state.catsAbertas = state.catsAbertas || new Set();
    el.innerHTML = `
      <p class="cd-tt">Para onde foi</p>
      <p class="cd-lb num">${moed(tot)} em gastos em ${mesNome(state.mes).toLowerCase()}</p>
      <div class="barra-cats">${itens.map(([cid, v]) => `<span style="width:${(v / tot) * 100}%;background:${corDe(cores, cid)}"></span>`).join('')}</div>
      ${itens.map(([cid, v]) => {
        const cat = getCat(cid);
        const nome = cat ? cat.nome : 'Sem categoria';
        const subs = cat ? (cat.subs || []).map(sb => [sb.nome, res.porSub[`${cid}:${sb.id}`] || 0]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]) : [];
        const lim = Number(state.orcamentos[cid]) || 0;
        const aberto = state.catsAbertas.has(cid);
        return `
          <div class="ct ${aberto ? 'open' : ''}" data-cid="${esc(cid)}" data-subs="${subs.length}">
            <div class="cth"><span><i class="bol" style="background:${corDe(cores, cid)}"></i><b>${esc(nome)}</b>${subs.length ? ` <span class="seta-c">${aberto ? '▾' : '▸'}</span>` : ''}</span><b class="num">${moed(v)}</b></div>
            <div class="trk"><i style="width:${Math.round((v / maior) * 100)}%;background:${corDe(cores, cid)}"></i></div>
            <div class="ctm"><span>${Math.round((v / tot) * 100)}% dos gastos</span><span>${lim ? `${Math.round((v / lim) * 100)}% do limite` : 'sem limite'}</span></div>
            ${subs.length ? `<div class="subs" style="border-color:${corDe(cores, cid)}">${subs.map(([n, sv]) => `<div><span>${esc(n)}</span><span class="num">${moed(sv)}</span></div>`).join('')}</div>` : ''}
          </div>`;
      }).join('')}
      ${res.compCartao > 0 ? `<p class="cd-lb nota-cartao">Inclui ${moed(res.compCartao)} de compras no cartão, na data da compra.</p>` : ''}`;
    $$('.ct', el).forEach(ct => {
      ct.onclick = () => {
        const cid = ct.dataset.cid;
        if (cid === '__sem') return irParaLancamentos({ sem: true });
        if (ct.dataset.subs === '0') return irParaLancamentos({ cat: cid });
        if (state.catsAbertas.has(cid)) state.catsAbertas.delete(cid); else state.catsAbertas.add(cid);
        renderCategoriasCard(res, cores);
      };
    });
  }

  /** Últimos meses: entrou ao lado dos gastos empilhados por categoria; embaixo, quanto sobrou ou faltou. */
  function renderHistoricoCard(meses, cores) {
    const el = $('#histCard');
    const dados = meses.map(m => ({ m, ...resumoMes(m) }));
    if (state.histBase !== state.mes || !meses.includes(state.histSel)) {
      state.histSel = state.mes;
      state.histBase = state.mes;
    }
    const mx = Math.max(...dados.map(d => Math.max(d.entrou, d.gastos)), 1);
    const h = v => Math.round((v / mx) * 92);
    const top3 = Object.entries(cores).filter(([cid]) => cid !== '__sem').slice(0, 3).map(([, c]) => c);
    const pilha = d => {
      const grupos = {};
      for (const [cid, v] of Object.entries(d.porCat)) {
        const c = corDe(cores, cid);
        grupos[c] = (grupos[c] || 0) + v;
      }
      return Object.entries(grupos).sort((a, b) => b[1] - a[1])
        .map(([c, v]) => `<i style="height:${(v / d.gastos) * 100}%;background:${c}"></i>`).join('');
    };
    const sel = dados.find(d => d.m === state.histSel);
    const difSel = round2(sel.entrou - sel.gastos);
    const topSel = Object.entries(sel.porCat).filter(([cid]) => cid !== '__sem').sort((a, b) => b[1] - a[1])[0];
    el.innerHTML = `
      <p class="cd-tt">Últimos meses</p>
      <div class="leg-mini">
        <span><i class="mini-e"></i>Entrou</span>
        <span><i class="mini-s">${top3.map(c => `<b style="background:${c}"></b>`).join('')}</i>Gastou</span>
      </div>
      <div class="hist2">${dados.map(d => `
        <button type="button" class="mc ${d.m === state.histSel ? 'on' : ''}" data-mes="${d.m}" aria-label="${esc(labelMes(d.m))}">
          <span class="pr"><span class="en" style="height:${h(d.entrou)}px"></span><span class="st" style="height:${h(d.gastos)}px">${d.gastos ? pilha(d) : ''}</span></span>
          <span class="mm">${esc(labelMesCurto(d.m))}</span>
          <span class="dl num ${d.entrou - d.gastos >= 0 ? 'okc' : 'ngc'}">${milhar(d.entrou - d.gastos)}</span>
        </button>`).join('')}
      </div>
      <div class="res-mes">
        <p><b>${esc(mesNome(sel.m))}</b> · <b class="${difSel >= 0 ? 'okc' : 'ngc'} num">${difSel >= 0 ? 'sobraram' : 'faltaram'} ${moed(Math.abs(difSel), true)}</b></p>
        <p class="cd-lb num">Entrou ${moed(sel.entrou, true)} · gastou ${moed(sel.gastos, true)}${topSel ? ` · mais pesou: <b style="color:${corDe(cores, topSel[0])}">${esc(getCat(topSel[0])?.nome || '')}</b>` : ''}</p>
      </div>`;
    $$('.mc', el).forEach(b => { b.onclick = () => { state.histSel = b.dataset.mes; renderHistoricoCard(meses, cores); }; });
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
    $$('#fTipo button').forEach(b => b.classList.toggle('on', b.dataset.v === (state.fTipo || '')));
    popularFiltrosLancamentos();

    const busca = norm($('#busca').value);
    const buscaNum = parseValor($('#busca').value);
    const fCat = $('#fCat').value;
    const fConta = $('#fConta').value;
    const fSem = $('#fSem').checked;

    const filtrados = lancamentosDoMes(state.mes)
      .filter(tx => {
        if (fSem && tx.catId) return false;
        // Entradas e Saídas mostram só o que conta: transferências entre as próprias contas,
        // aplicações e pagamento de fatura ficam só em "Todos" (com a etiqueta cinza).
        if ((state.fTipo === 'ent' || state.fTipo === 'sai') && ehMov(tx)) return false;
        if (state.fTipo === 'ent' && tx.valor <= 0) return false;
        if (state.fTipo === 'sai' && tx.valor >= 0) return false;
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
    $('#lancResumo').innerHTML = `<span>${filtrados.length} ${filtrados.length === 1 ? 'lançamento' : 'lançamentos'}</span>
      <span class="pl pl-e num">+${moed(totEnt, true)}</span><span class="pl pl-s num">−${moed(totSai, true)}</span>`;

    const temSemCat = filtrados.some(x => !x.catId);

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
    const coresLanc = coresCategorias(mesesDoPainel());
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
              <span class="${tagCls}" style="color:${corCategoria(coresLanc, tx.catId)}">${esc(tagTxt)}${esc(extraInfo)}</span>
              ${tx.parcela ? `<span class="parc-tag">${esc(tx.parcela)}</span>` : ''}
            </div>
            <span class="ct">${esc(conta ? nomeCurto(conta) : '')}</span>
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
          const outros = await criarRegraEAplicar(sugerirTextoRegra(tx.desc), tx.catId, tx.subId, tx);
          treinarIA();
          toast(`Classificado em ${labelCat(tx.catId, tx.subId)}${outros ? ` · e mais ${outros} parecido${outros === 1 ? '' : 's'}` : ''}`);
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

  /** "Fatura2026-11-20.csv" → "2026-11-20": nas faturas de cartão, a data do nome é o vencimento. */
  function vencimentoDoNome(nome) {
    const m = String(nome || '').match(/(20\d{2})[-_.]?(\d{2})[-_.]?(\d{2})/);
    return m && Number(m[2]) >= 1 && Number(m[2]) <= 12 && Number(m[3]) >= 1 && Number(m[3]) <= 31 ? `${m[1]}-${m[2]}-${m[3]}` : '';
  }

  async function importarItens({ conta, itens, saldoExtrato = null, saldoExtratoData = null, fatura = '' }) {
    if (conta.tipo !== 'cartao') fatura = '';
    if (typeof saldoExtrato === 'number' && Number.isFinite(saldoExtrato)) {
      const data = saldoExtratoData || hojeStr();
      conta.saldos = { ...(conta.saldos || {}), [data]: saldoExtrato };
      if (!conta.saldoExtratoData || data >= conta.saldoExtratoData) {
        conta.saldoExtrato = saldoExtrato;
        conta.saldoExtratoData = data;
        conta.saldoInicialManual = false;
      }
    }

    // Chave de cada lançamento já importado nesta conta → o lançamento (para não duplicar).
    const existentes = new Map();
    for (const tx of state.lancamentos) {
      if (tx.contaId !== conta.id) continue;
      if (tx.fitid) existentes.set(`fit|${tx.fitid}|${tx.data}|${Math.round(tx.valor * 100)}`, tx);
      if (tx.hashImport) existentes.set(tx.hashImport, tx);
    }
    const marcados = [];

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
      const chave = it.fitid ? `fit|${it.fitid}|${it.data}|${centavos}` : hashImport;

      const jaTem = existentes.get(chave);
      if (jaTem) {
        duplicados++;
        // Reimportar uma fatura antiga marca a qual fatura cada compra pertence.
        if (fatura && !jaTem.fatura) {
          jaTem.fatura = fatura;
          marcados.push(jaTem);
        }
        continue;
      }
      existentes.set(chave, true);

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
        fatura,
        hashImport
      });
    }

    state.lancamentos.push(...novos);
    const conciliados = conciliarTransferencias();
    for (const c of state.contas) recalcularSaldoInicialPorExtrato(c);

    await kvSet('contas', state.contas);
    await dbPutLanc([...new Set([...novos, ...conciliados, ...marcados])]);
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
            fatura: vencimentoDoNome(file.name),
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

  /** Limite por categoria: bolinha da cor, campo do limite, "usar média" ou a barra de quanto já gastou. */
  function renderOrcamento() {
    const cats = state.categorias.filter(c => c.tipo === 'gasto');
    const cores = coresCategorias(mesesDoPainel());
    const res = resumoMes(state.mes);
    const box = $('#orcLista');
    box.innerHTML = cats.map(c => {
      const lim = Number(state.orcamentos[c.id]) || 0;
      const sug = media3MesesCat(c.id);
      const gasto = res.porCat[c.id] || 0;
      const cor = corDe(cores, c.id);
      const extra = lim
        ? `<div class="orc-prog"><div class="trk"><i style="width:${Math.min(100, (gasto / lim) * 100)}%;background:${gasto > lim ? 'var(--neg)' : cor}"></i></div>
           <span class="cd-lb num">Gastou ${moed(gasto, true)} de ${moed(lim, true)}${gasto > lim ? ` · passou ${moed(gasto - lim, true)}` : ''}</span></div>`
        : sug > 0 ? `<button type="button" class="usar num" data-usar="${esc(c.id)}" data-v="${sug}">usar ${moed(sug, true)}</button>`
          : '<span class="cd-lb">sem histórico</span>';
      return `
        <div class="orc-l2">
          <span class="nm"><i class="bol" style="background:${cor}"></i>${esc(c.nome)}</span>
          <input type="number" inputmode="decimal" min="0" step="10" placeholder="Sem limite" data-orc="${esc(c.id)}" value="${lim || ''}" aria-label="Limite de ${esc(c.nome)}">
          ${extra}
        </div>`;
    }).join('');

    renderOrcResumo(res);

    const salvar = async (cid, v) => {
      if (v > 0) state.orcamentos[cid] = v;
      else delete state.orcamentos[cid];
      await kvSet('orcamentos', state.orcamentos);
      renderOrcamento();
    };
    $$('input[data-orc]', box).forEach(inp => {
      inp.onchange = async () => { await salvar(inp.dataset.orc, Math.max(0, Number(inp.value) || 0)); toast('Orçamento atualizado'); };
    });
    $$('button[data-usar]', box).forEach(b => {
      b.onclick = async () => { await salvar(b.dataset.usar, Number(b.dataset.v)); toast('Limite preenchido pela média'); };
    });
  }

  /** Topo do Orçamento: quanto do total já foi usado, comparado com quanto do mês já passou. */
  function renderOrcResumo(res) {
    const el = $('#orcResumo');
    const lims = Object.entries(state.orcamentos).filter(([cid, v]) => Number(v) > 0 && getCat(cid));
    if (!lims.length) {
      el.innerHTML = `<p class="cd-tt">Orçamento de ${esc(mesNome(state.mes).toLowerCase())}</p>
        <p class="cd-lb">Defina limites nas categorias abaixo (ou toque em "usar" para começar pela média) e o Bolso mostra aqui quanto já foi usado.</p>`;
      return;
    }
    const total = lims.reduce((a, [, v]) => a + Number(v), 0);
    const usado = lims.reduce((a, [cid]) => a + (res.porCat[cid] || 0), 0);
    const pct = Math.round((usado / total) * 100);
    let ritmo = '';
    if (state.mes === mesAtualStr()) {
      const hoje = new Date();
      const diasMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
      ritmo = ` · ${Math.round((hoje.getDate() / diasMes) * 100)}% do mês já passou`;
    }
    el.innerHTML = `
      <p class="cd-lb">Orçamento de ${esc(mesNome(state.mes).toLowerCase())}</p>
      <p class="orc-big num">${moed(usado, true)} <span>de ${moed(total, true)}</span></p>
      <div class="trk"><i style="width:${Math.min(100, pct)}%;background:${pct > 100 ? 'var(--neg)' : 'var(--pri)'}"></i></div>
      <p class="cd-lb">${pct}% usado${ritmo}</p>`;
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
              <b>${esc(nomeCurto(c))}</b>
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
      ulRegras.innerHTML = `<li><span class="mut">Nenhuma regra ainda. Elas aparecem aqui quando você classifica um lançamento.</span></li>`;
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
    const coresAj = coresCategorias(mesesDoPainel());
    ulCats.innerHTML = state.categorias.map(c => {
      const subsTxt = (c.subs && c.subs.length)
        ? c.subs.map(s => s.nome).join(', ')
        : 'Sem subcategorias';
      return `
        <li data-cat-edit="${esc(c.id)}">
          <div>
            <b><i class="bol" style="background:${corCategoria(coresAj, c.id)}"></i>${esc(c.nome)}</b>
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

  /** Texto sugerido para a regra: as duas primeiras palavras que dizem algo ("ASSOCIACAO VEREDAS"). */
  function sugerirTextoRegra(desc) {
    const tokens = tokenizar(desc);
    return tokens.length ? tokens.slice(0, 2).join(' ') : norm(desc).slice(0, 24);
  }

  /** Lançamentos já no app que a regra pegaria (mesmo sentido; nunca os que ela classificou à mão). */
  function parecidosComRegra(texto, tx) {
    if (!norm(texto)) return [];
    const sinal = tx ? Math.sign(tx.valor) : -1;
    return state.lancamentos.filter(x => x !== tx && x.catOrigem !== 'usuario' &&
      Math.sign(x.valor) === sinal && casaRegra(textoBusca(x.desc), texto, false));
  }

  /** Cria (ou troca) a regra e aplica a todos os lançamentos parecidos que ela não classificou à mão. */
  async function criarRegraEAplicar(texto, catId, subId, tx) {
    const chave = norm(texto);
    if (!chave || !getCat(catId)) return 0;
    state.regras = state.regras.filter(r => norm(r.texto) !== chave);
    state.regras.unshift({ texto: chave, catId, subId });
    await kvSet('regras', state.regras);
    const lista = parecidosComRegra(chave, tx);
    for (const x of lista) Object.assign(x, { catId, subId, catOrigem: 'regra' });
    await dbPutLanc(lista);
    return lista.length;
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
        <div class="sub-box" id="dlRegraBox" hidden>
          <label>Regra: daqui para frente, descrição com o texto<input id="dlRegraTxt" maxlength="60" placeholder="apague para não criar regra"></label>
          <p id="dlRegraN" style="margin:0"></p>
          <p class="mut" id="dlRegraEx" style="margin:0"></p>
        </div>
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

        // Regra: texto sugerido (editável) e quantos lançamentos que já estão no app ela também pegaria.
        const txt = $('#dlRegraTxt');
        txt.value = sugerirTextoRegra($('#dlDesc').value);
        const catIni = tx ? tx.catId : '';
        const subIni = tx ? (tx.subId || '') : '';
        const atualizar = () => {
          // Só ao trocar a categoria de um lançamento que já existia (o manual é dela, não vira regra).
          $('#dlRegraBox').hidden = novo || (dlCat.value === catIni && (dlSub.value || '') === subIni);
          const lista = parecidosComRegra(txt.value, tx);
          $('#dlRegraN').textContent = lista.length
            ? `Vale também para ${lista.length} ${lista.length === 1 ? 'lançamento que já está' : 'lançamentos que já estão'} no app.`
            : 'Nenhum outro lançamento no app tem esse texto; vale para os próximos.';
          $('#dlRegraEx').textContent = lista.length
            ? `Ex.: ${lista.slice(0, 3).map(x => `${x.data.slice(8, 10)}/${x.data.slice(5, 7)} ${x.desc} (${moed(Math.abs(x.valor))})`).join('; ')}${lista.length > 3 ? '…' : ''}. Os que você classificou à mão não mudam.`
            : '';
        };
        dlTipo.onchange = () => { syncCats(); atualizar(); };
        dlCat.onchange = () => { syncSubs(); atualizar(); };
        dlSub.onchange = atualizar;
        txt.oninput = atualizar;
        atualizar();
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

        const aplicados = $('#dlRegraBox').hidden ? 0
          : await criarRegraEAplicar($('#dlRegraTxt').value, catId, subId, tx);

        treinarIA();
        toast(aplicados ? `Salvo · e mais ${aplicados} ${aplicados === 1 ? 'lançamento parecido' : 'lançamentos parecidos'}`
          : novo ? 'Lançamento salvo' : 'Alterações salvas');
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
  // A linha do saldo é desenhada na largura do bloco; ao mudar o tamanho da janela, redesenha.
  let timerResize = null;
  window.addEventListener('resize', () => {
    clearTimeout(timerResize);
    timerResize = setTimeout(() => { if (state.view === 'painel') renderPainel(); }, 150);
  });

  function configurarPWA() {
    if ('serviceWorker' in navigator) {
      let recarregando = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (recarregando) return;
        recarregando = true;
        window.location.reload();
      });
      navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(reg => {
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
    $$('#fTipo button').forEach(b => {
      b.onclick = () => { state.fTipo = b.dataset.v; state.limiteLanc = 60; renderLancamentos(); };
    });
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

      const res = await importarItens({ conta, itens, fatura: vencimentoDoNome(fileName) });
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
      const cat = getCat(catId);
      if (!norm(texto) || !cat) return;
      state.regras = state.regras.filter(r => norm(r.texto) !== norm(texto));
      state.regras.unshift({ texto: norm(texto), catId, subId });
      await kvSet('regras', state.regras);
      // Vale também para o que já está no app (menos o que ela classificou à mão).
      const lista = state.lancamentos.filter(x => x.catOrigem !== 'usuario' && tipoCombina(cat, x.valor) &&
        casaRegra(textoBusca(x.desc), texto, false));
      for (const x of lista) Object.assign(x, { catId, subId, catOrigem: 'regra' });
      await dbPutLanc(lista);
      treinarIA();
      $('#rTexto').value = '';
      renderAjustes();
      toast(lista.length ? `Regra criada · ${lista.length} ${lista.length === 1 ? 'lançamento atualizado' : 'lançamentos atualizados'}` : 'Regra criada');
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
