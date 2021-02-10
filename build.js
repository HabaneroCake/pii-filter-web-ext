const browserify = require('browserify');
const tsify = require('tsify');
const fs = require('fs');

browserify()
    .add('src/service.ts')
    .plugin(tsify, { noImplicitAny: true, experimentalDecorators: true, target: 'esnext'})
    .bundle()
    .on('error', error => {
        throw new Error(error.toString());
    })
    .pipe(fs.createWriteStream('./build/service.js'));

browserify()
    .add('src/content.ts')
    .plugin(tsify, { noImplicitAny: true, experimentalDecorators: true, target: 'esnext'})
    .bundle()
    .on('error', error => {
        throw new Error(error.toString());
    })
    .pipe(fs.createWriteStream('./build/content.js'));
