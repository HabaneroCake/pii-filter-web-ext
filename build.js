const browserify = require('browserify');
const tsify = require('tsify');
const fs = require('fs');
const glob = require('glob');

// TODO: automate finding / excluding and copying over JSON if this works

const service =  browserify().add('src/service.ts');

// // make json files externals to keep under 4mb for ff.
// fs.readdirSync(dataset_dir).forEach(file => {
//     service.external(dataset_dir + file);
// });
// fs.readdirSync(lib_data_dir_nl).forEach(file => {
//     service.external(lib_data_dir_nl + file);
// });
// fs.readdirSync(lib_data_dir_en).forEach(file => {
//     service.external(lib_data_dir_en + file);
// });
glob("node_modules/pii-filter/**/*.json", function (err, res) {
    if (err) {
        console.log('Error', err);
    } else {
        console.log(res)
        service.external(res);
    }
});

service
    .plugin(tsify, {noImplicitAny: true, experimentalDecorators: true, target: 'esnext'})
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
