const shell = require('shelljs');

for (let cmd of [
  'npx eslint --color packages',
  'npx nyc ava --color',
  `node ${__dirname}/docs.js`,
  `node ${__dirname}/pkgupdate.js`
]) {
  if (shell.exec(cmd).code) {
    break;
  }
}
