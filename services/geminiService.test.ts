import { describe, it, expect } from 'vitest';

describe('geminiService', () => {
  it('exports generateCardMetadata', async () => {
    const mod = await import('./geminiService');
    expect(mod.generateCardMetadata).toBeDefined();
    expect(typeof mod.generateCardMetadata).toBe('function');
  });

  it('exports generateCardImage', async () => {
    const mod = await import('./geminiService');
    expect(mod.generateCardImage).toBeDefined();
    expect(typeof mod.generateCardImage).toBe('function');
  });
});
