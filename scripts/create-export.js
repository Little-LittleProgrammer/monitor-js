const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');

const { targets: allTargets, getArgv, errLog } = require('./utils');

run();

async function run() {
    const argv = getArgv();
    // accept npm run build web browser...
    const paramTarget = argv._;
    if (paramTarget.length === 0) { // 如果 node命令内没指定具体包名, 则build全部
        buildAll(allTargets);
    } else {
        buildAll(paramTarget);
    }
}

function buildAll(targets) {
    targets.forEach(target => {
        if (['core', 'enums', 'types', 'utils'].includes(target)) {
            const _pkgDir = path.resolve(`packages/${target}/src`);
            const _pkgName = fs.readdirSync(_pkgDir).filter(name => name !== 'index.ts').map(name => {
                const _length = name.length;
                return name.substring(0, _length - 3);
            });
            let _str = '';
            for (const name of _pkgName) {
                _str += `export * from './${name}';\n`;
            }
            fs.writeFile(`${_pkgDir}/index.ts`, _str, (err) => {
                if (err) {
                    errLog(`Generate error, src:${_pkgDir}/index.ts`);
                    throw err;
                }
                console.log(chalk.green(`Generate complete, src:${_pkgDir}/index.ts`));
            });
        }
    });
}
