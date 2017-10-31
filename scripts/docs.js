const shell = require('shelljs');

for (let cmd of [
  'node ./lib/esdoc-external-node/generate-api.js',
  'npx rimraf docs',
  'npx rimraf packages/node_modules',
  'npx esdoc',
  'npm run bootstrap -s'
]) {
  if (shell.exec(cmd).code) {
    break;
  }
}

