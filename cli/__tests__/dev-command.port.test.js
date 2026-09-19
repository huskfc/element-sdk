const devModule = require('../src/commands/dev');
const validatePort = devModule.validatePort;
const DevCommand = devModule.DevCommand;

describe('DevCommand port validation', () => {
  describe('validatePort', () => {
    it('accepts valid port numbers as strings', () => {
      expect(validatePort('3000')).toBe(3000);
      expect(validatePort('8080')).toBe(8080);
      expect(validatePort('1')).toBe(1);
      expect(validatePort('65535')).toBe(65535);
    });

    it('rejects non-numeric strings', () => {
      expect(() => validatePort('3000oops')).toThrow('Invalid port');
      expect(() => validatePort('abc')).toThrow('Invalid port');
      expect(() => validatePort('')).toThrow('Invalid port');
    });

    it('rejects decimal numbers', () => {
      expect(() => validatePort('3.5')).toThrow('Invalid port');
      expect(() => validatePort('3000.5')).toThrow('Invalid port');
    });

    it('rejects negative numbers', () => {
      expect(() => validatePort('-1')).toThrow('Invalid port');
    });

    it('rejects zero', () => {
      expect(() => validatePort('0')).toThrow('Invalid port');
    });

    it('rejects out of range ports', () => {
      expect(() => validatePort('65536')).toThrow('Invalid port');
      expect(() => validatePort('99999')).toThrow('Invalid port');
    });

    it('accepts leading zeros as valid integers', () => {
      expect(validatePort('03000')).toBe(3000);
    });
  });

  describe('DevCommand', () => {
    it('exports validatePort function', () => {
      expect(typeof validatePort).toBe('function');
    });

    it('exports DevCommand class', () => {
      expect(DevCommand).toBeDefined();
    });
  });
});
