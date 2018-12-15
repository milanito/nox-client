const config = {
  babelrc: false,
  presets: [['@babel/preset-env', {
    targets: {
      node: 'current'
    }
  }], '@babel/preset-react'],
  plugins: ['@babel/plugin-transform-runtime', '@babel/plugin-proposal-object-rest-spread']
}

module.exports = require('babel-jest').createTransformer(config)
