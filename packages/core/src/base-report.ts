import { BaseOptionsType, ReportBaseInfo, ReportData} from '@qmonitor/types';
import { get_unique_id, get_uuid, isEmpty, isFunction, Queue } from '@qmonitor/utils';

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
    submitErrorUids: string[];
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

    // send -> sendToServer -> report
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
        return this.sendToServer(_reportData, this.url, isImmediate);
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

    /**
     * post方式，子类需要重写
     *
     * @abstract
     * @param {(TransportDataType | any)} data
     * @param {string} url
     * @memberof BaseReport
     */
    abstract post(data: ReportBaseInfo | any, url: string): void
    /**
     * 最终上报到服务器的方法，需要子类重写
     *
     * @abstract
     * @param {(TransportDataType | any)} data
     * @param {string} url
     * @memberof BaseReport
     */
    abstract sendToServer(data: ReportBaseInfo | any, url: string, isImmediate: boolean): void
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
