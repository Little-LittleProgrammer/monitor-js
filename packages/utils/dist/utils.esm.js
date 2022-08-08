/* @qmonitor/utils version: 2.2.5 
 author: Evan Wu */
const toString = Object.prototype.toString;
function is(val, type) {
    return toString.call(val) === `[object ${type}]`;
}
function isDef(val) {
    return typeof val !== 'undefined';
}
function isUnDef(val) {
    return !isDef(val);
}
function isObject(val) {
    return val !== null && is(val, 'Object');
}
function isEmpty(val) {
    if (isArray(val) || isString(val)) {
        return val.length === 0;
    }
    if (val instanceof Map || val instanceof Set) {
        return val.size === 0;
    }
    if (isObject(val)) {
        return Object.keys(val).length === 0;
    }
    return false;
}
function isDate(val) {
    return is(val, 'Date');
}
function isNull(val) {
    return val === null;
}
function isNullAndUnDef(val) {
    return isUnDef(val) && isNull(val);
}
function isNullOrUnDef(val) {
    return isUnDef(val) || isNull(val);
}
function isNumber(val) {
    return is(val, 'Number');
}
function isPromise(val) {
    return is(val, 'Promise') && isObject(val) && isFunction(val.then) && isFunction(val.catch);
}
function isString(val) {
    return is(val, 'String');
}
function isFunction(val) {
    return typeof val === 'function';
}
function isBoolean(val) {
    return is(val, 'Boolean');
}
function isRegExp(val) {
    return is(val, 'RegExp');
}
function isArray(val) {
    return val && Array.isArray(val);
}
function isElement(val) {
    return isObject(val) && !!val.tagName;
}
function isMap(val) {
    return is(val, 'Map');
}
function isWindow(val) {
    return typeof window !== 'undefined' && is(val, 'Window');
}
const isServer = typeof process !== 'undefined';
const isWx = isObject(typeof wx !== 'undefined' ? wx : 0) && isFunction(typeof App !== 'undefined' ? App : 0);
const isClient = !isServer;

const defaultFunctionName = '<anonymous>';
function get_function_name(fn) {
    if (!fn || typeof fn !== 'function') {
        return defaultFunctionName;
    }
    return fn.name || defaultFunctionName;
}
function deep_copy(target) {
    return JSON.parse(JSON.stringify(target));
}
function get_page_url() {
    var _a;
    if (typeof document === 'undefined' || document.location == null)
        return '';
    return (_a = document.location.href) === null || _a === void 0 ? void 0 : _a.split('?')[0];
}
function get_big_version(version) {
    return Number(version.split('.')[0]);
}
function get_uuid() {
    let _uuid = '';
    if (isWindow) {
        _uuid = localStorage.getItem('uuid');
        if (_uuid)
            return _uuid;
        _uuid = get_unique_id(16);
        localStorage.setItem('uuid', _uuid);
        return _uuid;
    }
    if (isWx) {
        _uuid = wx.getStorageSync('uuid');
        if (_uuid)
            return _uuid;
        _uuid = get_unique_id(16);
        wx.setStorageSync('uuid', _uuid);
        return _uuid;
    }
}
function get_unique_id(len, radix) {
    const _chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    const _uuid = [];
    let i;
    radix = radix || _chars.length;
    if (len) {
        for (i = 0; i < len; i++)
            _uuid[i] = _chars[0 | Math.random() * radix];
    }
    else {
        let r;
        _uuid[8] = '-';
        _uuid[13] = '-';
        _uuid[18] = '-';
        _uuid[23] = '-';
        _uuid[14] = '4';
        for (i = 0; i < 36; i++) {
            if (!_uuid[i]) {
                r = 0 | Math.random() * 16;
                _uuid[i] = _chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }
    return _uuid.join('');
}
function safe_stringify(obj) {
    const set = new Set();
    const str = JSON.stringify(obj, function (_key, value) {
        if (set.has(value)) {
            return 'Circular';
        }
        typeof value === 'object' && set.add(value);
        return value;
    });
    set.clear();
    return str;
}
function format_string(str) {
    const _strList = str.split('-');
    let _resStr = '';
    _strList.forEach(item => {
        _resStr += (first_str_to_uppercase(item));
    });
    return _resStr;
}
function first_str_to_uppercase(str) {
    return str.replace(/\b(\w)(\w*)/g, function ($0, $1, $2) {
        return `${$1.toUpperCase()}${$2}`;
    });
}
function sampling(sample) {
    return Math.random() * 100 <= sample;
}
function encode(data) {
    return encodeURIComponent(data);
}
function decode(data) {
    return decodeURIComponent(data);
}
function throttle_event(fn, data) {
    clearTimeout(fn.__timebar);
    if (data !== true) {
        data = data || {};
        const params = {
            time: data.time || 200,
            context: data.context || null,
            args: data.args
        };
        return new Promise((resolve) => {
            fn.__timebar = setTimeout(function () {
                const _res = fn.apply(params.context, params.args);
                resolve(_res);
            }, params.time);
        });
    }
}

class Queue {
    constructor() {
        this.stack = [];
    }
    get_cache() {
        return deep_copy(this.stack);
    }
    add_cache(data) {
        this.stack.push(data);
    }
    clear_cache() {
        this.stack = [];
    }
}

function native_try_catch(fn, errorFn) {
    try {
        fn();
    }
    catch (err) {
        if (errorFn) {
            errorFn(err);
        }
        else {
            console.error('err', err);
        }
    }
}
function get_error_uid(input) {
    const _id = hash_code(input) + '';
    return _id;
}
function hash_code(str) {
    let _hash = 0;
    if (str.length == 0)
        return _hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        _hash = (_hash << 5) - _hash + char;
        _hash = _hash & _hash;
    }
    return _hash;
}
const FULL_MATCH = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
const STACKTRACE_LIMIT = 10;
function parse_stack_line(line) {
    const lineMatch = line.match(FULL_MATCH);
    if (!lineMatch)
        return {};
    const filename = lineMatch[2];
    const functionName = lineMatch[1] || '';
    const lineno = parseInt(lineMatch[3], 10) || undefined;
    const colno = parseInt(lineMatch[4], 10) || undefined;
    return {
        filename,
        functionName,
        lineno,
        colno
    };
}
function parse_stack_frames(error) {
    const { stack } = error;
    if (!stack)
        return [];
    const frames = [];
    for (const line of stack.split('\n').slice(1)) {
        const frame = parse_stack_line(line);
        if (frame) {
            frames.push(frame);
        }
    }
    return frames.slice(0, STACKTRACE_LIMIT);
}

function on(target, eventName, callback, options = false) {
    target.addEventListener(eventName, callback, options);
}
function off(target, eventName, callback, options = false) {
    target.removeEventListener(eventName, callback, options);
}
function on_hidden(target, callback, once = false) {
    const hidden = (e) => {
        if (e.type === 'pagehide' || document.visibilityState === 'hidden') {
            callback(e);
            if (once) {
                off(target, 'visibilitychange', hidden, true);
                off(target, 'pagehide', hidden, true);
            }
        }
    };
    on(target, 'visibilitychange', hidden, true);
    on(target, 'pagehide', hidden, true);
}
function on_load(target, callback) {
    if (target == Window && document.readyState === 'complete') {
        callback();
    }
    else {
        const onLoad = () => {
            callback();
            off(target, 'load', onLoad, true);
        };
        on(target, 'load', onLoad, true);
    }
}
function on_beforeunload(target, callback) {
    target.addEventListener('beforeunload', callback, true);
}

function get_global() {
    if (isWindow)
        return window;
    if (isWx)
        return wx;
    if (isServer)
        return process;
}
function is_support_performance_observer() {
    return !!window.PerformanceObserver;
}
const _global = get_global();
const _supportPerformance = is_support_performance_observer();

function html_element_to_string(target) {
    const _tagName = target.tagName.toLowerCase();
    if (_tagName === 'body') {
        return null;
    }
    let _classNames = target.classList.value;
    _classNames = _classNames !== '' ? ` class="${_classNames}"` : '';
    const _id = target.id ? ` id="${target.id}"` : '';
    const _innerText = target.innerText;
    return `<${_tagName}${_id}${_classNames !== '' ? _classNames : ''}>${_innerText}</${_tagName}>`;
}

export { Queue, _global, _supportPerformance, decode, deep_copy, defaultFunctionName, encode, first_str_to_uppercase, format_string, get_big_version, get_error_uid, get_function_name, get_global, get_page_url, get_unique_id, get_uuid, hash_code, html_element_to_string, is, isArray, isBoolean, isClient, isDate, isDef, isElement, isEmpty, isFunction, isMap, isNull, isNullAndUnDef, isNullOrUnDef, isNumber, isObject, isPromise, isRegExp, isServer, isString, isUnDef, isWindow, isWx, is_support_performance_observer, native_try_catch, off, on, on_beforeunload, on_hidden, on_load, parse_stack_frames, parse_stack_line, safe_stringify, sampling, throttle_event };
/* join us */
