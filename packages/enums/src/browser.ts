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
    VE= 'vue-error',
    FETCH = 'fetch',
    XHR = 'xhr'
}

export const enum BrowserPerformanceTypes {
    FP= 'first-paint', // 首次绘制, 白屏时间
    FCP= 'first-contentful-paint', // 首次内容绘制， 首屏时间
    LCP= 'largest-contentful-paint', // 最大内容绘制
    FID= 'first-input-delay', // 首次输入延迟
    CLS= 'cumulative-layout-shift', // 页面偏移分数, 所有值中去最大
    NT= 'navigation', // 页面数据
    RF= 'resource', // 资源文件
    FMP= 'first-meaning-paint' // 首次有效(主要内容)绘制
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

// 浏览器 用户行为栈类型
export const enum BrowserBreadcrumbTypes {
    ROUTE = 'Route',
    CLICK = 'UI.Click',
    CONSOLE = 'Console',
    XHR = 'Xhr',
    FETCH = 'Fetch',
    UNHANDLEDREJECTION = 'Unhandledrejection',
    RESOURCE = 'Resource',
    CODE_ERROR = 'Code Error',
    CUSTOMER = 'Customer'
  }
