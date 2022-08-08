/**
 *浏览器需要监听的事件类型
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
    click='click',
    pv='pv'
}
