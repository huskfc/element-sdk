import { ElementValidator } from '../src/core/ElementValidator';

describe('ElementValidator blank required metadata', () => {
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

  const requiredFields = ['id', 'name', 'version', 'author', 'description', 'category'];

  requiredFields.forEach(field => {
    describe(`missing/blank ${field}`, () => {
      it(`rejects missing ${field}`, () => {
        const manifest = { ...baseManifest, metadata: { ...baseManifest.metadata } };
        delete manifest.metadata[field];
        const result = ElementValidator.validateManifest(manifest);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'MISSING_METADATA_FIELD' && e.field === `metadata.${field}`)).toBe(true);
      });

      it(`rejects blank string ${field}`, () => {
        const manifest = { ...baseManifest, metadata: { ...baseManifest.metadata, [field]: '' } };
        const result = ElementValidator.validateManifest(manifest);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'MISSING_METADATA_FIELD' && e.field === `metadata.${field}`)).toBe(true);
      });

      it(`rejects whitespace-only ${field}`, () => {
        const manifest = { ...baseManifest, metadata: { ...baseManifest.metadata, [field]: '   ' } };
        const result = ElementValidator.validateManifest(manifest);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'MISSING_METADATA_FIELD' && e.field === `metadata.${field}`)).toBe(true);
      });

      it(`rejects non-string ${field}`, () => {
        const manifest = { ...baseManifest, metadata: { ...baseManifest.metadata, [field]: 123 as any } };
        const result = ElementValidator.validateManifest(manifest);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.code === 'MISSING_METADATA_FIELD' && e.field === `metadata.${field}`)).toBe(true);
      });
    });
  });

  it('rejects multiple blank fields at once', () => {
    const manifest = { 
      ...baseManifest, 
      metadata: { 
        ...baseManifest.metadata, 
        id: '', 
        name: '  ',
        version: '',
        author: null,
        description: '',
        category: '   '
      } 
    };
    const result = ElementValidator.validateManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.filter(e => e.code === 'MISSING_METADATA_FIELD').length).toBe(6);
  });

  it('does not produce format errors when id/version are blank', () => {
    const manifest = { 
      ...baseManifest, 
      metadata: { 
        ...baseManifest.metadata, 
        id: '',
        version: ''
      } 
    };
    const result = ElementValidator.validateManifest(manifest);
    expect(result.valid).toBe(false);
    // Should only have MISSING_METADATA_FIELD errors, not format errors
    expect(result.errors.every(e => e.code === 'MISSING_METADATA_FIELD')).toBe(true);
  });

  it('accepts valid non-blank required fields', () => {
    const result = ElementValidator.validateManifest(baseManifest);
    expect(result.valid).toBe(true);
  });
});
