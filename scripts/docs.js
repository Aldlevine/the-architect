const shell = require('shelljs');
let code = 0;

for (let cmd of [
  'node ./lib/esdoc-external-node/generate-api.js',
  'npx rimraf docs',
  'npx rimraf packages/node_modules',
  'npx esdoc',
  'npm run bootstrap -s'
]) {
  if (code = shell.exec(cmd).code) {
    break;
  }
}

process.exit(code);
