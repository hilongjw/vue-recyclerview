process.env.NODE_ENV = 'production'

var webpack = require('webpack')
var webpackBuild = require('./webpack.build')

webpack(webpackBuild, function (err, stats) {
  if (err) throw err
  process.stdout.write(stats.toString({
    colors: true,
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false
  }) + '\n\n')

  console.log('  Build complete.\n')
})
