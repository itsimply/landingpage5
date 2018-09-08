// Load all the modules from package.json
var gulp = require( 'gulp' ),
  plumber = require( 'gulp-plumber' ),
  autoprefixer = require('gulp-autoprefixer'),
  watch = require( 'gulp-watch' ),
  jshint = require( 'gulp-jshint' ),
  stylish = require( 'jshint-stylish' ),
  uglify = require( 'gulp-uglify' ),
  rename = require( 'gulp-rename' ),
  notify = require( 'gulp-notify' ),
  include = require( 'gulp-include' ),
  purify = require('gulp-purifycss'),
  sass = require( 'gulp-sass' ),
  concatCss = require('gulp-concat-css'),
  imagemin = require('gulp-imagemin'),
  pngcrush = require('imagemin-pngcrush');
  imageminJpegoptim = require('imagemin-jpegoptim'),
  imageminOptipng = require('imagemin-optipng'),
  imageminJpegRecompress = require('imagemin-jpeg-recompress'),
  browserSync = require('browser-sync').create(),
  critical = require('critical'),
  zip = require('gulp-zip'),
  gcmq = require('gulp-group-css-media-queries');

var config = {
     nodeDir: './node_modules' 
}


// automatically reloads the page when files changed
var browserSyncWatchFiles = [
    './*.min.css',
    './*.html',
    './js/**/*.min.js',
    './**/*.php'
];

// see: https://www.browsersync.io/docs/options/
var browserSyncOptions = {
    watchTask: true,
    proxy: "http://localhost/webdevchallange/5"
}
 
// Default error handler
var onError = function( err ) {
  console.log( 'An error occured:', err.message );
  this.emit('end');
}

// Zip files up
gulp.task('zip', function () {
 return gulp.src([
   '*',
   './css/**/*',
   './woocommerce/**/*',
   './fonts/*',
   './images/**/*',
   './plugin-activation/**/*',
   './inc/**/*',
   './js/**/*',
   './languages/*',
   './sass/**/*',
   './template-parts/*',
   './templates/*',
   '!bower_components',
   '!node_modules',
  ], {base: "."})
  .pipe(zip('domkonopi.zip'))
  .pipe(gulp.dest('.'));
});
 
// Jshint outputs any kind of javascript problems you might have
// Only checks javascript files inside /src directory
gulp.task( 'jshint', function() {
  return gulp.src( './js/src/*.js' )
    .pipe( jshint() )
    .pipe( jshint.reporter( stylish ) )
    .pipe( jshint.reporter( 'fail' ) );
})
 
 
// Concatenates all files that it finds in the manifest
// and creates two versions: normal and minified.
// It's dependent on the jshint task to succeed.
gulp.task( 'scripts', ['jshint'], function() {
  return gulp.src( './js/manifest.js' )
    .pipe( include() )
    .pipe( rename( { basename: 'scripts' } ) )
    .pipe( gulp.dest( './js/dist' ) )
    // Normal done, time to create the minified javascript (scripts.min.js)
    // remove the following 3 lines if you don't want it
    .pipe( uglify() )
    .pipe( rename( { suffix: '.min' } ) )
    .pipe( gulp.dest( './js/dist' ) )
    .pipe(browserSync.reload({stream: true}))
    .pipe( notify({ message: 'scripts task complete' }));
} );
 
// Different options for the Sass tasks
var options = {};
options.sass = {
  errLogToConsole: true,
  precision: 8,
  noCache: true,
  //imagePath: 'assets/img',
  includePaths: [
    config.nodeDir + '/bootstrap/scss',
  ]
};

options.sassmin = {
  errLogToConsole: true,
  precision: 8,
  noCache: true,
  outputStyle: 'compressed',
  //imagePath: 'assets/img',
  includePaths: [
    config.nodeDir + '/bootstrap/scss',
  ]
};

// Sass
gulp.task('sass', function() {
    return gulp.src('./sass/style.scss')
        .pipe(plumber())
        .pipe(sass(options.sass).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest('.'))
        .pipe(browserSync.reload({stream: true}))
        .pipe(notify({ title: 'Sass', message: 'sass task complete'  }));
});

// Sass-min - Release build minifies CSS after compiling Sass
gulp.task('sass-min', function() {
    return gulp.src('./sass/style.scss')
        .pipe(plumber())
        .pipe(sass(options.sassmin).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(rename( { suffix: '.min' } ) )
        .pipe(gulp.dest('.'))
        .pipe(browserSync.reload({stream: true}))
        .pipe(notify({ title: 'Sass', message: 'sass-min task complete' }));
});


// Remove unused CSS

gulp.task('cleancss', function() {
  return gulp.src('./style.css')
    .pipe(purify(['./*.php', './templates/*.php', './template-parts/*.php', './inc/*.php', './inc/modules/*.php', './js/dist/scripts.js'], 
    {minify: true,
    whitelist: ['tagcloud', 'icon svg']}))
    .pipe(gulp.dest('./css/thinstyle.css'));
});

gulp.task('concatCss', function () {
    return gulp.src([
        './bower_components/font-awesome/css/font-awesome.min.css',
        //'./bower_components/themify-icons/css/themify-icons.css',
        './bower_components/animate.css/animate.css',
        './bower_components/et-line-font/style.css',
        //'./bower_components/pushy/css/pushy.css',
        './bower_components/magnific-popup/dist/magnific-popup.css',
        './bower_components/owl.carousel/dist/assets/owl.carousel.min.css',
        './bower_components/owl.carousel/dist/assets/owl.theme.default.min.css'
        //'./et-line-font/style.css',
        //'./bootstrap/dist/css/bootstrap.min.css'
    ])
            .pipe(concatCss("plugins/plugins.css"))
            .pipe(gulp.dest('./css/'));
});



// Group media queries. 

gulp.task('mediaq', function () {
   return gulp.src('./style.css')
        .pipe(gcmq())
        .pipe(gulp.dest('./gulptask'));
});

// Optimize Images
// gulp.task('images', function() {
//     return gulp.src('./images/**/*')
//         .pipe(imageoptim.optimize({jpegmini: true}))
//         .pipe(gulp.dest('./imagesoptim'))
//         .pipe( notify({ message: 'Images task complete' }));
// });

gulp.task('images', function () {
    return gulp.src('./images/**/*')
        .pipe(imagemin([
      // imagemin.gifsicle(),
      // imageminJpegoptim({
      //   progressive: true,
      //   max: 65
      // }),
        imageminJpegRecompress({
        progressive: true,
        loops:4,
        min: 50,
        max: 65,
        quality:'medium' 
      }),
      imageminOptipng({
        optimizationLevel: 8
      }),
      imagemin.svgo()
    ]))
        .pipe(gulp.dest('./imagesoptim2'))
});

// -----------------------------------------------------------------------------
// Performance test: PageSpeed Insights
//
// Initializes a public tunnel so the PageSpeed service can access your local
// site, then it tests the site. This task outputs the standard PageSpeed results.
//
// The task will output a standard exit code based on the result of the PSI test
// results. 0 is success and any other number is a failure. To learn more about
// bash-compatible exit status codes read this page:
//
// http://tldp.org/LDP/abs/html/exit-status.html
// -----------------------------------------------------------------------------
gulp.task('gps', function() {
  // Set up a public tunnel so PageSpeed can see the local site.
  return ngrok.connect(80, function (err_ngrok, url) {
    log(c.cyan('ngrok'), '- serving your site from', c.yellow(url));

    // Run PageSpeed once the tunnel is up.
    gps.output(url, {
      strategy: 'mobile',
      threshold: 80
    }, function (err_gps, data) {
      // Log any potential errors and return a FAILURE.
      if (err_gps) {
        log(err_gps);
        process.exit(1);
      }

      // Kill the ngrok tunnel and return SUCCESS.
      process.exit(0);
    });
  });
});

// Generate & Inline Critical-path CSS
gulp.task('critical', function (cb) {
    critical.generate({
        base: './',
        src: 'http://localhost/wpbootstrap-htmlpart-mytheme/',
        dest: 'css/home.min.css',
        ignore: ['@font-face'],
        dimensions: [{
          width: 320,
          height: 480
        },{
          width: 768,
          height: 1024
        },{
          width: 1280,
          height: 960
        }],
        minify: true
    });
});


// Starts browser-sync task for starting the server.
gulp.task('browser-sync', function() {
    browserSync.init(browserSyncWatchFiles, browserSyncOptions);
});
 
 
// Start the livereload server and watch files for change
gulp.task( 'watch', function() {
 
  // don't listen to whole js folder, it'll create an infinite loop
  gulp.watch( [ './js/**/*.js', '!./js/dist/*.js' ], [ 'scripts' ] )
 
  gulp.watch( './sass/**/*.scss', ['sass', 'sass-min'] );

  gulp.watch( './images/**/*', ['images']);
 
  //gulp.watch( './**/*.php' ).on('change', browserSync.reload);
   
} );
 
 
gulp.task( 'default', ['watch', 'browser-sync'], function() {
 // Does nothing in this task, just triggers the dependent 'watch'
} );