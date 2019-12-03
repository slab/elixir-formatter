const path = require("path");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const env = process.env.MIX_ENV || "dev";
const isProduction = env === "prod";

const config = {
  mode: isProduction ? "production" : "development",
  entry: {
    app: ["./assets/js/index.js", "./assets/scss/app.scss"]
  },
  output: {
    path: path.resolve(__dirname, "priv/static"),
    filename: "js/[name].js"
  },
  resolve: {
    extensions: [".js"],
    modules: ["node_modules"]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: /js/,
        use: [{ loader: "babel-loader" }]
      },
      {
        test: /\.scss$/,
        include: path.resolve(__dirname, "assets/scss"),
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: { hmr: !isProduction }
          },
          {
            loader: "css-loader",
            options: { sourceMap: true }
          },
          {
            loader: "sass-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].css"
    })
  ]
};

if (isProduction) {
  config.plugins.push(
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
    }),
    new UglifyJSPlugin({
      sourceMap: true
    })
  );
  config.devtool = "source-map";
} else {
  config.devtool = "inline-source-map";
}

module.exports = config;
