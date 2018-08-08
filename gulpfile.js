const gulp = require('gulp');
const pump = require('pump');
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

const supportedBrowsers = require('./supported-browsers');

const distPathForCode = (file) => `./public/dist/${file}`;
const srcPathForCode = (file) => {
  if (file === 'scss') return `./public/src/${file}/styles.${file}`;
  return `./public/src/${file}/**/*.${file}`;
};
const srcPathForImages = './public/src/img/**/*.{png,jpeg,jpg,svg,gif}';
const distPathForImages = './public/dist/img';

const autoprefixConfig = { browsers: supportedBrowsers, cascade: false };
const babelConfig = { targets: { browsers: supportedBrowsers } };

// Images
gulp.task('images', () => {
  return gulp.src(srcPathForImages)
    .pipe( gulpImagemin([
      gulpImagemin.gifsicle(),
      gulpImagemin.jpegtran(),
      gulpImagemin.optipng(),
      gulpImagemin.svgo(),
      imageminPngquant(),
      imageminJpegRecompress(),
    ]) )
    .pipe( gulp.dest(distPathForImages) );
});

// Styles (SCSS)
gulp.task('styles', (cb) => {
  pump([
    gulp.src(srcPathForCode('scss')),
    gulpPlumber(function (err) {
      console.error('Styles Task Error', err);
      this.emit('end');
    }),
    gulpSourcemaps.init(),
    gulpAutoprefixer(autoprefixConfig),
    gulpSass({ outputStyle: 'compressed' }),
    gulpSourcemaps.write(),
    gulp.dest(distPathForCode('css')),
    gulpLiveReload(),
  ], cb);
});

// Scripts (JS)
gulp.task('scripts', (cb) => {
  pump([
    gulp.src(srcPathForCode('js')),
    gulpPlumber(function (err) {
      console.error('Scripts Task Error', err);
      this.emit('end');
    }),
    gulpSourcemaps.init(),
    gulpBabel({ presets: [['env', babelConfig]] }),
    gulpConcat('scripts.js'),
    gulpUglify(),
    gulpSourcemaps.write(),
    gulp.dest(distPathForCode('js')),
    gulpLiveReload(),
  ], cb);
});

// Default
gulp.task('default', ['images', 'styles', 'scripts'], () => {
  console.log('Starting Default task');
});

// Watch
gulp.task('watch', ['default'], () => {
  gulpLiveReload.listen();
  gulp.watch(srcPathForCode('scss'), ['styles']);
  gulp.watch(srcPathForCode('js'), ['scripts']);
});
