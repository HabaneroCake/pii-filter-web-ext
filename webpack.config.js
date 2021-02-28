const { fstat } = require('fs');
const path = require('path');
const fs = require('fs');

const background_top = `<!DOCTYPE html>

<html>
    <head>
        <meta charset="utf-8">
    </head>
    <body>

`;

const background_bottom = `
    </body>
</html>
`;

module.exports = {
    mode: 'production',
    entry: {
        content: path.resolve(__dirname, 'src/content.ts'),
        service: path.resolve(__dirname, 'src/service.ts'),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'build'),
    },
    optimization: {
        splitChunks: {
            chunks: 'async',
            maxSize: 2000000,
            minRemainingSize: 0,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            enforceSizeThreshold: 50000,
            cacheGroups: {
                defaultVendors: {
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    reuseExistingChunk: true,
                    minChunks: 2,
                },
                default: {
                    minChunks: 2,
                    priority: -20,
                    reuseExistingChunk: true,
                },
            },
        },
    },
    plugins: [
        {   // post build: export background page
            apply: (compiler) => {
                compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
                    const assets = compilation.getAssets();
                    let script_tags = '';
                    for (const asset of assets)
                    {
                        if (/^service-(?:.*?).js$/.test(asset.name))
                            script_tags += `        <script type="module" src="build/${asset.name}"></script>\r\n`;
                    }
                    fs.writeFile(
                        'background.html',
                        background_top + script_tags + background_bottom,
                        (err) => console.log(err)
                    )
                });
            }
        }
    ],
};
