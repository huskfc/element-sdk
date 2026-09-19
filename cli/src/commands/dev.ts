import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';
import ora from 'ora';
import { createWebpackConfig } from '../webpack/webpack.config';

/**
 * Strictly validate a port string
 * - Must be digits only (no prefixes, suffixes, decimals)
 * - Must be in range 1-65535
 */
export function validatePort(portStr: string): number {
  // Strict integer check - no prefixes, suffixes, decimals
  if (!/^\d+$/.test(portStr)) {
    throw new Error(`Invalid port: "${portStr}". Port must be a positive integer.`);
  }
  
  const port = parseInt(portStr, 10);
  
  if (port < 1 || port > 65535) {
    throw new Error(`Invalid port: ${port}. Port must be in range 1-65535.`);
  }
  
  return port;
}

export interface DevOptions {
  port: string;
  host: string;
  env: string;
  open: boolean;
}

export class DevCommand {
  constructor(private options: DevOptions) {}

  async execute(): Promise<void> {
    const spinner = ora('Starting development server...').start();
    
    try {
      // Validate port before starting
      const port = validatePort(this.options.port);
      const host = this.options.host;
      
      // Create webpack configuration
      const config = createWebpackConfig({
        mode: 'development',
        sourceMaps: true,
        minify: false
      });

      const compiler = webpack(config);
      
      if (!compiler) {
        throw new Error('Failed to create webpack compiler');
      }
      
      // Configure dev server
      const devServerConfig: WebpackDevServer.Configuration = {
        port,
        host,
        hot: true,
        open: this.options.open,
        static: {
          directory: './public',
          publicPath: '/'
        },
        devMiddleware: {
          publicPath: '/',
        },
        client: {
          overlay: true,
          progress: true
        },
        historyApiFallback: true
      };

      const server = new WebpackDevServer(devServerConfig, compiler);

      await server.start();
      
      spinner.succeed('Development server started successfully!');
      
      console.log();
      console.log(chalk.green('🚀 Element development server is running:'));
      console.log();
      console.log(`  ${chalk.bold('Local:')}            http://${host}:${port}`);
      console.log(`  ${chalk.bold('Network:')}          http://localhost:${port}`);
      console.log();
      console.log(chalk.cyan('📝 To stop the server, press Ctrl+C'));
      console.log();

    } catch (error) {
      spinner.fail('Failed to start development server');
      throw error;
    }
  }
}
