const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');

(async() => {
    const browser = await puppeteer.launch();
    const _page = await browser.newPage();
    await _page.goto('https://www.antdv.com/components/icon-cn');
    let _text = [];
    _text = await _page.$$eval('.main-container .ant-badge', (els) => {
        return els.map(el => {
            return ((str) => {
                const _strList = str.split('-');
                let _resStr = '';
                _strList.forEach(item => {
                    _resStr += (item.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
                        return `${$1.toUpperCase()}${$2}`;
                    }));
                });
                return `'${_resStr}'`;
            })(el.innerText);
        });
    });
    const _elementHandle = await _page.$$('.ant-radio-group-outline label');
    await _elementHandle[1].click();
    _text = _text.concat(await _page.$$eval('.main-container .ant-badge', (els) => {
        return els.map(el => {
            return ((str) => {
                const _strList = str.split('-');
                let _resStr = '';
                _strList.forEach(item => {
                    _resStr += (item.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
                        return `${$1.toUpperCase()}${$2}`;
                    }));
                });
                return `'${_resStr}'`;
            })(el.innerText);
        });
    }));
    await _elementHandle[2].click();
    _text = _text.concat(await _page.$$eval('.main-container .ant-badge', (els) => {
        return els.map(el => {
            return ((str) => {
                const _strList = str.split('-');
                let _resStr = '';
                _strList.forEach(item => {
                    _resStr += (item.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
                        return `${$1.toUpperCase()}${$2}`;
                    }));
                });
                return `'${_resStr}'`;
            })(el.innerText);
        });
    }));
    console.log(chalk.green('ok'));
    const pkgDir = path.resolve(`test`);
    fs.writeFile(`${pkgDir}/log.ts`, `const icons = [${_text}]; icons.sort(); export {icons}`);
    execa('prettier', ['--write', `${pkgDir}/log.ts`]); // 格式化文件
})();

