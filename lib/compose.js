const path = require('path');
const {execSync} = require('child_process');
const env = require('npm-run-path').env();
const {compose} = require(path.join(process.cwd(), 'package.json'));
const name = process.argv[2];

const re = /^compose (.+)$/;
let match;

let code = runScripts(compose[name]);
console.log();
process.exit(code);

function runScripts (scripts)
{
  let code = 0;
  for (let script of scripts) {
    if (Array.isArray(script)) {
      code = runScripts(script) || code;
    }
    else if (code == 0) {
      try {
        execSync(script, {env, stdio: [0,1,2]});
      }
      catch (err) {
        code = err.status || 1;
      }
    }
  }

  return code;
}
