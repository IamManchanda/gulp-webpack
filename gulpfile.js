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
const supportedBrowsers = require('./supported-browsers');

const distPath = (file) => `./public/dist/${file}`;
const srcPath = (file) => {
  if (file === 'scss') return `./public/src/${file}/styles.${file}`;
  return `./public/src/${file}/**/*.${file}`;
};

const autoprefixConfig = { browsers: supportedBrowsers, cascade: false };
const babelConfig = { targets: { browsers: supportedBrowsers } };

// Images
gulp.task('images', () => {
  console.log('Starting Images task');
});

// Styles (SCSS)
gulp.task('styles', (cb) => {
  pump([
    gulp.src(srcPath('scss')),
    gulpPlumber(function (err) {
      console.error('Styles Task Error', err);
      this.emit('end');
    }),
    gulpSourcemaps.init(),
    gulpAutoprefixer(autoprefixConfig),
    gulpSass({ outputStyle: 'compressed' }),
    gulpSourcemaps.write(),
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
    gulpSourcemaps.init(),
    gulpBabel({ presets: [['env', babelConfig]] }),
    gulpConcat('scripts.js'),
    gulpUglify(),
    gulpSourcemaps.write(),
    gulp.dest(distPath('js')),
    gulpLiveReload(),
  ], cb);
});

// Default
gulp.task('default', () => {
  console.log('Starting Default task');
});

// Watch
gulp.task('watch', () => {
  gulpLiveReload.listen();
  gulp.watch(srcPath('scss'), ['styles']);
  gulp.watch(srcPath('js'), ['scripts']);
});
