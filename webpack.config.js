var webpack = require('webpack');

module.exports = {
  context: __dirname,
  entry: {
    test: './src/index.ts',
    d3sc: './src/D3SeatingChart.ts',
    vendor: './src/vendor.ts'
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].bundle.js"
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({ names: ['d3sc', 'vendor'], minChunks: Infinity })
  ],
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'] // note if using webpack 1 you'd also need a '' in the array as well
  },
  module: {
    loaders: [ // loaders will work with webpack 1 or 2; but will be renamed "rules" in future
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.tsx?$/, loader: 'ts-loader' }
    ]
  }
};