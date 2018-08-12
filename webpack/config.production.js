// You can add other webpack configuration (plugins, loaders, etc).
// Apart from ES6 Import/Export, Gulp was able to do all my other work so this file is mainly empty.

const UglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  output: {
    filename: 'scripts.js',
  },
  optimization: {
    minimizer: [
      new UglifyjsWebpackPlugin({
        sourceMap: true,
      }),
    ],
  },
};
