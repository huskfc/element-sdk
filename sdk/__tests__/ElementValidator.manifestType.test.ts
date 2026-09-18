import { ElementValidator } from '../src/core/ElementValidator';

describe('ElementValidator manifest type rejection', () => {
  const invalidManifests = [
    { input: null, desc: 'null' },
    { input: undefined, desc: 'undefined' },
    { input: 'string', desc: 'string' },
    { input: 123, desc: 'number' },
    { input: true, desc: 'boolean' },
    { input: [], desc: 'array' },
    { input: () => {}, desc: 'function' },
  ];

  invalidManifests.forEach(({ input, desc }) => {
    it(`rejects ${desc} with INVALID_MANIFEST`, () => {
      const result = ElementValidator.validateManifest(input as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_MANIFEST')).toBe(true);
      expect(result.errors.length).toBe(1);
      expect(result.warnings.length).toBe(0);
    });
  });

  it('accepts empty object and proceeds to field validation', () => {
    const result = ElementValidator.validateManifest({} as any);
    expect(result.valid).toBe(false);
    // Should have field validation errors, not INVALID_MANIFEST
    expect(result.errors.some(e => e.code === 'INVALID_MANIFEST')).toBe(false);
    expect(result.errors.some(e => e.code === 'MISSING_METADATA')).toBe(true);
    expect(result.errors.some(e => e.code === 'MISSING_PERMISSIONS')).toBe(true);
  });

  it('accepts object with metadata and permissions and validates fields', () => {
    const result = ElementValidator.validateManifest({
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
    });
    expect(result.valid).toBe(true);
  });
});
