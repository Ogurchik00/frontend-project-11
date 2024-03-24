import * as path from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

export default {
  mode: 'development',
  entry: {
    main: './src/runApp.js',
  },
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader', 'postcss-loader'],
      },
    ],
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve('dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new CleanWebpackPlugin(),
  ],
};
