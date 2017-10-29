#!/usr/bin/env node

const {promisify} = require('util');
const path = require('path');
const fs = require('fs-extra');
const detective = require('@zdychacek/detective');
const glob = promisify(require('glob'));
const format = require('format-package');
const builtins = require('builtin-modules');
const argv = require('minimist')(process.argv.slice(2));

const detectiveOpts = {
  parse: {
    plugins: ['objectRestSpread']
  }
};

(async function doit () {
  const mainPkgJson = require(path.join(process.cwd(), 'package.json'));
  const {dependencies: mainDeps} = mainPkgJson;
  const srcdir = argv._[0];
  const pkgJsonPaths = await glob(path.join(srcdir, '**', 'package.json'));

  for (let pkgJsonPath of pkgJsonPaths) {
    const pkgDir = path.dirname(pkgJsonPath);
    const pkgJson = require(path.join(process.cwd(), pkgJsonPath));
    const pkgSrcPaths = await glob(path.join(pkgDir, '**', '*.js'));
    pkgJson.dependencies = pkgJson.dependencies || {};
    const pkgJsonDepsUsed = {};
    Object.keys(pkgJson.dependencies).forEach((k) => pkgJsonDepsUsed[k] = false);

    pkgJson.author = pkgJson.author || mainPkgJson.author;

    pkgJson.version = mainPkgJson.version;
    pkgJson.license = mainPkgJson.license;
    pkgJson.repository = mainPkgJson.repository;
    pkgJson.bugs = mainPkgJson.bugs;
    pkgJson.homepage = mainPkgJson.homepage;

    for (let pkgSrcPath of pkgSrcPaths) {
      const pkgSrc = fs.readFileSync(pkgSrcPath);
      const deps = detective(pkgSrc, detectiveOpts);

      for (let dep of deps) {
        const depPath = dep.split('/');
        dep = depPath[0];
        if (dep.charAt(0) == '@') dep += `/${depPath[1]}`;

        if (builtins.indexOf(dep) !== -1) continue;

        if (!(dep in mainDeps)) {
          console.warn(`WARNING: Main package.json missing "${dep}" required in ${pkgSrcPath}.`);
          continue;
        }
        if (!(dep in pkgJson.dependencies)) {
          console.log(`Adding "${dep}" to ${pkgJsonPath}`);
        }
        else if (pkgJson.dependencies[dep] !== mainDeps[dep]) {
          console.log(`Updating "${dep}" to version "${mainDeps[dep]}" in ${pkgJsonPath}`);
        }
        pkgJson.dependencies[dep] = mainDeps[dep];
        pkgJsonDepsUsed[dep] = true;
      }
    }

    for (let dep in pkgJsonDepsUsed) {
      if (pkgJsonDepsUsed[dep] == false) {
        console.warn(`WARNING: Dependency "${dep}" found in ${pkgJsonPath} but not found in any source files.`)
      }
    }

    const formattedPkgJson = await format(pkgJson);
    fs.writeFileSync(path.join(process.cwd(), pkgJsonPath), formattedPkgJson);
  }
})();
