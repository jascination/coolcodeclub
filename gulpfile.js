
var gulp         = require('gulp');
var browserSync  = require('browser-sync').create();
var watch        = require('gulp-watch');
var less         = require('gulp-less');
var concat       = require('gulp-concat');
var uglify       = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var jade         = require('gulp-jade');
var history      = require('connect-history-api-fallback');
var lib          = require('bower-files')();
var del          = require('del');
// Bower Files Injecting

gulp.task('bowerJS', function() {
    gulp.src(lib.ext('js').files)
        .pipe(concat('lib.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./app/js'));
});

gulp.task('bowerCSS', function() {
    del(['./app/css/lib.min.css']).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
        gulp.src(lib.ext('css').files)
            .pipe(concat('lib.min.css'))
            .pipe(gulp.dest('./app/css'));
    });
});



// Static Server + watching scss/html files
gulp.task('serve', [/*'bowerJS', 'bowerCSS',*/ 'less', 'templates'], function() {

    browserSync.init({
        server: {
          baseDir: "./app",
          middleware: [ history() ],
          port: 9000
        }
    });

    gulp.watch("app/css/*.less", ['less']);
    gulp.watch("app/**/*.html").on('change', browserSync.reload);
    gulp.watch("app/js/**/*.js").on('change', browserSync.reload);
    gulp.watch("views/**/*.jade", ['templates']);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('less', function() {
    gulp.src('./app/css/*.less')
        .pipe(less())
        .pipe(gulp.dest('./app/css'))
        .pipe(browserSync.stream());
});

// Render Jade templates as HTML files

gulp.task('templates', function() {
  gulp.src('views/**/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('app/'))
});

gulp.task('default', ['serve']);
gulp.task('jade', ['templates']);
