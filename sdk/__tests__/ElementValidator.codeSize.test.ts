import { ElementValidator } from '../src/core/ElementValidator';

describe('ElementValidator code size (UTF-8 bytes)', () => {
  it('rejects code exceeding 1 MB in UTF-8 bytes', () => {
    // 500,001 two-byte UTF-8 characters = 1,000,002 bytes
    const twoByteChar = '¢'; // U+00A2 = 2 bytes in UTF-8
    const largeCode = twoByteChar.repeat(500001);
    
    const result = ElementValidator.validateCode(largeCode);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.code === 'CODE_TOO_LARGE')).toBe(true);
  });

  it('accepts code under 1 MB in UTF-8 bytes', () => {
    // 400,000 two-byte UTF-8 characters = 800,000 bytes
    const twoByteChar = '¢'; // U+00A2 = 2 bytes in UTF-8
    const code = twoByteChar.repeat(400000);
    
    const result = ElementValidator.validateCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors.some(e => e.code === 'CODE_TOO_LARGE')).toBe(false);
  });

  it('warns at 500 KB UTF-8 bytes', () => {
    // 300,000 two-byte UTF-8 characters = 600,000 bytes
    const twoByteChar = '¢';
    const code = twoByteChar.repeat(300000);
    
    const result = ElementValidator.validateCode(code);
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.code === 'LARGE_CODE_SIZE')).toBe(true);
  });

  it('ASCII code still uses correct byte count', () => {
    // 600,000 ASCII characters = 600,000 bytes
    const code = 'a'.repeat(600000);
    
    const result = ElementValidator.validateCode(code);
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.code === 'LARGE_CODE_SIZE')).toBe(true);
  });

  it('ASCII under 500KB passes without warning', () => {
    // 400,000 ASCII characters = 400,000 bytes
    const code = 'a'.repeat(400000);
    
    const result = ElementValidator.validateCode(code);
    expect(result.valid).toBe(true);
    expect(result.warnings.some(w => w.code === 'LARGE_CODE_SIZE')).toBe(false);
  });
});
