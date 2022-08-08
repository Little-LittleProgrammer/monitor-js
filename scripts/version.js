// 更新版本
const path = require('path');
const fs = require('fs');

const { getArgv, targets: allTargets, binRun, getPkgRoot, step, errLog, sizeCheck } = require('./utils');
const SDK_PREFIX = '@qmonitor';
let beModifiedPackages = [];

run();

function run() {
    const argv = getArgv()._;
    let targetVersion = null;
    if (argv.length === 0) {
        return errLog('npm/yarn run version 没有带版本号，请到docs文件夹中查看开发指南');
    } else {
        targetVersion = argv.shift();
    }
    const masterVersion = require('../package.json').version;
    if (masterVersion !== targetVersion) {
        return errLog('传入的版本号与根路径的package.json不符合，请检查package.json的version');
    // return errLog('')
    }
    beModifiedPackages = argv.length === 0 ? allTargets : argv;
    const _flag = await sizeCheck(beReleasedPackages);
    if (_flag) {
        modify(targetVersion);
    }
}

async function modify(targetVersion) {
    step(`start modify packages version: ${targetVersion}`);
    for (const target of beModifiedPackages) {
        await modify_version(target, targetVersion);
    }
}

async function modify_version(pkgName, version) {
    const pkgRoot = getPkgRoot(pkgName);
    const pkgPath = path.resolve(pkgRoot, 'package.json');
    const pkg = require(pkgPath);
    const oldVersion = pkg.version;
    if (pkg.name.startsWith(SDK_PREFIX)) { // 将 pkg.version 替换成跟路径version
        pkg.version = version;
    }
    const dependencies = pkg.dependencies || {};
    Object.entries(dependencies).forEach(([dependent, dependentVersion]) => {
        // 拼接：前缀 + 当前包名: @qmonitor/vue 如果当前依赖中有被改的包，也把version修改
        const isExist = beModifiedPackages.some((pkg) => `${SDK_PREFIX}/${pkg}` === dependent);
        if (isExist) {
            dependencies[dependent] = `^${version}`;
        }
    });
    fs.writeFileSync(pkgPath, JSON.stringify(pkg));
    await binRun('prettier', ['--write', pkgPath]); // 为了格式化代码, 利用脚本替换代码后会挤在一行
    step(`${pkgName} package version from ${oldVersion} to ${version} success`);
}
