import { isServer, isWindow, isWx } from './is';
// 全局环境支持

export function getGlobal<T>() {
    if (isWindow) return window as unknown as T;
    if (isWx) return wx as unknown as T;
    // it's true when run e2e
    if (isServer) return process as unknown as T;
}

// 是否支持 performanceObserver
export function isSupportPerformanceObserver() {
    return !!window.PerformanceObserver;
}

const _global = getGlobal<Window & WechatMiniprogram.Wx>();
const _supportPerformance = isSupportPerformanceObserver();

export { _global, _supportPerformance };
