export declare interface BaseClientType<O extends BaseOptionsType = BaseOptionsType> {
    SDK_NAME?: string;
    SDK_VERSION?: string;
    options: O;
    getOptions(): O;
}

export declare interface BaseOptionsFieldsType {
    url?: string;
    appID?: string;
    appName?: string;
    userID?: string;
    cacheNum?: number;
    sample?: number;
    vue?: {
        Vue?: VueInstance;
        router?: VueRouter;
    };
}

export declare interface BaseOptionsHooksType {
    beforeDataReport?(event: ReportBaseInfo): Promise<ReportBaseInfo | CANCEL> | ReportBaseInfo | any | CANCEL;
    beforeAppAjaxSend?(config: IRequestHeaderConfig, setRequestHeader: IBeforeAppAjaxSendConfig): void;
}

export declare type BaseOptionsType = BaseOptionsFieldsType & BaseOptionsHooksType;

export declare interface BasePluginType<T extends EventTypes = EventTypes, C extends BaseClientType = BaseClientType, Class extends EventClassTypes = EventClassTypes> {
    name: T;
    type: Class;
    monitor: (this: C, notify: (eventName: T, data: any) => void) => void;
    transform?: (this: C, collectedData: any) => any;
    consumer?: (this: C, transformedData: any) => void;
}

declare const enum BrowserBehaviorTypes {
    click='click',
    pv='pv'
}

/**
 *浏览器需要监听的事件类型
 *
 * @export
 * @enum {number}
 */
declare const enum BrowserErrorTypes {
    CE= 'console-error',
    JE= 'js-error',
    PE= 'promise-error',
    RE= 'resource-error',
    VE= 'vue-error'
}

declare const enum BrowserPerformanceTypes {
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

declare type CANCEL = null | undefined | boolean;

declare const enum EventClassTypes {
    performance= 'performance',
    error='error',
    behavior='behavior'
}

/**
 * 所有重写事件类型整合
 * 以后扩展微信什么的
 */

declare type EventTypes = BrowserErrorTypes | BrowserPerformanceTypes | BrowserBehaviorTypes

export declare type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS';

export declare interface IBeforeAppAjaxSendConfig {
    setRequestHeader: TSetRequestHeader;
}

declare interface IRequestHeaderConfig {
    url: string;
    method: HttpMethod;
}

export declare type NavigationGuard<V extends VueInstance = VueInstance> = (to: Route, from: Route, next: (to?: RawLocation | false | ((vm: V) => any) | void) => void) => any;

export declare type RawLocation = string | Location;

export declare interface ReportBaseInfo {
    id: string;
    appID: string;
    appName?: string;
    userID?: string;
    networkInfo?: Record<string, any>;
    data: ReportData;
}

export declare interface ReportBehaviorData<T extends string = any> extends ReportData {
    type: 'behavior';
    subType: T;
    pageURL: string;
    extraData: Record<string, any>;
}

export declare interface ReportData {
    type: string;
    subType: string;
    pageURL: string;
    startTime?: number;
    extraData: Record<string, any>;
}

export declare interface ReportErrorData<T extends string = any> extends ReportData {
    type: 'error';
    subType: T;
    pageURL: string;
    startTime?: number;
    extraData: {
        type: string;
        errorUid: string;
        msg: string;
        meta: Record<string, any>;
        stackTrace: Record<'frames', string[]>;
    };
}

export declare interface ReportPerformanceData<T extends string = any> extends ReportData {
    type: 'performance';
    subType: T;
    pageURL: string;
    extraData: Record<string, any>;
}

export declare interface Route {
    path: string;
    name?: string;
    hash: string;
    query: any;
    params: any;
    fullPath: string;
    matched: any;
    redirectedFrom?: string;
    meta?: any;
}

export declare interface RouteChangeCollectType {
    from: string;
    to: string;
}

declare type TSetRequestHeader = (key: string, value: string) => {};

export declare interface ViewModel {
    [key: string]: any;
    $root?: Record<string, unknown>;
    $options?: {
        [key: string]: any;
        name?: string;
        propsData?: Record<any, any>;
        _componentTag?: string;
        __file?: string;
        props?: Record<any, any>;
    };
    $props?: Record<string, unknown>;
}

export declare interface VueConfiguration {
    silent?: boolean;
    errorHandler?(err: Error, vm: ViewModel | any, info: string): void;
    warnHandler?(msg: string, vm: ViewModel | any, trace: string): void;
    [key: string]: any;
}

export declare interface VueInstance {
    [key: string]: any;
    config?: VueConfiguration;
    version: string;
}

export declare interface VueRouter {
    needCalculateRenderTime?: boolean;
    beforeEach(guard: NavigationGuard): Function;
    beforeResolve(guard: NavigationGuard): Function;
    afterEach(hook: (to: Route, from: Route) => any): Function;
}

export { }
