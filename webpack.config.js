/* eslint-disable @typescript-eslint/no-var-requires */
const TerserPlugin = require("terser-webpack-plugin");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
module.exports = (options, webpack) => {
  return {
    ...options,
    mode: "production",
    entry: "./src/lambda.ts",
    devtool: "source-map",
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true,
          },
        }),
      ],
    },
    output: {
      ...options.output,
      filename: "src/main.js",
      libraryTarget: "commonjs2",
    },
  };
};
