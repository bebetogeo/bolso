'use strict';
/* Bolso — controle financeiro pessoal. Tudo roda e fica guardado neste aparelho (IndexedDB). */
const VERSAO = '1.3.0';

// ───────────────────────── utilidades ─────────────────────────
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtNum = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const brl = c => fmtBRL.format(c / 100);
const brl0 = c => fmtBRL.format(Math.round(c / 100)).replace(/,00$/, '');
const p2 = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
const hoje = () => iso(new Date());
const mesAtual = () => hoje().slice(0, 7);
const dataBR = d => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const dataBRa = d => `${dataBR(d)}/${d.slice(0, 4)}`;
const addMes = (m, n) => { const d = new Date(+m.slice(0, 4), +m.slice(5, 7) - 1 + n, 1); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}`; };
const diasNoMes = m => new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate();
const mesLongo = m => new Date(+m.slice(0, 4), +m.slice(5, 7) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
const mesSo = m => new Date(+m.slice(0, 4), +m.slice(5, 7) - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
const mesCurto = m => new Date(+m.slice(0, 4), +m.slice(5, 7) - 1, 1).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
const difDias = (a, b) => Math.round((new Date(a + 'T12:00') - new Date(b + 'T12:00')) / 864e5);
const norm = s => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

/** Converte texto em centavos. Aceita "1.234,56", "-1234.56", "R$ 45,90", "45,90-", "(45,90)", "45,90 D". */
function parseValor(s, dec) {
  if (s == null) return NaN;
  s = String(s).replace(/R\$|\s|\u00a0/g, '');
  if (!s) return NaN;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (/[DC]$/i.test(s)) { if (/D$/i.test(s)) neg = true; s = s.slice(0, -1); }
  if (/-$/.test(s)) { neg = true; s = s.slice(0, -1); }
  if (s[0] === '-' || s[0] === '−') { neg = !neg; s = s.slice(1); } else if (s[0] === '+') s = s.slice(1);
  if (!/^\d[\d.,]*$/.test(s) && !/^[.,]\d+$/.test(s)) return NaN;
  const c = s.lastIndexOf(','), p = s.lastIndexOf('.');
  if (c >= 0 && p >= 0) s = c > p ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  else if (c >= 0) s = (dec === '.' && /^\d{1,3}(,\d{3})+$/.test(s)) ? s.replace(/,/g, '') : s.replace(',', '.');
  else if (p >= 0 && dec === ',' && /^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) * (neg ? -1 : 1) : NaN;
}
function parseData(s) {
  s = String(s ?? '').trim(); let m, y, mo, d;
  if ((m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s))) [y, mo, d] = [+m[1], +m[2], +m[3]];
  else if ((m = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4}|\d{2})(?!\d)/.exec(s))) [d, mo, y] = [+m[1], +m[2], +m[3] < 100 ? 2000 + +m[3] : +m[3]];
  else if ((m = /^(\d{1,2})\/(\d{1,2})$/.exec(s))) {
    [d, mo] = [+m[1], +m[2]]; y = new Date().getFullYear();
    if (new Date(y, mo - 1, d) - new Date() > 31 * 864e5) y--;
  } else return null;
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return null;
  return `${y}-${p2(mo)}-${p2(d)}`;
}
function decodificar(buf) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch { return new TextDecoder('windows-1252').decode(buf); }
}
function baixar(nome, conteudo, tipo) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  a.download = nome; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3500);
}

/** Detecta padrão de parcelamento na descrição (ex.: "PARC 02/10", "3/6", "01 DE 12"). */
function detectarParcela(desc) {
  const s = String(desc ?? '').toUpperCase();
  const m = /(?:PARC(?:ELA)?\.?\s*)?(\d{1,2})\s*(?:\/|DE)\s*(\d{1,2})(?!\d)/i.exec(s);
  if (!m) return null;
  const atual = +m[1], total = +m[2];
  if (atual < 1 || total < 2 || total > 48 || atual > total) return null;
  const antes = s.slice(Math.max(0, m.index - 10), m.index);
  if (/\b(?:DIA|DATA|EM)\s*$/.test(antes) && total <= 12) return null;
  const base = norm(s.slice(0, m.index) + ' ' + s.slice(m.index + m[0].length));
  return { atual, total, base };
}

// ───────────────────────── banco de dados ─────────────────────────
const LOJAS = ['tx', 'contas', 'cats', 'regras'];
const DB = {
  db: null,
  abrir() {
    return new Promise((ok, erro) => {
      const r = indexedDB.open('bolso', 1);
      r.onupgradeneeded = () => { for (const s of LOJAS) r.result.createObjectStore(s, { keyPath: 'id' }); r.result.createObjectStore('meta'); };
      r.onsuccess = () => { this.db = r.result; ok(); };
      r.onerror = () => erro(r.error);
    });
  },
  op(lojas, modo, fn) {
    return new Promise((ok, erro) => {
      const t = this.db.transaction(lojas, modo); let res;
      t.oncomplete = () => ok(res); t.onerror = t.onabort = () => erro(t.error);
      res = fn(t);
    });
  },
  todos(loja) { let r; return this.op(loja, 'readonly', t => { r = t.objectStore(loja).getAll(); }).then(() => r.result); },
  async metaTudo() {
    const m = {};
    await this.op('meta', 'readonly', t => { t.objectStore('meta').openCursor().onsuccess = e => { const c = e.target.result; if (c) { m[c.key] = c.value; c.continue(); } }; });
    return m;
  },
  gravar(loja, itens) { return this.op(loja, 'readwrite', t => { const s = t.objectStore(loja); for (const i of [].concat(itens)) s.put(i); }); },
  apagar(loja, ids) { return this.op(loja, 'readwrite', t => { const s = t.objectStore(loja); for (const i of [].concat(ids)) s.delete(i); }); },
  meta(k, v) { S.meta[k] = v; return this.op('meta', 'readwrite', t => { v === undefined ? t.objectStore('meta').delete(k) : t.objectStore('meta').put(v, k); }); },
  limpar() { return this.op([...LOJAS, 'meta'], 'readwrite', t => { for (const s of [...LOJAS, 'meta']) t.objectStore(s).clear(); }); },
};

// ───────────────────────── estado e mês de competência ─────────────────────────
const S = { tx: [], contas: [], cats: [], regras: [], meta: {}, mes: mesAtual(), view: 'painel', limite: 200, catMap: {}, contaMap: {}, regrasOrd: [] };
function indexar() {
  S.catMap = Object.fromEntries(S.cats.map(c => [c.id, c]));
  S.contaMap = Object.fromEntries(S.contas.map(c => [c.id, c]));
  const tam = (a, b) => b.texto.length - a.texto.length;
  S.regrasOrd = [...S.regras.filter(r => !r.padrao).sort(tam), ...S.regras.filter(r => r.padrao).sort(tam)];
  treinarModelo();
}
const temDados = () => S.tx.length > 0;

/** Retorna o mês de competência do lançamento (considera o dia de fechamento nos cartões de crédito). */
function mesCompetencia(t) {
  const m = t.data.slice(0, 7);
  if (t.projecao) return m;
  const c = S.contaMap[t.conta];
  if (c && c.tipo === 'cartao' && c.fechamento > 0 && c.fechamento <= 31) {
    const dia = +t.data.slice(8, 10);
    if (dia >= c.fechamento) return addMes(m, 1);
  }
  return m;
}

// ───────────────────────── categorias e regras padrão ─────────────────────────
const CATS_PADRAO = [
  ['moradia', 'Moradia', 'gasto'], ['mercado', 'Mercado', 'gasto'], ['restaurantes', 'Restaurantes e delivery', 'gasto'],
  ['transporte', 'Transporte', 'gasto'], ['saude', 'Saúde', 'gasto'], ['cuidados', 'Cuidados pessoais', 'gasto'],
  ['assinaturas', 'Assinaturas', 'gasto'], ['compras', 'Compras', 'gasto'], ['lazer', 'Lazer', 'gasto'],
  ['educacao', 'Educação', 'gasto'], ['pets', 'Pets', 'gasto'], ['tarifas', 'Tarifas e impostos', 'gasto'],
  ['pix', 'Pix e transferências', 'gasto'], ['salario', 'Salário', 'receita'], ['entradas', 'Outras entradas', 'receita'],
  ['fatura', 'Pagamento de fatura', 'mov'], ['transf', 'Transferência entre minhas contas', 'mov'], ['invest', 'Investimentos (aplicação e resgate)', 'mov'],
];
const CATS_FIXAS = ['pix', 'entradas', 'fatura', 'transf', 'invest'];
const TIPO_NOME = { gasto: 'Gasto', receita: 'Entrada', mov: 'Não conta' };
const REGRAS_PADRAO = {
  moradia: 'ALUGUEL|CONDOMINIO|IMOBILIARIA|QUINTOANDAR|CEMIG|COPASA|ENEL=|CPFL|LIGHT=|SABESP|EQUATORIAL|ENERGISA|NEOENERGIA|COELBA|CELPE|COPEL|CELESC|SANEPAR|CEDAE|CAESB|EMBASA|COMPESA|CORSAN|SANEAGO|COMGAS|GASMIG|ULTRAGAZ|SUPERGASBRAS|LIQUIGAS|VIVO=|CLARO=|TIM=|OI MOVEL|OI FIXO|TELEFONICA|SKY=|INTERNET|ENERGIA ELETRICA|CONTA DE LUZ|CONTA DE AGUA|AGUA E ESGOTO|GAS ENCANADO',
  mercado: 'SUPERMERC|HIPERMERC|MERCADINHO|MERCEARIA|ATACADAO|ATACAREJO|ASSAI|CARREFOUR|PAO DE ACUCAR|EXTRA HIPER|SUPER NOSSO|VERDEMAR|EPA=|MART MINAS|APOIO MINEIRO|DIA BRASIL|SACOLAO|HORTIFRUTI|ACOUGUE|PADARIA|PANIFICADORA|SAMS CLUB|ZAFFARI|GUANABARA|MUFFATO|ANGELONI|SAVEGNAGO|TENDA ATACADO|GRUPO MATEUS|SUPER BH|BH SUPERM|OBA HORTI|ST MARCHE|MAMBO=',
  restaurantes: 'IFOOD|IFD=|RAPPI|UBER EATS|UBEREATS|ZE DELIVERY|AIQFOME|RESTAUR|LANCHON|LANCHES|PIZZ|BURGER|HAMBURG|MCDONALD|MC DONALD|BK BRASIL|SUBWAY|HABIB|OUTBACK|STARBUCKS|CAFETERIA|CAFE=|SUSHI|CHURRASC|PASTEL|SORVET|ACAI|DOCERIA|CONFEITARIA|SPOLETO|GIRAFFAS|BOBS=|COCO BAMBU|MADERO|BAR E|BOTECO|CHOPERIA|ESPETO|TEMAKI|CACAU SHOW|KOPENHAGEN',
  transporte: 'UBER|99APP|99 POP|99POP|99 TECNOLOGIA|99 TAXI|CABIFY|POSTO|AUTO POSTO|IPIRANGA|SHELL|PETROBRAS|COMBUST|ESTACIONAMENTO|ESTAPAR|PARKING|ZONA AZUL|SEM PARAR|CONECTCAR|VELOE|PEDAGIO|METRO=|BILHETE UNICO|BUSER|CLICKBUS|RODOVIARIA|LATAM|GOL LINHAS|AZUL LINHAS|LOCALIZA|MOVIDA|OFICINA|AUTO PECAS|BORRACHARIA|LAVA JATO|TEMBICI',
  saude: 'FARMAC|DROGA|DROGARIA|DROGASIL|PAGUE MENOS|PANVEL|UNIMED|AMIL=|HAPVIDA|NOTREDAME|SULAMERICA SAUDE|BRADESCO SAUDE|LABORAT|CLINICA|HOSPITAL|ODONTO|DENTIST|HERMES PARDINI|FLEURY|PSICOLOG|FISIOTERAP|CONSULTORIO|MEDIC',
  cuidados: 'SALAO|CABELEIR|BARBEAR|MANICURE|ESMALTERIA|ESTETIC|DEPIL|ESPACO LASER|BOTICARIO|NATURA=|SEPHORA|QUEM DISSE BERENICE|BELEZA NA WEB|SOBRANCELHA|ACADEMIA|SMARTFIT|SMART FIT|BLUEFIT|BODYTECH|GYMPASS|WELLHUB|TOTALPASS|PILATES|PERFUMARIA',
  assinaturas: 'NETFLIX|SPOTIFY|AMAZON PRIME|AMAZONPRIME|PRIME VIDEO|DISNEY|HBO|GLOBOPLAY|DEEZER|YOUTUBE|APPLE COM BILL|GOOGLE ONE|GOOGLE STORAGE|ICLOUD|PARAMOUNT|CRUNCHYROLL|MICROSOFT|CHATGPT|OPENAI|CANVA|KINDLE UNLIMITED|AUDIBLE|TELECINE|PREMIERE|MUBI=|TINDER|LINKEDIN',
  compras: 'AMAZON|MERCADO LIVRE|MERCADOLIVRE|SHOPEE|SHEIN|ALIEXPRESS|MAGALU|MAGAZINE LUIZA|AMERICANAS|CASAS BAHIA|RENNER|RIACHUELO|C A MODAS|CEA=|ZARA=|LEROY|TOK STOK|TOKSTOK|KABUM|CENTAURO|NETSHOES|DECATHLON|HAVAN|MARISA|PERNAMBUCANAS|DAFITI|PONTO FRIO|FAST SHOP|ZATTINI|AREZZO|OTICA|TELHANORTE',
  lazer: 'CINEMA|CINEMARK|CINEPOLIS|INGRESSO|SYMPLA|EVENTIM|TICKETMASTER|TICKETS FOR FUN|TEATRO|BOOKING|AIRBNB|HOTEL|POUSADA|HOSTEL|DECOLAR|HURB|STEAM|PLAYSTATION|XBOX|NINTENDO|LIVRARIA|PARQUE|MUSEU|BOLICHE',
  educacao: 'ESCOLA|COLEGIO|FACULDADE|UNIVERSIDADE|CURSO|UDEMY|ALURA|COURSERA|DUOLINGO|HOTMART|CULTURA INGLESA|WIZARD|CCAA=|FISK=|PAPELARIA|KALUNGA|MENSALIDADE ESCOLAR',
  pets: 'PET SHOP|PETSHOP|PET CENTER|PETZ|PETLOVE|COBASI|VETERIN|AGROPET|BANHO E TOSA|CLINICA VET',
  tarifas: 'TARIFA|TAR=|ANUIDADE|IOF=|JUROS|MULTA|ENCARGO|CESTA DE SERV|PACOTE DE SERV|PACOTE SERV|MANUTENCAO DE CONTA|MANUT CONTA|IPTU|IPVA|DARF|RECEITA FEDERAL|DETRAN|LICENCIAMENTO|IMPOSTO|IRPF|CARTORIO|SEGURO PRESTAMISTA',
  pix: '-PIX|-TED=|-DOC=|-TEV=|-TRANSF',
  salario: '+SALARIO|+FOLHA DE PAGAMENTO|+PROVENTOS|+REMUNERACAO SALARIO|+CREDITO DE SALARIO|+FERIAS=|+ADIANTAMENTO SALARIAL|+BENEFICIO INSS|+INSS=',
  entradas: '+PIX|+TED=|+DOC=|+TEV=|+TRANSF|+ESTORNO|+REEMBOLSO|+CASHBACK|+RENDIMENTO|+DEPOSITO|+DEP DINHEIRO|+RESTITUICAO',
  fatura: 'PAGAMENTO FATURA|PAGAMENTO DE FATURA|PAGTO FATURA|PGTO FATURA|PAG FATURA|FATURA CARTAO|FATURA DE CARTAO|PAGAMENTO CARTAO|PAGTO CARTAO|PGTO CARTAO|CARTAO DE CREDITO|CARTAO CREDITO|GASTOS CARTAO|PAGAMENTO RECEBIDO|PAGAMENTO EFETUADO|CARTAO VISA|CARTAO MASTER|CARTAO ELO|OUROCARD|SICOOBCARD|FATURA=',
  transf: 'ENTRE CONTAS|MESMA TITULARIDADE|CONTAS PROPRIAS',
  invest: 'APLIC|RESGATE|RESG=|CDB=|RDB=|RDC=|LCI=|LCA=|POUPANCA|TESOURO DIRETO|INVEST|CORRETORA|NUINVEST|FUNDO DE INV|PREVIDENCIA',
};
function regrasPadrao() {
  const out = [];
  for (const [cat, lista] of Object.entries(REGRAS_PADRAO)) for (let t of lista.split('|')) {
    const r = { cat, padrao: true, sinal: 0, modo: 'p' };
    if (t[0] === '+') { r.sinal = 1; t = t.slice(1); } else if (t[0] === '-') { r.sinal = -1; t = t.slice(1); }
    if (t.endsWith('=')) { r.modo = 'w'; t = t.slice(0, -1); }
    r.texto = t; r.id = `p:${cat}:${r.sinal}:${t}`; out.push(r);
  }
  return out;
}
async function semear() {
  S.cats = CATS_PADRAO.map(([id, nome, tipo], i) => ({ id, nome, tipo, ordem: i, orc: null }));
  S.regras = regrasPadrao();
  await DB.gravar('cats', S.cats); await DB.gravar('regras', S.regras);
  await DB.meta('criadoEm', hoje());
  indexar();
}

// ───────────────────────── aprendizado de máquina (classificador) ─────────────────────────
// Classificador leve (Naive Bayes Multinomial + similaridade de valor para recorrências/Pix).
// Roda em memória sobre os lançamentos classificados do aparelho, dando peso maior às escolhas manuais.
const PALAVRAS_VAZIAS = new Set('PIX ENVIADO RECEBIDO TRANSF TRANSFERENCIA TED DOC TEV COMPRA COMPRAS CARTAO DEBITO CREDITO PAGTO PAGAMENTO PGTO VISA ELECTRON ELO MASTER MASTERCARD MAESTRO DE DA DO DAS DOS COM NO NA EM PARA QR CODE DES REM VIA A O E BR SAO PAULO BELO HORIZONTE PARC PARCELA'.split(' '));
const IA = { prontos: false, nManuais: 0, nTotal: 0, catPeso: {}, featCat: {}, featTot: {}, vocab: new Set(), exManuais: [] };

function faixaValor(cent) {
  const v = Math.abs(cent) / 100;
  if (v < 20) return 'v:micro';
  if (v < 60) return 'v:peq';
  if (v < 180) return 'v:med';
  if (v < 600) return 'v:alto';
  if (v < 2000) return 'v:muito_alto';
  return 'v:grande';
}

function extrairFeatures(desc, valor, conta, data) {
  const bruto = norm(desc).split(' ').filter(w => w.length >= 2 && !/^\d+$/.test(w));
  const sig = bruto.filter(w => !PALAVRAS_VAZIAS.has(w));
  const feats = [];
  for (const w of sig) feats.push(`w:${w}`);
  for (let i = 0; i < sig.length - 1; i++) feats.push(`bi:${sig[i]}_${sig[i + 1]}`);
  if (sig.length) feats.push(`ini:${sig[0]}`);
  feats.push(faixaValor(valor));
  feats.push(`ct:${conta?.tipo || 'conta'}`);
  if (data && data.length >= 10) {
    const dia = +data.slice(8, 10);
    feats.push(dia <= 10 ? 'd:ini' : dia <= 20 ? 'd:meio' : 'd:fim');
  }
  return { feats, sig };
}

function treinarModelo() {
  IA.catPeso = {}; IA.featCat = {}; IA.featTot = {}; IA.vocab = new Set(); IA.exManuais = [];
  IA.nManuais = 0; IA.nTotal = 0;
  const somar = (cat, feats, peso) => {
    if (!S.catMap[cat]) return;
    IA.catPeso[cat] = (IA.catPeso[cat] || 0) + peso;
    if (!IA.featCat[cat]) IA.featCat[cat] = {};
    for (const f of feats) {
      IA.vocab.add(f);
      IA.featCat[cat][f] = (IA.featCat[cat][f] || 0) + peso;
      IA.featTot[cat] = (IA.featTot[cat] || 0) + peso;
    }
  };
  for (const [cat, lista] of Object.entries(REGRAS_PADRAO)) {
    if (!S.catMap[cat] || S.catMap[cat].tipo === 'mov') continue;
    for (let t of lista.split('|')) {
      t = t.replace(/^[+-]|=$/g, '');
      const { feats } = extrairFeatures(t, -5000, null, '');
      const soTexto = feats.filter(f => f.startsWith('w:') || f.startsWith('bi:'));
      if (soTexto.length) somar(cat, soTexto, 0.35);
    }
  }
  for (const t of S.tx) {
    if (!t.cat || !S.catMap[t.cat]) continue;
    const peso = t.catManual ? 3.0 : 1.0;
    const { feats, sig } = extrairFeatures(t.desc, t.valor, S.contaMap[t.conta], t.data);
    somar(t.cat, feats, peso);
    IA.nTotal++;
    if (t.catManual) {
      IA.nManuais++;
      if (sig.length) IA.exManuais.push({ cat: t.cat, sig: new Set(sig), valor: t.valor, conta: t.conta });
    }
  }
  IA.prontos = true;
}

function preverCategoria(desc, valor, conta, data) {
  if (!IA.prontos) treinarModelo();
  const ehEntrada = valor > 0;
  const candidatas = S.cats.filter(c => {
    if (ehEntrada) return c.tipo === 'receita' || (c.tipo === 'mov' && (IA.catPeso[c.id] || 0) > 0);
    return c.tipo === 'gasto' || (c.tipo === 'mov' && (IA.catPeso[c.id] || 0) > 0);
  });
  if (!candidatas.length) return { cat: null, conf: 0, top: [] };

  const { feats, sig } = extrairFeatures(desc, valor, conta, data);
  const V = Math.max(1, IA.vocab.size);
  const pesoGlobal = Math.max(1, candidatas.reduce((n, c) => n + (IA.catPeso[c.id] || 0.2), 0));

  const bonusVizinho = {};
  if (sig.length) {
    for (const ex of IA.exManuais) {
      if ((ex.valor > 0) !== ehEntrada) continue;
      let comuns = 0;
      for (const w of sig) if (ex.sig.has(w)) comuns++;
      if (!comuns) continue;
      const ratio = comuns / Math.max(sig.length, ex.sig.size);
      const difVal = Math.abs(Math.abs(ex.valor) - Math.abs(valor)) / Math.max(100, Math.abs(ex.valor));
      if (ratio >= 0.5 && difVal <= 0.18) {
        const boost = (ratio * 2.2) + (difVal <= 0.05 ? 1.1 : 0.4);
        bonusVizinho[ex.cat] = Math.max(bonusVizinho[ex.cat] || 0, boost);
      }
    }
  }

  const scores = candidatas.map(c => {
    const prior = Math.log(((IA.catPeso[c.id] || 0.15) + 0.2) / (pesoGlobal + 0.2 * candidatas.length));
    const denom = (IA.featTot[c.id] || 0) + V;
    const mapa = IA.featCat[c.id] || {};
    let logLik = 0;
    for (const f of feats) {
      const cnt = mapa[f] || 0;
      const pesoFeat = f.startsWith('bi:') ? 1.35 : f.startsWith('w:') ? 1.15 : 0.75;
      logLik += pesoFeat * Math.log((cnt + 1) / denom);
    }
    return { cat: c.id, score: prior + logLik + (bonusVizinho[c.id] || 0) };
  });

  const maxS = Math.max(...scores.map(x => x.score));
  const exps = scores.map(x => ({ cat: x.cat, e: Math.exp(Math.max(-25, x.score - maxS)) }));
  const somaE = exps.reduce((n, x) => n + x.e, 0) || 1;
  const fatorAmostra = Math.min(1, 0.55 + (IA.nManuais / 12) * 0.45);
  const top = exps
    .map(x => ({ cat: x.cat, conf: (x.e / somaE) * fatorAmostra }))
    .sort((a, b) => b.conf - a.conf);

  return { cat: top[0]?.cat || null, conf: top[0]?.conf || 0, top };
}

/** Devolve o id da categoria para um lançamento, ou null. */
function categorizar(desc, valor, conta, data = '') {
  const n = norm(desc), pad = ` ${n} `;
  if (conta && conta.tipo === 'cartao' && valor > 0 && /\b(PAGAMENTO|PAGTO|PGTO|PAG)\b/.test(n)) return 'fatura';
  for (const r of S.regrasOrd) {
    if (r.padrao) continue;
    if (r.sinal && Math.sign(valor) !== r.sinal) continue;
    if (!S.catMap[r.cat]) continue;
    const ok = r.modo === 'w' ? pad.includes(` ${r.texto} `) : r.modo === 'p' ? pad.includes(` ${r.texto}`) : n.includes(r.texto);
    if (ok) return r.cat;
  }
  const ia = IA.nManuais >= 3 ? preverCategoria(desc, valor, conta, data) : null;
  if (ia && ia.conf >= 0.85 && ia.cat) return ia.cat;
  for (const r of S.regrasOrd) {
    if (!r.padrao) continue;
    if (r.sinal && Math.sign(valor) !== r.sinal) continue;
    if (!S.catMap[r.cat]) continue;
    const ok = r.modo === 'w' ? pad.includes(` ${r.texto} `) : r.modo === 'p' ? pad.includes(` ${r.texto}`) : n.includes(r.texto);
    if (ok) return r.cat;
  }
  if (ia && ia.conf >= 0.78 && ia.cat) return ia.cat;
  return null;
}
async function reaplicarRegras() {
  treinarModelo();
  const mud = [];
  for (const t of S.tx) {
    if (t.catManual) continue;
    const c = categorizar(t.desc, t.valor, S.contaMap[t.conta], t.data);
    if (c !== t.cat) { t.cat = c; mud.push(t); }
  }
  if (mud.length) {
    await DB.gravar('tx', mud);
    treinarModelo();
  }
  return mud.length;
}
function sugerirTexto(desc) {
  const p = norm(desc).split(' '), vazia = w => !w || /^\d+$/.test(w) || PALAVRAS_VAZIAS.has(w);
  const i = p.findIndex(w => !vazia(w));
  if (i < 0) return norm(desc).slice(0, 40);
  const t = p.slice(i, i + 3);
  while (t.length > 1 && vazia(t[t.length - 1])) t.pop();
  return t.join(' ').slice(0, 40);
}

// ───────────────────────── leitura de OFX ─────────────────────────
const BANCOS = [[237, 'Bradesco', /bradesco/i], [33, 'Santander', /santander/i], [1, 'Banco do Brasil', /banco do brasil|^bb$/i], [104, 'Caixa', /caixa|^cef$/i], [756, 'Sicoob', /sicoob|bancoob/i], [341, 'Itaú', /ita[uú]/i], [260, 'Nubank', /nu ?bank|nu pagamentos/i], [77, 'Inter', /banco inter|^inter$/i], [336, 'C6 Bank', /c6/i], [748, 'Sicredi', /sicredi/i], [208, 'BTG Pactual', /btg/i]];
function nomeBanco(bankid, org) {
  const cod = /^\d+$/.test(bankid || '') ? +bankid : -1;
  const b = BANCOS.find(x => x[0] === cod) || BANCOS.find(x => x[2].test(org || ''));
  return b ? b[1] : (org || 'Banco').slice(0, 24);
}
function lerOFX(txt) {
  const ent = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
  const tag = (b, t) => { const m = new RegExp(`<${t}>([^<\\r\\n]*)`, 'i').exec(b); return m ? ent(m[1]).replace(/\s+/g, ' ').trim() : ''; };
  const org = tag(txt, 'ORG');
  const blocos = [];
  const re = /<(CC)?STMTRS>([\s\S]*?)(?=<(?:CC)?STMTRS>|$)/gi; let m;
  while ((m = re.exec(txt))) blocos.push({ cartao: !!m[1], corpo: m[2] });
  if (!blocos.length && /<STMTTRN>/i.test(txt)) blocos.push({ cartao: /<CCACCTFROM>/i.test(txt), corpo: txt });
  return blocos.map(({ cartao, corpo }) => {
    const cab = corpo.split(/<BANKTRANLIST>/i)[0];
    const bankid = tag(cab, 'BANKID'), acct = tag(cab, 'ACCTID');
    const banco = nomeBanco(bankid, org);
    const fim = acct.replace(/[^0-9Xx*]/g, '').slice(-4);
    const itens = [];
    for (const parte of corpo.split(/<STMTTRN>/i).slice(1)) {
      const b = parte.split(/<\/STMTTRN>/i)[0];
      const data = parseData(tag(b, 'DTPOSTED').replace(/^(\d{4})(\d{2})(\d{2}).*/, '$1-$2-$3'));
      let valor = parseValor(tag(b, 'TRNAMT'));
      const tipo = tag(b, 'TRNTYPE').toUpperCase(), nome = tag(b, 'NAME'), memo = tag(b, 'MEMO');
      if (!data || !Number.isFinite(valor) || valor === 0) continue;
      if ((tipo === 'DEBIT' && valor > 0) || (tipo === 'CREDIT' && valor < 0)) valor = -valor;
      const desc = (nome && memo && !memo.includes(nome) && !nome.includes(memo) ? `${nome} ${memo}` : (memo || nome || 'Sem descrição'));
      if (/^SALDO\b/i.test(desc)) continue;
      itens.push({ data, valor, desc, fitid: tag(b, 'FITID') });
    }
    return {
      conta: { chave: `${cartao ? 'cc' : 'ck'}|${bankid}|${acct}`, banco, tipo: cartao ? 'cartao' : 'conta', nome: `${banco} · ${cartao ? 'cartão' : 'conta'}${fim ? ' final ' + fim : ''}` },
      itens,
    };
  }).filter(l => l.itens.length);
}

// ───────────────────────── leitura de CSV com presets BR ─────────────────────────
function detectarPresetCSV(cab, nomeArq) {
  const h = cab.map(norm).join('|');
  const arq = norm(nomeArq);
  if (h === 'DATE|TITLE|AMOUNT' || h === 'DATA|CATEGORIA|TITULO|VALOR') {
    return { banco: 'Nubank', tipo: 'cartao', nome: 'Nubank · cartão', inv: true };
  }
  if (h.startsWith('DATA|VALOR|IDENTIFICADOR|DESCRICAO')) {
    return { banco: 'Nubank', tipo: 'conta', nome: 'Nubank · conta', inv: false };
  }
  if (h.startsWith('DATA LANCAMENTO|HISTORICO|DESCRICAO|VALOR')) {
    return { banco: 'Inter', tipo: 'conta', nome: 'Inter · conta', inv: false };
  }
  if (/NUBANK/.test(arq)) return { banco: 'Nubank', tipo: /FATURA|CARTAO/.test(arq) ? 'cartao' : 'conta', nome: /FATURA|CARTAO/.test(arq) ? 'Nubank · cartão' : 'Nubank · conta', inv: /FATURA|CARTAO/.test(arq) };
  if (/INTER/.test(arq)) return { banco: 'Inter', tipo: /FATURA|CARTAO/.test(arq) ? 'cartao' : 'conta', nome: 'Inter', inv: /FATURA|CARTAO/.test(arq) };
  if (/ITAU/.test(arq)) return { banco: 'Itaú', tipo: /FATURA|CARTAO/.test(arq) ? 'cartao' : 'conta', nome: 'Itaú', inv: /FATURA|CARTAO/.test(arq) };
  if (/C6/.test(arq)) return { banco: 'C6 Bank', tipo: /FATURA|CARTAO/.test(arq) ? 'cartao' : 'conta', nome: 'C6 Bank', inv: /FATURA|CARTAO/.test(arq) };
  if (/BTG/.test(arq)) return { banco: 'BTG Pactual', tipo: /FATURA|CARTAO/.test(arq) ? 'cartao' : 'conta', nome: 'BTG Pactual', inv: /FATURA|CARTAO/.test(arq) };
  return null;
}
function lerCSV(txt, nomeArq = '') {
  const linhas = txt.replace(/^\ufeff/, '').split(/\r\n|\n|\r/).filter(l => l.trim());
  const conta = (l, s) => l.split(s).length - 1;
  const sep = [';', '\t', ','].map(s => [s, linhas.slice(0, 40).filter(l => conta(l, s) >= 2).length]).sort((a, b) => b[1] - a[1])[0][0];
  const partir = l => {
    const out = []; let cur = '', q = false;
    for (let i = 0; i < l.length; i++) {
      const c = l[i];
      if (q) { if (c === '"') { if (l[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true; else if (c === sep) { out.push(cur.trim()); cur = ''; } else cur += c;
    }
    out.push(cur.trim()); return out;
  };
  const rows = linhas.map(partir);
  const i0 = rows.findIndex(r => r.length >= 2 && r.some(c => parseData(c)));
  if (i0 < 0) return null;
  const dados = rows.slice(i0).filter(r => r.some(c => parseData(c)));
  const ncol = Math.max(...dados.map(r => r.length));
  const cabRow = i0 > 0 && rows[i0 - 1].filter(Boolean).length >= 2 ? rows[i0 - 1] : null;
  const cab = Array.from({ length: ncol }, (_, i) => (cabRow && cabRow[i]) || `Coluna ${i + 1}`);
  const col = i => dados.map(r => r[i] ?? '');
  const acha = re => cab.findIndex(c => re.test(norm(c)));
  const conte = (i, f) => col(i).filter(f).length;
  const ehNum = c => /\d/.test(c) && !parseData(c) && Number.isFinite(parseValor(c, ','));
  const idx = [...Array(ncol).keys()];
  let cData = acha(/^(DATA|DATE|DT)\b/); if (cData < 0 || !conte(cData, parseData)) cData = idx.sort((a, b) => conte(b, parseData) - conte(a, parseData))[0];
  let cDeb = acha(/DEBITO|SAIDA/), cCred = acha(/CREDITO|ENTRADA/);
  let cValor = acha(/^(VALOR|VALUE|AMOUNT|QUANTIA|MONTANTE)\b/);
  if (cDeb >= 0 && cCred >= 0 && cValor < 0) cValor = cCred; else cDeb = -1;
  if (cValor < 0) cValor = [...Array(ncol).keys()].filter(i => i !== cData && !/SALDO|DOC/.test(norm(cab[i]))).sort((a, b) => conte(b, ehNum) - conte(a, ehNum))[0] ?? 0;
  let cDesc = acha(/HIST|DESCRI|LANCAMENTO|ESTABELECIMENTO|MEMO|DETALHE|TITLE|TITULO|NOME/);
  if (cDesc < 0) {
    const media = i => { const v = col(i).filter(c => c && !ehNum(c) && !parseData(c)); return v.length ? v.reduce((n, c) => n + c.length, 0) / dados.length : 0; };
    cDesc = [...Array(ncol).keys()].sort((a, b) => media(b) - media(a))[0];
  }
  const nums = col(cValor).concat(cDeb >= 0 ? col(cDeb) : []).filter(Boolean);
  const dec = nums.some(c => /,\d{1,2}\D*$/.test(c)) ? ',' : nums.some(c => /\.\d{1,2}\D*$/.test(c)) ? '.' : ',';
  const preset = detectarPresetCSV(cab, nomeArq);
  return { cab, dados, dec, cData, cDesc, cValor, cDeb, preset };
}
function csvItens(c, m) {
  const itens = [];
  for (const r of c.dados) {
    const data = parseData(r[m.data]), desc = (r[m.desc] || '').replace(/\s+/g, ' ').trim();
    let valor = parseValor(r[m.valor], c.dec);
    if (m.deb >= 0) {
      const deb = parseValor(r[m.deb], c.dec);
      valor = (Number.isFinite(valor) ? Math.abs(valor) : 0) - (Number.isFinite(deb) ? Math.abs(deb) : 0);
    }
    if (!data || !Number.isFinite(valor) || valor === 0 || /^SALDO\b/i.test(desc)) continue;
    itens.push({ data, desc: desc || 'Sem descrição', valor: m.inv ? -valor : valor, fitid: '' });
  }
  return itens;
}

// ───────────────────────── importação e parcelamentos ─────────────────────────
async function importarLote({ conta, itens }, opt = {}) {
  let c = S.contas.find(x => x.chave === conta.chave);
  let criada = false;
  if (!c) {
    c = { id: uid(), ...conta }; criada = true;
    S.contas.push(c); await DB.gravar('contas', c); indexar();
  }
  const chave = t => `${t.data}|${t.valor}|${norm(t.desc)}`;
  const fits = new Set(), tem = new Map();
  for (const t of S.tx) if (t.conta === c.id && !t.projecao) {
    if (t.fitid) fits.add(`${t.fitid}|${t.data}|${t.valor}`);
    tem.set(chave(t), (tem.get(chave(t)) || 0) + 1);
  }
  const visto = new Map(), novos = [], projRemover = [];
  for (const it of itens) {
    const k = chave(it), n = (visto.get(k) || 0) + 1; visto.set(k, n);
    if (n <= (tem.get(k) || 0)) continue;
    if (it.fitid && n === 1 && fits.has(`${it.fitid}|${it.data}|${it.valor}`)) continue;
    const parc = detectarParcela(it.desc);
    const mesComp = (c.tipo === 'cartao' && c.fechamento > 0 && +it.data.slice(8, 10) >= c.fechamento)
      ? addMes(it.data.slice(0, 7), 1) : it.data.slice(0, 7);
    const idxProj = S.tx.findIndex(t => t.projecao && t.conta === c.id && t.data.startsWith(mesComp) && t.valor === it.valor && !projRemover.includes(t.id));
    let catHerdada = null;
    if (idxProj >= 0) {
      catHerdada = S.tx[idxProj].cat;
      projRemover.push(S.tx[idxProj].id);
    }
    novos.push({
      id: uid(), conta: c.id, data: it.data, desc: it.desc, valor: it.valor, fitid: it.fitid || '',
      cat: catHerdada || categorizar(it.desc, it.valor, c, it.data), catManual: !!catHerdada, manual: !!opt.manual, nota: '',
      ...(parc ? { parcela: { atual: parc.atual, total: parc.total } } : {}),
    });
  }
  if (projRemover.length) {
    S.tx = S.tx.filter(t => !projRemover.includes(t.id));
    await DB.apagar('tx', projRemover);
  }
  S.tx.push(...novos);
  const pares = opt.semPares ? 0 : detectarTransferencias(novos);
  await DB.gravar('tx', novos);
  treinarModelo();
  const datas = itens.map(i => i.data).sort();
  const parcelados = novos.filter(t => t.parcela && t.parcela.atual < t.parcela.total && t.valor < 0);
  return {
    conta: c, criada, novos: novos.length, repetidos: itens.length - novos.length,
    semCat: novos.filter(t => !t.cat).length, pares, parcelados,
    de: datas[0], ate: datas[datas.length - 1], ultimoMes: novos.map(mesCompetencia).sort().pop(),
  };
}

/** Projeta parcelas futuras (ex.: 02/10 até 10/10) evitando duplicatas. */
async function projetarParcelas(listaTx) {
  const criadas = [];
  for (const t of listaTx) {
    const p = t.parcela || detectarParcela(t.desc);
    if (!p || p.atual >= p.total || t.valor >= 0) continue;
    const base = detectarParcela(t.desc)?.base || norm(t.desc);
    const dia = +t.data.slice(8, 10);
    const mesBase = mesCompetencia(t);
    for (let k = p.atual + 1; k <= p.total; k++) {
      const mesFut = addMes(mesBase, k - p.atual);
      const dataFut = `${mesFut}-${p2(Math.min(dia, diasNoMes(mesFut)))}`;
      const jaExiste = S.tx.some(x => x.conta === t.conta && mesCompetencia(x) === mesFut && x.valor === t.valor && (x.parcela?.atual === k || norm(x.desc).includes(base.slice(0, 14))));
      if (jaExiste) continue;
      const descLimpa = t.desc.replace(/(\d{1,2})\s*(\/|DE)\s*(\d{1,2})/i, (_, a, sep, tot) => `${p2(k)}${sep}${tot}`);
      const novo = {
        id: uid(), conta: t.conta, data: dataFut,
        desc: descLimpa === t.desc ? `${t.desc} (${p2(k)}/${p2(p.total)})` : descLimpa,
        valor: t.valor, fitid: '', cat: t.cat, catManual: !!t.cat, manual: false,
        nota: 'Parcela projetada automaticamente', projecao: true,
        parcela: { atual: k, total: p.total },
      };
      S.tx.push(novo); criadas.push(novo);
    }
  }
  if (criadas.length) {
    await DB.gravar('tx', criadas);
    treinarModelo();
  }
  return criadas.length;
}

/** Concilia transferências entre contas (conta<->conta) e pagamento de fatura (conta<->cartao). */
function detectarTransferencias(novos) {
  const reT = /\b(PIX|TED|DOC|TEV|TRANSF\w*)\b/;
  const reFat = /\b(PAGAMENTO|PAGTO|PGTO|PAG|FATURA|CARTAO|NUBANK|ITAU|BRADESCO|SANTANDER|INTER|C6|BTG|OUROCARD)\b/;
  const ehConta = id => S.contaMap[id]?.tipo === 'conta';
  const ehCartao = id => S.contaMap[id]?.tipo === 'cartao';
  let n = 0;

  for (const a of novos) {
    if (a.catManual) continue;
    if (ehConta(a.conta) && a.cat !== 'transf' && reT.test(norm(a.desc)) && S.catMap.transf) {
      const b = S.tx.find(t => t.id !== a.id && t.conta !== a.conta && ehConta(t.conta) && !t.catManual && t.cat !== 'transf' && t.valor === -a.valor && Math.abs(difDias(t.data, a.data)) <= 1 && reT.test(norm(t.desc)));
      if (b) {
        a.cat = b.cat = 'transf'; a.catManual = b.catManual = true; n++;
        if (!novos.includes(b)) DB.gravar('tx', b);
        continue;
      }
    }
    if ((ehConta(a.conta) || ehCartao(a.conta)) && a.cat !== 'fatura' && reFat.test(norm(a.desc)) && S.catMap.fatura) {
      const b = S.tx.find(t => t.id !== a.id && t.conta !== a.conta && !t.catManual && t.cat !== 'fatura' && t.valor === -a.valor && Math.abs(difDias(t.data, a.data)) <= 4 && ((ehConta(a.conta) && ehCartao(t.conta)) || (ehCartao(a.conta) && ehConta(t.conta))) && reFat.test(norm(a.desc)));
      if (b) {
        a.cat = b.cat = 'fatura'; a.catManual = b.catManual = true; n++;
        if (!novos.includes(b)) DB.gravar('tx', b);
      }
    }
  }
  return n;
}

/** Identifica contas fixas/assinaturas recorrentes (não parceladas) e sinaliza as que ainda não caíram no mês. */
function detectarRecorrencias(mesAlvo) {
  const ocultas = new Set(S.meta.fixasOcultas || []);
  const grupos = new Map();
  for (const t of S.tx) {
    if (t.valor >= 0 || t.projecao || t.parcela || detectarParcela(t.desc)) continue;
    const tp = tipoTx(t);
    if (tp === 'mov') continue;
    const { sig } = extrairFeatures(t.desc, t.valor, null, '');
    const chave = (sig.slice(0, 2).join('_') || norm(t.desc).slice(0, 18));
    if (chave.length < 3) continue;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(t);
  }
  const pendentes = [];
  for (const [chave, lista] of grupos) {
    if (ocultas.has(chave)) continue;
    const porMes = new Map();
    for (const t of lista) {
      const mc = mesCompetencia(t);
      if (mc > mesAlvo) continue;
      if (!porMes.has(mc)) porMes.set(mc, []);
      porMes.get(mc).push(t);
    }
    const anteriores = [...porMes.keys()].filter(m => m < mesAlvo).sort();
    if (anteriores.length < 2) continue;
    const ultMes = anteriores[anteriores.length - 1];
    if (difDias(`${mesAlvo}-15`, `${ultMes}-15`) > 45) continue;

    const valsAnt = anteriores.slice(-3).map(m => porMes.get(m).reduce((n, x) => n - x.valor, 0));
    const media = Math.round(valsAnt.reduce((n, v) => n + v, 0) / valsAnt.length);
    const maxVar = Math.max(...valsAnt.map(v => Math.abs(v - media) / Math.max(100, media)));
    if (maxVar > 0.28) continue;

    const noMes = porMes.get(mesAlvo) || [];
    const amostra = porMes.get(ultMes)[0];
    if (!noMes.length) {
      pendentes.push({ chave, desc: amostra.desc, valor: media, cat: amostra.cat, dia: +amostra.data.slice(8, 10), aumento: 0 });
    } else {
      const pago = noMes.reduce((n, x) => n - x.valor, 0);
      if (pago > media * 1.12 && (pago - media) >= 500) {
        pendentes.push({ chave, desc: noMes[0].desc, valor: pago, cat: noMes[0].cat, dia: +noMes[0].data.slice(8, 10), aumento: pago - media, pago: true });
      }
    }
  }
  return pendentes.sort((a, b) => (a.pago ? 1 : 0) - (b.pago ? 1 : 0) || a.dia - b.dia);
}

let csvResolver = null, ultimosParcelados = [];
async function importarArquivos(arquivos) {
  const res = $('#importRes'); res.innerHTML = '';
  let ultimoMes = null, algum = false;
  ultimosParcelados = [];
  for (const f of arquivos) {
    try {
      const txt = decodificar(await f.arrayBuffer());
      let lotes;
      if (/<OFX>|OFXHEADER/i.test(txt.slice(0, 3000)) || /<STMTTRN>/i.test(txt)) {
        lotes = lerOFX(txt);
        if (!lotes.length) throw new Error('Não encontrei lançamentos neste arquivo. Confira se o período escolhido no banco tem movimentação.');
      } else {
        const c = lerCSV(txt, f.name);
        if (!c) throw new Error('Não consegui ler este arquivo. Ele precisa ser um OFX ou um CSV com uma coluna de data.');
        const lote = await mapearCSV(c, f.name);
        if (!lote) { res.insertAdjacentHTML('beforeend', `<div class="res"><b>${esc(f.name)}</b>: importação cancelada.</div>`); continue; }
        if (!lote.itens.length) throw new Error('Com essas colunas não sobrou nenhum lançamento válido. Tente escolher outras colunas.');
        lotes = [lote];
      }
      if (S.meta.exemplo && !algum) { await apagarTudo(true); res.insertAdjacentHTML('beforeend', '<div class="res">Os dados de exemplo foram removidos para dar lugar aos seus.</div>'); }
      for (const l of lotes) {
        const r = await importarLote(l); algum = true;
        if (r.parcelados.length) ultimosParcelados.push(...r.parcelados);
        if (r.ultimoMes && (!ultimoMes || r.ultimoMes > ultimoMes)) ultimoMes = r.ultimoMes;
        res.insertAdjacentHTML('beforeend', `<div class="res"><b>${esc(r.conta.nome)}</b>${r.criada ? ' <span class="tag-n">conta nova</span>' : ''}<br>
          ${r.novos ? `${plural(r.novos, 'lançamento novo', 'lançamentos novos')}` : 'Nenhum lançamento novo'}${r.repetidos ? ` · ${plural(r.repetidos, 'já existia e foi ignorado', 'já existiam e foram ignorados')}` : ''}
          <br><span class="mut">Período: ${dataBRa(r.de)} a ${dataBRa(r.ate)}${r.pares ? ` · ${plural(r.pares, 'conciliação automática (transferência/fatura)', 'conciliações automáticas (transferências/faturas)')}` : ''}</span>
          ${r.parcelados.length ? `<br>Encontrei <b>${plural(r.parcelados.length, 'compra parcelada', 'compras parceladas')}</b>. <button class="lnk" data-projparc="1">Projetar parcelas nos próximos meses</button>` : ''}
          ${r.semCat ? `<br>${plural(r.semCat, 'ficou sem categoria', 'ficaram sem categoria')}. <button class="lnk" data-revisar="1">Revisar agora</button>` : ''}</div>`);
      }
    } catch (e) {
      console.error(e);
      res.insertAdjacentHTML('beforeend', `<div class="res erro"><b>${esc(f.name)}</b>: ${esc(e.message || 'não consegui ler este arquivo.')}</div>`);
    }
  }
  if (algum) {
    if (ultimoMes) S.mes = ultimoMes;
    if (!S.meta.primeiraImportacao) await DB.meta('primeiraImportacao', hoje());
    navigator.storage?.persist?.().catch(() => {});
  }
  $('#arquivo').value = '';
}
function mapearCSV(c, nomeArq) {
  const box = $('#csvMap'), ops = (sel, extra = '') => extra + c.cab.map((n, i) => `<option value="${i}"${i === sel ? ' selected' : ''}>${esc(n)}${c.dados[0][i] ? ' — ex.: ' + esc(String(c.dados[0][i]).slice(0, 18)) : ''}</option>`).join('');
  $('#csvNome').textContent = `Arquivo: ${nomeArq}${c.preset ? ` · formato ${c.preset.banco} reconhecido` : ''}`;
  $('#mData').innerHTML = ops(c.cData); $('#mDesc').innerHTML = ops(c.cDesc); $('#mValor').innerHTML = ops(c.cValor);
  $('#mDeb').innerHTML = ops(c.cDeb, '<option value="-1">Não, é uma coluna só</option>');
  $('#mConta').innerHTML = S.contas.filter(x => x.tipo !== 'dinheiro' && !S.meta.exemplo).map(x => `<option value="${x.id}">${esc(x.nome)}</option>`).join('') + '<option value="nova:conta">Nova conta corrente…</option><option value="nova:cartao">Novo cartão de crédito…</option>';
  const nomePadrao = c.preset?.nome || nomeArq.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').slice(0, 40);
  $('#mNome').value = nomePadrao;
  const deCsv = S.meta.exemplo ? [] : S.contas.filter(x => x.chave.startsWith('csv|'));
  const igual = deCsv.find(x => x.chave.endsWith('|' + norm(nomePadrao)));
  $('#mConta').value = igual ? igual.id : deCsv.length === 1 && !c.preset ? deCsv[0].id : (c.preset?.tipo === 'cartao' ? 'nova:cartao' : 'nova:conta');
  const mapa = () => ({ data: +$('#mData').value, desc: +$('#mDesc').value, valor: +$('#mValor').value, deb: +$('#mDeb').value, inv: $('#mInv').checked });
  const m0 = { data: c.cData, desc: c.cDesc, valor: c.cValor, deb: c.cDeb, inv: false }, it0 = csvItens(c, m0);
  $('#mInv').checked = c.preset ? c.preset.inv : (it0.length > 2 && it0.every(i => i.valor > 0));
  const prev = () => {
    $('#mNomeL').hidden = !$('#mConta').value.startsWith('nova:');
    const it = csvItens(c, mapa());
    $('#csvPrev').innerHTML = it.length
      ? `<table><tr><th>Data</th><th>Descrição</th><th>Valor</th></tr>${it.slice(0, 6).map(i => `<tr><td>${dataBRa(i.data)}</td><td>${esc(i.desc.slice(0, 50))}</td><td class="num ${i.valor > 0 ? 'pos' : ''}">${brl(i.valor)}</td></tr>`).join('')}</table><p class="mut">${plural(it.length, 'lançamento reconhecido', 'lançamentos reconhecidos')} (mostrando os primeiros). Gastos devem aparecer com sinal de menos.</p>`
      : '<p class="mut">Com essas colunas não reconheci nenhum lançamento. Tente outras.</p>';
  };
  for (const id of ['mData', 'mDesc', 'mValor', 'mDeb', 'mConta', 'mInv']) $('#' + id).onchange = prev;
  prev(); box.hidden = false; box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  return new Promise(ok => {
    csvResolver = confirma => {
      box.hidden = true; csvResolver = null;
      if (!confirma) return ok(null);
      const v = $('#mConta').value; let conta;
      if (v.startsWith('nova:')) {
        const tipo = v.slice(5), nome = $('#mNome').value.trim() || (tipo === 'cartao' ? 'Cartão' : 'Conta');
        conta = { chave: `csv|${tipo}|${norm(nome)}`, banco: c.preset?.banco || '', tipo, nome };
      } else { const x = S.contaMap[v]; conta = { chave: x.chave, banco: x.banco, tipo: x.tipo, nome: x.nome }; }
      ok({ conta, itens: csvItens(c, mapa()) });
    };
  });
}

// ───────────────────────── contas do mês ─────────────────────────
const tipoTx = t => S.catMap[t.cat]?.tipo || 'sem';
function resumo(mes) {
  const r = { entrou: 0, saiu: 0, porCat: {}, semN: 0, semGasto: 0, nEntradas: 0, gastos: [], n: 0 };
  for (const t of S.tx) {
    if (mesCompetencia(t) !== mes) continue;
    r.n++;
    const tp = tipoTx(t);
    if (tp === 'mov') continue;
    // Entrada marcada como abatimento de gasto (ex.: reembolso/rachadinha) reduz a categoria em vez de inflar receita
    if (t.valor > 0 && t.abaterCat && S.catMap[t.abaterCat]?.tipo === 'gasto') {
      r.saiu -= t.valor;
      r.porCat[t.abaterCat] = (r.porCat[t.abaterCat] || 0) - t.valor;
      continue;
    }
    if (tp === 'receita') { r.entrou += t.valor; if (t.valor > 0) r.nEntradas++; }
    else if (tp === 'gasto') { r.saiu -= t.valor; r.porCat[t.cat] = (r.porCat[t.cat] || 0) - t.valor; if (t.valor < 0) r.gastos.push(t); }
    else { r.semN++; if (t.valor > 0) { r.entrou += t.valor; r.nEntradas++; } else { r.saiu -= t.valor; r.semGasto -= t.valor; r.gastos.push(t); } }
  }
  return r;
}
function mediaTresMeses(refMes = mesAtual()) {
  const meses = [1, 2, 3].map(i => addMes(refMes, -i)).map(resumo).filter(r => r.n);
  const m = {};
  if (meses.length) for (const c of S.cats) if (c.tipo === 'gasto') m[c.id] = Math.max(0, Math.round(meses.reduce((n, r) => n + (r.porCat[c.id] || 0), 0) / meses.length));
  return m;
}
function topCategoriasGasto(limite = 6) {
  const freq = {};
  for (const t of S.tx) if (t.valor < 0 && S.catMap[t.cat]?.tipo === 'gasto') freq[t.cat] = (freq[t.cat] || 0) + 1;
  return S.cats.filter(c => c.tipo === 'gasto').sort((a, b) => (freq[b.id] || 0) - (freq[a.id] || 0)).slice(0, limite);
}

// ───────────────────────── telas ─────────────────────────
function ir(view, manterHash) {
  S.view = view;
  if (!manterHash && location.hash !== '#' + view) history.replaceState(null, '', '#' + view);
  render(); window.scrollTo(0, 0);
}
function render() {
  for (const v of $$('.view[data-view]')) v.hidden = v.dataset.view !== S.view;
  for (const b of $$('.tabs button')) { const on = b.dataset.go === S.view; b.classList.toggle('on', on); on ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'); }
  $('#mesNav').style.visibility = (S.view === 'painel' || S.view === 'lancamentos') && temDados() ? 'visible' : 'hidden';
  $('#mesLabel').textContent = mesLongo(S.mes).replace(' de ', ' ');
  $('#avisoExemplo').hidden = !S.meta.exemplo;
  if ($('#btnNovoTop')) $('#btnNovoTop').hidden = !temDados();
  ({ painel: rPainel, lancamentos: rLanc, importar: () => {}, orcamento: rOrc, ajustes: rAjustes })[S.view]();
}

function rPainel() {
  $('#vazio').hidden = temDados(); $('#painel').hidden = !temDados();
  if (!temDados()) return;
  const r = resumo(S.mes), ant = resumo(addMes(S.mes, -1)), sobra = r.entrou - r.saiu;
  $('#kEntrou').textContent = brl(r.entrou); $('#kSaiu').textContent = brl(r.saiu);
  const ks = $('#kSobra'); ks.textContent = brl(sobra); ks.className = 'num ' + (sobra < 0 ? 'neg' : 'pos');
  $('#kEntrouSub').textContent = r.nEntradas ? plural(r.nEntradas, 'entrada', 'entradas') : 'nada entrou ainda';
  let sub = '';
  if (ant.saiu > 0 && r.saiu > 0) { const d = Math.round((r.saiu / ant.saiu - 1) * 100); sub = d === 0 ? `igual a ${mesSo(addMes(S.mes, -1))}` : `${Math.abs(d)}% ${d > 0 ? 'a mais' : 'a menos'} que em ${mesSo(addMes(S.mes, -1))}`; }
  $('#kSaiuSub').textContent = sub;
  $('#kSobraSub').textContent = sobra < 0 ? 'saiu mais do que entrou' : r.entrou > 0 ? `${Math.round(sobra / r.entrou * 100)}% do que entrou` : '';

  // faixa de saldos (com suporte a saldo inicial de referência) e faturas por conta
  const strip = $('#contasStrip');
  if (strip) {
    const porConta = S.contas.map(c => {
      const baseIni = c.saldoIni || 0;
      const dataIni = c.saldoData || '0000-01-01';
      const soma = baseIni + S.tx.filter(t => t.conta === c.id && !t.projecao && t.data >= dataIni && t.data <= `${S.mes}-31`).reduce((n, t) => n + t.valor, 0);
      const mesMov = S.tx.filter(t => t.conta === c.id && mesCompetencia(t) === S.mes && t.valor < 0).reduce((n, t) => n - t.valor, 0);
      return { c, soma, mesMov };
    }).filter(x => S.tx.some(t => t.conta === x.c.id) || x.c.saldoIni);
    strip.hidden = porConta.length < 1;
    strip.innerHTML = porConta.map(({ c, soma, mesMov }) => `<div class="conta-pill" data-filtraconta="${esc(c.id)}" role="button" tabindex="0">
      <span class="cn">${esc(c.nome)}</span>
      <span class="cv num ${c.tipo === 'cartao' ? '' : soma < 0 ? 'neg' : 'pos'}">${c.tipo === 'cartao' ? `Fatura: ${brl(mesMov)}` : brl(soma)}</span>
    </div>`).join('');
  }

  // radar de contas fixas e assinaturas no mês atual
  const cFix = $('#cardFixas');
  if (cFix) {
    const recs = S.mes === mesAtual() ? detectarRecorrencias(S.mes) : [];
    if (!recs.length) { cFix.hidden = true; }
    else {
      const pend = recs.filter(x => !x.pago);
      const totPend = pend.reduce((n, x) => n + x.valor, 0);
      cFix.hidden = false;
      cFix.innerHTML = `<div class="card-h"><h2>Contas fixas e assinaturas</h2><span class="mut">${pend.length ? `faltam ${brl(totPend)}` : 'alerta de reajuste'}</span></div>
        <ul class="fixas-lista">${recs.slice(0, 6).map(x => `<li><span class="fn">${esc(x.desc)}<small>${x.pago ? 'já caiu neste mês' : `previsto por volta do dia ${p2(x.dia)}`}${x.cat && S.catMap[x.cat] ? ` · ${esc(S.catMap[x.cat].nome)}` : ''}</small></span>
          <span class="fv"><span class="num">${brl(x.valor)}</span>${x.aumento ? `<span class="tag-alta">↑ ${brl0(x.aumento)}</span>` : ''}<button type="button" class="x" data-ocultarfixa="${esc(x.chave)}" title="Não lembrar esta cobrança" aria-label="Ocultar">×</button></span></li>`).join('')}</ul>`;
    }
  }

  // compromissos parcelados nos próximos meses
  const cf = $('#cardFuturo');
  if (cf) {
    const fut = S.tx.filter(t => t.projecao && mesCompetencia(t) > S.mes && t.valor < 0);
    if (!fut.length) { cf.hidden = true; }
    else {
      const proxMes = addMes(S.mes, 1);
      const totProx = fut.filter(t => mesCompetencia(t) === proxMes).reduce((n, t) => n - t.valor, 0);
      const totGeral = fut.reduce((n, t) => n - t.valor, 0);
      cf.hidden = false;
      cf.innerHTML = `<div class="card-h"><h2>Parcelas futuras projetadas</h2><button class="lnk" data-mes="${proxMes}">Ver ${mesSo(proxMes)}</button></div>
        <p class="orc-txt">Em <b>${mesSo(proxMes)}</b> você já tem <b>${brl(totProx)}</b> comprometidos em parcelas (${brl(totGeral)} no total dos próximos meses).</p>`;
    }
  }

  // avisos
  const av = $('#avisoRevisar'); av.hidden = !r.semN;
  if (r.semN) av.innerHTML = `<span><b>${plural(r.semN, 'lançamento', 'lançamentos')} sem categoria</b> neste mês${r.semGasto ? ` (${brl(r.semGasto)} em gastos)` : ''}.</span><button class="btn sm" data-revisar="1">Revisar</button>`;
  const ab = $('#avisoBackup'), ref = S.meta.ultimoBackup || S.meta.primeiraImportacao, dias = ref ? difDias(hoje(), ref) : 0;
  ab.hidden = !(dias >= 30 && !S.meta.exemplo && difDias(hoje(), S.meta.backupAdiado || '2000-01-01') >= 7);
  if (!ab.hidden) ab.innerHTML = `<span>${S.meta.ultimoBackup ? `Faz ${dias} dias que você salvou a última cópia de segurança.` : 'Você ainda não salvou nenhuma cópia de segurança dos seus dados.'}</span><span class="row"><button class="btn sm" id="bkAgora">Salvar agora</button><button class="lnk" id="bkDepois">Depois</button></span>`;

  // orçamento × ritmo do mês
  const comOrc = S.cats.filter(c => c.tipo === 'gasto' && c.orc > 0), total = comOrc.reduce((n, c) => n + c.orc, 0);
  const usado = comOrc.reduce((n, c) => n + Math.max(0, r.porCat[c.id] || 0), 0);
  const ma = mesAtual(), nd = diasNoMes(S.mes), dia = S.mes === ma ? new Date().getDate() : S.mes < ma ? nd : 0, fr = dia / nd;
  $('#orcBarra').hidden = !total;
  if (!total) $('#orcTxt').innerHTML = 'Você ainda não definiu um orçamento. Com ele o Bolso mostra se o mês está no ritmo certo. <button class="lnk" data-go="orcamento">Definir agora</button>';
  else {
    const pct = usado / total, f = $('#orcFill');
    f.style.width = Math.min(100, pct * 100) + '%';
    f.className = 'orc-fill' + (pct > 1 ? ' estourou' : pct > fr + 0.1 && S.mes === ma ? ' alto' : '');
    const h = $('#orcHoje'); h.hidden = S.mes !== ma; h.style.left = `calc(${fr * 100}% - 1px)`;
    let ritmo = '';
    if (pct > 1) ritmo = `Passou do orçamento em <b>${brl(usado - total)}</b>.`;
    else if (S.mes === ma) ritmo = `Já passaram ${dia} de ${nd} dias (${Math.round(fr * 100)}% do mês). ` + (pct > fr + 0.1 ? '<b>Está gastando mais rápido que o mês.</b>' : pct < fr - 0.1 ? 'Está com folga.' : 'Está no ritmo.');
    else if (S.mes < ma) ritmo = `Sobraram <b>${brl(total - usado)}</b> do orçamento.`;
    $('#orcTxt').innerHTML = `Você usou <b>${brl(usado)}</b> de ${brl(total)} (${Math.round(pct * 100)}%). ${ritmo}`;
  }

  // categorias + comparativo com média de 3 meses
  const med3 = mediaTresMeses(S.mes);
  const linhas = S.cats.filter(c => c.tipo === 'gasto' && ((r.porCat[c.id] || 0) !== 0 || c.orc > 0)).map(c => ({ c, v: r.porCat[c.id] || 0 })).sort((a, b) => b.v - a.v);
  const maior = Math.max(1, ...linhas.map(l => l.v), r.semGasto);
  let h = linhas.map(({ c, v }) => {
    const tem = c.orc > 0, pct = tem ? v / c.orc : v / maior;
    const det = tem ? (v > c.orc ? `de ${brl(c.orc)} · <span class="neg">passou ${brl(v - c.orc)}</span>` : `de ${brl(c.orc)} · sobram ${brl(c.orc - v)}`) : 'sem orçamento definido';
    let comp = '';
    if (med3[c.id] > 0 && v > 0) {
      const dif = Math.round((v / med3[c.id] - 1) * 100);
      if (Math.abs(dif) >= 10) comp = `<span>${Math.abs(dif)}% ${dif > 0 ? 'acima' : 'abaixo'} da média</span>`;
    }
    return `<div class="cat" data-cat="${esc(c.id)}" role="button" tabindex="0"><span class="nome">${esc(c.nome)}</span><span class="valor">${brl(v)}</span>
      <div class="trilho"><div class="enche${tem && v > c.orc ? ' estourou' : tem ? '' : ' livre'}" style="width:${Math.max(0, Math.min(100, pct * 100))}%"></div></div><span class="det"><span>${det}</span>${comp}</span></div>`;
  }).join('');
  if (r.semGasto) h += `<div class="cat" data-cat="__sem" role="button" tabindex="0"><span class="nome">Sem categoria</span><span class="valor">${brl(r.semGasto)}</span><div class="trilho"><div class="enche sem" style="width:${Math.min(100, r.semGasto / maior * 100)}%"></div></div><span class="det"><span>toque para classificar</span></span></div>`;
  $('#cats').innerHTML = h || '<p class="mut">Nenhum gasto neste mês.</p>';

  // últimos 6 meses
  const ms = [5, 4, 3, 2, 1, 0].map(i => addMes(S.mes, -i)), rs = ms.map(resumo), mx = Math.max(1, ...rs.map(x => Math.max(x.entrou, x.saiu)));
  $('#hist').innerHTML = ms.map((m, i) => `<div class="hcol${m === S.mes ? ' atual' : ''}" data-mes="${m}" title="${esc(mesLongo(m))}: entrou ${brl(rs[i].entrou)}, saiu ${brl(rs[i].saiu)}">
    <div class="hbars"><i class="e" style="height:${Math.max(0, rs[i].entrou) / mx * 100}%"></i><i class="s" style="height:${Math.max(0, rs[i].saiu) / mx * 100}%"></i></div>
    <span class="v">${rs[i].n ? compacto(rs[i].saiu) : '–'}</span><span class="m">${mesCurto(m)}</span></div>`).join('');

  // maiores gastos
  const top = r.gastos.sort((a, b) => a.valor - b.valor).slice(0, 5);
  $('#top5').innerHTML = top.map(t => `<li data-tx="${t.id}" role="button" tabindex="0"><span class="d">${esc(t.desc)}<small>${dataBR(t.data)} · ${esc(S.catMap[t.cat]?.nome || 'Sem categoria')}</small></span><span class="valor">${brl(-t.valor)}</span></li>`).join('') || '<li class="mut">Nenhum gasto neste mês.</li>';
}
const compacto = c => { const v = c / 100; return Math.abs(v) >= 1000 ? (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : Math.round(v).toLocaleString('pt-BR'); };

function opcoesCat(sel, comSem) {
  const g = (tipo, rot) => { const l = S.cats.filter(c => c.tipo === tipo); return l.length ? `<optgroup label="${rot}">${l.map(c => `<option value="${esc(c.id)}"${c.id === sel ? ' selected' : ''}>${esc(c.nome)}</option>`).join('')}</optgroup>` : ''; };
  return (comSem ? `<option value=""${!sel ? ' selected' : ''}>${comSem}</option>` : '') + g('gasto', 'Gastos') + g('receita', 'Entradas') + g('mov', 'Não conta como gasto nem entrada');
}
function filtrados() {
  const q = norm($('#busca').value), qv = $('#busca').value.trim().replace(/^R\$\s*/i, '').replace('.', ','), fc = $('#fCat').value, fa = $('#fConta').value, sem = $('#fSem').checked;
  const busca = $('#busca').value.trim() !== '';
  return S.tx.filter(t => {
    if (!busca && mesCompetencia(t) !== S.mes) return false;
    if (sem && S.catMap[t.cat]) return false;
    if (fc && (fc === '__sem' ? S.catMap[t.cat] : (t.cat !== fc && t.abaterCat !== fc))) return false;
    if (fa && t.conta !== fa) return false;
    if (busca) {
      const v = fmtNum.format(Math.abs(t.valor) / 100);
      if (!(q && norm(t.desc + ' ' + (t.nota || '')).includes(q)) && !(/\d/.test(qv) && (v.includes(qv) || v.replace(/\./g, '').includes(qv)))) return false;
    }
    return true;
  }).sort((a, b) => b.data.localeCompare(a.data) || a.desc.localeCompare(b.desc));
}
function montarChipsTriagem(t, topGeral) {
  const pred = preverCategoria(t.desc, t.valor, S.contaMap[t.conta], t.data);
  const sugs = pred.top.filter(x => x.conf >= 0.14 && S.catMap[x.cat]).slice(0, 2);
  const usados = new Set(sugs.map(x => x.cat));
  const base = t.valor > 0 ? S.cats.filter(x => x.tipo === 'receita').slice(0, 4) : topGeral;
  const extras = base.filter(c => !usados.has(c.id)).slice(0, Math.max(2, 6 - sugs.length));
  const btnIA = sugs.map(x => `<button type="button" class="qchip qchip-ia" data-quicktx="${esc(t.id)}" data-quickcat="${esc(x.cat)}" title="Confiança estimada: ${Math.round(x.conf * 100)}%">✦ ${esc(S.catMap[x.cat].nome)}</button>`).join('');
  const btnBase = extras.map(qc => `<button type="button" class="qchip" data-quicktx="${esc(t.id)}" data-quickcat="${esc(qc.id)}">${esc(qc.nome)}</button>`).join('');
  return `<div class="qcats">${btnIA}${btnBase}<button type="button" class="qchip qchip-out" data-tx="${esc(t.id)}">+ Outra…</button></div>`;
}
function rLanc() {
  const fc = $('#fCat'), fa = $('#fConta'), vc = fc.value, va = fa.value;
  fc.innerHTML = '<option value="">Todas as categorias</option><option value="__sem">Sem categoria</option>' + opcoesCat(vc);
  fc.value = vc; if (fc.selectedIndex < 0) fc.value = '';
  fa.innerHTML = '<option value="">Todas as contas</option>' + S.contas.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join('');
  fa.value = va; if (fa.selectedIndex < 0) fa.value = '';
  const l = filtrados(), busca = $('#busca').value.trim() !== '', modoTriagem = ($('#fSem').checked || $('#fCat').value === '__sem') && l.length > 0;
  if ($('#barTriagem')) $('#barTriagem').hidden = !modoTriagem;
  let ent = 0, sai = 0;
  for (const t of l) {
    const tp = tipoTx(t);
    if (tp === 'mov') continue;
    if (t.valor > 0 && t.abaterCat && S.catMap[t.abaterCat]?.tipo === 'gasto') { sai -= t.valor; continue; }
    if (t.valor > 0) ent += t.valor; else sai -= t.valor;
  }
  $('#lancResumo').textContent = l.length ? `${plural(l.length, 'lançamento', 'lançamentos')}${busca ? ' em todos os meses' : ''} · saiu ${brl(sai)} · entrou ${brl(ent)}` : '';
  const topCats = modoTriagem ? topCategoriasGasto(6) : [];
  $('#lanc').innerHTML = l.slice(0, S.limite).map(t => {
    const c = S.catMap[t.cat];
    const mc = mesCompetencia(t);
    const parc = t.parcela || detectarParcela(t.desc);
    const chips = modoTriagem ? montarChipsTriagem(t, topCats) : '';
    const tagAbate = t.valor > 0 && t.abaterCat && S.catMap[t.abaterCat]
      ? `<span class="tag">abate ${esc(S.catMap[t.abaterCat].nome)}</span>`
      : `<span class="tag${c ? (c.tipo === 'mov' ? ' mov' : '') : ' sem'}">${esc(c ? c.nome : 'Sem categoria')}</span>`;
    return `<li class="${t.projecao ? 'proj' : ''}" data-tx="${t.id}" role="button" tabindex="0"><span class="dia"><b>${t.data.slice(8, 10)}</b>${mesCurto(t.data.slice(0, 7))}</span>
      <span class="desc">${esc(t.desc)}</span><span class="valor ${t.valor > 0 ? 'pos' : ''}${c?.tipo === 'mov' ? ' apag' : ''}">${t.valor > 0 ? '+ ' : ''}${brl(Math.abs(t.valor))}</span>
      <span class="meta"><span class="meta-esq">${tagAbate}${parc ? `<span class="parc-tag">${parc.atual}/${parc.total}</span>` : ''}${t.projecao ? '<span class="parc-tag">previsto</span>' : ''}${mc !== t.data.slice(0, 7) ? `<span class="parc-tag">fatura ${mesCurto(mc)}</span>` : ''}</span><span class="ct">${esc(S.contaMap[t.conta]?.nome || '')}</span></span>${chips}</li>`;
  }).join('') || `<li class="vazia">${temDados() ? 'Nenhum lançamento com esses filtros' + (busca ? '.' : ` em ${mesLongo(S.mes)}.`) : 'Ainda não há lançamentos. Importe um extrato ou adicione um lançamento manual.'}</li>`;
  $('#lancMais').hidden = l.length <= S.limite;
}

function rOrc() {
  const med = mediaTresMeses();
  $('#orcLista').innerHTML = S.cats.filter(c => c.tipo === 'gasto').map(c => `<div class="orc-l"><span><b>${esc(c.nome)}</b><span class="sug">${med[c.id] ? `média de 3 meses: ${brl0(med[c.id])} <button class="lnk" data-sug="${esc(c.id)}" data-v="${med[c.id]}">usar</button>` : 'sem histórico ainda'}</span></span>
    <input inputmode="decimal" data-orc="${esc(c.id)}" value="${c.orc ? fmtNum.format(c.orc / 100).replace(/,00$/, '') : ''}" placeholder="R$" aria-label="Orçamento de ${esc(c.nome)}"></div>`).join('');
  $('#orcTotal').textContent = brl(S.cats.reduce((n, c) => n + (c.tipo === 'gasto' && c.orc > 0 ? c.orc : 0), 0));
  $('#orcSugTudo').hidden = !Object.values(med).some(Boolean);
}
const arred = c => c >= 20000 ? Math.ceil(c / 5000) * 5000 : Math.ceil(c / 1000) * 1000;
async function salvarOrc(id, cent) {
  const c = S.catMap[id]; if (!c) return;
  c.orc = cent > 0 ? cent : null; await DB.gravar('cats', c);
}

function rAjustes() {
  $('#ver').textContent = VERSAO;
  $('#tema').value = S.meta.tema || 'auto';
  const nTx = id => S.tx.filter(t => t.conta === id).length;
  const tipoC = { conta: 'conta corrente', cartao: 'cartão de crédito', dinheiro: 'dinheiro' };
  $('#contas').innerHTML = S.contas.map(c => {
    const ext = c.tipo === 'cartao' && c.fechamento ? ` · fecha dia ${p2(c.fechamento)}` : c.saldoIni ? ` · saldo ini. ${brl0(c.saldoIni)}` : '';
    return `<li data-conta="${c.id}" role="button" tabindex="0"><span><b>${esc(c.nome)}</b><small>${tipoC[c.tipo] || ''}${ext} · ${plural(nTx(c.id), 'lançamento', 'lançamentos')}</small></span><span class="seta">›</span></li>`;
  }).join('') || '<li class="mut">Nenhuma conta ainda.</li>';
  const minhas = S.regras.filter(r => !r.padrao), pad = S.regras.filter(r => r.padrao).sort((a, b) => (S.catMap[a.cat]?.ordem ?? 99) - (S.catMap[b.cat]?.ordem ?? 99) || a.texto.localeCompare(b.texto));
  const li = r => `<li><span><b>${esc(r.texto)}</b> → ${esc(S.catMap[r.cat]?.nome || '?')}${r.sinal ? `<small>${r.sinal > 0 ? 'só entradas' : 'só saídas'}</small>` : ''}</span><button class="x" data-del-regra="${esc(r.id)}" aria-label="Excluir regra ${esc(r.texto)}">×</button></li>`;
  $('#regras').innerHTML = minhas.map(li).join('') || '<li class="mut">Você ainda não criou regras fixas. Elas aparecem aqui quando você salva uma regra.</li>';
  if ($('#iaStatus')) $('#iaStatus').textContent = `Classificação inteligente ativa · ${plural(IA.nTotal, 'lançamento analisado', 'lançamentos analisados')} (${plural(IA.nManuais, 'escolha manual', 'escolhas manuais')}).`;
  $('#regrasPadraoT').textContent = `Ver as ${pad.length} regras que já vêm no app`;
  $('#regrasPadrao').innerHTML = pad.map(li).join('');
  $('#rCat').innerHTML = opcoesCat('mercado');
  $('#cats-lista').innerHTML = S.cats.map(c => `<li data-catedit="${esc(c.id)}" role="button" tabindex="0"><span><b>${esc(c.nome)}</b><small>${TIPO_NOME[c.tipo]}</small></span><span class="seta">›</span></li>`).join('');
  $('#bkInfo').textContent = S.meta.ultimoBackup ? `Última cópia salva em ${dataBRa(S.meta.ultimoBackup)}. O Bolso lembra você a cada 30 dias.` : 'Nenhuma cópia salva ainda. O Bolso lembra você a cada 30 dias.';
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent), instalado = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  $('#cardInstalar').hidden = instalado || !!S.meta.ocultarInstalar || !(promptInstalar || ios);
  $('#btnInstalar').hidden = !promptInstalar;
  if (ios && !promptInstalar) $('#instalarTxt').innerHTML = 'No iPhone: toque em <b>Compartilhar</b> (o ícone do quadrado com seta na barra do navegador) e escolha <b>Adicionar à Tela de Início</b>.';
}

// ───────────────────────── diálogos ─────────────────────────
function dialogo({ titulo, desc = '', corpo = '', ok = 'Salvar', cancelar = 'Cancelar', extra = '', aoAbrir }) {
  return new Promise(res => {
    const d = $('#dlg');
    $('#dlgTitulo').textContent = titulo; $('#dlgDesc').textContent = desc; $('#dlgDesc').hidden = !desc;
    $('#dlgCorpo').innerHTML = corpo; $('#dlgOk').textContent = ok;
    $('#dlgCancel').textContent = cancelar; $('#dlgCancel').hidden = !cancelar;
    const ex = $('#dlgExtra'); ex.hidden = !extra; ex.textContent = extra;
    ex.onclick = () => d.close('extra'); $('#dlgCancel').onclick = () => d.close('cancel');
    d.returnValue = '';
    d.onclose = () => { const v = d.returnValue; res(v === 'ok' || v === 'extra' ? { _acao: v, ...Object.fromEntries(new FormData($('#dlgForm'))) } : null); };
    d.showModal(); aoAbrir?.(d);
  });
}
const confirmar = (titulo, desc, ok = 'Confirmar') => dialogo({ titulo, desc, ok }).then(Boolean);

async function contaDinheiro() {
  let c = S.contas.find(x => x.tipo === 'dinheiro');
  if (!c) { c = { id: uid(), chave: 'dinheiro', banco: '', tipo: 'dinheiro', nome: 'Dinheiro' }; S.contas.push(c); await DB.gravar('contas', c); indexar(); }
  return c;
}
async function dividirTx(t) {
  const totalAbs = Math.abs(t.valor);
  if (totalAbs < 200) return toast('Valor muito pequeno para dividir.');
  const r = await dialogo({
    titulo: 'Dividir lançamento',
    desc: `Total original: ${brl(totalAbs)} (${t.desc}). Informe quanto vai para a segunda categoria.`,
    ok: 'Dividir',
    corpo: `<label>Valor da segunda parte (R$)<input name="parte" required inputmode="decimal" placeholder="0,00"></label>
      <label>Categoria da segunda parte<select name="cat">${opcoesCat('compras')}</select></label>
      <label>Descrição (opcional)<input name="desc" maxlength="120" value="${esc(t.desc)}"></label>`,
    aoAbrir: d => $('[name=parte]', d).focus(),
  });
  if (!r) return;
  const parte = Math.abs(parseValor(r.parte, ','));
  if (!Number.isFinite(parte) || parte <= 0 || parte >= totalAbs) return toast('Informe um valor maior que zero e menor que o total.');
  const sinal = Math.sign(t.valor) || -1;
  t.valor = (totalAbs - parte) * sinal;
  const novoT = {
    id: uid(), conta: t.conta, data: t.data, desc: (r.desc || t.desc).trim(),
    valor: parte * sinal, fitid: '', cat: r.cat || null, catManual: true,
    manual: t.manual, nota: t.nota || '',
  };
  S.tx.push(novoT);
  await DB.gravar('tx', [t, novoT]);
  treinarModelo();
  render(); toast('Lançamento dividido em duas partes');
}
async function editarTx(id) {
  const novo = !id, t = novo ? { data: S.mes === mesAtual() ? hoje() : S.mes + '-01', desc: '', valor: 0, cat: null, conta: (await contaDinheiro()).id, manual: true, nota: '' } : S.tx.find(x => x.id === id);
  if (!t) return;
  const parc = !novo ? (t.parcela || detectarParcela(t.desc)) : null;
  const pred = !novo && !t.cat ? preverCategoria(t.desc, t.valor, S.contaMap[t.conta], t.data) : null;
  const dicaIA = pred && pred.cat && pred.conf >= 0.25 && S.catMap[pred.cat]
    ? `<p class="mut" style="margin:-4px 0 0">✦ Sugestão inteligente: <b>${esc(S.catMap[pred.cat].nome)}</b> (${Math.round(pred.conf * 100)}%) <button type="button" class="lnk" id="btnUsarIA" data-catia="${esc(pred.cat)}">aplicar</button></p>`
    : '';
  const opcoesAbate = '<option value="">Não (contar como entrada normal)</option>' + S.cats.filter(c => c.tipo === 'gasto').map(c => `<option value="${esc(c.id)}"${t.abaterCat === c.id ? ' selected' : ''}>${esc(c.nome)}</option>`).join('');
  const acoesExtras = !novo ? `<div class="row" style="margin-top:4px">
    <button type="button" class="btn sm" id="btnSplitTx">Dividir valor</button>
    ${parc && parc.atual < parc.total && t.valor < 0 ? `<button type="button" class="btn sm" id="btnProjTx">Projetar parcelas (${parc.atual + 1}/${parc.total} a ${parc.total}/${parc.total})</button>` : ''}
  </div>` : '';
  const r = await dialogo({
    titulo: novo ? 'Lançamento manual' : 'Editar lançamento',
    desc: novo ? 'Para gastos em dinheiro ou qualquer coisa que não aparece no extrato.' : (t.projecao ? 'Parcela projetada automaticamente (será substituída quando o extrato real chegar).' : (t.manual ? '' : `Importado de ${S.contaMap[t.conta]?.nome || 'extrato'}`)),
    extra: novo ? '' : 'Excluir',
    corpo: `<label>Descrição<input name="desc" required maxlength="120" value="${esc(t.desc)}"></label>
      <div class="grid2"><label>Tipo<select name="sinal"><option value="-1">Saída (gasto)</option><option value="1"${t.valor > 0 ? ' selected' : ''}>Entrada</option></select></label>
      <label>Valor (R$)<input name="valor" required inputmode="decimal" placeholder="0,00" value="${t.valor ? fmtNum.format(Math.abs(t.valor) / 100) : ''}"></label></div>
      <div class="grid2"><label>Data<input type="date" name="data" required value="${t.data}"></label>
      <label>Conta<select name="conta"${!t.manual ? ' disabled' : ''}>${S.contas.map(c => `<option value="${c.id}"${c.id === t.conta ? ' selected' : ''}>${esc(c.nome)}</option>`).join('')}</select></label></div>
      <label id="lblCatTx">Categoria<select name="cat">${opcoesCat(S.catMap[t.cat] ? t.cat : '', 'Sem categoria')}</select></label>${dicaIA}
      <label id="lblAbateTx"${t.valor > 0 ? '' : ' hidden'}>Abater de um gasto (estorno / rachadinha)<select name="abaterCat">${opcoesAbate}</select></label>
      <label>Observação (opcional)<input name="nota" maxlength="120" value="${esc(t.nota || '')}"></label>${acoesExtras}`,
    aoAbrir: d => {
      if (novo) $('[name=desc]', d).focus(); else $('[name=cat]', d).focus();
      const selSinal = $('[name=sinal]', d), lblAb = $('#lblAbateTx', d), selAb = $('[name=abaterCat]', d), lblCat = $('#lblCatTx', d);
      const syncAbate = () => {
        const ehEnt = selSinal.value === '1';
        lblAb.hidden = !ehEnt;
        lblCat.hidden = ehEnt && !!selAb.value;
      };
      selSinal.onchange = syncAbate; selAb.onchange = syncAbate; syncAbate();
      $('#btnUsarIA', d)?.addEventListener('click', e => { $('[name=cat]', d).value = e.target.dataset.catia; e.target.parentElement.remove(); });
      $('#btnSplitTx', d)?.addEventListener('click', () => { d.close('cancel'); dividirTx(t); });
      $('#btnProjTx', d)?.addEventListener('click', async () => {
        d.close('cancel');
        const n = await projetarParcelas([t]);
        render();
        toast(n ? `${plural(n, 'parcela futura projetada', 'parcelas futuras projetadas')}` : 'As parcelas futuras já estavam projetadas');
      });
    },
  });
  if (!r) return;
  if (r._acao === 'extra') {
    if (!await confirmar('Excluir este lançamento?', `${t.desc} · ${brl(t.valor)}. Se ele veio de um extrato, pode voltar se você importar o mesmo arquivo de novo.`, 'Excluir')) return;
    S.tx = S.tx.filter(x => x.id !== t.id); await DB.apagar('tx', t.id); treinarModelo(); toast('Lançamento excluído'); return render();
  }
  const v = parseValor(r.valor, ',');
  if (!Number.isFinite(v) || v === 0) { toast('Não entendi o valor. Use algo como 45,90'); return; }
  const catAntes = t.cat, abateAntes = t.abaterCat || '';
  const ehEntrada = +r.sinal > 0;
  const abater = ehEntrada && r.abaterCat ? r.abaterCat : null;
  Object.assign(t, {
    desc: r.desc.trim(), valor: Math.abs(v) * +r.sinal, data: r.data || t.data,
    cat: abater ? null : (r.cat || null), nota: (r.nota || '').trim(),
  });
  if (abater) t.abaterCat = abater; else delete t.abaterCat;
  const pNovo = detectarParcela(t.desc);
  if (pNovo) t.parcela = { atual: pNovo.atual, total: pNovo.total }; else delete t.parcela;
  if (t.manual && r.conta) t.conta = r.conta;
  if (novo) { t.id = uid(); t.fitid = ''; t.catManual = true; S.tx.push(t); }
  else if (t.cat !== catAntes || (t.abaterCat || '') !== abateAntes) t.catManual = true;
  await DB.gravar('tx', t);
  const autoExtras = t.cat !== catAntes ? await reaplicarRegras() : 0;
  if (S.meta.exemplo === undefined && novo && !S.meta.primeiraImportacao) await DB.meta('primeiraImportacao', hoje());
  render();
  if (!novo && !abater && t.cat && t.cat !== catAntes && !t.manual) await oferecerRegra(t);
  else toast(novo ? 'Lançamento adicionado' : `Lançamento salvo${autoExtras ? ` (+${plural(autoExtras, 'parecido atualizado', 'parecidos atualizados')})` : ''}`);
}
async function oferecerRegra(t) {
  const nomeCat = S.catMap[t.cat].nome;
  const conta = txt => { const n = norm(txt); return n ? S.tx.filter(x => x.id !== t.id && !x.catManual && x.cat !== t.cat && norm(x.desc).includes(n)).length : 0; };
  const r = await dialogo({
    titulo: 'Fazer isso sempre?',
    desc: `Você colocou “${t.desc}” em ${nomeCat}. O Bolso pode fazer o mesmo sozinho nos próximos extratos.`,
    ok: 'Criar regra', cancelar: 'Só desta vez',
    corpo: `<label>Quando a descrição contiver<input name="texto" required maxlength="60" value="${esc(sugerirTexto(t.desc))}"></label>
      <p class="mut" style="margin:0">vai para <b>${esc(nomeCat)}</b>. Deixe só o trecho que se repete (o nome da loja ou da pessoa).</p>
      <label class="chk"><input type="checkbox" name="antigos" checked> <span id="rgN"></span></label>`,
    aoAbrir: d => { const i = $('[name=texto]', d), up = () => { const n = conta(i.value); $('#rgN').textContent = n ? `Aplicar também a ${plural(n, 'lançamento parecido que já está', 'lançamentos parecidos que já estão')} no app` : 'Aplicar também aos lançamentos parecidos que já estão no app'; }; i.oninput = up; up(); },
  });
  if (!r) return toast('Categoria salva');
  const texto = norm(r.texto); if (!texto) return;
  await criarRegra(texto, t.cat, !!r.antigos);
  render(); toast(`Regra criada: ${texto} → ${nomeCat}`);
}
async function criarRegra(texto, cat, aplicar) {
  S.regras = S.regras.filter(x => !(x.texto === texto && !x.padrao));
  const regra = { id: uid(), texto, cat, padrao: false, sinal: 0, modo: 'c' };
  S.regras.push(regra); await DB.gravar('regras', regra); indexar();
  if (aplicar) {
    const mud = S.tx.filter(x => !x.catManual && x.cat !== cat && norm(x.desc).includes(texto));
    for (const x of mud) x.cat = cat;
    if (mud.length) await DB.gravar('tx', mud);
    treinarModelo();
  }
}
async function editarConta(id) {
  const c = S.contaMap[id]; if (!c) return;
  const n = S.tx.filter(t => t.conta === id).length;
  const saldoStr = c.saldoIni ? fmtNum.format(c.saldoIni / 100) : '';
  const r = await dialogo({
    titulo: 'Conta', extra: 'Excluir',
    corpo: `<label>Nome<input name="nome" required maxlength="40" value="${esc(c.nome)}"></label>
      <label>Tipo<select name="tipo"><option value="conta">Conta corrente</option><option value="cartao"${c.tipo === 'cartao' ? ' selected' : ''}>Cartão de crédito</option><option value="dinheiro"${c.tipo === 'dinheiro' ? ' selected' : ''}>Dinheiro</option></select></label>
      <label id="lblFechamento"${c.tipo === 'cartao' ? '' : ' hidden'}>Dia de fechamento da fatura (opcional)<input type="number" name="fechamento" min="1" max="31" placeholder="Ex.: 25" value="${c.fechamento || ''}"></label>
      <div class="grid2" id="boxSaldoIni"${c.tipo === 'cartao' ? ' hidden' : ''}>
        <label>Saldo inicial (R$)<input name="saldoIni" inputmode="decimal" placeholder="0,00" value="${saldoStr}"></label>
        <label>A partir de<input type="date" name="saldoData" value="${c.saldoData || ''}"></label>
      </div>`,
    aoAbrir: d => {
      const sel = $('[name=tipo]', d);
      const sync = () => {
        const cc = sel.value === 'cartao';
        $('#lblFechamento', d).hidden = !cc;
        $('#boxSaldoIni', d).hidden = cc;
      };
      sel.onchange = sync;
    },
  });
  if (!r) return;
  if (r._acao === 'extra') {
    if (!await confirmar(`Excluir “${c.nome}”?`, n ? `Isso apaga também ${plural(n, 'lançamento', 'lançamentos')} desta conta. Não dá para desfazer.` : 'A conta está vazia.', 'Excluir')) return;
    const ids = S.tx.filter(t => t.conta === id).map(t => t.id);
    S.tx = S.tx.filter(t => t.conta !== id); S.contas = S.contas.filter(x => x.id !== id);
    await DB.apagar('tx', ids); await DB.apagar('contas', id); indexar(); toast('Conta excluída'); return render();
  }
  c.nome = r.nome.trim() || c.nome; c.tipo = r.tipo;
  const fech = parseInt(r.fechamento, 10);
  if (c.tipo === 'cartao' && fech >= 1 && fech <= 31) c.fechamento = fech; else delete c.fechamento;
  const sIni = r.saldoIni ? parseValor(r.saldoIni, ',') : NaN;
  if (c.tipo !== 'cartao' && Number.isFinite(sIni) && sIni !== 0) {
    c.saldoIni = sIni;
    c.saldoData = r.saldoData || '0000-01-01';
  } else { delete c.saldoIni; delete c.saldoData; }
  await DB.gravar('contas', c); indexar();
  await reaplicarRegras(); render();
}
async function editarCat(id) {
  const c = S.catMap[id]; if (!c) return;
  const fixa = CATS_FIXAS.includes(id), n = S.tx.filter(t => t.cat === id).length;
  const r = await dialogo({
    titulo: 'Categoria', extra: fixa ? '' : 'Excluir',
    desc: fixa ? 'Esta categoria é usada pelo próprio app, por isso só o nome pode mudar.' : '',
    corpo: `<label>Nome<input name="nome" required maxlength="40" value="${esc(c.nome)}"></label>
      ${fixa ? '' : `<label>Tipo<select name="tipo">${Object.entries(TIPO_NOME).map(([k, v]) => `<option value="${k}"${c.tipo === k ? ' selected' : ''}>${v}${k === 'mov' ? ' como gasto nem entrada' : ''}</option>`).join('')}</select></label>`}`,
  });
  if (!r) return;
  if (r._acao === 'extra') {
    if (!await confirmar(`Excluir “${c.nome}”?`, `${n ? plural(n, 'lançamento ficará', 'lançamentos ficarão') + ' sem categoria. ' : ''}As regras desta categoria também serão apagadas.`, 'Excluir')) return;
    const mud = S.tx.filter(t => t.cat === id); for (const t of mud) { t.cat = null; t.catManual = false; }
    const rg = S.regras.filter(x => x.cat === id).map(x => x.id);
    S.regras = S.regras.filter(x => x.cat !== id); S.cats = S.cats.filter(x => x.id !== id);
    await DB.gravar('tx', mud); await DB.apagar('regras', rg); await DB.apagar('cats', id); indexar(); return render();
  }
  c.nome = r.nome.trim() || c.nome; if (!fixa && r.tipo) { c.tipo = r.tipo; if (c.tipo !== 'gasto') c.orc = null; }
  await DB.gravar('cats', c); indexar(); render();
}

// ───────────────────────── cópia de segurança ─────────────────────────
async function salvarCopia() {
  const d = { app: 'bolso', formato: 1, versao: VERSAO, exportadoEm: new Date().toISOString(), contas: S.contas, cats: S.cats, regras: S.regras, tx: S.tx, meta: S.meta };
  baixar(`bolso-copia-${hoje()}.json`, JSON.stringify(d), 'application/json');
  await DB.meta('ultimoBackup', hoje()); render(); toast('Cópia salva. Guarde o arquivo num lugar seguro.');
}
async function restaurarCopia(arq) {
  let d;
  try { d = JSON.parse(decodificar(await arq.arrayBuffer())); } catch { d = null; }
  const okLista = (l, campos) => Array.isArray(l) && l.every(x => x && typeof x === 'object' && campos.every(c => c in x));
  if (!d || d.app !== 'bolso' || !okLista(d.tx, ['id', 'data', 'valor', 'desc']) || !okLista(d.contas, ['id', 'nome']) || !okLista(d.cats, ['id', 'nome', 'tipo']) || !okLista(d.regras, ['id', 'texto', 'cat'])) return toast('Este arquivo não é uma cópia do Bolso.');
  if (temDados() && !await confirmar('Restaurar esta cópia?', `A cópia de ${d.exportadoEm ? dataBRa(d.exportadoEm.slice(0, 10)) : 'data desconhecida'} tem ${plural(d.tx.length, 'lançamento', 'lançamentos')}. Ela substitui tudo o que está no app agora.`, 'Restaurar')) return;
  await DB.limpar();
  for (const s of LOJAS) await DB.gravar(s, d[s]);
  S.meta = {};
  for (const [k, v] of Object.entries(d.meta || {})) await DB.meta(k, v);
  await carregar(); aplicarTema(); S.mes = ultimoMesComDados(); render(); toast('Cópia restaurada');
}
function exportarCSV() {
  const q = s => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const l = [...S.tx].sort((a, b) => a.data.localeCompare(b.data)).map(t => [dataBRa(t.data), q(t.desc), fmtNum.format(t.valor / 100).replace(/\./g, ''), q(S.catMap[t.cat]?.nome || (t.abaterCat ? `Abate: ${S.catMap[t.abaterCat]?.nome || ''}` : '')), q(S.contaMap[t.conta]?.nome || ''), q(t.nota || '')].join(';'));
  baixar(`bolso-lancamentos-${hoje()}.csv`, '\ufeffData;Descrição;Valor;Categoria;Conta;Observação\r\n' + l.join('\r\n'), 'text/csv;charset=utf-8');
}
async function apagarTudo(silencioso) {
  const tema = S.meta.tema, ocultarInst = S.meta.ocultarInstalar;
  await DB.limpar(); S.meta = {}; S.tx = []; S.contas = [];
  await semear();
  if (tema) await DB.meta('tema', tema);
  if (ocultarInst) await DB.meta('ocultarInstalar', true);
  S.mes = mesAtual();
  if (!silencioso) { render(); toast('Tudo apagado'); }
}

// ───────────────────────── modo exemplo ─────────────────────────
async function carregarExemplo() {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, entre = (a, b) => Math.round((a + rnd() * (b - a)) * 100);
  const hj = hoje(), ck = [], cc = [];
  const poe = (l, mes, dia, desc, valor) => { const d = `${mes}-${p2(Math.min(dia, diasNoMes(mes)))}`; if (d <= hj) l.push({ data: d, desc, valor, fitid: '' }); };
  const mercados = ['SUPERMERCADO BOA COMPRA', 'ATACADAO DA SERRA', 'SACOLAO DO BAIRRO', 'PADARIA PAO QUENTE'], rest = ['IFOOD *RESTAURANTE', 'IFD*PIZZARIA NAPOLI', 'RESTAURANTE SABOR MINEIRO', 'CAFE DA PRACA', 'IFOOD *HAMBURGUERIA', 'SORVETERIA GELATO'];
  let faturaAnt = 0;
  for (let i = 5; i >= 0; i--) {
    const m = addMes(mesAtual(), -i); let fat = 0;
    const cartao = (dia, desc, v) => { const n = cc.length; poe(cc, m, dia, desc, -v); if (cc.length > n) fat += v; };
    poe(ck, m, 5, 'CREDITO DE SALARIO EMPRESA EXEMPLO LTDA', 480000);
    poe(ck, m, 8, 'PIX ENVIADO IMOBILIARIA CENTRAL ALUGUEL', -145000);
    poe(ck, m, 10, 'CONDOMINIO ED PRIMAVERA', -38000);
    poe(ck, m, 12, 'CEMIG DISTRIBUICAO', -entre(110, 190));
    poe(ck, m, 14, 'COPASA MG', -entre(55, 85));
    poe(ck, m, 15, 'VIVO MOVEL', -6999);
    poe(ck, m, 2, 'TAR PACOTE SERVICOS', -2990);
    poe(ck, m, 6, 'APLICACAO CDB', -30000);
    if (faturaAnt) { poe(ck, m, 10, 'PAGTO FATURA CARTAO CREDITO', -faturaAnt); poe(cc, m, 10, 'PAGAMENTO RECEBIDO', faturaAnt); }
    poe(ck, m, 18, 'PIX ENVIADO MARIANA COSTA', -entre(40, 120));
    poe(ck, m, 22, 'PIX RECEBIDO JULIA ALVES', entre(50, 150));
    poe(ck, m, 25, 'COMPRA CARTAO DEBITO FEIRA LIVRE', -entre(35, 70));
    if (i % 2 === 0) poe(ck, m, 20, 'SAQUE 24H', -10000);
    cartao(3, 'NETFLIX.COM', 4490); cartao(3, 'SPOTIFY', 2190); cartao(7, 'SMARTFIT ACADEMIA', 11990);
    for (let k = 0; k < 4; k++) cartao(4 + k * 7, mercados[(k + i) % 4], entre(90, 320));
    for (let k = 0; k < 7; k++) cartao(2 + k * 4, rest[(k + i) % 6], entre(28, 95));
    for (let k = 0; k < 5; k++) cartao(1 + k * 6, 'UBER *TRIP', entre(12, 38));
    cartao(11, 'DROGARIA SAUDE E VIDA', entre(30, 140)); cartao(16, 'POSTO AVENIDA', entre(120, 220));
    cartao(19, i % 2 ? 'AMAZON MARKETPLACE' : 'RENNER', entre(80, 350)); cartao(21, 'SALAO BELLA', entre(70, 160));
    if (i === 0) cartao(12, 'DECATHLON PARC 01/04', 18500);
    if (i % 3 === 0) cartao(23, 'CINEMARK', entre(40, 90));
    cartao(9, 'LOJA DA ESQUINA', entre(30, 90)); cartao(27, 'PETZ', entre(60, 150));
    faturaAnt = fat;
  }
  await importarLote({ conta: { chave: 'ex|ck', banco: 'Bradesco', tipo: 'conta', nome: 'Bradesco · conta final 4821' }, itens: ck }, { semPares: true });
  await importarLote({ conta: { chave: 'ex|cc', banco: 'Santander', tipo: 'cartao', nome: 'Santander · cartão final 7730' }, itens: cc }, { semPares: true });
  const orc = { moradia: 220000, mercado: 90000, restaurantes: 40000, transporte: 35000, saude: 15000, cuidados: 30000, assinaturas: 8000, compras: 25000, pets: 12000 };
  for (const [id, v] of Object.entries(orc)) if (S.catMap[id]) S.catMap[id].orc = v;
  await DB.gravar('cats', S.cats); await DB.meta('exemplo', true);
  S.mes = mesAtual(); ir('painel');
}

// ───────────────────────── tema, privacidade e instalação ─────────────────────────
function aplicarTema() {
  const t = S.meta.tema || 'auto', r = document.documentElement;
  if (t === 'auto') delete r.dataset.theme; else r.dataset.theme = t === 'claro' ? 'light' : 'dark';
  try { localStorage.setItem('bolso-tema', t); } catch {}
  const escuro = t === 'escuro' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  $('meta[name=theme-color]').content = escuro ? '#142729' : '#0f5257';
}
function aplicarPrivacidade() {
  let priv = false;
  try { priv = localStorage.getItem('bolso-privado') === '1'; } catch {}
  document.body.classList.toggle('privado', priv);
  if ($('#btnPriv')) $('#btnPriv').textContent = priv ? '🙈' : '👁';
}
let promptInstalar = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); promptInstalar = e; if (S.view === 'ajustes') rAjustes(); });
addEventListener('appinstalled', () => { promptInstalar = null; if (S.view === 'ajustes') rAjustes(); });

// ───────────────────────── eventos ─────────────────────────
function revisar() { $('#busca').value = ''; $('#fCat').value = ''; $('#fConta').value = ''; $('#fSem').checked = true; ir('lancamentos'); }
function ligar() {
  document.addEventListener('click', async e => {
    const qChip = e.target.closest('[data-quicktx]');
    if (qChip) {
      e.stopPropagation();
      const t = S.tx.find(x => x.id === qChip.dataset.quicktx);
      if (!t) return;
      t.cat = qChip.dataset.quickcat; t.catManual = true;
      await DB.gravar('tx', t);
      if ($('#triagemRegra')?.checked && !t.manual) {
        const texto = sugerirTexto(t.desc);
        if (texto.length >= 2) await criarRegra(texto, t.cat, true);
      }
      const autoExtras = await reaplicarRegras();
      render();
      toast(`Classificado em ${S.catMap[t.cat]?.nome || 'categoria'}${autoExtras ? ` (+${plural(autoExtras, 'parecido atualizado', 'parecidos atualizados')})` : ''}`);
      return;
    }
    const ocFixa = e.target.closest('[data-ocultarfixa]');
    if (ocFixa) {
      e.stopPropagation();
      const lista = new Set(S.meta.fixasOcultas || []);
      lista.add(ocFixa.dataset.ocultarfixa);
      await DB.meta('fixasOcultas', [...lista]);
      render();
      return;
    }
    const el = e.target.closest('[data-go],[data-revisar],[data-projparc],[data-tx],[data-cat],[data-filtraconta],[data-mes],[data-conta],[data-catedit],[data-del-regra],[data-sug]');
    if (!el) return;
    const d = el.dataset;
    if (d.go) { if (d.go === 'lancamentos' && el.classList.contains('lnk')) { $('#fSem').checked = false; $('#fCat').value = ''; $('#busca').value = ''; } ir(d.go); }
    else if (d.revisar) revisar();
    else if (d.projparc) { const n = await projetarParcelas(ultimosParcelados); el.disabled = true; toast(n ? `${plural(n, 'parcela futura projetada', 'parcelas futuras projetadas')}` : 'Parcelas futuras já projetadas'); }
    else if (d.tx) editarTx(d.tx);
    else if (d.cat) { $('#busca').value = ''; $('#fConta').value = ''; $('#fSem').checked = false; S.view = 'lancamentos'; rLanc(); $('#fCat').value = d.cat; ir('lancamentos'); }
    else if (d.filtraconta) { $('#busca').value = ''; $('#fCat').value = ''; $('#fSem').checked = false; S.view = 'lancamentos'; rLanc(); $('#fConta').value = d.filtraconta; ir('lancamentos'); }
    else if (d.mes) { S.mes = d.mes; render(); }
    else if (d.conta) editarConta(d.conta);
    else if (d.catedit) editarCat(d.catedit);
    else if (d.delRegra) { S.regras = S.regras.filter(r => r.id !== d.delRegra); await DB.apagar('regras', d.delRegra); indexar(); const n = await reaplicarRegras(); const ab = $('details.padrao').open; render(); $('details.padrao').open = ab; toast(n ? `Regra excluída · ${plural(n, 'lançamento reclassificado', 'lançamentos reclassificados')}` : 'Regra excluída'); }
    else if (d.sug) { await salvarOrc(d.sug, arred(+d.v)); rOrc(); }
  });
  document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button]')) { e.preventDefault(); e.target.click(); } });
  $('#mesAnt').onclick = () => { S.mes = addMes(S.mes, -1); S.limite = 200; render(); };
  $('#mesProx').onclick = () => { S.mes = addMes(S.mes, 1); S.limite = 200; render(); };
  if ($('#btnPriv')) $('#btnPriv').onclick = () => {
    const prox = !document.body.classList.contains('privado');
    try { localStorage.setItem('bolso-privado', prox ? '1' : '0'); } catch {}
    aplicarPrivacidade();
  };
  $('#btnExemplo').onclick = carregarExemplo;
  $('#sairExemplo').onclick = async () => { await apagarTudo(true); ir('painel'); toast('Dados de exemplo removidos'); };
  for (const id of ['busca', 'fCat', 'fConta', 'fSem']) $('#' + id).addEventListener(id === 'busca' ? 'input' : 'change', () => { S.limite = 200; rLanc(); });
  $('#lancMais').onclick = () => { S.limite += 300; rLanc(); };
  $('#btnNovo').onclick = () => editarTx(null);
  if ($('#btnNovoTop')) $('#btnNovoTop').onclick = () => editarTx(null);

  const drop = $('#drop'), entra = async fs => { if (fs.length) { await importarArquivos([...fs]); } };
  $('#arquivo').onchange = e => entra(e.target.files);
  for (const ev of ['dragenter', 'dragover']) drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('sobre'); });
  for (const ev of ['dragleave', 'drop']) drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('sobre'); });
  drop.addEventListener('drop', e => entra(e.dataTransfer.files));
  $('#csvOk').onclick = () => csvResolver?.(true); $('#csvCancel').onclick = () => csvResolver?.(false);

  $('#orcLista').addEventListener('change', async e => {
    const id = e.target.dataset.orc; if (!id) return;
    const v = e.target.value.trim() === '' ? 0 : parseValor(e.target.value, ',');
    if (!Number.isFinite(v) || v < 0) { toast('Não entendi o valor. Use algo como 800 ou 1.200,00'); return rOrc(); }
    await salvarOrc(id, v); rOrc();
  });
  $('#orcSugTudo').onclick = async () => { const med = mediaTresMeses(); let n = 0; for (const c of S.cats) if (c.tipo === 'gasto' && !c.orc && med[c.id]) { await salvarOrc(c.id, arred(med[c.id])); n++; } rOrc(); toast(n ? `${plural(n, 'categoria preenchida', 'categorias preenchidas')}` : 'Nada para preencher'); };

  $('#tema').onchange = async e => { await DB.meta('tema', e.target.value); aplicarTema(); };
  $('#btnInstalar').onclick = async () => { if (!promptInstalar) return; promptInstalar.prompt(); await promptInstalar.userChoice; promptInstalar = null; rAjustes(); };
  if ($('#btnOcultarInstalar')) $('#btnOcultarInstalar').onclick = async () => { await DB.meta('ocultarInstalar', true); rAjustes(); };
  $('#rAdd').onclick = async () => {
    const texto = norm($('#rTexto').value), cat = $('#rCat').value;
    if (texto.length < 2) return toast('Escreva o texto que aparece na descrição');
    await criarRegra(texto, cat, false); const n = await reaplicarRegras(); $('#rTexto').value = ''; render();
    toast(`Regra criada${n ? ` · ${plural(n, 'lançamento reclassificado', 'lançamentos reclassificados')}` : ''}`);
  };
  $('#cAdd').onclick = async () => {
    const nome = $('#cNome').value.trim(); if (!nome) return toast('Dê um nome para a categoria');
    if (S.cats.some(c => norm(c.nome) === norm(nome))) return toast('Já existe uma categoria com esse nome');
    const c = { id: uid(), nome, tipo: $('#cTipo').value, ordem: Math.max(0, ...S.cats.map(x => x.ordem || 0)) + 1, orc: null };
    S.cats.push(c); await DB.gravar('cats', c); indexar(); $('#cNome').value = ''; render(); toast('Categoria criada');
  };
  $('#bkSalvar').onclick = salvarCopia;
  $('#bkRestaurar').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (f) await restaurarCopia(f); };
  $('#csvExport').onclick = () => temDados() ? exportarCSV() : toast('Ainda não há lançamentos para exportar');
  $('#apagar').onclick = async () => { if ($('#apagarConf').value.trim().toUpperCase() !== 'APAGAR') return toast('Digite APAGAR no campo ao lado para confirmar'); $('#apagarConf').value = ''; await apagarTudo(); ir('painel'); };
  $('#main').addEventListener('click', async e => {
    if (e.target.id === 'bkAgora') salvarCopia();
    else if (e.target.id === 'bkDepois') { await DB.meta('backupAdiado', hoje()); render(); }
  });
  addEventListener('hashchange', () => { const v = location.hash.slice(1); if ($(`.view[data-view="${v}"]`) && v !== S.view) ir(v, true); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', aplicarTema);
}

// ───────────────────────── início ─────────────────────────
function ultimoMesComDados() {
  if (!S.tx.length) return mesAtual();
  const ma = mesAtual(); if (S.tx.some(t => mesCompetencia(t) === ma && !t.projecao)) return ma;
  const m = S.tx.filter(t => !t.projecao).map(mesCompetencia).filter(x => x <= ma).sort().pop();
  return m || ma;
}
async function carregar() {
  [S.tx, S.contas, S.cats, S.regras, S.meta] = await Promise.all([DB.todos('tx'), DB.todos('contas'), DB.todos('cats'), DB.todos('regras'), DB.metaTudo()]);
  S.cats.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  indexar();
  if (!S.cats.length) await semear();
}
async function iniciar() {
  try { await DB.abrir(); await carregar(); }
  catch (e) {
    console.error(e);
    $('#main').innerHTML = '<div class="vazio"><h1>Não consegui abrir o armazenamento</h1><p>O Bolso guarda os dados neste aparelho, e o navegador não permitiu. Isso acontece em janela anônima/privada ou quando o armazenamento está bloqueado. Abra o Bolso numa janela normal.</p></div>';
    return;
  }
  navigator.storage?.persist?.().catch(() => {});
  aplicarTema(); aplicarPrivacidade(); ligar();
  S.mes = ultimoMesComDados();
  const v = location.hash.slice(1);
  ir($(`.view[data-view="${v}"]`) ? v : 'painel');
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW', e));
}
iniciar();
