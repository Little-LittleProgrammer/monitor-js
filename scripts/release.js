// 发布
const chalk = require('chalk');
const { getArgv, targets: allTargets, binRun, getPkgRoot, step, sizeCheck } = require('./utils');

const path = require('path');
const fs = require('fs');

let beReleasedPackages = [];

run();
async function run() {
    const argv = getArgv();
    beReleasedPackages = argv._;
    release();
}

async function release() {
    step('\ncollect be released packages...');
    if (beReleasedPackages.length === 0) {
        beReleasedPackages = allTargets;
    }
    console.log(beReleasedPackages)
    const _flag = await sizeCheck(beReleasedPackages);
    if (_flag) {
        step(`\nbeReleasedPackages:\n ${beReleasedPackages.join('\n')}`);
        beReleasedPackages.forEach((target) => {
            public_package(target);
        });
    }
}

async function public_package(pkgName) {
    const pkgRoot = getPkgRoot(pkgName);
    const pkgPath = path.resolve(pkgRoot, 'package.json');
    const pkg = require(pkgPath);
    const version = pkg.version;
    if (pkg.private) return;
    fs.access(`${pkgRoot}/dist`, fs.constants.F_OK, async(err) => {
        if (err) {
            console.error(chalk.red(`${pkgName} don't have dist folder`));
            return;
        }
        step(`Publishing ${pkgName}...`);
        try {
            await binRun('yarn', ['publish', '--new-version', version, '--access', 'public'], {
                cwd: pkgRoot,
                stdio: 'pipe'
            });
            console.log(chalk.green(`Successfully published ${pkgName}@${version}`));
        } catch (error) {
            console.error(`failed publish ${pkgName}@${version}`, error);
        }
    });
}
