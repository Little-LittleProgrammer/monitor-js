/**
 * * 抽象客户端，已实现插件和钩子函数的定义
 * 如果目前的钩子函数满足不了业务，需要在use中额外添加钩子，并在各个端实现
 *
 * @export
 * @abstract
 * @class BaseClient
 * @implements { BaseClientType }
 * @template Options
 * @template Event
 */
declare abstract class BaseClient<
Options extends BaseOptionsType = BaseOptionsType,
Event extends EventTypes = EventTypes
> implements BaseClientType {
    SDK_NAME?: string;
    SDK_VERSION?: string;
    options: BaseOptionsType;
    abstract report: BaseReport
    constructor(options: Options) {
        this.options = options;
    }
    /**
     * 引用插件
     *
     * @param {BasePluginType<E>[]} plugins
     * @memberof BaseClient
     */
    use(plugins: BasePluginType<Event>[]) {
        // 新建发布订阅实例
        const subscribe = new Subscribe<Event>();
        plugins.forEach((item) => {
            if (!this.isPluginsEnable(item.type)) return;
            if (!this.isPluginEnable(item.name)) return;
            // 调用插件中的monitor并将发布函数传入 item.monitor(subscribe.notify)
            item.monitor.call(this, subscribe.notify.bind(subscribe));
            const wrapperTransform = (...args: any[]) => {
                // 先执行transform
                const res = item.transform?.apply(this, args);
                // 拿到transform返回的数据并传入
                item.consumer?.call(this, res);
                // 如果需要新增hook，可在这里添加逻辑
            };
            // 订阅插件中的名字，并传入回调函数
            subscribe.watch(item.name, wrapperTransform);
        });
    }
    getOptions() {
        return this.options;
    }
    /**
     * 判断当前插件是否启用，每个端的可选字段不同，需要子类实现
     *
     * @abstract
     * @param {EventTypes} name
     * @return {*}  {boolean}
     * @memberof BaseClient
     */
    abstract isPluginEnable(name: EventTypes): boolean
    /**
     * 判断此类插件是否启用,例如性能监控类, 错误收集类
     *
     * @abstract
     * @param {EventTypes} name
     * @return {*}  {boolean}
     * @memberof BaseClient
     */
    abstract isPluginsEnable(name: EventClassTypes): boolean
    /**
     * 手动上报方法, 可应用于自定义埋点事件
     * @param data
     */
    log(data: Partial<ReportData>, isImmediate = false): void {
        const _data = {...data};
        _data.startTime = Date.now();
        if (!_data.pageURL) {
            _data.pageURL = get_page_url();
        }
        this.report.send(data as ReportData, isImmediate);
    }
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

declare abstract class BaseReport<
Options extends BaseOptionsType = BaseOptionsType
> {
    url = '';
    appID = '';
    userID = '';
    appName = '';
    cacheNum = 50;
    beforeDataReport: Promise<ReportBaseInfo | null | undefined | boolean> | ReportBaseInfo | any | null | undefined | boolean = null;
    queue: Queue;
    submitErrorUids: string[];
    timer = null;
    constructor() {
        this.queue = new Queue(); // 缓存
        this.submitErrorUids = [];
    }
    /**
     * 绑定配置项
     * @param options 配置项
     */
    bindOptions(options: Options) {
        this.appID = options.appID;
        this.url = options.url;
        if (options.appName) this.appName = options.appName;
        if (options.cacheNum) this.cacheNum = options.cacheNum;
        if (options.userID) {
            this.userID = options.userID;
        } else {
            this.userID = get_uuid();
        }
    }

    // send -> sendTime -> report
    async send(data: ReportData, isImmediate = false):Promise<void> {
        // 如果包含uid
        if (data.extraData && data.extraData.errorUid) {
            // 如果uid存在, 则不上报
            const _hasSubmitStatus = this.submitErrorUids.indexOf(data.extraData.errorUid);
            if (_hasSubmitStatus > -1) return;
            this.submitErrorUids.push(data.extraData.errorUid);
        }
        let _reportData = { // 格式化上传数据
            ...this.formatReportData(data)
        };
        _reportData = { // 自定义上传数据
            ...this.getReportData(_reportData)
        };
        if (isFunction(this.beforeDataReport)) {
            _reportData = await this.beforeDataReport(_reportData);
            if (!_reportData) return;
        }
        if (isEmpty(this.url)) {
            console.error('请设置上传 URL 地址');
            return;
        }
        return this.sendTime(_reportData, this.url, isImmediate);
    }

    private formatReportData(data: ReportData): ReportBaseInfo {
        const _reportData = {
            id: get_unique_id(16),
            appID: this.appID,
            userID: this.userID,
            appName: this.appName,
            data
        };
        return _reportData;
    }
    // 处理是否立即上传, 或缓存上传
    sendTime(data: ReportBaseInfo, url: string, isImmediate: boolean): void {
        if (isImmediate) {
            this.report(data, url);
            return;
        }
        this.queue.add_cache(data);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            const _data = this.queue.get_cache();
            if (_data && _data.length >= this.cacheNum) {
                this.report(_data, url);
                this.queue.clear_cache();
            }
        }, 3000);
        return;
    }

    /**
     * post方式，子类需要重写
     * 不同端可能有不同上传方式
     *
     * @abstract
     * @param {(TransportDataType | any)} data
     * @param {string} url
     * @memberof BaseReport
     */
    abstract post(data: ReportBaseInfo | any, url: string): void
    /**
     * 最终上报到服务器的方法，需要子类重写
     * 为了, 不同端可能有多重上传方式
     * 例如浏览器端, 有beacon, xhr, image
     * 小程序端: 只有 wx.request
     *
     * @abstract
     * @param {(TransportDataType | any)} data
     * @param {string} url
     * @memberof BaseReport
     */
    abstract report(data: ReportBaseInfo | any, url: string): void
    /**
     * 获取上报的格式
     *
     * @abstract
     * @param {ReportDataType} data
     * @return {TransportDataType}  {TransportDataType}
     * @memberof BaseReport
     */
    abstract getReportData(data: ReportBaseInfo): ReportBaseInfo
}

declare const enum BrowserBehaviorTypes {
    click='click',
    pv='pv'
}

export declare class BrowserClient extends BaseClient<BrowserOptionsType, EventTypes> {
    report: BrowserReport;
    options: BrowserOptionsType;
    constructor(options: BrowserOptionsType);
    isPluginEnable(name: EventTypes): boolean;
    isPluginsEnable(type: EventClassTypes): boolean;
}

declare interface BrowserDisabledOptionsType {
    disabledPerformance?: boolean;
    disabledBehavior?: boolean;
    disabledError?: boolean;
    disabledCustom?: boolean;
    disabledConsoleError?: boolean;
    disabledJsError?: boolean;
    disabledPromiseError?: boolean;
    disabledResourceError?: boolean;
    disabledFirstPaint?: boolean;
    disabledFirstContentfulPaint?: boolean;
    disabledLargestContentfulPaint?: boolean;
    disabledFirstInputDelay?: boolean;
    disabledCumulativeLayoutShift?: boolean;
    disabledNavigation?: boolean;
    disabledResource?: boolean;
    disabledFetch?: boolean;
    disabledXhr?: boolean;
    disabledFirstMeaningPaint?: boolean;
    useImgUpload?: boolean;
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

declare interface BrowserOptionsHooksType {
    configReportXhr?(xhr: XMLHttpRequest, reportData: any): void;
}

declare type BrowserOptionsType = BaseOptionsType & BrowserOptionsHooksType & BrowserDisabledOptionsType;

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

declare class BrowserReport extends BaseReport<BrowserOptionsType> {
    configReportXhr: unknown;
    useImgUpload: boolean;
    constructor(options: BrowserOptionsType);
    post(data: ReportBaseInfo | ReportBaseInfo[], url: string): void;
    imgRequest(data: ReportBaseInfo | ReportBaseInfo[], url: string): void;
    beaconPost(data: ReportBaseInfo | ReportBaseInfo[], url: string): void;
    report(data: ReportBaseInfo | ReportBaseInfo[], url: string): void;
    getReportData(data: ReportBaseInfo): ReportBaseInfo;
    bindOptions(options: BrowserOptionsType): void;
}

declare type CANCEL = null | undefined | boolean

declare function create_browser_instance(options?: BrowserOptionsType, plugins?: BasePluginType[]): BrowserClient;

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

export declare const init: typeof create_browser_instance;

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
