import gulp from 'gulp';
import fileInclude from 'gulp-file-include';
import browserSync from 'browser-sync';
import { deleteSync } from 'del';  // синхронная очистка

import sass from 'gulp-sass';
import dartSass from 'sass';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';

import imagemin from 'gulp-imagemin';
const bs = browserSync.create();
const scss = sass(dartSass);

// Пути к файлам
const path = {
    build: { 
        html: './dist',
        css: './dist/css',
        images: './dist/images/',
     },
    src: { 
        html: './src/html/*.html',
        css: '.src/scss/*. scss',
        images: './src/images/**/*.{jpg,jpeg,png,gif,svg}',
     },
    watch: { 
        html: './src/**/*.html',
        css: './src/scss/**/*.scss',
        images: './src/images/**/*.{jpg,jpeg,png,gif,svg}',
     },
};

// 1️⃣ Очистка dist
function clean() {
      deleteSync(['dist']); // del(...) работает без default
      return Promise.resolve(); // сообщает Gulp, что задача завершена 
}

// 2️⃣ Сборка HTML с fileInclude
function html() {
    return gulp
        .src(path.src.html)
        .pipe(fileInclude({
            prefix: '@@',    // синтаксис вставки @@include('parts/header.html')
            basepath: '@file'
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(bs.stream());  // обновление браузера
}

// 3️⃣ Запуск сервера и watch
function serve() {
    bs.init({
        server: { baseDir: path.build.html },
        port: 3000,
        browser: 'chrome.exe'  // открывает Chrome
    });

    watchFiles(); // следим за css,html,js
}


//Делаем Css
//Sass to css
function styles() {
    return gulp.src('./src/scss/*.scss')
        .pipe(scss().on('error', scss.logError)) // компиляция SCSS
        .pipe(autoprefixer({ cascade: false }))  // префиксы
        .pipe(cleanCSS())                        // минификация
        .pipe(gulp.dest('./dist/css'))           // результат
        .pipe(bs.stream());                      // BrowserSync обновление
}


//Функция images
function images() {
    return gulp
        .src(path.src.images, { encoding: false }) // копируем все файлы
        .pipe(gulp.dest(path.build.images));
}

// Функция Watch
function watchFiles() {
    gulp.watch('./src/**/*.html', html);
    gulp.watch('./src/scss/**/*.scss', styles);
    gulp.watch('./src/images/**/*.{jpg,jpeg,png,svg,gif}', images);

}



// 4️⃣ Экспорт задач
export { html };
export {clean};
export {styles};
export{images};
export {watchFiles};
export default gulp.series(clean, gulp.parallel(html, styles,images), gulp.series(serve, watchFiles));
