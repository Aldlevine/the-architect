module.exports = {
  'env': {
    'es6': true,
    'node': true
  },
  'extends': 'eslint:recommended',
  'parserOptions': {
    'ecmaFeatures': {'experimentalObjectRestSpread': true}
  },
  'rules': {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'no-unused-vars': ['warn'],
    'quotes': ['error', 'single'],
  }
}
