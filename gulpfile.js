const gulp = require('gulp');
const pump = require('pump');
const del = require('del');
const gulpZip = require('gulp-zip');
const gulpUglify = require('gulp-uglify');
const gulpLiveReload = require('gulp-livereload');
const gulpConcat = require('gulp-concat');
const gulpAutoprefixer = require('gulp-autoprefixer');
const gulpPlumber = require('gulp-plumber');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpSass = require('gulp-sass');
const gulpBabel = require('gulp-babel');
const gulpImagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const supportedBrowsers = require('./browsers');

const autoprefixConfig = { browsers: supportedBrowsers, cascade: false };
const babelConfig = { targets: { browsers: supportedBrowsers } };

const exportPathForZipping = './public/**/*';
const srcPath = (file) => {
  if (file === 'scss') return './public/src/scss/styles.scss';
  if (file === 'js') return './public/src/js/**/*.js';
  if (file === 'img') return './public/src/img/**/*.{png,jpeg,jpg,svg,gif}';
  console.error('Unsupported file type entered into Gulp Task Runner for Source Path');
};
const distPath = (file) => {
  if (['css', 'js', 'img'].includes(file)) return `./public/dist/${file}`;
  console.error('Unsupported file type entered into Gulp Task Runner for Dist Path');
};

// Images
gulp.task('images', (cb) => {
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
  ], cb);
});

// Styles (SCSS)
gulp.task('styles', (cb) => {
  pump([
    gulp.src(srcPath('scss')),
    gulpPlumber(function (err) {
      console.error('Styles Task Error', err);
      this.emit('end');
    }),
    gulpSourcemaps.init({ loadMaps: true }),
    gulpAutoprefixer(autoprefixConfig),
    gulpSass({ outputStyle: 'compressed' }),
    gulpSourcemaps.write('./'),
    gulp.dest(distPath('css')),
    gulpLiveReload(),
  ], cb);
});

// Scripts (JS)
gulp.task('scripts', (cb) => {
  pump([
    gulp.src(srcPath('js')),
    gulpPlumber(function (err) {
      console.error('Scripts Task Error', err);
      this.emit('end');
    }),
    gulpSourcemaps.init({ loadMaps: true }),
    gulpBabel({ presets: [['env', babelConfig]] }),
    gulpConcat('scripts.js'),
    gulpUglify(),
    gulpSourcemaps.write('./'),
    gulp.dest(distPath('js')),
    gulpLiveReload(),
  ], cb);
});

// Clean
gulp.task('clean', () => {
  return del.sync([
    distPath('css'),
    distPath('js'),
    distPath('img'),
  ]);
});

// Delete the zip
gulp.task('delete-zip', () => {
  return del.sync([
    './website.zip',
  ]);
});

// Default
gulp.task('default', ['clean', 'images', 'styles', 'scripts'], () => {
  console.log('Starting All tasks');
});

// Watch
gulp.task('watch', ['default'], () => {
  require('./server');
  gulpLiveReload.listen();
  gulp.watch(srcPath('scss'), ['styles']);
  gulp.watch(srcPath('js'), ['scripts']);
});

// Export 
gulp.task('export', ['delete-zip'], () => {
  pump([
    gulp.src(exportPathForZipping),
    gulpZip('./website.zip'),
    gulp.dest('./'),
  ]);
});
