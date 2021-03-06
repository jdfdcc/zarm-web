const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const size = require('gulp-filesize');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const modifyCssUrls = require('gulp-modify-css-urls');
const browserlist = require('../config/browserlist');

const DIR = {
  sass: path.resolve(__dirname, '../../components/**/*.scss'),
  font: path.resolve(__dirname, '../../components/**/fonts/*.*'),
  buildSrc: path.resolve(__dirname, '../../components/**/index.scss'),
  lib: path.resolve(__dirname, '../../lib'),
  dist: path.resolve(__dirname, '../../dist'),
};

gulp.task('copySass', () => {
  return gulp.src(DIR.sass)
    .pipe(gulp.dest(DIR.lib));
});

gulp.task('copyFont', () => {
  return gulp.src(DIR.font)
    .pipe(gulp.dest(DIR.lib));
});

gulp.task('buildEntryScss', () => {
  if (fs.existsSync(DIR.dist)) {
    const componentsPath = path.join(process.cwd(), '../../components');
    let componentsLessContent = '';

    fs.readdir(componentsPath, (err, files) => {
      files.forEach(file => {
        if (fs.existsSync(path.join(componentsPath, file, 'style', 'index.scss'))) {
          componentsLessContent += `@import "../${path.join(file, 'style', 'index.scss')}";\n`;
        }
      });
      fs.writeFileSync(
        path.join(process.cwd(), '../../', 'lib', 'style', 'components.scss'),
        componentsLessContent,
      );

      fs.writeFileSync(
        path.join(DIR.dist, 'dragon-ui.scss'),
        '@import "../lib/style/index.scss";\n@import "../lib/style/components.scss";\n',
      );
    });
  }
})

gulp.task('dist', () => {
  return gulp.src(DIR.buildSrc)
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
    }))
    .pipe(autoprefixer({ browsers: browserlist }))
    .pipe(modifyCssUrls({
      modify(url) {
        return url.replace('../..', '../lib');
      },
    }))
    .pipe(concat('dragon-ui.css'))
    .pipe(size())
    .pipe(gulp.dest(DIR.dist))
    .pipe(sourcemaps.write())
    .pipe(rename('dragon-ui.css.map'))
    .pipe(size())
    .pipe(gulp.dest(DIR.dist))

    .pipe(cssnano())
    .pipe(concat('dragon-ui.min.css'))
    .pipe(size())
    .pipe(gulp.dest(DIR.dist))
    .pipe(sourcemaps.write())
    .pipe(rename('dragon-ui.min.css.map'))
    .pipe(size())
    .pipe(gulp.dest(DIR.dist));
});

gulp.task('default', ['copySass', 'copyFont', 'buildEntryScss', 'dist']);
