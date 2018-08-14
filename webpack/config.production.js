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
        minify(file, sourceMap) {
          // https://github.com/mishoo/UglifyJS2#minify-options
          const uglifyJsOptions = {
            parse: {
              // parse options
            },
            compress: {
              // compress options
            },
            mangle: {
              // mangle options
              properties: {
                // mangle property options
              },
            },
            output: {
              // output options
            },
            sourceMap: {
              // source map options
            },
            nameCache: null, // or specify a name cache object
            toplevel: false,
            ie8: false,
            warnings: false,
          };
          if (sourceMap) uglifyJsOptions.sourceMap = { content: sourceMap };
          return require('uglify-js').minify(file, uglifyJsOptions);
        },
      }),
    ],
  },
};
