const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    library: '',
    libraryTarget: 'commonjs'
  },
  target: 'node',
  externals: [nodeExternals()],
  resolve: {
    alias: {
      joi: 'joi-browser'
    }
  },
  module: {
    rules: [{
      // // set up standard-loader as a preloader
      // enforce: 'pre',
      // test: /\.js$/,
      // loader: 'standard-loader',
      // exclude: /(node_modules|bower_components)/,
      // options: {
      //   // config options to be passed through to standard e.g.
      //   parser: 'babel-eslint'
      // }
    // }, {
      test: /\.js$/,
      include: path.join(__dirname, 'src'),
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-env', {
            modules: false,
            targets: {
              node: 'current'
            }
          }], '@babel/preset-react'],
          plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-object-rest-spread']
        }
      }
    }]
  },
  plugins: [new CleanWebpackPlugin(['dist'])]
}
