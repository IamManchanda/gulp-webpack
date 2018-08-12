// Node Packages
const gulp = require('gulp');
const pump = require('pump');
const del = require('del');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const gulpZip = require('gulp-zip');
const gulpUglify = require('gulp-uglify');
const gulpLiveReload = require('gulp-livereload');
const gulpAutoprefixer = require('gulp-autoprefixer');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpSass = require('gulp-sass');
const gulpBabel = require('gulp-babel');
const gulpImagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

// Supported Browsers
const supportedBrowsers = require('./tooling/browsers');

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
gulp.task('cleanImages', () => del([distPath('img')])); // Clean Images
gulp.task('cleanStyles', () => del([distPath('css')])); // Clean Styles
gulp.task('cleanScripts', () => del([distPath('js')])); // Clean Scripts
gulp.task('cleanExport', () => del(['./website.zip'])); // Clean Exported zip

// Images Task
gulp.task('images', (done) => {
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
  ], done);
});

// Styles Task for Development
gulp.task('devStyles', (done) => {
  pump([
    gulp.src(srcPath('scss')),
    gulpSourcemaps.init({ loadMaps: true }),
    gulpAutoprefixer(autoprefixConfig),
    gulpSass({ outputStyle: 'nested' }),
    gulpSourcemaps.write('./'),
    gulp.dest(distPath('css')),
    gulpLiveReload(),
  ], done);
});

// Styles Task for Production
gulp.task('prodStyles', (done) => {
  pump([
    gulp.src(srcPath('scss')),
    gulpSourcemaps.init({ loadMaps: true }),
    gulpAutoprefixer(autoprefixConfig),
    gulpSass({ outputStyle: 'compressed' }),
    gulpSourcemaps.write('./'),
    gulp.dest(distPath('css')),
  ], done);
});

// Scripts Task for Development
gulp.task('devScripts', (done) => {
  pump([
    gulp.src(srcPath('js')),
    webpackStream(require('./tooling/webpack.prod.js'), webpack),
    gulpSourcemaps.init({ loadMaps: true }),
    gulpBabel({ presets: [['env', babelConfig]] }),
    gulpSourcemaps.write('./'),
    gulp.dest(distPath('js')),
    gulpLiveReload(),
  ], done);
});

// Scripts Task for Production
gulp.task('prodScripts', (done) => {
  pump([
    gulp.src(srcPath('js')),
    webpackStream(require('./tooling/webpack.prod.js'), webpack),
    gulpSourcemaps.init({ loadMaps: true }),
    gulpBabel({ presets: [['env', babelConfig]] }),
    gulpUglify(),
    gulpSourcemaps.write('./'),
    gulp.dest(distPath('js')),
  ], done);
});

/**
 * Main Gulp Tasks that are inserted within `package.json`
 * Above tasks inserted in these main gulp tasks through `gulp.series`
*/

// Default (`npm start` or `yarn start`)
gulp.task('default', gulp.series('cleanImages', 'images', 'cleanStyles', 'devStyles', 'cleanScripts', 'devScripts', (done) => {
  require('./tooling/server');
  gulpLiveReload.listen();
  gulp.watch(srcPath('img', true), gulp.series('cleanImages', 'images'));
  gulp.watch(srcPath('scss', true), gulp.series('cleanStyles', 'devStyles'));
  gulp.watch(srcPath('js', true), gulp.series('cleanScripts', 'devScripts'));
  done();
}));

// Build (`npm run build` or `yarn run build`)
gulp.task('build', gulp.series('cleanImages', 'images', 'cleanStyles', 'prodStyles', 'cleanScripts', 'prodScripts', (done) => {
  done();
}));

// Export (`npm run export` or `yarn run export`)
gulp.task('export', gulp.series('cleanExport', 'default', (done) => {
  pump([
    gulp.src(exportPath),
    gulpZip('./website.zip'),
    gulp.dest('./'),
  ], done);
}));
