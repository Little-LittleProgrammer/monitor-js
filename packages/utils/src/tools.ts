import { isBase, isFunction, isMap, isRegExp, isSet, isSymbol, isWindow, isWx } from './is';

export const defaultFunctionName = '<anonymous>'; // 匿名
/**
 * 获取函数名, 匿名函数则返回<anonymous>
 * @param fn 方法名
 * @returns 函数名, 匿名函数则返回<anonymous>
 */
export function getFunctionName(fn: unknown):string {
    if (!fn || typeof fn !== 'function') {
        return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
}

export function deepCopy<T>(target: T, map = new Map()):T {
    // 判断引用类型的temp
    function check_temp(target:any) {
        const _c = target.constructor;
        return new _c();
    }

    // 不可遍历应用类型深拷贝
    // 拷贝方法
    function clone_func(func:Function):Function | null {
        const _bodyReg = /(?<={)(.|\n)+(?=})/m;
        const _paramReg = /(?<=\().+(?=\)\s+{)/;
        const _funcStr = func.toString();
        if (func.prototype) {
            const _param = _paramReg.exec(_funcStr);
            const _body = _bodyReg.exec(_funcStr);
            if (_body) {
                if (_param) {
                    const _paramArr = _param[0].split(',');
                    return new Function(..._paramArr, _body[0]);
                } else {
                    return new Function(_body[0]);
                }
            } else {
                return null;
            }
        } else {
            // eslint-disable-next-line
            // return eval(_funcStr);
        }
    }
    // 拷贝Symbol
    function clone_symbol(target: T): T {
        return Object(Symbol.prototype.valueOf.call(target));
    }
    // 拷贝RegExp
    function clone_reg(target: RegExp): RegExp {
        const _result = new RegExp(target.source);
        _result.lastIndex = target.lastIndex;
        return _result;
    }

    // 基本数据类型直接返回
    if (isBase(target)) return target;
    // 判断 不可遍历类型, 并拷贝
    if (isFunction(target)) return clone_func(target) as unknown as T;
    if (isRegExp(target)) return clone_reg(target) as unknown as T;
    if (isSymbol(target)) return clone_symbol(target);

    // 引用数据类型特殊处理
    const _temp = check_temp(target);
    // 防止循环引用
    if (map.get(target)) {
        return map.get(target);
    }
    map.set(target, _temp);
    // 处理 Map类型
    if (isMap(target)) {
        target.forEach((val, key) => {
            _temp.set(key, deepCopy(val, map));
        });
        return _temp;
    }
    // 处理 Set类型
    if (isSet(target)) {
        target.forEach((val) => {
            _temp.add(deepCopy(val, map));
        });
        return _temp;
    }
    // 处理数据和对象
    for (const key in target) {
        // 递归
        _temp[key] = deepCopy(target[key], map);
    }
    return _temp;
}

export function getPageUrl(): string {
    if (typeof document === 'undefined' || document.location == null) return '';
    return document.location.href?.split('?')[0];
}

export function getBigVersion(version: string) {
    return Number(version.split('.')[0]);
}

export function getUuid() { // 用户id
    let _uuid = '';
    if (isWindow) {
        _uuid = localStorage.getItem('qmonitor_uuid');
        if (_uuid) return _uuid;
        _uuid = getUniqueId(16);
        localStorage.setItem('qmonitor_uuid', _uuid);
        return _uuid;
    }
    if (isWx) {
        _uuid = wx.getStorageSync('qmonitor_uuid');
        if (_uuid) return _uuid;
        _uuid = getUniqueId(16);
        wx.setStorageSync('qmonitor_uuid', _uuid);
        return _uuid;
    }
}

export function getUniqueId(len:number, radix?:number) { //  指定长度和基数
    const _chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    const _uuid = [];
    let i;
    radix = radix || _chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) _uuid[i] = _chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        let r;

        // rfc4122 requires these characters
        _uuid[8] = '-';
        _uuid[13] = '-';
        _uuid[18] = '-';
        _uuid[23] = '-';
        _uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!_uuid[i]) {
                r = 0 | Math.random() * 16;
                _uuid[i] = _chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return _uuid.join('');
}

/**
 * 安全的转换对象，包括循环引用，如果是循环引用就返回Circular
 *
 * @export
 * @param {object} obj 需要转换的对象
 * @return {*}  {string}
 */
export function safeStringify(obj: object): string {
    const set = new Set();
    const str = JSON.stringify(obj, function(_key, value) {
        if (set.has(value)) {
            return 'Circular';
        }
        typeof value === 'object' && set.add(value);
        return value;
    });
    set.clear();
    return str;
}

/**
 * 格式化字符串, 连接符变驼峰
 * @param str 需要格式化的字符串
 */
export function formatString(str: string): string {
    const _strList = str.split('-');
    let _resStr = '';
    _strList.forEach(item => {
        _resStr += (firstStrToUppercase(item));
    });
    return _resStr;
}

/**
 *将传入的字符串的首字母改为大写，其他不变
 *
 * @export
 * @param {string} str 原字符
 * @return {*}  {string}
 * @example xhr => Xhr
 */
export function firstStrToUppercase(str: string): string {
    return str.replace(/\b(\w)(\w*)/g, function($0: string, $1: string, $2: string) {
        return `${$1.toUpperCase()}${$2}`;
    });
}

// 采样率设置, 最基本的方式
export function sampling(sample: number): boolean {
    return Math.random() * 100 <= sample;
}

// 简单加密
export function encode(data: string): string {
    return encodeURIComponent(data);
}

// 简单解密
export function decode(data: string): string {
    return decodeURIComponent(data);
}

/**
 * 防抖截流
 * @param {*} fn 方法
 * @param {*} data 配置
 * @return promise
 */
export function throttleEvent(fn: any, data: any) {
    // 清除定时器
    clearTimeout(fn.__timebar);
    // 启动节流
    if (data !== true) {
        // 定义默认值
        data = data || {};
        const params = {
            time: data.time || 200,
            context: data.context || null,
            args: data.args
        };
        // 执行定时器
        // 函数也属于对象，因此可以添加属性
        return new Promise((resolve) => {
            fn.__timebar = setTimeout(function() {
                // 执行方法
                const _res = fn.apply(params.context, params.args);
                resolve(_res);
            }, params.time);
        });
    } else {
        // 如果是清除防抖
    }
}

export function getTimestamp():number {
    return Math.floor(Date.now() / 1000);
}
