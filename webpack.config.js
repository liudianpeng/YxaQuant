module.exports = {
    entry: "./client.js",
    output: {
        path: 'public/build',
        filename: "bundle.js"
    },
    module: {
        loaders: []
    }
};