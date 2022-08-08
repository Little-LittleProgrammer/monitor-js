/* @qmonitor/vue version: 2.2.5 
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
function isString(val) {
    return is(val, 'String');
}
function isFunction(val) {
    return typeof val === 'function';
}
function isWindow(val) {
    return typeof window !== 'undefined' && is(val, 'Window');
}
const isServer = typeof process !== 'undefined';
const isWx = isObject(typeof wx !== 'undefined' ? wx : 0) && isFunction(typeof App !== 'undefined' ? App : 0);

function get_page_url() {
    var _a;
    if (typeof document === 'undefined' || document.location == null)
        return '';
    return (_a = document.location.href) === null || _a === void 0 ? void 0 : _a.split('?')[0];
}
function get_big_version(version) {
    return Number(version.split('.')[0]);
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

function get_global() {
    if (isWindow)
        return window;
    if (isWx)
        return wx;
    if (isServer)
        return process;
}
get_global();

function vue2_vm_handler(vm) {
    let componentName = '';
    if (vm.$root === vm) {
        componentName = 'root';
    }
    else {
        const name = vm._isVue ? (vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag) : vm.name;
        componentName =
            (name ? 'component <' + name + '>' : 'anonymous component') +
                (vm._isVue && vm.$options && vm.$options.__file ? ' at ' + (vm.$options && vm.$options.__file) : '');
    }
    return {
        componentName
    };
}
function vue3_vm_handler(vm) {
    let componentName = '';
    if (vm.$root === vm) {
        componentName = 'root';
    }
    else {
        const name = vm.$options && vm.$options.name;
        componentName = name ? 'component <' + name + '>' : 'anonymous component';
    }
    return {
        componentName
    };
}

const vuePlugin = {
    name: "vue-error",
    type: "error",
    monitor(notify) {
        const vue = this.options.vue;
        if (vue && vue.Vue && vue.Vue.config) {
            const { Vue } = vue;
            const originErrorHandle = Vue.config.errorHandler;
            Vue.config.errorHandler = (err, vm, info) => {
                const _report = {
                    type: 'error',
                    subType: "vue-error",
                    pageURL: get_page_url(),
                    extraData: {
                        type: err.name,
                        errorUid: get_error_uid(`${"vue-error"}-${err.message}-${info}`),
                        msg: err.stack || err.message,
                        stackTrace: {
                            frames: parse_stack_frames(err)
                        },
                        meta: {
                            info
                        }
                    }
                };
                notify("vue-error", { _report, vm });
                return originErrorHandle === null || originErrorHandle === void 0 ? void 0 : originErrorHandle(err, vm, info);
            };
        }
    },
    transform({ _report: collectedData, vm }) {
        const vue = this.options.vue;
        if (vue && vue.Vue && vue.Vue.config) {
            const { Vue } = vue;
            if (isString(Vue === null || Vue === void 0 ? void 0 : Vue.version)) {
                switch (get_big_version(Vue.version)) {
                    case 2:
                        collectedData.extraData.meta = Object.assign(Object.assign({}, collectedData.extraData.meta), vue2_vm_handler(vm));
                        return collectedData;
                    case 3:
                        collectedData.extraData.meta = Object.assign(Object.assign({}, collectedData.extraData.meta), vue3_vm_handler(vm));
                        return collectedData;
                    default:
                        return collectedData;
                }
            }
        }
    },
    consumer(data) {
        this.report.send(data, true);
    }
};

exports.vuePlugin = vuePlugin;
/* join us */
