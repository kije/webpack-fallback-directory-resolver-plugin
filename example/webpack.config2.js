const FallbackDirectoryResolverPlugin = require('webpack-fallback-directory-resolver-plugin');
const path = require('path');

module.exports = {
    context: __dirname,
    entry: "./js/script.js",
    output: {
        path: __dirname + "/dist",
        filename: "script2.js"
    },
    resolve: {
        plugins: [
            new FallbackDirectoryResolverPlugin(
                {
                    prefix: 'test-fallback',
                    directories: [
                        path.resolve(__dirname, 'js/dir1')
                    ]
                }
            )
        ]
    }
};