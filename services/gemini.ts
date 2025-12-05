import type { Model } from '../types';

const GEMINI_MODEL = 'gemini-2.5-flash-lite';
export const GEMINI_TIMEOUT_MS = 12000;

const readEnvValue = (...keys: string[]): string | undefined => {
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as { env?: Record<string, string> }).env : undefined;
  for (const key of keys) {
    const value = (process.env[key] ?? metaEnv?.[key]) as string | undefined;
    if (value) return value;
  }
  return undefined;
};

const apiKey = (readEnvValue('GEMINI_API_KEY', 'GEMINI_KEY') ?? '').trim();
const featureToggle = (readEnvValue('VITE_ENABLE_GEMINI_PREFILL') ?? 'true').toString().toLowerCase();
const searchApiKey = readEnvValue('GOOGLE_SEARCH_API_KEY', 'VITE_GOOGLE_SEARCH_API_KEY');
const searchEngineId = readEnvValue('GOOGLE_SEARCH_ENGINE_ID', 'VITE_GOOGLE_SEARCH_ENGINE_ID');
export const isGeminiConfigured = Boolean(apiKey);
export const isGeminiEnabled = isGeminiConfigured && featureToggle !== 'false';

let cachedClient: InstanceType<(typeof import('@google/genai'))['GoogleGenAI']> | null = null;

const getClient = async () => {
  if (!isGeminiConfigured) {
    throw new Error('Gemini API key is not configured.');
  }
  if (!isGeminiEnabled) {
    throw new Error('Gemini enrichment is disabled.');
  }

  if (cachedClient) return cachedClient;

  const { GoogleGenAI } = (await import('@google/genai')) as typeof import('@google/genai');
  cachedClient = new GoogleGenAI({ apiKey });
  return cachedClient;
};

const toModelId = (brand: string, modelName: string) =>
  `${brand}-${modelName}`
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .trim();

const parseNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim();
    if (!cleaned) return undefined;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const parseBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    if (['true', 'yes', 'y', '1'].includes(normalized)) return true;
    if (['false', 'no', 'n', '0'].includes(normalized)) return false;
  }
  return undefined;
};

const cleanString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;

type WebSearchResult = {
  title: string;
  url: string;
  snippet?: string;
};

const fetchSearchResults = async (brand: string, model: string): Promise<WebSearchResult[]> => {
  if (!searchApiKey || !searchEngineId) return [];

  const query = `${brand} ${model} EV specs`;
  const searchUrl = new URL('https://www.googleapis.com/customsearch/v1');
  searchUrl.searchParams.set('key', searchApiKey);
  searchUrl.searchParams.set('cx', searchEngineId);
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('num', '5');

  try {
    const response = await fetch(searchUrl.toString());
    if (!response.ok) return [];

    const payload = (await response.json()) as {
      items?: { title?: string; link?: string; snippet?: string }[];
    };

    return (payload.items ?? [])
      .map(item => ({
        title: item.title?.trim() ?? 'Result',
        url: item.link ?? '',
        snippet: item.snippet?.trim(),
      }))
      .filter(result => Boolean(result.url));
  } catch (error) {
    console.warn('Gemini search enrichment failed', error);
    return [];
  }
};

const buildContextBlock = (brand: string, model: string, searchResults: WebSearchResult[]) => {
  if (!searchResults.length) return '';

  const bulletList = searchResults
    .map(result => `- ${result.title}\n  URL: ${result.url}${result.snippet ? `\n  Snippet: ${result.snippet}` : ''}`)
    .join('\n');

  return `\nThe following recent web results were retrieved for ${brand} ${model}. Cross-check and rely on them for the latest specs when possible, but omit any field you cannot verify.\n${bulletList}\n`;
};

export const buildGeminiPrompt = (brand: string, model: string, searchResults: WebSearchResult[]) => {
  const context = buildContextBlock(brand, model, searchResults);
  return `You are an EV data expert.
Provide concise technical specifications for the electric vehicle ${brand} ${model}.${context}
Respond with a single JSON object using these keys only: brand, model_name, year_start, body_type, charge_port, charge_power,
autocharge_supported, battery_capacity, battery_useable_capacity, battery_type, battery_voltage, range_wltp, power_kw, torque_nm,
acceleration_0_100, acceleration_0_60, top_speed, drive_type, seats, charging_ac, charging_dc, length_mm, width_mm, height_mm,
wheelbase_mm, weight_kg, cargo_volume_l, notes.
If a value is unknown, omit that key entirely. Use numbers where appropriate.`;
};

export const normalizeGeminiModel = (
  payload: Partial<Record<keyof Model, unknown>>,
  fallbackBrand: string,
  fallbackModel: string,
): Model => {
  const brand = cleanString(payload.brand) ?? fallbackBrand;
  const modelName = cleanString(payload.model_name) ?? fallbackModel;
  const id = toModelId(brand || 'unknown', modelName || 'model');

  return {
    id,
    brand: brand || 'Unknown',
    model_name: modelName || 'Unknown',
    source: 'ai',
    year_start: parseNumber(payload.year_start),
    body_type: cleanString(payload.body_type),
    charge_port: cleanString(payload.charge_port),
    charge_power: parseNumber(payload.charge_power),
    autocharge_supported: parseBoolean(payload.autocharge_supported),
    battery_capacity: parseNumber(payload.battery_capacity),
    battery_useable_capacity: parseNumber(payload.battery_useable_capacity),
    battery_type: cleanString(payload.battery_type),
    battery_voltage: parseNumber(payload.battery_voltage),
    range_wltp: parseNumber(payload.range_wltp),
    power_kw: parseNumber(payload.power_kw),
    torque_nm: parseNumber(payload.torque_nm),
    acceleration_0_100: parseNumber(payload.acceleration_0_100),
    acceleration_0_60: parseNumber(payload.acceleration_0_60),
    top_speed: parseNumber(payload.top_speed),
    drive_type: cleanString(payload.drive_type),
    seats: parseNumber(payload.seats),
    charging_ac: cleanString(payload.charging_ac),
    charging_dc: cleanString(payload.charging_dc),
    length_mm: parseNumber(payload.length_mm),
    width_mm: parseNumber(payload.width_mm),
    height_mm: parseNumber(payload.height_mm),
    wheelbase_mm: parseNumber(payload.wheelbase_mm),
    weight_kg: parseNumber(payload.weight_kg),
    cargo_volume_l: parseNumber(payload.cargo_volume_l),
    notes: cleanString(payload.notes),
    isFeatured: false,
    imageGallery: [],
    image_url: undefined,
  } satisfies Model;
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Gemini request timed out')), timeoutMs);
    promise
      .then(result => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timer);
        reject(error);
      });
  });

export const enrichModelWithGemini = async (
  brand: string,
  modelName: string,
  signal?: AbortSignal,
): Promise<Model> => {
  const client = await getClient();

  const searchResults = await fetchSearchResults(brand, modelName);
  const prompt = buildGeminiPrompt(brand, modelName, searchResults);
  const request = client.models.generateContent({
    model: GEMINI_MODEL.startsWith('models/') ? GEMINI_MODEL : `models/${GEMINI_MODEL}`,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.35 },
  });

  const abortPromise = signal
    ? new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => reject(new Error('Gemini request aborted')), { once: true });
      })
    : null;

  const response = await withTimeout(abortPromise ? Promise.race([request, abortPromise]) : request, GEMINI_TIMEOUT_MS);

  const text = (() => {
    const structured =
      (response as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
        response?: { candidates?: { content?: { parts?: { text?: string }[] } }[]; text?: () => string };
      }) ?? {};

    const candidateParts = structured.candidates ?? structured.response?.candidates;
    const parts = candidateParts?.flatMap(candidate => candidate.content?.parts ?? []) ?? [];
    const concatenated = parts
      .map(part => part.text?.trim())
      .filter((value): value is string => Boolean(value))
      .join('\n')
      .trim();

    if (concatenated) return concatenated;

    return structured.response?.text?.();
  })();

  if (!text || !text.trim()) {
    throw new Error('Gemini returned an empty response.');
  }

  try {
    const parsed = JSON.parse(text) as Partial<Record<keyof Model, unknown>>;
    return normalizeGeminiModel(parsed, brand, modelName);
  } catch (error) {
    throw new Error(`Gemini response parsing failed: ${(error as Error).message}`);
  }
};

