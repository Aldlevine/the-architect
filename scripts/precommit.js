const shell = require('shelljs');

for (let cmd of [
  'git stash save -q --keep-index "pre-commit stash"',
  `node ${__dirname}/build.js`
]) {
  if (shell.exec(cmd).code) {
    break;
  }
}

for (let cmd of [
  'git reset -q --hard',
  'git stash pop -q --index',
  'git add README.md package.json packages/**/package.json'
]) {
  if (shell.exec(cmd).code) {
    break;
  }
}
