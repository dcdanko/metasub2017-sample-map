const path = require("path");

module.exports = {
    entry: {
         map: "./components/js/index.js"
    },
    output: {
        path: path.join(__dirname, 'build'),
        publicPath:"/build",
        filename: "[name].js"
    },
    watch: false,
    module: {
        rules: [
            {
                test: /\.js$/,
                enforce: "pre",
                exclude: /node_modules/,
                loader: "eslint-loader"
            },
            { 
              test: /\.js$/, 
              exclude: [/node_modules/], 
              loader: "babel-loader",
                query: {
                    presets: ["es2015"]
                } 
            },
            {
              test: /\.css$/, 
              loaders: ["style-loader","css-loader"] 
            },
            {
            test: /\.scss$/,
            loaders: ["style-loader", "css-loader", "sass-loader"]
        },
            { 
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                loader: 'url-loader?limit=100000' 
            },
            {
                test: /\.html/,
                exclude: [/node_modules/],
                loader: "raw-loader"
            }
        ]
    }
}