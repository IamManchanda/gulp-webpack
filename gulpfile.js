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
const srcPathForImages = './public/src/img/**/*.{png,jpeg,jpg,svg,gif}';
const distPathForImages = './public/dist/img';
const distPathForCode = (file) => `./public/dist/${file}`;
const srcPathForCode = (file) => {
  if (file === 'scss') return `./public/src/${file}/styles.${file}`;
  return `./public/src/${file}/**/*.${file}`;
};

// Images
gulp.task('images', (cb) => {
  pump([
    gulp.src(srcPathForImages),
    gulpImagemin([
      gulpImagemin.gifsicle(),
      gulpImagemin.jpegtran(),
      gulpImagemin.optipng(),
      gulpImagemin.svgo(),
      imageminPngquant(),
      imageminJpegRecompress(),
    ]),
    gulp.dest(distPathForImages),
  ], cb);
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

// Clean
gulp.task('clean', () => {
  return del.sync([
    distPathForCode('css'),
    distPathForCode('js'),
    distPathForImages,
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
  gulp.watch(srcPathForCode('scss'), ['styles']);
  gulp.watch(srcPathForCode('js'), ['scripts']);
});

// Export 
gulp.task('export', ['delete-zip'], () => {
  pump([
    gulp.src(exportPathForZipping),
    gulpZip('./website.zip'),
    gulp.dest('./'),
  ]);
});
