const path = require('path');
const {execSync} = require('child_process');
const runPath = require('npm-run-path');
const {compose} = require(path.join(process.cwd(), 'package.json'));
const name = process.argv[2];

for (let script of compose[name]) {
  execSync(script, {
    env: runPath.env(),
    stdio: [0,1,2],
  });
}
