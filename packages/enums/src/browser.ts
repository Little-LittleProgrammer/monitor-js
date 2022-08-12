/**
 * 浏览器插件名称以及subtype
 *
 * @export
 * @enum {number}
 */
export const enum BrowserErrorTypes {
    CE= 'console-error',
    JE= 'js-error',
    PE= 'promise-error',
    RE= 'resource-error',
    VE= 'vue-error'
}

export const enum BrowserPerformanceTypes {
    FP= 'first-paint',
    FCP= 'first-contentful-paint',
    LCP= 'largest-contentful-paint',
    FID= 'first-input-delay',
    CLS= 'cumulative-layout-shift',
    NT= 'navigation',
    RF= 'resource',
    FETCH = 'fetch',
    XHR = 'xhr',
    FMP= 'first-meaning-paint'
}

export const enum BrowserBehaviorTypes {
    CLICK='click',
    PV='pv',
    HASHROUTE='hash-route',
    HISTORYROUTE='history-route'// 是否禁止监控 popstate、pushState、replaceState
}

// 浏览器事件类型
export const enum BrowserEventTypes {
    ERROR='error',
    UNHANDLEDREJECTION='unhandledrejection',
    CLICK='click',
    HASHCHANGE = 'hashchange',
    TOUCHSTART='touchstart',
    POPSTATE='onpopstate',
    PUSHSTATE='pushState',
    REPLACESTATE='replaceState',
    PAINT='paint',
    LCP= 'largest-contentful-paint',
    FI='first-input',
    LS='layout-shift',
    NT= 'navigation',
    RF= 'resource',
}
