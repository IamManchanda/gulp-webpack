// Node Packages
const gulp = require('gulp');
const pump = require('pump');
const del = require('del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const browserSync = require('browser-sync').create();
const vinylNamed = require('vinyl-named');
const through2 = require('through2');
const gulpZip = require('gulp-zip');
const gulpAutoprefixer = require('gulp-autoprefixer');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpSass = require('gulp-sass');
const gulpBabel = require('gulp-babel');
const gulpImagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

// Supported Browsers
const supportedBrowsers = [
  'last 3 versions', // http://browserl.ist/?q=last+3+versions
  'ie >= 10', // http://browserl.ist/?q=ie+%3E%3D+10
  'edge >= 12', // http://browserl.ist/?q=edge+%3E%3D+12
  'firefox >= 28', // http://browserl.ist/?q=firefox+%3E%3D+28
  'chrome >= 21', // http://browserl.ist/?q=chrome+%3E%3D+21
  'safari >= 6.1', // http://browserl.ist/?q=safari+%3E%3D+6.1
  'opera >= 12.1', // http://browserl.ist/?q=opera+%3E%3D+12.1
  'ios >= 7', // http://browserl.ist/?q=ios+%3E%3D+7
  'android >= 4.4', // http://browserl.ist/?q=android+%3E%3D+4.4
  'blackberry >= 10', // http://browserl.ist/?q=blackberry+%3E%3D+10
  'operamobile >= 12.1', // http://browserl.ist/?q=operamobile+%3E%3D+12.1
  'samsung >= 4', // http://browserl.ist/?q=samsung+%3E%3D+4
];

// Config
const autoprefixConfig = { browsers: supportedBrowsers, cascade: false };
const babelConfig = { targets: { browsers: supportedBrowsers } };

// Paths for reuse
const exportPath = './public/**/*';
const srcPath = (file, watch = false) => {
  if (file === 'scss' && watch === false) return './public/src/scss/styles.scss';
  if (file === 'scss' && watch === true) return './public/src/scss/**/*.scss';
  if (file === 'js' && watch === false) return './public/src/js/scripts.js';
  if (file === 'js' && watch === true) return './public/src/js/**/*.js';
  if (file === 'img') return './public/src/img/**/*.{png,jpeg,jpg,svg,gif}';
  console.error('Unsupported file type entered into Gulp Task Runner for Source Path');
};
const distPath = (file) => {
  if (['css', 'js', 'img'].includes(file)) return `./public/dist/${file}`;
  console.error('Unsupported file type entered into Gulp Task Runner for Dist Path');
};

// Cleaning Tasks
const cleanImages = () => del([distPath('img')]); // Clean Images
const cleanStyles = () => del([distPath('css')]); // Clean Styles
const cleanScripts = () => del([distPath('js')]); // Clean Scripts
const cleanExport = () => del(['./website.zip']); // Clean Exported zip

// Images Task
const images = (done) => {
  pump([
    gulp.src(srcPath('img')),
    gulpImagemin([
      gulpImagemin.gifsicle(),
      gulpImagemin.jpegtran(),
      gulpImagemin.optipng(),
      gulpImagemin.svgo(),
      imageminPngquant(),
      imageminJpegRecompress(),
    ]),
    gulp.dest(distPath('img')),
    browserSync.stream(),
  ], done);
};

// Styles Task
const styles = (done, mode) => {
  let outputStyle;
  if (mode === 'development') outputStyle = 'nested';
  else if (mode === 'production') outputStyle = 'compressed';
  pump([
    gulp.src(srcPath('scss')),
    gulpSourcemaps.init({ loadMaps: true }),
    gulpAutoprefixer(autoprefixConfig),
    gulpSass({ outputStyle }),
    gulpSourcemaps.write('./'),
    gulp.dest(distPath('css')),
    browserSync.stream(),
  ], done);
};
const devStyles = (done) => styles(done, 'development');
const prodStyles = (done) => styles(done, 'production');

// Scripts Task
const scripts = (done, mode) => {
  let streamMode;
  if (mode === 'development') streamMode = require('./webpack/config.development.js');
  else if (mode === 'production') streamMode = require('./webpack/config.production.js');
  pump([
    gulp.src(srcPath('js')),
    vinylNamed(),
    webpackStream(streamMode, webpack),
    gulpSourcemaps.init({ loadMaps: true }),
    through2.obj(function (file, enc, cb) {
      const isSourceMap = /\.map$/.test(file.path);
      if (!isSourceMap) this.push(file);
      cb();
    }),
    gulpBabel({ presets: [['env', babelConfig]] }),
    gulpSourcemaps.write('./'),
    gulp.dest(distPath('js')),
    browserSync.stream(),
  ], done);
};
const devScripts = (done) => scripts(done, 'development');
const prodScripts = (done) => scripts(done, 'production');

/**
 * Main Gulp Tasks that are inserted within `package.json`
 * Above tasks inserted in these main gulp tasks through `gulp.series`
*/

// Default (`npm start` or `yarn start`)
gulp.task('default', gulp.series(cleanImages, images, cleanStyles, devStyles, cleanScripts, devScripts, (done) => {
  browserSync.init({
    server: './public',
  });
  gulp.watch(srcPath('img', true)).on('all', gulp.series(cleanImages, images), browserSync.reload);
  gulp.watch(srcPath('scss', true)).on('all', gulp.series(cleanStyles, devStyles), browserSync.reload);
  gulp.watch(srcPath('js', true)).on('all', gulp.series(cleanScripts, devScripts), browserSync.reload);
  gulp.watch('./public/**/*.html').on('all', browserSync.reload);
  done();
}));

// Build (`npm run build` or `yarn run build`)
gulp.task('build', gulp.series(cleanImages, images, cleanStyles, prodStyles, cleanScripts, prodScripts, (done) => {
  done();
}));

// Export (`npm run export` or `yarn run export`)
gulp.task('export', gulp.series(cleanExport, 'build', (done) => {
  pump([
    gulp.src(exportPath),
    gulpZip('./website.zip'),
    gulp.dest('./'),
  ], done);
}));
