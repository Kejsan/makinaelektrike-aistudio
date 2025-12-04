import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@google/genai', () => {
  const generateContent = vi.fn();
  const getGenerativeModel = vi.fn(() => ({ generateContent }));
  const GoogleGenAI = vi.fn(() => ({ getGenerativeModel }));
  return { GoogleGenAI, __private__: { generateContent, getGenerativeModel } };
});

const mockEnv = (key: string, value: string) => {
  process.env[key] = value;
};

describe('gemini service', () => {
  beforeEach(() => {
    vi.resetModules();
    mockEnv('GEMINI_API_KEY', 'test-key');
    mockEnv('VITE_ENABLE_GEMINI_PREFILL', 'true');
  });

  it('normalizes Gemini payloads into Model shape with AI source', async () => {
    const { normalizeGeminiModel } = await import('./gemini');

    const model = normalizeGeminiModel(
      {
        brand: 'Tesla',
        model_name: 'Model 3',
        battery_capacity: '82',
        range_wltp: '560',
        autocharge_supported: 'true',
        charging_ac: '11 kW',
      },
      'Tesla',
      'Model 3',
    );

    expect(model).toMatchObject({
      brand: 'Tesla',
      model_name: 'Model 3',
      battery_capacity: 82,
      range_wltp: 560,
      autocharge_supported: true,
      charging_ac: '11 kW',
      source: 'ai',
      isFeatured: false,
      imageGallery: [],
    });
  });

  it('throws a readable error when Gemini is enabled but the response cannot be parsed', async () => {
    const { __private__ } = await import('@google/genai');
    __private__.generateContent.mockResolvedValueOnce({ response: { text: () => 'not-json' } });

    const { enrichModelWithGemini } = await import('./gemini');

    await expect(enrichModelWithGemini('Test', 'Model')).rejects.toThrow(/parsing failed/i);
  });
});

