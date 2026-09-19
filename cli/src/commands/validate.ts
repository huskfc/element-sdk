import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';

export interface ValidateOptions {
  strict: boolean;
  config?: string;
  fix: boolean;
}

export class ValidateCommand {
  constructor(private options: ValidateOptions) {}

  async execute(): Promise<void> {
    const spinner = ora('Validating element...').start();
    
    try {
      const issues: Array<{ type: 'error' | 'warning'; message: string }> = [];
      
      // Check manifest.json
      await this.validateManifest(issues);
      
      // Check package.json
      await this.validatePackageJson(issues);
      
      // Check entry point
      await this.validateEntryPoint(issues);
      
      // Check required files
      await this.validateRequiredFiles(issues);

      // Report results
      const errors = issues.filter(i => i.type === 'error');
      const warnings = issues.filter(i => i.type === 'warning');

      if (errors.length > 0) {
        spinner.fail('Validation failed');
        console.log();
        console.log(chalk.red('❌ Errors:'));
        errors.forEach(error => {
          console.log(`  ${chalk.red('•')} ${error.message}`);
        });
      } else {
        spinner.succeed('Validation passed');
      }

      if (warnings.length > 0) {
        console.log();
        console.log(chalk.yellow('⚠️  Warnings:'));
        warnings.forEach(warning => {
          console.log(`  ${chalk.yellow('•')} ${warning.message}`);
        });
      }

      if (errors.length === 0 && warnings.length === 0) {
        console.log();
        console.log(chalk.green('🎉 Element validation passed with no issues!'));
      }

      console.log();

      // In strict mode, treat warnings as errors
      if (this.options.strict && warnings.length > 0) {
        console.log(chalk.red('🔒 Strict mode: treating warnings as errors'));
        throw new Error('Validation failed in strict mode: warnings present');
      }

      if (errors.length > 0) {
        throw new Error('Validation failed');
      }

    } catch (error) {
      spinner.fail('Validation failed');
      throw error;
    }
  }

  private async validateManifest(issues: Array<{ type: 'error' | 'warning'; message: string }>): Promise<void> {
    try {
      const manifestPath = path.join(process.cwd(), 'manifest.json');
      
      if (!await fs.pathExists(manifestPath)) {
        issues.push({
          type: 'error',
          message: 'manifest.json is required'
        });
        return;
      }

      const manifest = await fs.readJson(manifestPath);
      
      // Detect manifest format: SDK nested format vs legacy flat format
      const isSDKFormat = manifest.metadata && manifest.permissions;
      
      if (isSDKFormat) {
        // SDK nested format validation
        await this.validateSDKManifest(manifest, issues);
      } else {
        // Legacy flat format validation
        await this.validateLegacyManifest(manifest, issues);
      }

    } catch (error) {
      issues.push({
        type: 'error',
        message: `Failed to parse manifest.json: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  private async validateSDKManifest(manifest: any, issues: Array<{ type: 'error' | 'warning'; message: string }>): Promise<void> {
    const { metadata, permissions, dependencies, build } = manifest;
    
    if (!metadata) {
      issues.push({ type: 'error', message: 'SDK manifest missing required "metadata" object' });
      return;
    }
    
    if (!permissions) {
      issues.push({ type: 'error', message: 'SDK manifest missing required "permissions" object' });
      return;
    }

    // Validate required metadata fields
    const requiredMetadataFields = ['id', 'name', 'version', 'author', 'description', 'category'];
    for (const field of requiredMetadataFields) {
      const value = metadata[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        issues.push({
          type: 'error',
          message: `metadata missing required field: ${field}`
        });
      }
    }

    // Validate metadata field formats
    if (metadata.id && typeof metadata.id === 'string' && !/^[a-z0-9-]+$/.test(metadata.id)) {
      issues.push({ type: 'error', message: 'metadata.id must contain only lowercase letters, numbers, and hyphens' });
    }
    
    if (metadata.version && typeof metadata.version === 'string' && !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
      issues.push({ type: 'error', message: 'metadata.version must follow semantic versioning (e.g., 1.0.0)' });
    }

    // Validate permissions
    const validPermissionKeys = new Set([
      'network', 'storage', 'notifications', 'clipboard',
      'canReceiveFrom', 'canSendTo', 'portfolio', 'transactions',
      'aiChat', 'wallet', 'maxMemory', 'maxCpu'
    ]);
    
    if (permissions) {
      for (const key of Object.keys(permissions)) {
        if (!validPermissionKeys.has(key)) {
          issues.push({
            type: 'warning',
            message: `Unknown permission: ${key}`
          });
        }
      }
    }

    // Validate dependencies if present
    if (dependencies) {
      for (const [pkg, version] of Object.entries(dependencies)) {
        if (typeof version !== 'string') {
          issues.push({ type: 'error', message: `Invalid version for dependency ${pkg}` });
        }
      }
    }

    // Validate build config if present
    if (build) {
      if (!build.entry) {
        issues.push({ type: 'error', message: 'build configuration missing entry point' });
      }
      if (!build.output) {
        issues.push({ type: 'error', message: 'build configuration missing output' });
      }
    }

  }

  private async validateLegacyManifest(manifest: any, issues: Array<{ type: 'error' | 'warning'; message: string }>): Promise<void> {
    // Required fields for legacy format
    const requiredFields = ['id', 'name', 'version', 'description', 'category'];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        issues.push({
          type: 'error',
          message: `manifest.json missing required field: ${field}`
        });
      }
    }

    // Validate permissions for legacy format
    if (manifest.permissions) {
      const validPermissions = ['wallet', 'network', 'ai', 'storage', 'notifications', 'messaging'];
      for (const permission of Object.keys(manifest.permissions)) {
        if (!validPermissions.includes(permission)) {
          issues.push({
            type: 'warning',
            message: `Unknown permission in manifest.json: ${permission}`
          });
        }
      }
    }
  }

  private async validatePackageJson(issues: Array<{ type: 'error' | 'warning'; message: string }>): Promise<void> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      
      if (!await fs.pathExists(packagePath)) {
        issues.push({
          type: 'error',
          message: 'package.json is required'
        });
        return;
      }

      const pkg = await fs.readJson(packagePath);
      
      // Check SDK dependency
      if (!pkg.dependencies || !pkg.dependencies['@defai/element-sdk']) {
        issues.push({
          type: 'error',
          message: 'package.json must include @defai/element-sdk dependency'
        });
      }

    } catch (error) {
      issues.push({
        type: 'error',
        message: `Failed to parse package.json: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  private async validateEntryPoint(issues: Array<{ type: 'error' | 'warning'; message: string }>): Promise<void> {
    const entryPoints = ['src/index.tsx', 'src/index.ts'];
    
    let hasEntryPoint = false;
    for (const entryPoint of entryPoints) {
      if (await fs.pathExists(path.join(process.cwd(), entryPoint))) {
        hasEntryPoint = true;
        break;
      }
    }

    if (!hasEntryPoint) {
      issues.push({
        type: 'error',
        message: 'No entry point found (src/index.tsx or src/index.ts required)'
      });
    }
  }

  private async validateRequiredFiles(issues: Array<{ type: 'error' | 'warning'; message: string }>): Promise<void> {
    const requiredFiles = ['tsconfig.json'];
    
    for (const file of requiredFiles) {
      if (!await fs.pathExists(path.join(process.cwd(), file))) {
        issues.push({
          type: 'warning',
          message: `Recommended file missing: ${file}`
        });
      }
    }
  }
}
