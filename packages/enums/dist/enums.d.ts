export declare const enum BrowserBehaviorTypes {
    click = "click",
    pv = "pv"
}

export declare const enum BrowserErrorTypes {
    CE = "console-error",
    JE = "js-error",
    PE = "promise-error",
    RE = "resource-error",
    VE = "vue-error"
}

export declare const enum BrowserPerformanceTypes {
    FP = "first-paint",
    FCP = "first-contentful-paint",
    LCP = "largest-contentful-paint",
    FID = "first-input-delay",
    CLS = "cumulative-layout-shift",
    NT = "navigation",
    RF = "resource",
    FETCH = "fetch",
    XHR = "xhr",
    FMP = "first-meaning-paint"
}

export declare const enum EventClassTypes {
    performance = "performance",
    error = "error",
    behavior = "behavior"
}

export declare type EventTypes = BrowserErrorTypes | BrowserPerformanceTypes | BrowserBehaviorTypes;

export { }
