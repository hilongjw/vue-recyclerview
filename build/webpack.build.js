const path = require('path')
const webpack = require('webpack')
const env = process.env.NODE_ENV || 'production'

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const webpackConfig = {
  entry: {
    recyclerview: './src/index.js'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json']
  },
  devtool: false,
  output: {
    path: resolve('dist'),
    filename: '[name].js',
    library: 'RecyclerView',
    libraryTarget: 'umd'
  },
  module: {
      rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: false
    })
  ]
}

module.exports = webpackConfig
