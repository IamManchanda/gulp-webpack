const gulp = require('gulp');
const gulpUglifyEs = require('gulp-uglify-es').default;
const gulpLiveReload = require('gulp-livereload');
const gulpConcat = require('gulp-concat');
const gulpMinifyCss = require('gulp-minify-css');
const gulpAutoprefixer = require('gulp-autoprefixer');
const gulpPlumber = require('gulp-plumber');
const gulpSourcemaps = require('gulp-sourcemaps');

const distPath = (file) => `./public/dist/${file}`;
const srcPath = (file) => `./public/src/${file}/**/*.${file}`;
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

// Styles
gulp.task('styles', () => {
  return gulp
    .src(['./public/src/css/reset.css', srcPath('css')])
    .pipe( gulpPlumber(function (err) {
      console.error('Styles Task Error', err);
      this.emit('end');
    }) )
    .pipe( gulpSourcemaps.init() )
    .pipe( gulpAutoprefixer(autoprefixConfig) )
    .pipe( gulpConcat('styles.css') )
    .pipe( gulpMinifyCss() )
    .pipe( gulpSourcemaps.write() )
    .pipe( gulp.dest(distPath('css')) )
    .pipe( gulpLiveReload() );
});

// Scripts
gulp.task('scripts', () => {
  return gulp
    .src(srcPath('js'))
    .pipe( gulpConcat('scripts.js') )
    .pipe( gulpUglifyEs() )
    .pipe( gulp.dest(distPath('js')) )
    .pipe( gulpLiveReload() );
});

// Default
gulp.task('default', () => {
  console.log('Starting Default task');
});

// Watch
gulp.task('watch', () => {
  gulpLiveReload.listen();
  gulp.watch(srcPath('css'), ['styles']);
  gulp.watch(srcPath('js'), ['scripts']);
});
