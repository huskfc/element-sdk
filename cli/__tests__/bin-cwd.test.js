const fs = require('fs');
const path = require('path');

describe('CLI bin cwd preservation', () => {
  it('should spawn with caller cwd in development mode', () => {
    const binPath = path.resolve(__dirname, '../bin/defai-element.js');
    expect(fs.existsSync(binPath)).toBe(true);
    
    const content = fs.readFileSync(binPath, 'utf8');
    // Should use process.cwd() not path.resolve(__dirname, '..')
    expect(content).toContain('process.cwd()');
    expect(content).not.toContain("path.resolve(__dirname, '..')");
  });

  it('should not have hardcoded cli directory cwd', () => {
    const binPath = path.resolve(__dirname, '../bin/defai-element.js');
    const content = fs.readFileSync(binPath, 'utf8');
    // Should not hardcode the cli directory as cwd
    expect(content).not.toMatch(/cwd:\s*path\.resolve\(__dirname,\s*\.\.\)/);
  });
});
