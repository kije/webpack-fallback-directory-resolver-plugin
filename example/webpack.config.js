const FallbackDirectoryResolverPlugin = require('weback-fallback-directory-resolver-plugin');
const path = require('path');

module.exports = {
    context: __dirname,
    entry: "./js/script.js",
    output: {
        path: __dirname + "/dist",
        filename: "script.js"
    },
    resolve: {
        plugins: [
            new FallbackDirectoryResolverPlugin(
                {
                    prefix: 'test-fallback',
                    directories: [
                        path.resolve(__dirname, 'js/dir2'),
                        path.resolve(__dirname, 'js/dir1')
                    ]
                }
            )
        ]
    }
};