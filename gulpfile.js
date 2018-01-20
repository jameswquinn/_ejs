const gulp = require('gulp')
const gulpEjsMonster = require('gulp-ejs-monster')
const htmlmin = require('gulp-html-minifier')
const prettify = require('gulp-html-prettify')
const gutil = require("gulp-util")
const gulpSeo = require('gulp-seo')
const favicons = require('gulp-favicons')
const convert = require('gulp-rsvg');
const uncss = require('gulp-uncss');
const runSequence = require('run-sequence')
const critical = require('critical')
const faviconOptions = {
    appName: null, // Your application's name. `string`
    appDescription: null, // Your application's description. `string`
    developerName: null, // Your (or your developer's) name. `string`
    developerURL: null, // Your (or your developer's) URL. `string`
    background: "#fff", // Background colour for flattened icons. `string`
    theme_color: "#fff", // Theme color for browser chrome. `string`
    path: "/", // Path for overriding default icons path. `string`
    display: "standalone", // Android display: "browser" or "standalone". `string`
    orientation: "portrait", // Android orientation: "portrait" or "landscape". `string`
    start_url: "/?homescreen=1", // Android start application's URL. `string`
    version: "1.0", // Your application's version number. `number`
    logging: false, // Print logs to console? `boolean`
    online: false, // Use RealFaviconGenerator to create favicons? `boolean`
    html: "partials/favicons.ejs",
    preferOnline: false, // Use offline generation, if online generation has failed. `boolean`
    pipeHTML: false,
    replace: false,
    icons: {
        // Platform Options:
        // - offset - offset in percentage
        // - shadow - drop shadow for Android icons, available online only
        // - background:
        //   * false - use default
        //   * true - force use default, e.g. set background for Android icons
        //   * color - set background for the specified icons
        //
        android: true, // Create Android homescreen icon. `boolean` or `{ offset, background, shadow }`
        appleIcon: true, // Create Apple touch icons. `boolean` or `{ offset, background }`
        appleStartup: false, // Create Apple startup images. `boolean` or `{ offset, background }`
        coast: false, // Create Opera Coast icon with offset 25%. `boolean` or `{ offset, background }`
        favicons: true, // Create regular favicons. `boolean`
        firefox: false, // Create Firefox OS icons. `boolean` or `{ offset, background }`
        windows: true, // Create Windows 8 tile icons. `boolean` or `{ background }`
        yandex: false // Create Yandex browser icon. `boolean` or `{ background }`
    }
}


gulp.task('svg2png', function() {
    return gulp.src('public/logo/Donald Trump.svg')
        .pipe(convert({
            width: 500,
            height: 500
        }))
        .pipe(gulp.dest('public/logo'));
});


gulp.task("favicon", function() {
    return gulp.src("public/logo/*.png").pipe(favicons(faviconOptions))
        .on("error", gutil.log)
        .pipe(gulp.dest('dist'));
});


gulp.task('ejs', function() {
    return gulp.src('src/pages/*.ejs')
        .pipe(gulpEjsMonster())
        .pipe(htmlmin({
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            removeTagWhitespace: true,
            removeComments: true
        }))
        //.pipe(prettify({indent_char: ' ', indent_size: 2}))
        .pipe(gulp.dest('dist'));
});


gulp.task('uncss', function() {
    return gulp.src('public/css/milligram.css')
        .pipe(uncss({
            html: ['dist/index.html']
        }))
        .pipe(gulp.dest('dist/css'));
});


// -----------------------------------------------------------------------------
// Generate critical-path CSS
//
// This task generates a small, minimal amount of your CSS based on which rules
// are visible (aka "above the fold") during a page load. We will use a Jekyll
// template command to inline the CSS when the site is generated.
//
// All styles should be directly applying to an element visible when your
// website renders. If the user has to scroll even a small amount, it's not
// critical CSS.
// -----------------------------------------------------------------------------
gulp.task('critical', function(cb) {
    critical.generate({
        inline: true,
        base: 'dist/',
        src: 'index.html',
        dest: 'index.html',
        dimensions: [{
            width: 320,
            height: 480
        }, {
            width: 768,
            height: 1024
        }, {
            width: 1280,
            height: 960
        }],
    });
});


gulp.task('default', () => {
    runSequence(
        'svg2png',
        'favicon', // ...then do this
        'ejs', // ...then just do this
        'uncss',
        'critical',
    );
});
