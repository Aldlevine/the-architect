const path = require('path');
const fs = require('fs-extra');
const {exec} = require('child_process');
const headTag = '<!-- HEAD -->';

function renderBadges ({branch})
{
  const badges = [
    `[![Build Status](https://travis-ci.org/Aldlevine/the-architect.svg?branch=${branch})](https://travis-ci.org/Aldlevine/the-architect)`,
    `[![Coverage Status](https://coveralls.io/repos/github/Aldlevine/the-architect/badge.svg?branch=${branch})](https://coveralls.io/github/Aldlevine/the-architect?branch=${branch})`
  ];
  return badges.join('\n');
}

async function gitBranch ()
{
  return new Promise((res, rej) => {
    exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
      if (err) return rej(err);
      res(stdout.toString().trim());
    })
  });
}

!(async function doit () {
  const branch = await gitBranch();
  const readmePath = path.join(process.cwd(), 'README.md');
  const readme = fs.readFileSync(readmePath).toString();

  const split = readme.split('\n\n');
  let [head, ...body] = split;
  body = body ? body.join('\n\n') : body;

  if (head.indexOf(headTag) == 0) {
    head = headTag + '\n' + renderBadges({branch});
    fs.writeFileSync(readmePath, head + '\n\n' +  body);
  }

})();
