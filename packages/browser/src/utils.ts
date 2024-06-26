import { _global } from '@qmonitor/utils';

// 获取浏览器是否支持sendBeacon(同步请求不阻塞浏览器进程)
export function isSupportSendBeacon():boolean {
    return !!(_global.navigator && _global.navigator.sendBeacon);
}

export function getNetworkInfo() {
    if (window.navigator.connection) {
        const _info = window.navigator.connection as any;
        return {
            effectiveType: _info.effectiveType, // 网络类型
            downlink: _info.downlink, // 下行速度
            rtt: _info.rtt, // 发送数据到接受数据的往返时间
            saveData: _info.saveData // 是否打开数据保护模式
        };
    }
    return null;
}

// 是否支持history模式
export function isSupportHistoryRoute(): boolean {
    // borrowed from: https://github.com/angular/angular.js/pull/13945/files
    const chrome = (_global as any).chrome;
    const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime;
    const hasHistoryApi = 'history' in _global && !!_global.history.pushState && !!_global.history.replaceState;
    return !isChromePackagedApp && hasHistoryApi;
}
