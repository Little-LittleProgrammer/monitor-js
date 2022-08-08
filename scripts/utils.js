// 工具类
const fs = require('fs');
const chalk = require('chalk'); // 更改控制台文字颜色
const execa = require('execa'); // 用运行node命令
const path = require('path');

const targets = (exports.targets = fs.readdirSync('packages').filter(f => {
    if (!fs.statSync(`packages/${f}`).isDirectory()) { // 如果不是文件夹
        return false;
    }
    const pkg = require(`../packages/${f}/package.json`);
    if (pkg.private && !pkg.buildOptions) {
        return false;
    }
    return true;
}));

exports.fuzzyMatchTarget = (partialTargets, includeAllMatching) => {
    const matched = [];
    partialTargets.forEach(partialTarget => {
        for (const target of targets) {
            if (target.match(partialTarget)) {
                matched.push(target);
                if (!includeAllMatching) {
                    break;
                }
            }
        }
    });
    if (matched.length) {
        return matched;
    } else {
        console.log();
        console.error(
            `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
                `Target ${chalk.underline(partialTargets)} not found!`
            )}`
        );
        console.log();

        process.exit(1);
    }
};

exports.getPkgRoot = (pkg) => path.resolve(__dirname, '../packages/' + pkg);

/**
 * node example/parse.js -a beep -b boop
    { _: [], a: 'beep', b: 'boop' }
 */
exports.getArgv = () => { // 获取 node 命令中的变量
    const argv = require('minimist')(process.argv.slice(2));
    return argv;
};

exports.binRun = (bin, args, opts = {}) => execa(bin, args, { stdio: 'inherit', ...opts });

exports.step = (msg) => console.info(chalk.cyan(msg));

exports.errLog = (msg) => console.error(chalk.red(msg));

// size检查
exports.sizeCheck = async(beReleasedPackages) => {
    let _flag = true;
    // size检查
    try {
        if (beReleasedPackages.includes('wx-mini') || beReleasedPackages.includes('browser')) {
            await binRun('yarn', ['size']);
            console.log(chalk.green(`Size check passed`));
        }
        _flag = true;
    } catch (error) {
        console.error(chalk.red('please make sure that package size does not exceed the limit'));
        _flag = false;
    }
    return _flag;
};
