const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = (_, argv) => ({
  mode: argv.mode === "production" ? "production" : "development",

  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === "production" ? false : "inline-source-map",

  entry: {
    ui: "./src/ui.tsx",
    figma: "./src/figma.ts" // figma entrypoint
  },

  module: {
    rules: [
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },

      {
        test: /\.css$/,
        loader: [{ loader: "style-loader" }, { loader: "css-loader" }]
      },

      {
        test: /\.(png|jpg|gif|webp|svg|zip)$/,
        loader: [{ loader: "url-loader" }]
      }
    ]
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: { extensions: [".tsx", ".ts", ".jsx", ".js"] },

  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },

  // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/ui.html",
      filename: "ui.html",
      inlineSource: ".(js)$",
      chunks: ["ui"]
    }),
    new HtmlWebpackInlineSourcePlugin()
  ]
});
