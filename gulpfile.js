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

const distPath = (file) => `./public/dist/${file}`;
const srcPath = (file) => {
  if (file === 'scss') return `./public/src/${file}/styles.${file}`;
  return `./public/src/${file}/**/*.${file}`;
};
const autoprefixConfig = {
  // https://caniuse.com/#search=flex
  browsers: [
    'last 2 versions',
    'ie >= 10',
    'edge >= 12',
    'firefox >= 28',
    'chrome >= 21',
    'safari >= 6.1',
    'opera >= 12.1',
    'ios >= 7',
    'android >= 4.4',
    'blackberry >= 10',
    'operamobile >= 12.1',
    'samsung >= 4',
  ],
  cascade: false,
};

// Images
gulp.task('images', () => {
  console.log('Starting Images task');
});

// Styles (SCSS)
gulp.task('styles', () => {
  return gulp
    .src(srcPath('scss'))
    .pipe( gulpPlumber(function (err) {
      console.error('Styles Task Error', err);
      this.emit('end');
    }) )
    .pipe( gulpSourcemaps.init() )
    .pipe( gulpAutoprefixer(autoprefixConfig) )
    .pipe( gulpSass({ outputStyle: 'compressed' }) )
    .pipe( gulpSourcemaps.write() )
    .pipe( gulp.dest(distPath('css')) )
    .pipe( gulpLiveReload() );
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
    gulpBabel({ presets: ['env'] }),
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
