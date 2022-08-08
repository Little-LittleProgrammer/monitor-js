/* @qmonitor/core version: 2.2.5 
 author: Evan Wu */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const toString = Object.prototype.toString;
function is(val, type) {
    return toString.call(val) === `[object ${type}]`;
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
function isString(val) {
    return is(val, 'String');
}
function isFunction(val) {
    return typeof val === 'function';
}
function isArray(val) {
    return val && Array.isArray(val);
}
function isWindow(val) {
    return typeof window !== 'undefined' && is(val, 'Window');
}
const isServer = typeof process !== 'undefined';
const isWx = isObject(typeof wx !== 'undefined' ? wx : 0) && isFunction(typeof App !== 'undefined' ? App : 0);

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

function get_global() {
    if (isWindow)
        return window;
    if (isWx)
        return wx;
    if (isServer)
        return process;
}
get_global();

class Subscribe {
    constructor() {
        this.cache = new Map();
    }
    watch(eventName, callBack) {
        const _fns = this.cache.get(eventName);
        if (_fns) {
            this.cache.set(eventName, _fns.concat(callBack));
            return;
        }
        this.cache.set(eventName, [callBack]);
    }
    notify(eventName, data) {
        const _fns = this.cache.get(eventName);
        if (!eventName || !_fns)
            return;
        _fns.forEach((fn) => {
            native_try_catch(() => { fn(data); }, (e) => {
                console.error(`Subscribe.notify: 监听事件的回调函数发生错误\n
                        eventName:${eventName}\n
                        Name: ${get_function_name(fn)}\n
                        Error: ${e}`);
            });
        });
    }
}

class BaseClient {
    constructor(options) {
        this.options = options;
    }
    use(plugins) {
        const subscribe = new Subscribe();
        plugins.forEach((item) => {
            if (!this.isPluginsEnable(item.type))
                return;
            if (!this.isPluginEnable(item.name))
                return;
            item.monitor.call(this, subscribe.notify.bind(subscribe));
            const wrapperTransform = (...args) => {
                var _a, _b;
                const res = (_a = item.transform) === null || _a === void 0 ? void 0 : _a.apply(this, args);
                (_b = item.consumer) === null || _b === void 0 ? void 0 : _b.call(this, res);
            };
            subscribe.watch(item.name, wrapperTransform);
        });
    }
    getOptions() {
        return this.options;
    }
    log(data, isImmediate = false) {
        const _data = Object.assign({}, data);
        _data.startTime = Date.now();
        if (!_data.pageURL) {
            _data.pageURL = get_page_url();
        }
        this.report.send(data, isImmediate);
    }
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class BaseReport {
    constructor() {
        this.url = '';
        this.appID = '';
        this.userID = '';
        this.appName = '';
        this.cacheNum = 50;
        this.beforeDataReport = null;
        this.timer = null;
        this.queue = new Queue();
        this.submitErrorUids = [];
    }
    bindOptions(options) {
        this.appID = options.appID;
        this.url = options.url;
        if (options.appName)
            this.appName = options.appName;
        if (options.cacheNum)
            this.cacheNum = options.cacheNum;
        if (options.userID) {
            this.userID = options.userID;
        }
        else {
            this.userID = get_uuid();
        }
    }
    send(data, isImmediate = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.extraData && data.extraData.errorUid) {
                const _hasSubmitStatus = this.submitErrorUids.indexOf(data.extraData.errorUid);
                if (_hasSubmitStatus > -1)
                    return;
                this.submitErrorUids.push(data.extraData.errorUid);
            }
            let _reportData = Object.assign({}, this.formatReportData(data));
            _reportData = Object.assign({}, this.getReportData(_reportData));
            if (isFunction(this.beforeDataReport)) {
                _reportData = yield this.beforeDataReport(_reportData);
                if (!_reportData)
                    return;
            }
            if (isEmpty(this.url)) {
                console.error('请设置上传 URL 地址');
                return;
            }
            return this.sendTime(_reportData, this.url, isImmediate);
        });
    }
    formatReportData(data) {
        const _reportData = {
            id: get_unique_id(16),
            appID: this.appID,
            userID: this.userID,
            appName: this.appName,
            data
        };
        return _reportData;
    }
    sendTime(data, url, isImmediate) {
        if (isImmediate) {
            this.report(data, url);
            return;
        }
        this.queue.add_cache(data);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            const _data = this.queue.get_cache();
            if (_data && _data.length >= this.cacheNum) {
                this.report(_data, url);
                this.queue.clear_cache();
            }
        }, 3000);
        return;
    }
}

class BaseOptions {
    constructor() {
        this.beforeAppAjaxSend = null;
        this.vue = null;
        this.sample = 100;
    }
    bindOptions(options) {
        if (options.sample)
            this.sample = options.sample;
        if (options.vue && Object.keys(options.vue).length > 0) {
            this.vue = options.vue;
        }
        if (options.beforeAppAjaxSend && isFunction(options.beforeAppAjaxSend)) {
            this.beforeAppAjaxSend = options.beforeAppAjaxSend;
        }
    }
}

exports.BaseClient = BaseClient;
exports.BaseOptions = BaseOptions;
exports.BaseReport = BaseReport;
/* join us */
