/* @qmonitor/browser version: 2.2.5 
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

class BrowserOptions extends BaseOptions {
    constructor(options) {
        super();
        this.configReportXhr = null;
        super.bindOptions(options);
        this.bindOptions(options);
    }
    bindOptions(options) {
        const { disabledPerformance, disabledBehavior, disabledError, disabledCustom, disabledConsoleError, disabledJsError, disabledPromiseError, disabledResourceError, disabledFirstPaint, disabledFirstContentfulPaint, disabledLargestContentfulPaint, disabledFirstInputDelay, disabledCumulativeLayoutShift, disabledNavigation, disabledResource, disabledXhr, disabledFetch, disabledFirstMeaningPaint, useImgUpload, configReportXhr } = options;
        this.disabledPerformance = disabledPerformance || false;
        this.disabledBehavior = disabledBehavior || false;
        this.disabledError = disabledError || false;
        this.disabledCustom = disabledCustom || false;
        this.disabledXhr = disabledXhr || false;
        this.disabledFetch = disabledFetch || false;
        this.disabledFirstMeaningPaint = disabledFirstMeaningPaint || false;
        this.disabledConsoleError = disabledConsoleError || false;
        this.disabledJsError = disabledJsError || false;
        this.disabledPromiseError = disabledPromiseError || false;
        this.disabledResourceError = disabledResourceError || false;
        this.disabledFirstPaint = disabledFirstPaint || false;
        this.disabledFirstContentfulPaint = disabledFirstContentfulPaint || false;
        this.disabledLargestContentfulPaint = disabledLargestContentfulPaint || false;
        this.disabledFirstInputDelay = disabledFirstInputDelay || false;
        this.disabledCumulativeLayoutShift = disabledCumulativeLayoutShift || false;
        this.disabledNavigation = disabledNavigation || false;
        this.disabledResource = disabledResource || false;
        this.useImgUpload = useImgUpload || false;
        if (configReportXhr && isFunction(configReportXhr)) {
            this.configReportXhr = configReportXhr;
        }
    }
}

function is_support_send_beacon() {
    return !!(_global.navigator && _global.navigator.sendBeacon);
}
function get_network_info() {
    if (window.navigator.connection) {
        const _info = window.navigator.connection;
        return {
            effectiveType: _info.effectiveType,
            downlink: _info.downlink,
            rtt: _info.rtt,
            saveData: _info.saveData
        };
    }
    return null;
}

class BrowserReport extends BaseReport {
    constructor(options) {
        super();
        this.configReportXhr = null;
        this.useImgUpload = false;
        super.bindOptions(options);
        this.bindOptions(options);
    }
    post(data, url) {
        const xhr = new XMLHttpRequest();
        xhr.open('post', url);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.withCredentials = true;
        if (this.configReportXhr && isFunction(this.configReportXhr)) {
            this.configReportXhr(xhr, data);
        }
        xhr.send(safe_stringify(data));
    }
    imgRequest(data, url) {
        let _img = new Image();
        const _spliceStr = url.indexOf('?') === -1 ? '?' : '&';
        _img.src = `${url}${_spliceStr}data=${encodeURIComponent(safe_stringify(data))}`;
        _img = null;
    }
    beaconPost(data, url) {
        _global.navigator.sendBeacon.call(window.navigator, url, safe_stringify(data));
    }
    report(data, url) {
        let _fn = null;
        if (this.useImgUpload) {
            _fn = this.imgRequest;
        }
        else {
            _fn = is_support_send_beacon() ? this.beaconPost : this.post;
        }
        if (_global.requestIdleCallback) {
            _global.requestIdleCallback(() => __awaiter(this, void 0, void 0, function* () {
                yield _fn(data, url);
            }));
        }
        else {
            setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                yield _fn(data, url);
            }));
        }
    }
    getReportData(data) {
        return Object.assign(Object.assign({}, data), { networkInfo: get_network_info() });
    }
    bindOptions(options) {
        this.useImgUpload = options.useImgUpload || false;
        if (options.configReportXhr && isFunction(options.configReportXhr)) {
            this.configReportXhr = options.configReportXhr;
        }
    }
}

class BrowserClient extends BaseClient {
    constructor(options) {
        super(options);
        this.options = new BrowserOptions(options);
        this.report = new BrowserReport(options);
    }
    isPluginEnable(name) {
        const _flag = `disabled${format_string(name)}`;
        return !this.options[_flag];
    }
    isPluginsEnable(type) {
        const _flag = `disabled${first_str_to_uppercase(type)}`;
        return !this.options[_flag];
    }
}

const consoleErrorPlugin = {
    name: "console-error",
    type: "error",
    monitor(notify) {
        _global.console.error = (...args) => {
            notify("console-error", args);
        };
    },
    transform(args) {
        const _reportData = {
            type: 'error',
            subType: "console-error",
            pageURL: get_page_url(),
            extraData: {
                type: '',
                errorUid: get_error_uid(`console-error-${args[0]}`),
                msg: args.join(';'),
                meta: undefined,
                stackTrace: undefined
            }
        };
        return _reportData;
    },
    consumer(reportData) {
        this.report.send(reportData, true);
    }
};

const jsErrorPlugin = {
    name: "js-error",
    type: "error",
    monitor(notify) {
        on(_global, 'error', (e) => {
            const _target = e.target;
            if (_target.localName) {
                return;
            }
            e.preventDefault();
            notify("js-error", e);
        }, true);
    },
    transform(errorEvent) {
        return get_js_report_data(errorEvent);
    },
    consumer(reportData) {
        this.report.send(reportData, true);
    }
};
const resourceErrorPlugin = {
    name: "resource-error",
    type: "error",
    monitor(notify) {
        on(_global, 'error', (e) => {
            const _target = e.target;
            if (!_target.localName) {
                return;
            }
            e.preventDefault();
            notify("resource-error", e);
        }, true);
    },
    transform(errorEvent) {
        const _target = errorEvent.target;
        return get_resource_report_data(_target);
    },
    consumer(reportData) {
        this.report.send(reportData, true);
    }
};
function get_resource_report_data(target) {
    const _url = target.src || target.href;
    const _reportData = {
        type: 'error',
        subType: "resource-error",
        pageURL: get_page_url(),
        extraData: {
            type: "resource-error",
            errorUid: get_error_uid(`${"resource-error"}-${target.src}-${target.tagName}`),
            msg: `资源地址: ` + _url,
            meta: {
                url: _url,
                html: target.outerHTML,
                type: target.tagName
            },
            stackTrace: undefined
        }
    };
    return _reportData;
}
function get_js_report_data(errorEvent) {
    const _reportData = {
        type: 'error',
        subType: "js-error",
        pageURL: get_page_url(),
        extraData: {
            type: (errorEvent.error && errorEvent.error.name) || 'UnKnown',
            errorUid: get_error_uid(`${"js-error"}-${errorEvent.message}-${errorEvent.filename}`),
            msg: errorEvent.stack || errorEvent.message,
            meta: {
                file: errorEvent.filename,
                col: errorEvent.colno,
                row: errorEvent.lineno
            },
            stackTrace: {
                frames: parse_stack_frames(errorEvent.error)
            }
        }
    };
    return _reportData;
}

const promiseErrorPlugin = {
    name: "promise-error",
    type: "error",
    monitor(notify) {
        on(_global, 'unhandledrejection', (e) => {
            notify("promise-error", e);
        });
    },
    transform(errorEvent) {
        const _msg = errorEvent.reason.stack || errorEvent.reason.message || errorEvent.reason;
        const _type = errorEvent.reason.name || 'UnKnown';
        const _reportData = {
            type: 'error',
            subType: "promise-error",
            pageURL: get_page_url(),
            extraData: {
                type: _type,
                errorUid: get_error_uid(`${"promise-error"}-${_msg}`),
                msg: _msg,
                meta: undefined,
                stackTrace: {
                    frames: parse_stack_frames(errorEvent.reason)
                }
            }
        };
        return _reportData;
    },
    consumer(reportData) {
        this.report.send(reportData, true);
    }
};

const fetchPlugin = {
    name: "fetch",
    type: "performance",
    monitor(notify) {
        monitor_fetch.call(this, notify);
    },
    transform(reportData) {
        return reportData;
    },
    consumer(reportData) {
        this.report.send(reportData);
    }
};
const originalFetch = _global.fetch;
function monitor_fetch(notify) {
    const { options } = this;
    if (!('fetch' in _global))
        return;
    _global.fetch = (url, config = {}) => {
        const startTime = Date.now();
        const method = ((config && config.method) || 'GET').toUpperCase();
        const _reportData = {
            type: 'performance',
            subType: "fetch",
            pageURL: get_page_url(),
            extraData: {
                startTime,
                url,
                method,
                data: config.body
            }
        };
        const headers = new Headers(config.headers || {});
        Object.assign(headers, {
            setRequestHeader: headers.set
        });
        options.beforeAppAjaxSend && options.beforeAppAjaxSend({ url, method: method }, headers);
        return originalFetch(url, config).then(res => {
            const _data = res.clone();
            const _endTime = Date.now();
            _reportData.extraData = Object.assign(Object.assign({}, _reportData.extraData), { endTime: _endTime, duration: _endTime - _reportData.extraData.startTime, status: _data.status, success: _data.ok });
            _data.text().then(() => {
                notify("fetch", _reportData);
            });
            return res;
        }).catch((err) => {
            const _endTime = Date.now();
            _reportData.extraData = Object.assign(Object.assign({}, _reportData.extraData), { endTime: _endTime, duration: _endTime - _reportData.extraData.startTime, status: 0, success: false });
            notify("fetch", _reportData);
            throw err;
        });
    };
}
const xhrPlugin = {
    name: "xhr",
    type: "performance",
    monitor(notify) {
        monitor_xhr.call(this, notify);
    },
    transform(reportData) {
        return reportData;
    },
    consumer(reportData) {
        this.report.send(reportData);
    }
};
function monitor_xhr(notify) {
    const { options } = this;
    if (!('XMLHttpRequest' in _global)) {
        return;
    }
    const _xhr = XMLHttpRequest.prototype;
    const _open = _xhr.open;
    const _send = _xhr.send;
    _xhr.open = function new_open(...args) {
        var _a, _b;
        this.url = (_b = (_a = args[1]) === null || _a === void 0 ? void 0 : _a.split('?')) === null || _b === void 0 ? void 0 : _b[0];
        this.method = args[0];
        _open.apply(this, args);
    };
    _xhr.send = function new_send(...args) {
        this.startTime = Date.now();
        options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method: this.method, url: this.url }, this);
        const onLoadend = () => {
            this.endTime = Date.now();
            this.duration = this.endTime - this.startTime;
            const { status, duration, startTime, endTime, url, method } = this;
            const _reportData = {
                type: 'performance',
                subType: "xhr",
                extraData: {
                    status,
                    duration,
                    startTime,
                    endTime,
                    url,
                    method: (method || 'GET').toUpperCase(),
                    success: status >= 200 && status < 300
                },
                pageURL: get_page_url()
            };
            notify("xhr", _reportData);
            off(this, 'loadend', onLoadend, true);
        };
        on(this, 'loadend', onLoadend, true);
        _send.apply(this, args);
    };
}

const clsPlugin = {
    name: "cumulative-layout-shift",
    type: "performance",
    monitor(notify) {
        if (!is_support_performance_observer())
            return;
        let _sessionValue = 0;
        let _sessionEntries = [];
        const _reportData = {
            type: 'performance',
            subType: "cumulative-layout-shift",
            pageURL: '',
            extraData: {
                value: 0
            }
        };
        function entry_handle(list) {
            _reportData.pageURL = get_page_url();
            for (const entry of list.getEntries()) {
                const _entry = entry;
                if (!_entry.hadRecentInput) {
                    const _firstSessionEntry = _sessionEntries[0];
                    const _lastSessionEntry = _sessionEntries[_sessionEntries.length - 1];
                    if (_sessionValue &&
                        entry.startTime - _lastSessionEntry.startTime < 1000 &&
                        entry.startTime - _firstSessionEntry.startTime < 5000) {
                        _sessionValue += _entry.value;
                        _sessionEntries.push(format_cls_entry(entry));
                    }
                    else {
                        _sessionValue = _entry.value;
                        _sessionEntries = [format_cls_entry(entry)];
                    }
                    if (_sessionValue > _reportData.extraData.value) {
                        _reportData.extraData = {
                            entry: _entry,
                            value: _sessionValue,
                            entries: _sessionEntries
                        };
                        notify("cumulative-layout-shift", deep_copy(_reportData));
                    }
                }
            }
        }
        const _observe = new PerformanceObserver(entry_handle);
        _observe.observe({ type: 'layout-shift', buffered: true });
        if (_observe) {
            on_hidden(_global, () => {
                _observe.takeRecords().map(entry_handle);
            });
        }
    },
    transform(reportData) {
        return reportData;
    },
    consumer(reportData) {
        this.report.send(reportData);
    }
};
function format_cls_entry(entry) {
    const _result = entry.toJSON();
    delete _result.duration;
    delete _result.sources;
    return _result;
}

const fidPlugin = {
    name: "first-input-delay",
    type: "performance",
    monitor(notify) {
        if (!_supportPerformance)
            return;
        function entry_handler(list) {
            if (_observer) {
                _observer.disconnect();
            }
            for (const entry of list.getEntries()) {
                const _reportData = {
                    type: 'performance',
                    subType: "first-input-delay",
                    pageURL: get_page_url(),
                    extraData: Object.assign({}, entry.toJSON())
                };
                notify("first-input-delay", _reportData);
            }
        }
        const _observer = new PerformanceObserver(entry_handler);
        _observer.observe({ type: 'first-input', buffered: true });
    },
    transform(reportData) {
        return reportData;
    },
    consumer(reportData) {
        this.report.send(reportData);
    }
};

let _lcpFlag = false;
function is_lcp_done() {
    return _lcpFlag;
}
const lcpPlugin = {
    name: "largest-contentful-paint",
    type: "performance",
    monitor(notify) {
        if (!_supportPerformance) {
            _lcpFlag = true;
            return;
        }
        function entry_handler(list) {
            _lcpFlag = true;
            if (_observer) {
                _observer.disconnect();
            }
            for (const entry of list.getEntries()) {
                const _reportData = {
                    type: 'performance',
                    subType: "largest-contentful-paint",
                    pageURL: get_page_url(),
                    extraData: Object.assign({}, entry.toJSON())
                };
                notify("largest-contentful-paint", _reportData);
            }
        }
        const _observer = new PerformanceObserver(entry_handler);
        _observer.observe({ type: "largest-contentful-paint", buffered: true });
    },
    transform(reportData) {
        return reportData;
    },
    consumer(reportData) {
        this.report.send(reportData);
    }
};

let _isOnLoaded = false;
on_load(_global, () => {
    _isOnLoaded = true;
});
let _observer;
const _entries = [];
const fmpPlugin = {
    name: "first-meaning-paint",
    type: "performance",
    monitor(notify) {
        if (!MutationObserver)
            return;
        const _next = window.requestAnimationFrame ? requestAnimationFrame : setTimeout;
        const _ignoreDomList = ['STYLE', 'SCRIPT', 'LINK', 'META'];
        _observer = new MutationObserver(records => {
            check_dom_change(notify);
            const _entry = {
                startTime: 0,
                children: []
            };
            _next(() => {
                _entry.startTime = performance.now();
            });
            for (const record of records) {
                if (record.addedNodes.length) {
                    for (const node of [...record.addedNodes]) {
                        if (node.nodeType === 1 && !_ignoreDomList.includes(node.tagName) && !is_include(node, _entry.children)) {
                            _entry.children.push(node);
                        }
                    }
                }
            }
            if (_entry.children.length) {
                _entries.push(_entry);
            }
        });
        _observer.observe(document, {
            childList: true,
            subtree: true
        });
    },
    transform(reportData) {
        return reportData;
    },
    consumer(reportData) {
        this.report.send(reportData);
    }
};
let _time = null;
function check_dom_change(notify) {
    clearTimeout(_time);
    _time = setTimeout(() => {
        if (is_lcp_done() && _isOnLoaded) {
            _observer && _observer.disconnect();
            const _reportData = {
                type: 'performance',
                subType: "first-meaning-paint",
                pageURL: get_page_url(),
                extraData: {
                    startTime: get_render_time()
                }
            };
            notify("first-meaning-paint", _reportData);
        }
        else {
            check_dom_change(notify);
        }
    }, 500);
}
function get_render_time() {
    let _startTime = 0;
    _entries.forEach(entry => {
        for (const node of entry.children) {
            if (is_in_screen(node) && entry.startTime > _startTime && need_to_count(node)) {
                _startTime = entry.startTime;
                break;
            }
        }
    });
    performance.getEntriesByType('resource').forEach((item) => {
        if (item.initiatorType === 'img' &&
            item.fetchStart < _startTime &&
            item.responseEnd > _startTime) {
            _startTime = item.responseEnd;
        }
    });
    return _startTime;
}
function is_include(node, arr) {
    if (!node || node === document.documentElement) {
        return false;
    }
    if (arr.includes(node)) {
        return true;
    }
    return is_include(node.parentElement, arr);
}
function is_in_screen(dom) {
    const _viewportWidth = window.innerWidth;
    const _viewportHeight = window.innerHeight;
    const _rectInfo = dom.getBoundingClientRect();
    return (_rectInfo.left >= 0 && _rectInfo.left < _viewportWidth && _rectInfo.top >= 0 && _rectInfo.top < _viewportHeight);
}
function need_to_count(node) {
    if (window.getComputedStyle(node).display === 'none')
        return false;
    if (node.tagName === 'IMG' && node.width < 2 && node.height < 2) {
        return false;
    }
    return true;
}

const fpPlugin = {
    name: "first-paint",
    type: "performance",
    monitor(notify) {
        if (!_supportPerformance)
            return;
        function entry_handler(list) {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    _observer.disconnect();
                }
                const _reportData = {
                    type: 'performance',
                    subType: entry.name,
                    pageURL: get_page_url(),
                    extraData: Object.assign({}, entry.toJSON())
                };
                notify("first-paint", _reportData);
            }
        }
        const _observer = new PerformanceObserver(entry_handler);
        _observer.observe({ type: 'paint', buffered: true });
    },
    transform(reportData) {
        return reportData;
    },
    consumer(reportData) {
        this.report.send(reportData);
    }
};

const resourcePlugin = {
    name: "resource",
    type: "performance",
    monitor(notify) {
        if (!_supportPerformance)
            return;
        on_load(_global, () => observe_event.call(this, "resource", notify));
    },
    transform(entry) {
        const _reportData = {
            type: 'performance',
            subType: "resource",
            extraData: {},
            pageURL: ''
        };
        _reportData.extraData = {
            name: entry.name.split('/')[entry.name.split('/').length - 1],
            sourceType: entry.initiatorType,
            ttfb: entry.responseStart,
            transferSize: entry.transferSize,
            protocol: entry.nextHopProtocol,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
            resourceRatio: (entry.decodedBodySize / entry.encodedBodySize) || 1,
            isCache: is_cahce(entry),
            startTime: performance.now(),
            redirect: (entry.redirectEnd - entry.redirectStart),
            dns: (entry.domainLookupEnd - entry.domainLookupStart),
            tcp: (entry.connectEnd - entry.connectStart),
            request: (entry.responseStart - entry.requestStart),
            response: (entry.responseEnd - entry.responseStart),
            duration: entry.duration
        };
        return _reportData;
    },
    consumer(reportData) {
        this.report.send(reportData);
    }
};
const navigationPlugin = {
    name: "navigation",
    type: "performance",
    monitor(notify) {
        if (!_supportPerformance)
            return;
        on_load(_global, () => observe_event.call(this, "navigation", notify));
    },
    transform(entry) {
        const _reportData = {
            type: 'performance',
            subType: "navigation",
            extraData: {},
            pageURL: ''
        };
        _reportData.pageURL = get_page_url();
        _reportData.extraData = {
            fp: entry.responseEnd - entry.fetchStart,
            tti: entry.domInteractive - entry.fetchStart,
            domReady: entry.domContentLoadedEventEnd - entry.fetchStart,
            load: entry.loadEventStart - entry.fetchStart,
            firstByte: entry.responseStart - entry.domainLookupStart,
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            tcp: entry.connectEnd - entry.connectStart,
            ssl: entry.secureConnectionStart ? entry.connectEnd - entry.secureConnectionStart : 0,
            ttfb: entry.responseStart - entry.requestStart,
            trans: entry.responseEnd - entry.responseStart,
            domParse: entry.domInteractive - entry.responseEnd,
            res: entry.loadEventStart - entry.domContentLoadedEventEnd
        };
        return _reportData;
    },
    consumer(reportData) {
        this.report.send(reportData);
    }
};
let _hasAlreadyCollected = false;
function observe_event(entryType, notify) {
    function entry_handler(list) {
        for (const entry of list.getEntries()) {
            const _entry = entry;
            if (entryType === 'navigation') {
                if (_hasAlreadyCollected)
                    return;
                if (_observe) {
                    _observe.disconnect();
                }
                _hasAlreadyCollected = true;
            }
            if ((!_entry.nextHopProtocol && entryType !== 'navigation') || filter(_entry.initiatorType)) {
                return;
            }
            notify(entryType, _entry);
        }
    }
    const _observe = new PerformanceObserver(entry_handler);
    _observe.observe({ type: entryType, buffered: true });
}
const preventType = ['fetch', 'xmlhttprequest', 'beacon'];
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
if (isSafari) {
    preventType.push('other');
}
function filter(type) {
    return preventType.includes(type);
}
function is_cahce(entry) {
    return entry.transferSize === 0 || (entry.transferSize !== 0 && entry.encodedBodySize === 0);
}

function create_browser_instance(options = {}, plugins = []) {
    const _browserClient = new BrowserClient(options);
    const _sample = _browserClient.getOptions().sample;
    let _browserPlugin = [
        consoleErrorPlugin,
        jsErrorPlugin,
        resourceErrorPlugin,
        promiseErrorPlugin
    ];
    if (sampling(_sample)) {
        _browserPlugin = [
            ..._browserPlugin,
            xhrPlugin,
            fetchPlugin,
            clsPlugin,
            fidPlugin,
            fmpPlugin,
            fpPlugin,
            lcpPlugin,
            resourcePlugin,
            navigationPlugin
        ];
        const _callback = () => {
            const _data = _browserClient.report.queue.get_cache();
            if (_data && _data.length > 0) {
                _browserClient.report.post(_data, _browserClient.report.url);
                _browserClient.report.queue.clear_cache();
            }
        };
        on_beforeunload(_global, _callback);
    }
    _browserClient.use([..._browserPlugin, ...plugins]);
    return _browserClient;
}
const init = create_browser_instance;

exports.BrowserClient = BrowserClient;
exports.init = init;
/* join us */
