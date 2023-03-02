const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const EslingPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, 'src', 'index'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.[contenthash].js',
    assetModuleFilename: 'webpack-module-assets/[name].[contenthash][ext]'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.js|ts$/,
        use: 'babel-loader',
        exclude: /node_modules/,
        use: [{ loader: 'babel-loader' }, { loader: 'ts-loader' }]
      },
      {
        test: /\.(scss)$/,
        use: [{ loader: MiniCssExtractPlugin.loader }, { loader: 'css-loader', options: { url: false } }, 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'template.html'),
      filename: 'index.html',
    }),
    new CopyPlugin({
      patterns: [
        { from: './src/assets/', to: './assets/' },
      ],
    }),
    new FileManagerPlugin({
      events: {
        onStart: {
          delete: ['dist'],
        },
      },
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/styles/[name].[contenthash].css',
    }),
    new EslingPlugin({ extensions: 'ts' }),
  ],
  devServer: {
    watchFiles: path.join(__dirname, 'src'),
  },
};