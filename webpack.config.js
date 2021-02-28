const path = require('path');

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
    // plugins: [new JSONSplitPlugin()],
    // plugins: [],
};
