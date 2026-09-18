import { ElementValidator } from '../src/core/ElementValidator';

describe('ElementValidator resource limits', () => {
  const baseManifest: any = {
    metadata: { 
      id: 'test', 
      name: 'Test', 
      version: '1.0.0', 
      author: 'A', 
      description: 'D', 
      category: 'Utilities',
      tags: ['test'],
      icon: '🧪',
      screenshots: [],
      minSize: { width: 300, height: 200 },
      maxSize: { width: 800, height: 600 },
      defaultSize: { width: 400, height: 300 },
      tierRequired: 'free'
    },
    permissions: { 
      network: false,
      storage: false,
      notifications: false,
      clipboard: false,
      canReceiveFrom: [],
      canSendTo: [],
      portfolio: false,
      transactions: false,
      aiChat: false,
      wallet: false,
      maxMemory: 50,
      maxCpu: 25
    }
  };

  describe('maxMemory validation', () => {
    const invalidMemories = [
      { value: 0, desc: 'zero' },
      { value: -1, desc: 'negative' },
      { value: -100, desc: 'negative large' },
      { value: NaN, desc: 'NaN' },
      { value: Infinity, desc: 'Infinity' },
      { value: -Infinity, desc: '-Infinity' },
    ];

    invalidMemories.forEach(({ value, desc }) => {
      it(`rejects maxMemory ${desc}`, () => {
        const manifest = { ...baseManifest, permissions: { ...baseManifest.permissions, maxMemory: value } };
        const result = ElementValidator.validateManifest(manifest);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'INVALID_MEMORY_LIMIT')).toBe(true);
      });
    });

    it('accepts positive finite maxMemory', () => {
      const result = ElementValidator.validateManifest({ ...baseManifest, permissions: { ...baseManifest.permissions, maxMemory: 50 } });
      expect(result.valid).toBe(true);
    });

    it('warns for maxMemory > 100', () => {
      const result = ElementValidator.validateManifest({ ...baseManifest, permissions: { ...baseManifest.permissions, maxMemory: 150 } });
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'HIGH_MEMORY_LIMIT')).toBe(true);
    });

    it('does not warn for maxMemory <= 100', () => {
      const result = ElementValidator.validateManifest({ ...baseManifest, permissions: { ...baseManifest.permissions, maxMemory: 100 } });
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'HIGH_MEMORY_LIMIT')).toBe(false);
    });
  });

  describe('maxCpu validation', () => {
    const invalidCpus = [
      { value: 0, desc: 'zero' },
      { value: -1, desc: 'negative' },
      { value: -50, desc: 'negative large' },
      { value: NaN, desc: 'NaN' },
      { value: Infinity, desc: 'Infinity' },
      { value: -Infinity, desc: '-Infinity' },
    ];

    invalidCpus.forEach(({ value, desc }) => {
      it(`rejects maxCpu ${desc}`, () => {
        const manifest = { ...baseManifest, permissions: { ...baseManifest.permissions, maxCpu: value } };
        const result = ElementValidator.validateManifest(manifest);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'INVALID_CPU_LIMIT')).toBe(true);
      });
    });

    it('accepts positive finite maxCpu', () => {
      const result = ElementValidator.validateManifest({ ...baseManifest, permissions: { ...baseManifest.permissions, maxCpu: 25 } });
      expect(result.valid).toBe(true);
    });

    it('warns for maxCpu > 50', () => {
      const result = ElementValidator.validateManifest({ ...baseManifest, permissions: { ...baseManifest.permissions, maxCpu: 75 } });
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'HIGH_CPU_LIMIT')).toBe(true);
    });

    it('does not warn for maxCpu <= 50', () => {
      const result = ElementValidator.validateManifest({ ...baseManifest, permissions: { ...baseManifest.permissions, maxCpu: 50 } });
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.code === 'HIGH_CPU_LIMIT')).toBe(false);
    });
  });

  it('rejects both invalid maxMemory and maxCpu together', () => {
    const manifest = { 
      ...baseManifest, 
      permissions: { ...baseManifest.permissions, maxMemory: -1, maxCpu: NaN } 
    };
    const result = ElementValidator.validateManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'INVALID_MEMORY_LIMIT')).toBe(true);
    expect(result.errors.some(e => e.code === 'INVALID_CPU_LIMIT')).toBe(true);
  });

  it('does not warn when maxMemory/maxCpu not specified', () => {
    const manifest = { 
      ...baseManifest, 
      permissions: { 
        ...baseManifest.permissions, 
        maxMemory: undefined,
        maxCpu: undefined 
      } 
    };
    const result = ElementValidator.validateManifest(manifest);
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBe(0);
  });
});
