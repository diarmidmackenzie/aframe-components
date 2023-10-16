var path = require('path');
var merge = require('webpack-merge').merge;
var commonConfiguration = require('./webpack.config.js');

module.exports = merge(commonConfiguration, {
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'anchored.min.js'
  },
  mode: 'production'
});