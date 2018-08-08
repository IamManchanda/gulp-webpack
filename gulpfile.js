const gulp = require('gulp');
const gulpUglifyEs = require('gulp-uglify-es').default;
const gulpLiveReload = require('gulp-livereload');
const gulpConcat = require('gulp-concat');
const gulpMinifyCss = require('gulp-minify-css');

const distPath = (file) => `./public/dist/${file}`;
const srcPath = (file) => `./public/src/${file}/**/*.${file}`;

// Images
gulp.task('images', () => {
  console.log('Starting Images task');
});

// Styles
gulp.task('styles', () => {
  return gulp
    .src(['./public/src/css/reset.css', srcPath('css')])
    .pipe( gulpConcat('styles.css') )
    .pipe( gulpMinifyCss() )
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
