// Webpack prod config for aframe-connecting-line — minified bundle.
const path = require('path');
const merge = require('webpack-merge').merge;
const commonConfiguration = require('./webpack.config.js');

module.exports = merge(commonConfiguration, {
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'connecting-line.min.js'
  },
  devtool: 'source-map',
  mode: 'production'
});
