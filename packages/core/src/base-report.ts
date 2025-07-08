import { BrowserEventTypes, SDK_NAME, SDK_VERSION } from '@qmonitor/enums';
import { BaseOptionsType, ReportBaseInfo, ReportData} from '@qmonitor/types';
import { getTimestamp, getUniqueId, getUuid, isArray, isEmpty, isFunction, isNumber, Queue } from '@qmonitor/utils';
import { Breadcrumb } from './breadcrumb';

export abstract class BaseReport<
    Options extends BaseOptionsType = BaseOptionsType
> {
    url = '';
    appID = '';
    userID = '';
    appName = '';
    cacheNum = 50;
    beforeDataReport: Promise<ReportBaseInfo | null | undefined | boolean> | ReportBaseInfo | any | null | undefined | boolean = null;
    queue: Queue;
    breadcrumb: Breadcrumb;
    ignoreErrors: string[];
    resourceLimitSize: number;
    submitErrorUids: string[];
    environment: string;
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
            this.userID = getUuid();
        }
        if (options.beforeDataReport) {
            this.beforeDataReport = options.beforeDataReport;
        }
        this.breadcrumb = new Breadcrumb(options);
        this.ignoreErrors = options.ignoreErrors;
        this.resourceLimitSize = options.resourceLimitSize || 0;
        this.environment = options.environment;
    }

    // send -> sendTime -> report
    async send(data: ReportData, isImmediate = false):Promise<void> {
        // 如果包含uid, 代表是错误
        if (data.mainData && data.mainData.errorUid) {
            // 如果uid存在, 则不上报
            const _hasSubmitStatus = this.submitErrorUids.indexOf(data.mainData.errorUid);
            if (_hasSubmitStatus > -1) return;

            // 需要忽略的错误
            if (isArray(this.ignoreErrors) && this.ignoreErrors.length > 0) {
                for (const ingore of this.ignoreErrors) {
                    if (data.mainData.msg?.includes(ingore)) {
                        return;
                    }
                }
            }
            this.submitErrorUids.push(data.mainData.errorUid);
        }
        // 如果是资源类型
        if (data.type === 'performance' && data.subType === 'resource') {
            // 资源类型不到上报警戒大小, 则不上报
            if (isNumber(data.mainData.transferSize) && data.mainData.transferSize < this.resourceLimitSize) {
                return;
            }
        }
        let _reportData = { // 格式化上传数据
            ...this.formatReportData(data)
        };
        // _reportData = { // 自定义上传数据
        //     ...this.addOtherInfo(_reportData)
        // };
        if (isFunction(this.beforeDataReport)) {
            // 一次处理数据变成二次处理数据
            _reportData = await this.beforeDataReport(_reportData);
            if (!_reportData) return;
        }
        if (isEmpty(this.url)) {
            console.error('请设置上传 URL 地址');
            return;
        }
        return this.sendTime(_reportData, this.url, isImmediate);
    }
    /**
     * 添加基本信息
     * @param data 未处理数据 ReportData
     * @returns 一次处理数据 ReportBaseInfo
     */
    formatReportData(data: ReportData): ReportData {
        const _reportData = {
            time: getTimestamp(),
            ...data
        };
        if (data.type === BrowserEventTypes.ERROR) { // 如果类型是error, 上报用户行为栈, 以更好复现错误出现的操作
            _reportData.breadcrumbData = this.breadcrumb.getStack();
        }
        return _reportData;
    }
    /**
     * 添加基本信息
     * @param data 二次处理数据 ReportData
     * @returns 三次处理数据 ReportBaseInfo
     */
    addBaseInfo(data: ReportData | ReportData[]): ReportBaseInfo {
        const _data = data;
        const _reportData = {
            sdkVersion: SDK_VERSION,
            sdkName: SDK_NAME,
            id: getUniqueId(16),
            appID: this.appID,
            userID: this.userID,
            appName: this.appName,
            environment: this.environment,
            data: _data
        };
        return _reportData;
    }
    /**
     * 处理是否立即上传, 或缓存上传
     * @param data 二次处理数据
     * @param url 上报地址
     * @param isImmediate 是否立即上传
     * @returns void
     */
    sendTime(data: ReportData, url: string, isImmediate: boolean): void {
        if (isImmediate) {
            let _data = this.addBaseInfo(data);
            _data = this.addOtherInfo(_data);
            this.report(_data, url);
            return;
        }
        this.queue.addCache(data);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            const _data = this.queue.getCache();
            if (_data && _data.length >= this.cacheNum) {
                let _reportData = this.addBaseInfo(_data);
                _reportData = this.addOtherInfo(_reportData);
                this.report(_reportData, url);
                this.queue.clearCache();
            }
        }, 1000);
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
     * 自定义添加
     *
     * @abstract
     * @param {ReportDataType} data 三次处理数据
     * @return {TransportDataType}  {TransportDataType} 四次处理数据, 即最终上报数据
     * @memberof BaseReport
     */
    abstract addOtherInfo(data: ReportBaseInfo): ReportBaseInfo
}
