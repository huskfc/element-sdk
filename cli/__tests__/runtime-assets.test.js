const fs = require('fs');
const path = require('path');

describe('Runtime assets', () => {
  it('should have jest.config.js in lib/jest', () => {
    const configPath = path.resolve(__dirname, '../lib/jest/jest.config.js');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it('should have valid Jest config structure', () => {
    const configPath = path.resolve(__dirname, '../lib/jest/jest.config.js');
    const config = require(configPath);
    
    expect(config).toBeDefined();
    expect(config.preset).toBe('ts-jest');
    expect(config.testEnvironment).toBe('jsdom');
    expect(config.testMatch).toBeDefined();
    expect(Array.isArray(config.testMatch)).toBe(true);
    expect(config.moduleFileExtensions).toContain('ts');
    expect(config.moduleFileExtensions).toContain('tsx');
  });
});
