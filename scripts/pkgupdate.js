const shell = require('shelljs');
let code = 0;

for (let cmd of [
  'node ./lib/update-pkgjson.js ./packages',
  'npx format-package -w'
]) {
  if (code = shell.exec(cmd).code) {
    break;
  }
}

process.exit(code);
