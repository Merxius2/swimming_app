const EXPORT_VERSION = 3;

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

const bytesToBinaryString = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
};

const binaryStringToBytes = (binary) => {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

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

const isGzipBytes = (bytes) => bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;

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

const encodePayloadJson = async (jsonStr) => {
  const gzipped = await tryGzip(jsonStr);
  if (gzipped) return encodeBase64FromBytes(gzipped);
  return encodeUtf8Json(jsonStr);
};

const decodePayloadJson = async (encoded) => {
  const bytes = decodeBase64ToBytes(encoded);
  const gunzipped = await tryGunzip(bytes);
  if (gunzipped != null) return gunzipped;
  return decodeUtf8Json(encoded);
};

const compressSession = (session) => ({
  i: session.id,
  dt: session.date,
  ca: session.createdAt,
  m: {
    ds: session.metrics?.durationSec,
    dm: session.metrics?.distanceM,
    ak: session.metrics?.activeKcal,
    tk: session.metrics?.totalKcal,
    ps: session.metrics?.paceSecPer100m,
    hr: session.metrics?.avgHeartRate,
    lp: session.metrics?.laps,
    pl: session.metrics?.poolLengthM,
    gm: session.metrics?.goalM,
    loc: session.metrics?.location,
    tr: session.metrics?.timeRange,
    st: session.metrics?.strokes,
  },
});

const decompressSession = (raw) => ({
  id: raw.i,
  date: raw.dt,
  createdAt: raw.ca,
  metrics: {
    durationSec: raw.m?.ds ?? null,
    distanceM: raw.m?.dm ?? null,
    activeKcal: raw.m?.ak ?? null,
    totalKcal: raw.m?.tk ?? null,
    paceSecPer100m: raw.m?.ps ?? null,
    avgHeartRate: raw.m?.hr ?? null,
    laps: raw.m?.lp ?? null,
    poolLengthM: raw.m?.pl ?? 25,
    goalM: raw.m?.gm ?? null,
    location: raw.m?.loc ?? '',
    timeRange: raw.m?.tr ?? '',
    strokes: raw.m?.st ?? {},
  },
});

export const generateSwimExportString = async (swimData) => {
  const payload = {
    v: EXPORT_VERSION,
    p: swimData.profile,
    s: (swimData.sessions || []).map(compressSession),
  };
  const jsonStr = JSON.stringify(payload);
  const encoded = await encodePayloadJson(jsonStr);
  const checksum = crc32(encoded);
  return `${encoded}:${checksum}`;
};

export const parseSwimImportString = async (str) => {
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

  if (compressed.v !== EXPORT_VERSION) {
    throw new Error('Unsupported export version');
  }

  return {
    profile: compressed.p || { sex: 'male', age: 30 },
    sessions: (compressed.s || []).map(decompressSession),
  };
};

/** @internal */
export const __testing = { EXPORT_VERSION, compressSession, decompressSession, crc32 };
