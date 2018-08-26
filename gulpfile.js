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
const gulpUglify = require('gulp-uglify');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpPostcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const postcssUncss = require('postcss-uncss');
const gulpSass = require('gulp-sass');
const gulpBabel = require('gulp-babel');
const gulpImagemin = require('gulp-imagemin');
const gulpHtmlmin = require('gulp-htmlmin');
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
const exportPath = './website/dist/**/*';
const srcPath = (file, watch = false) => {
  if (file === 'scss' && watch === false) return './website/src/scss/styles.scss';
  if (file === 'scss' && watch === true) return './website/src/scss/**/*.scss';
  if (file === 'js' && watch === false) return './website/src/js/scripts.js';
  if (file === 'js' && watch === true) return './website/src/js/**/*.js';
  if (file === 'html') return './website/src/**/*.html';
  if (file === 'img') return './website/src/img/**/*.{png,jpeg,jpg,svg,gif}';
  console.error('Unsupported file type entered into Gulp Task Runner for Source Path');
};
const distPath = (file, serve = false) => {
  if (['css', 'js', 'img'].includes(file)) return `./website/dist/${file}`;
  if (file === 'html' && serve === false) return './website/dist/**/*.html';
  if (file === 'html' && serve === true) return './website/dist';
  console.error('Unsupported file type entered into Gulp Task Runner for Dist Path');
};

// Cleaning Tasks
const cleanImages = () => del([distPath('img')]); // Clean Images
const cleanStyles = () => del([distPath('css')]); // Clean Styles
const cleanScripts = () => del([distPath('js')]); // Clean Scripts
const cleanMarkup = () => del([distPath('html')]); // Clean Markup

// Images Task
const images = (mode) => (done) => {
  ['development', 'production'].includes(mode) ? pump([
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
  ], done) : undefined;
};

// Styles Task
const styles = (mode) => (done) => {
  let outputStyle;
  if (mode === 'development') outputStyle = 'nested';
  else if (mode === 'production') outputStyle = 'compressed';
  const postcssPlugins = [
    autoprefixer(autoprefixConfig),
    postcssUncss({ html: [distPath('html')] }),
  ];
  ['development', 'production'].includes(mode) ? pump([
    gulp.src(srcPath('scss')),
    gulpSourcemaps.init({ loadMaps: true }),
    gulpSass({ outputStyle }),
    gulpPostcss(postcssPlugins),
    gulpSourcemaps.write('./'),
    gulp.dest(distPath('css')),
    browserSync.stream(),
  ], done) : undefined;
};

// Scripts Task
const scripts = (mode) => (done) => {
  let streamMode;
  if (mode === 'development') streamMode = require('./webpack/config.development.js');
  else if (mode === 'production') streamMode = require('./webpack/config.production.js');
  ['development', 'production'].includes(mode) ? pump([
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
    ...((mode === 'production') ? [gulpUglify()] : []),
    gulpSourcemaps.write('./'),
    gulp.dest(distPath('js')),
    browserSync.stream(),
  ], done) : undefined;
};

const markup = (mode) => (done) => {
  ['development', 'production'].includes(mode) ? pump([
    gulp.src(srcPath('html')),
    ...((mode === 'production') ? [gulpHtmlmin({ collapseWhitespace: true })] : []),
    gulp.dest(distPath('html', true)),
  ], done) : undefined;
};

// Combine all these above coding tasks into one array!
const allCodeTasks = (mode) => [
  cleanImages, 
  images(mode),
  cleanStyles, 
  styles(mode), 
  cleanScripts, 
  scripts(mode), 
  cleanMarkup, 
  markup(mode),
];

const genericTask = (mode) => {
  let port;
  if (mode === 'development') port = '3000';
  else if (mode === 'production') port = '8000';
  return [
    ...allCodeTasks(mode),
    (done) => {
      browserSync.init({
        port,
        server: distPath('html', true),
      });
      gulp.watch(srcPath('img', true)).on('all', gulp.series(cleanImages, images), browserSync.reload);
      gulp.watch(srcPath('scss', true)).on('all', gulp.series(cleanStyles, styles(mode)), browserSync.reload);
      gulp.watch(srcPath('js', true)).on('all', gulp.series(cleanScripts, scripts(mode)), browserSync.reload);
      gulp.watch(srcPath('html')).on('all', browserSync.reload);
      done();
    },
  ];
};

/**
 * Main Gulp Tasks that are inserted within `package.json`
*/

// Default (`npm start` or `yarn start`)
gulp.task('default', gulp.series(...genericTask('production')));

// Dev (`npm run dev` or `yarn run dev`)
gulp.task('dev', gulp.series(...genericTask('development')));

/**
 * Exporting the code into a Zip File!
*/

// Clean the zip file
const cleanExport = () => del(['./website.zip']); // Clean Exported zip

// Export (`npm run export` or `yarn run export`)
gulp.task('export', gulp.series(
  cleanExport, 
  ...allCodeTasks('production'), 
  (done) => {
    pump([
      gulp.src(exportPath),
      gulpZip('./website.zip'),
      gulp.dest('./'),
    ], done);
  },
));
