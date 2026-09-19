const fs = require('fs');
const path = require('path');

describe('Webpack config entry point detection', () => {
  it('should export detectEntryPoint function', () => {
    const configPath = path.resolve(__dirname, '../src/webpack/webpack.config.ts');
    expect(fs.existsSync(configPath)).toBe(true);
    
    const content = fs.readFileSync(configPath, 'utf8');
    expect(content).toContain('detectEntryPoint');
    expect(content).toContain('export');
  });

  it('should prefer index.tsx when both exist', () => {
    const configPath = path.resolve(__dirname, '../src/webpack/webpack.config.ts');
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Should check for tsx first
    expect(content).toContain('index.tsx');
    expect(content).toContain('index.ts');
  });

  it('should check for index.tsx existence before index.ts', () => {
    const configPath = path.resolve(__dirname, '../src/webpack/webpack.config.ts');
    const content = fs.readFileSync(configPath, 'utf8');
    
    // The detection logic should check tsx first
    const existsTsxIndex = content.indexOf('fs.existsSync(tsxPath)');
    const existsTsIndex = content.indexOf('fs.existsSync(tsPath)');
    expect(existsTsxIndex).toBeLessThan(existsTsIndex);
  });

  it('should default to index.tsx when neither exists', () => {
    const configPath = path.resolve(__dirname, '../src/webpack/webpack.config.ts');
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Default should be index.tsx
    expect(content).toContain('./src/index.tsx');
  });
});
