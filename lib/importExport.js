/**
 * Import/Export Utilities
 * Handles compression, encoding, checksums for data serialization
 */

const EXPORT_VERSION = 2;

// Kept in sync with lib/constants.js (duplicated to avoid icon imports)
const EXPENSE_CATEGORIES = [
  'House', 'Car', 'Food', 'Utilities', 'Healthcare', 'Leisure',
  'Subscriptions', 'Phone', 'Insurance', 'Other',
];
const SHARED_EXPENSE_CATEGORIES = [
  'House', 'Food', 'Utilities', 'Insurance', 'Other', 'Subscriptions',
  'Taxes', 'InternetTV', 'Car',
];
const PERSONAL_EXPENSE_CATEGORIES = [
  'Car', 'Healthcare', 'Leisure', 'Other', 'Phone', 'Subscriptions',
];

// Simple CRC32 implementation for data validation
const CRC32_TABLE = (() => {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

const crc32 = (str) => {
  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ str.charCodeAt(i)) & 0xff];
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0');
};

const KEY_MAP = {
  calculationType: 'ct',
  incomes: 'inc',
  savings: 'sv',
  expenses: 'ex',
  includeSavingsInCalculations: 'isc',
  person1Incomes: 'p1i',
  person1Income: 'p1i',
  person1Savings: 'p1s',
  person1Expenses: 'p1e',
  person1Name: 'p1n',
  person2Incomes: 'p2i',
  person2Income: 'p2i',
  person2Savings: 'p2s',
  person2Expenses: 'p2e',
  person2Name: 'p2n',
  sharedExpenses: 'se',
  sharedSavingsPots: 'ssp',
  person1SavingsPots: 'p1p',
  person2SavingsPots: 'p2p',
  savingsPots: 'sp',
  separateSavingsPots: 'dsp',
  expenseLineItems: 'eli',
  currentAge: 'ca',
  retirementAge: 'ra',
  monthlyInvestment: 'mi',
  annualReturn: 'ar',
  goalBalance: 'gb',
  currentBalance: 'cb',
};

const REVERSE_KEY_MAP = {
  ct: 'calculationType',
  inc: 'incomes',
  sv: 'savings',
  ex: 'expenses',
  isc: 'includeSavingsInCalculations',
  p1i: 'person1Incomes',
  p1s: 'person1Savings',
  p1e: 'person1Expenses',
  p1n: 'person1Name',
  p2i: 'person2Incomes',
  p2s: 'person2Savings',
  p2e: 'person2Expenses',
  p2n: 'person2Name',
  se: 'sharedExpenses',
  ssp: 'sharedSavingsPots',
  p1p: 'person1SavingsPots',
  p2p: 'person2SavingsPots',
  sp: 'savingsPots',
  dsp: 'separateSavingsPots',
  eli: 'expenseLineItems',
  ca: 'currentAge',
  ra: 'retirementAge',
  mi: 'monthlyInvestment',
  ar: 'annualReturn',
  gb: 'goalBalance',
  cb: 'currentBalance',
};

const ALL_CATEGORIES = [...new Set([
  ...EXPENSE_CATEGORIES,
  ...PERSONAL_EXPENSE_CATEGORIES,
  ...SHARED_EXPENSE_CATEGORIES,
])];

const CATEGORY_MAP = Object.fromEntries(ALL_CATEGORIES.map((cat, index) => [cat, String(index)]));
const REVERSE_CATEGORY_MAP = Object.fromEntries(
  Object.entries(CATEGORY_MAP).map(([cat, code]) => [code, cat])
);

const SCOPE_MAP = {
  shared: 's',
  person1: '1',
  person2: '2',
  separateShared: 'x',
};

const REVERSE_SCOPE_MAP = Object.fromEntries(
  Object.entries(SCOPE_MAP).map(([scope, code]) => [code, scope])
);

const INCOME_LIST_KEYS = new Set(['incomes', 'person1Incomes', 'person2Incomes']);
const EXPENSE_RECORD_KEYS = new Set(['expenses', 'person1Expenses', 'person2Expenses', 'sharedExpenses']);
const POTS_LIST_KEYS = new Set([
  'sharedSavingsPots',
  'person1SavingsPots',
  'person2SavingsPots',
  'savingsPots',
  'separateSavingsPots',
]);

const bytesToBinaryString = (bytes) => String.fromCharCode(...bytes);
const binaryStringToBytes = (binary) => Uint8Array.from(binary, (char) => char.charCodeAt(0));

const isGzipBytes = (bytes) => bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;

const encodeBase64FromBytes = (bytes) => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  return btoa(bytesToBinaryString(bytes));
};

const decodeBase64ToBytes = (encoded) => {
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(encoded, 'base64'));
  }
  return binaryStringToBytes(atob(encoded));
};

const encodeUtf8Json = (jsonStr) => {
  if (typeof Buffer !== 'undefined') {
    return encodeBase64FromBytes(Buffer.from(jsonStr, 'utf8'));
  }
  return btoa(unescape(encodeURIComponent(jsonStr)));
};

const decodeUtf8Json = (encoded) => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(encoded, 'base64').toString('utf8');
  }
  return decodeURIComponent(escape(atob(encoded)));
};

const tryGzip = async (text) => {
  if (typeof CompressionStream === 'undefined') return null;

  const input = new Blob([new TextEncoder().encode(text)]).stream();
  const compressedStream = input.pipeThrough(new CompressionStream('gzip'));
  const buffer = await new Response(compressedStream).arrayBuffer();
  return new Uint8Array(buffer);
};

const tryGunzip = async (bytes) => {
  if (!isGzipBytes(bytes) || typeof DecompressionStream === 'undefined') return null;

  const decompressedStream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(decompressedStream).text();
};

const trimTrailingEmpty = (tuple) => {
  const next = [...tuple];
  while (next.length > 1 && (next[next.length - 1] === '' || next[next.length - 1] == null)) {
    next.pop();
  }
  return next;
};

const omitEmptyDeep = (value) => {
  if (Array.isArray(value)) {
    const next = value
      .map((item) => omitEmptyDeep(item))
      .filter((item) => item !== '' && item != null);
    return next.length ? next : undefined;
  }

  if (value && typeof value === 'object') {
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      const cleaned = omitEmptyDeep(item);
      if (cleaned === '' || cleaned == null) continue;
      if (Array.isArray(cleaned) && cleaned.length === 0) continue;
      if (typeof cleaned === 'object' && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0) {
        continue;
      }
      next[key] = cleaned;
    }
    return Object.keys(next).length ? next : undefined;
  }

  return value === '' ? undefined : value;
};

const compressIncomeList = (items = []) =>
  items.map(({ id, label, amount }) => trimTrailingEmpty([id, label, amount]));

const decompressIncomeList = (items = []) =>
  items.map((tuple) => {
    const [id, label = '', amount = ''] = tuple;
    return { id, label, amount };
  });

const compressExpenseRecord = (expenses = {}) => {
  const compressed = {};
  for (const [category, amount] of Object.entries(expenses)) {
    if (amount == null) continue;
    const code = CATEGORY_MAP[category] ?? category;
    compressed[code] = amount;
  }
  return compressed;
};

const decompressExpenseRecord = (expenses = {}) => {
  const decompressed = {};
  for (const [code, amount] of Object.entries(expenses)) {
    const category = REVERSE_CATEGORY_MAP[code] ?? code;
    decompressed[category] = amount;
  }
  return decompressed;
};

const compressPotsList = (pots = []) =>
  pots.map(({ id, name, goalAmount, currentAmount, monthlyContribution }) =>
    trimTrailingEmpty([id, name, goalAmount, currentAmount, monthlyContribution])
  );

const decompressPotsList = (pots = []) =>
  pots.map((tuple) => {
    const [id, name = '', goalAmount = '', currentAmount = '', monthlyContribution = ''] = tuple;
    return { id, name, goalAmount, currentAmount, monthlyContribution };
  });

const compressLineItemList = (items = []) =>
  items.map(({ id, name, amount }) => trimTrailingEmpty([id, name, amount]));

const decompressLineItemList = (items = []) =>
  items.map((tuple) => {
    const [id, name = '', amount = ''] = tuple;
    return { id, name, amount };
  });

const compressExpenseLineItems = (lineItems = {}) => {
  const compressed = {};
  for (const [scope, categories] of Object.entries(lineItems)) {
    const scopeCode = SCOPE_MAP[scope] ?? scope;
    const scopeData = {};
    for (const [category, items] of Object.entries(categories || {})) {
      if (!items?.length) continue;
      const categoryCode = CATEGORY_MAP[category] ?? category;
      scopeData[categoryCode] = compressLineItemList(items);
    }
    if (Object.keys(scopeData).length) {
      compressed[scopeCode] = scopeData;
    }
  }
  return compressed;
};

const decompressExpenseLineItems = (lineItems = {}) => {
  const decompressed = {};
  for (const [scopeCode, categories] of Object.entries(lineItems)) {
    const scope = REVERSE_SCOPE_MAP[scopeCode] ?? scopeCode;
    const scopeData = {};
    for (const [categoryCode, items] of Object.entries(categories || {})) {
      const category = REVERSE_CATEGORY_MAP[categoryCode] ?? categoryCode;
      scopeData[category] = decompressLineItemList(items);
    }
    decompressed[scope] = scopeData;
  }
  return decompressed;
};

const compressDashboardValue = (fullKey, value) => {
  if (fullKey === 'includeSavingsInCalculations') {
    return value === false ? 0 : undefined;
  }
  if (INCOME_LIST_KEYS.has(fullKey)) return compressIncomeList(value);
  if (EXPENSE_RECORD_KEYS.has(fullKey)) return compressExpenseRecord(value);
  if (POTS_LIST_KEYS.has(fullKey)) return compressPotsList(value);
  if (fullKey === 'expenseLineItems') return compressExpenseLineItems(value);
  return value;
};

const decompressDashboardValue = (fullKey, value) => {
  if (fullKey === 'includeSavingsInCalculations') {
    return value === 0 ? false : true;
  }
  if (INCOME_LIST_KEYS.has(fullKey)) return decompressIncomeList(value);
  if (EXPENSE_RECORD_KEYS.has(fullKey)) return decompressExpenseRecord(value);
  if (POTS_LIST_KEYS.has(fullKey)) return decompressPotsList(value);
  if (fullKey === 'expenseLineItems') return decompressExpenseLineItems(value);
  return value;
};

const compressDashboard = (dashboardData = {}) => {
  const compressed = {};
  for (const [key, value] of Object.entries(dashboardData)) {
    const shortKey = KEY_MAP[key] || key;
    const nextValue = compressDashboardValue(key, value);
    if (nextValue === undefined) continue;
    compressed[shortKey] = nextValue;
  }
  return compressed;
};

const decompressDashboardV2 = (dashboardData = {}) => {
  const decompressed = {};
  for (const [key, value] of Object.entries(dashboardData)) {
    const fullKey = REVERSE_KEY_MAP[key] || key;
    decompressed[fullKey] = decompressDashboardValue(fullKey, value);
  }

  if (decompressed.includeSavingsInCalculations === undefined) {
    decompressed.includeSavingsInCalculations = true;
  }

  return decompressed;
};

const decompressRetirementV2 = (retirementData = {}) => {
  const decompressed = {};
  for (const [key, value] of Object.entries(retirementData)) {
    const fullKey = REVERSE_KEY_MAP[key] || key;
    decompressed[fullKey] = decompressDashboardValue(fullKey, value);
  }
  return decompressed;
};

const compressRetirement = (retirementData = {}) => compressDashboard(retirementData);

const buildExportPayload = (dashboardData, retirementData) => ({
  v: EXPORT_VERSION,
  d: compressDashboard(dashboardData || {}),
  r: compressRetirement(retirementData || {}),
});

const decodePayloadJson = async (encoded) => {
  const bytes = decodeBase64ToBytes(encoded);
  const gunzipped = await tryGunzip(bytes);
  if (gunzipped != null) return gunzipped;
  return decodeUtf8Json(encoded);
};

const encodePayloadJson = async (jsonStr) => {
  const gzipped = await tryGzip(jsonStr);
  if (gzipped) return encodeBase64FromBytes(gzipped);
  return encodeUtf8Json(jsonStr);
};

const parsePayload = (compressed) => {
  if (compressed?.v === EXPORT_VERSION) {
    return {
      dashboardData: decompressDashboardV2(compressed.d || {}),
      retirementData: decompressRetirementV2(compressed.r || {}),
    };
  }

  return {
    dashboardData: decompressObjectLegacy(compressed.d || {}),
    retirementData: decompressObjectLegacy(compressed.r || {}),
  };
};

/**
 * Generate compressed export string with checksum
 * @param {Object} dashboardData - Dashboard cookie data
 * @param {Object} retirementData - Retirement cookie data
 * @returns {Promise<string>} Compressed, encoded string with checksum
 */
export const generateExportString = async (dashboardData, retirementData) => {
  try {
    const payload = buildExportPayload(dashboardData, retirementData);
    const jsonStr = JSON.stringify(payload);
    const encoded = await encodePayloadJson(jsonStr);
    const checksum = crc32(encoded);
    return `${encoded}:${checksum}`;
  } catch (error) {
    console.error('Export error:', error);
    throw new Error('Failed to generate export string');
  }
};

/**
 * Parse and validate import string
 * @param {string} str - Export string to parse
 * @returns {Promise<Object>} { dashboardData, retirementData }
 */
export const parseImportString = async (str) => {
  try {
    if (!str || typeof str !== 'string') {
      throw new Error('Invalid input');
    }

    const parts = str.trim().split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid format');
    }

    const [encoded, checksum] = parts;

    const expectedChecksum = crc32(encoded);
    if (expectedChecksum !== checksum.toLowerCase()) {
      throw new Error('Checksum validation failed');
    }

    const decoded = await decodePayloadJson(encoded);
    const compressed = JSON.parse(decoded);
    return parsePayload(compressed);
  } catch (error) {
    console.error('Import error:', error);
    throw new Error(`Import failed: ${error.message}`);
  }
};

/**
 * Legacy top-level key decompression (v1 exports)
 */
const compressObjectLegacy = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const compressed = {};
  for (const [key, value] of Object.entries(obj)) {
    const shortKey = KEY_MAP[key] || key;
    compressed[shortKey] = value;
  }
  return compressed;
};

const decompressObjectLegacy = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const decompressed = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = REVERSE_KEY_MAP[key] || key;
    decompressed[fullKey] = value;
  }
  return decompressed;
};

/** @internal Exported for tests and size comparisons */
export const __testing = {
  EXPORT_VERSION,
  buildExportPayload,
  compressDashboard,
  decompressDashboardV2,
  compressObjectLegacy,
  decodePayloadJson,
  encodePayloadJson,
  parsePayload,
};
