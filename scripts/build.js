const shell = require('shelljs');
let code = 0;

for (let cmd of [
  'npx eslint --color packages',
  'npx nyc ava --color',
  `node ${__dirname}/docs.js`,
  `node ${__dirname}/pkgupdate.js`
]) {
  if (code = shell.exec(cmd).code) {
    break;
  }
}

process.exit(code);
