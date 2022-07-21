import { isServer, isWindow, isWx } from './is';
// 全局环境支持

export function get_global<T>() {
    if (isWindow) return window as unknown as T;
    if (isWx) return wx as unknown as T;
    // it's true when run e2e
    if (isServer) return process as unknown as T;
}

// 是否支持 performanceObserver
export function is_support_performance_observer() {
    return !!window.PerformanceObserver;
}

const _global = get_global<Window & WechatMiniprogram.Wx>();
const _supportPerformance = is_support_performance_observer();

export { _global, _supportPerformance };
