import { isWindow, isWx } from './is';

export const defaultFunctionName = '<anonymous>'; // 匿名
/**
 * 获取函数名, 匿名函数则返回<anonymous>
 * @param fn 方法名
 * @returns 函数名, 匿名函数则返回<anonymous>
 */
export function get_function_name(fn: unknown):string {
    if (!fn || typeof fn !== 'function') {
        return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
}

export function deep_copy<T>(target: T):T {
    // if (typeof target === 'object') {
    //     const result = Array.isArray(target) ? [] : {};
    //     for (const key in target) {
    //         if (typeof target[key] == 'object') {
    //             result[key] = deep_copy(target[key]);
    //         } else {
    //             result[key] = target[key];
    //         }
    //     }

    //     return result;
    // }

    // return target;
    return JSON.parse(JSON.stringify(target));
}

export function get_page_url(): string {
    if (typeof document === 'undefined' || document.location == null) return '';
    return document.location.href?.split('?')[0];
}

export function get_big_version(version: string) {
    return Number(version.split('.')[0]);
}

export function get_uuid() { // 用户id
    let _uuid = '';
    if (isWindow) {
        _uuid = localStorage.getItem('uuid');
        if (_uuid) return _uuid;
        _uuid = get_unique_id(16);
        localStorage.setItem('uuid', _uuid);
        return _uuid;
    }
    if (isWx) {
        _uuid = wx.getStorageSync('uuid');
        if (_uuid) return _uuid;
        _uuid = get_unique_id(16);
        wx.setStorageSync('uuid', _uuid);
        return _uuid;
    }
}

export function get_unique_id(len:number, radix?:number) { //  指定长度和基数
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
export function safe_stringify(obj: object): string {
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
export function format_string(str: string): string {
    const _strList = str.split('-');
    let _resStr = '';
    _strList.forEach(item => {
        _resStr += (first_str_to_uppercase(item));
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
export function first_str_to_uppercase(str: string): string {
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
export function throttle_event(fn: any, data: any) {
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
