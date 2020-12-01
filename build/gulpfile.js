let { src, dest, watch, parallel, series } = require('gulp'),
	browserSync = require('browser-sync').create(),
	scss = require('gulp-sass'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify-es').default,
	autoprefixer = require('gulp-autoprefixer'),
	imagemin = require('gulp-imagemin'),
	del = require('del')

function sync() {
	browserSync.init({
		server: {
			baseDir: '../app/html',
		},
	})
}

function cleanDist() {
	return del('../dist')
}

function scripts() {
	return src([
		//'node_modules/jquery/dist/jquery.js',  example of adding a js file after installation via npm
		'../app/js/main.js',
	])
		.pipe(concat('main.min.js'))
		.pipe(uglify())
		.pipe(dest('../app/js'))
		.pipe(browserSync.stream())
}

function styles() {
	return src('../app/scss/style.scss')
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(concat('style.min.css'))
		.pipe(
			autoprefixer({
				overrideBrowserslist: ['last 10 versions'],
				cascade: false,
				grid: true,
			})
		)
		.pipe(dest('../app/css'))
		.pipe(browserSync.stream())
}

function images() {
	return src('../app/img/**/*')
		.pipe(
			imagemin([
				imagemin.gifsicle({ interlaced: true }),
				imagemin.mozjpeg({ quality: 75, progressive: true }),
				imagemin.optipng({ optimizationLevel: 5 }),
				imagemin.svgo({
					plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
				}),
			])
		)
		.pipe(dest('../dist/img'))
}

function watching() {
	watch(['../app/scss/**/*.scss'], styles)
	watch(['../app/js/**/*.js', '!../app/js/main.min.js'], scripts)
	watch(['../app/html/*.html']).on('change', browserSync.reload)
}

function build() {
	return src(
		[
			'../app/css/style.min.css',
			'../app/fonts/**/*',
			'../app/js/main.min.js',
			'../app/html/*.html',
		],
		{ base: '../app' }
	).pipe(dest('../dist'))
}

exports.styles = styles
exports.watching = watching
exports.sync = sync
exports.scripts = scripts
exports.images = images
exports.cleanDist = cleanDist

exports.build = series(cleanDist, images, build)
exports.default = parallel(scripts, styles, sync, watching)
