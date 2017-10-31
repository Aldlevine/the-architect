const shell = require('shelljs');

for (let cmd of [
  'node ./lib/update-pkgjson.js ./packages',
  'npx format-package -w'
]) {
  if (shell.exec(cmd).code) {
    break;
  }
}


