import webpack from 'webpack';
import path from 'path';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

export interface WebpackConfigOptions {
  mode: 'development' | 'production';
  sourceMaps: boolean;
  minify: boolean;
}

/**
 * Detect the element entry point
 * Prefers index.tsx when both exist, otherwise uses index.ts
 */
function detectEntryPoint(projectRoot: string): string {
  const tsxPath = path.resolve(projectRoot, 'src/index.tsx');
  const tsPath = path.resolve(projectRoot, 'src/index.ts');
  
  if (fs.existsSync(tsxPath)) {
    return './src/index.tsx';
  }
  
  if (fs.existsSync(tsPath)) {
    return './src/index.ts';
  }
  
  // Default to TSX so Webpack reports the missing entry clearly
  return './src/index.tsx';
}

export function createWebpackConfig(options: WebpackConfigOptions): webpack.Configuration {
  const isDevelopment = options.mode === 'development';
  const projectRoot = process.cwd();
  const entry = detectEntryPoint(projectRoot);
  
  return {
    mode: options.mode,
    entry,
    
    output: {
      path: path.resolve(projectRoot, 'dist'),
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      clean: true,
      publicPath: '/'
    },
    
    resolve: {
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {
        '@': path.resolve(projectRoot, 'src')
      }
    },
    
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: isDevelopment,
                compilerOptions: {
                  module: 'esnext'
                }
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/,
          type: 'asset/resource'
        }
      ]
    },
    
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html'
      }),
      
      ...(isDevelopment ? [
        new ReactRefreshWebpackPlugin({
          exclude: [/node_modules/]
        })
      ] : [])
    ],
    
    optimization: {
      minimize: options.minify,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    
    devtool: options.sourceMaps ? (isDevelopment ? 'eval-source-map' : 'source-map') : false,
    
    stats: {
      errorDetails: true
    }
  };
}
