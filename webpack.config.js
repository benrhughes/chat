const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './app/ts/loader.ts', // Assuming your TypeScript entry is named index.ts
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js', // Output bundle file name
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/, // Match TypeScript files
                use: 'ts-loader', // Use ts-loader to transpile TypeScript
                exclude: /node_modules/,
            },
            {
                test: /\.css$/, // Match CSS files
                use: ['style-loader', 'css-loader'], // Use loaders to handle CSS files
            },
            {
                test: /\.(png|html)$/, // Match PNG and HTML files
                type: 'asset/resource', // Emit a separate file and export the URL
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'], // Resolve extensions
    },
    mode: 'production', // Production mode to enable optimizations
    plugins: [
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
                '**/*', // This pattern indicates that all files will be cleaned...
                '!**/.git', // Exclude the .git directory itself
                '!**/.git/**', // Exclude all files within the .git directory
            ],
        }),
        new CopyPlugin({
            patterns: [
                { from: 'app/index.html', to: 'index.html' },
                { from: 'app/cog.png', to: 'cog.png' },
                { from: 'app/app.css', to: 'app.css' },
                { from: 'node_modules/primeflex/primeflex.css', to: 'primeflex.css' },
                { from: 'node_modules/primeflex/themes/primeone-light.css', to: 'primeone-light.css' },
            ],
        }),
    ],
};