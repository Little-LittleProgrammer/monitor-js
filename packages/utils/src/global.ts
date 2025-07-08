import { isArray, isFunction, isServer, isWindow, isWx } from './is';
import { onBeforeunload } from './listen';
// 全局环境支持

export function getGlobal<T>() {
    if (isWindow()) return window as unknown as T;
    if (isWx()) return wx as unknown as T;
    // it's true when run e2e
    if (isServer()) return process as unknown as T;
}

function injectPerformanceObserver() {
    // // 检查是否需要Polyfill
    if (isFunction(typeof window.PerformanceObserver)) {
        return; // 浏览器已支持，无需Polyfill
    }

    // 模拟PerformanceEntryList
    function PerformanceEntryList(entries) {
        this.entries = entries || [];
    }

    PerformanceEntryList.prototype.getEntries = function() {
        return this.entries;
    };

    // 模拟PerformanceObserver
    function PerformanceObserver(callback) {
        this.callback = callback;
        this.entryType = [];
    }

    PerformanceObserver.prototype.observe = function(options:PerformanceObserverInit) {
        if (options.entryTypes) {
            this.entryType = options.entryTypes;
        } else if (options.type) {
            this.entryType = isArray(options.type) ? options.type : [options.type];
        }

        const memo = new Set();

        // 模拟监听，定期检查新的性能条目
        this.intervalId = setInterval(() => {
            const api = (window.performance as any).webkitGetEntries || window.performance.getEntries;
            const entries = api.call(window.performance).filter((entry) => {
                if (memo.has(entry.entryType || entry.name)) return false;
                return this.entryType.indexOf(entry.entryType) > -1 || this.entryType.indexOf(entry.name) > -1;
            });

            if (entries.length > 0) {
                this.callback(new PerformanceEntryList(entries), this);
                entries.forEach(entry => {
                    memo.add(entry.entryType || entry.name);
                });
            }
        }, 3000); // 每三秒检查一次，根据需要调整
        onBeforeunload(window, () => {
            this.disconnect();
        });
    };

    PerformanceObserver.prototype.disconnect = function() {
        // 断开观察，实际上是停止定时器
        clearInterval(this.intervalId);
    };
    PerformanceObserver.prototype.takeRecords = function() {
        this.disconnect();
        return [];
    };

    // 将模拟的PerformanceObserver挂载到window上
    // @ts-ignore
    window.PerformanceObserver = PerformanceObserver;
}

// 是否支持 performanceObserver
export function isSupportPerformanceObserver() {
    if (!isWindow() ||
        !window.performance ||
        !(
            isFunction(window.performance.getEntries) ||
            isFunction((window.performance as any).webkitGetEntries)
        )
    ) {
        return false;
    }
    injectPerformanceObserver();
    return true;
}

const _global = getGlobal<Window & WechatMiniprogram.Wx>();
const _supportPerformance = isSupportPerformanceObserver();

export { _global, _supportPerformance };
