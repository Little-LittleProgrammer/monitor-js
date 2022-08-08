export declare abstract class BaseClient<Options extends BaseOptionsType = BaseOptionsType, Event extends EventTypes = EventTypes> implements BaseClientType {
    SDK_NAME?: string;
    SDK_VERSION?: string;
    options: BaseOptionsType;
    abstract report: BaseReport;
    constructor(options: Options);
    use(plugins: BasePluginType<Event>[]): void;
    getOptions(): BaseOptionsType;
    abstract isPluginEnable(name: EventTypes): boolean;
    abstract isPluginsEnable(name: EventClassTypes): boolean;
    log(data: Partial<ReportData>, isImmediate?: boolean): void;
}

declare interface BaseClientType<O extends BaseOptionsType = BaseOptionsType> {
    /**
     *SDK名称
     *
     * @type {string}
     * @memberof BaseClientType
     * @static
     */
    SDK_NAME?: string
    /**
     *SDK版本
     *
     * @type {string}
     * @memberof BaseClientType
     */
    SDK_VERSION?: string

    /**
     *配置项和钩子函数
     *
     * @type {O}
     * @memberof BaseClientType
     */
    options: O

    /**
     *返回配置项和钩子函数
     *
     * @return {*}  {O}
     * @memberof BaseClientType
     */
    getOptions(): O
}

export declare class BaseOptions<Options extends BaseOptionsType = BaseOptionsType> {
    beforeAppAjaxSend: any;
    vue: {
        Vue?: VueInstance;
        router?: VueRouter;
    };
    sample: number;
    constructor();
    bindOptions(options: Options): void;
}

declare interface BaseOptionsFieldsType { // 基本属性
    url?: string; // 上报地址
    appID?: string; // 项目ID
    appName?: string; // 项目名称
    userID?: string; // 用户ID
    cacheNum?:number; // 缓存数据
    sample?: number; // 采样率
    vue?: {
        Vue?: VueInstance,
        router?: VueRouter
    }
}

declare interface BaseOptionsHooksType { // 自定义钩子
    /**
     * 钩子函数:在每次发送事件前会调用, 可自定义对请求参数进行设置
     *
     * @param {ReportBaseInfo} event 上报的数据格式
     * @return {*}  {(Promise<TransportDataType | null | CANCEL> | TransportDataType | any | CANCEL | null)} 如果返回 null | undefined | boolean 时，将忽略本次上传
     * @memberof BaseOptionsHooksType
     */
    beforeDataReport?(event: ReportBaseInfo):Promise<ReportBaseInfo | CANCEL> | ReportBaseInfo | any | CANCEL
    /**
     * 钩子函数:拦截用户页面的ajax请求，并在ajax请求发送前执行该hook，可以对用户发送的ajax请求做xhr.setRequestHeader
     *
     * @param {IRequestHeaderConfig} config 原本的请求头信息
     * @param {IBeforeAppAjaxSendConfig} setRequestHeader 设置请求头函数
     * @memberof BaseOptionsHooksType
     */
    beforeAppAjaxSend?(config: IRequestHeaderConfig, setRequestHeader: IBeforeAppAjaxSendConfig): void

}

declare type BaseOptionsType = BaseOptionsFieldsType & BaseOptionsHooksType

declare interface BasePluginType<T extends EventTypes = EventTypes, C extends BaseClientType = BaseClientType, Class extends EventClassTypes = EventClassTypes> {
    // 事件枚举
    name: T,
    type: Class,
    // 监控事件, 并在该事件中用notify通知订阅中心
    monitor: (this:C, notify:(eventName: T, data: any) => void) => void
    // 在monitor中触发数据并将数据传入当前函数，拿到数据做数据格式转换(会将tranform放入Subscrib的handers)
    transform?: (this: C, collectedData: any) => any
    // 拿到转换后的数据进行report等等操作
    consumer?: (this: C, transformedData: any) => void
}

export declare abstract class BaseReport<Options extends BaseOptionsType = BaseOptionsType> {
    url: string;
    appID: string;
    userID: string;
    appName: string;
    cacheNum: number;
    beforeDataReport: Promise<ReportBaseInfo | null | undefined | boolean> | ReportBaseInfo | any | null | undefined | boolean;
    queue: Queue;
    submitErrorUids: string[];
    timer: any;
    constructor();
    bindOptions(options: Options): void;
    send(data: ReportData, isImmediate?: boolean): Promise<void>;
    private formatReportData;
    sendTime(data: ReportBaseInfo, url: string, isImmediate: boolean): void;
    abstract post(data: ReportBaseInfo | any, url: string): void;
    abstract report(data: ReportBaseInfo | any, url: string): void;
    abstract getReportData(data: ReportBaseInfo): ReportBaseInfo;
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

declare type CANCEL = null | undefined | boolean

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

declare type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS'

declare interface IBeforeAppAjaxSendConfig {
    setRequestHeader: TSetRequestHeader
}

declare interface IRequestHeaderConfig {
    url: string
    method: HttpMethod
}

declare type NavigationGuard<V extends VueInstance = VueInstance> = (
to: Route,
from: Route,
next: (to?: RawLocation | false | ((vm: V) => any) | void) => void
) => any

declare class Queue {
    private stack: any[];
    constructor() {
        this.stack = [];
    }
    get_cache() {
        return deep_copy(this.stack);
    }
    add_cache(data: any) {
        this.stack.push(data);
    }
    clear_cache() {
        this.stack = [];
    }
}

declare type RawLocation = string | Location;

declare interface ReportBaseInfo {
    id: string; // uuid,
    appID: string; // 项目id
    appName?: string; // 项目名称
    userID?: string; // 用户ID
    networkInfo?:Record<string, any> // 网络信息
    data: ReportData
}

declare interface ReportData {
    type: string; // 信息类型
    subType: string// 信息副类型
    pageURL: string; // 上报页面
    startTime?: number; // 上报时间
    extraData: Record<string, any>
}

declare interface Route {
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

declare type TSetRequestHeader = (key: string, value: string) => {}

declare interface ViewModel {
    [key: string]: any
    $root?: Record<string, unknown>
    $options?: {
        [key: string]: any
        name?: string
        // vue2.6
        propsData?: Record<any, any>
        _componentTag?: string
        __file?: string
        props?: Record<any, any>
    }
    $props?: Record<string, unknown>
}

declare interface VueConfiguration {
    // for Vue2.x
    silent?: boolean

    errorHandler?(err: Error, vm: ViewModel | any, info: string): void
    warnHandler?(msg: string, vm: ViewModel | any, trace: string): void
    [key: string]: any
}

declare interface VueInstance {
    // fix in Vue3 typescript's declaration file error
    [key: string]: any
    config?: VueConfiguration
    // mixin(hooks: { [key: string]: () => void }): void
    version: string
}

declare interface VueRouter {
    needCalculateRenderTime ?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    beforeEach (guard: NavigationGuard): Function;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    beforeResolve (guard: NavigationGuard): Function;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    afterEach (hook: (to: Route, from: Route) => any): Function;
}

export { }
