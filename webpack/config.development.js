// You can add other webpack configuration (plugins, loaders, etc).
// Apart from ES6 Import/Export, Gulp was able to do all my other work so this file is mainly empty.

module.exports = {
  mode: 'development',
  devtool: 'inline-cheap-source-map',
  output: {
    filename: 'scripts.js',
  },
};
