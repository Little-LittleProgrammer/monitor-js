import { BaseOptions } from '@qmonitor/core';
import { isFunction } from '@qmonitor/utils';
import { BrowserOptionsType } from './types';

export class BrowserOptions extends BaseOptions<BrowserOptionsType> {
    // 禁止所有performance监控
    disabledPerformance: boolean;
    // 禁止所有Behavior监控
    disabledBehavior: boolean;
    // 禁止所有error监控
    disabledError: boolean;
    // 禁止所有custom监控
    disabledCustom: boolean;

    // 单独禁止
    // 是否禁止监控 ConsoleError
    disabledConsoleError: boolean;
    // 是否禁止监控 JsError
    disabledJsError: boolean;
    // 是否禁止监控  PromiseError
    disabledPromiseError: boolean;
    // 是否禁止监控  资源加载错误
    disabledResourceError: boolean;
    // 是否禁止监控 首次绘制
    disabledFirstPaint: boolean;
    // 是否禁止监控 首次有效绘制
    disabledFirstContentfulPaint: boolean;
    // 是否禁止监控 最大内容绘制
    disabledLargestContentfulPaint: boolean;
    // 是否禁止监控  首次输入延迟
    disabledFirstInputDelay: boolean;
    // 是否禁止监控 绘画偏移分数
    disabledCumulativeLayoutShift: boolean;
    // 是否禁止监控 页面关键时间点
    disabledNavigation: boolean;
    // 是否禁止监控 资源文件
    disabledResource: boolean;
    // 是否禁止监控 api
    disabledXhr: boolean;
    // 是否禁止监控 api
    disabledFetch: boolean;
    // 是否禁止监控 首次有效绘制
    disabledFirstMeaningPaint: boolean;
    useImgUpload: boolean;
    configReportXhr: (xhr: XMLHttpRequest, reportData: any)=> void = null;
    constructor(options: BrowserOptionsType) {
        super();
        super.bindOptions(options);
        this.bindOptions(options);
    }
    bindOptions(options:BrowserOptionsType) {
        const {
            disabledPerformance,
            disabledBehavior,
            disabledError,
            disabledCustom,
            disabledConsoleError,
            disabledJsError,
            disabledPromiseError,
            disabledResourceError,
            disabledFirstPaint,
            disabledFirstContentfulPaint,
            disabledLargestContentfulPaint,
            disabledFirstInputDelay,
            disabledCumulativeLayoutShift,
            disabledNavigation,
            disabledResource,
            disabledXhr,
            disabledFetch,
            disabledFirstMeaningPaint,
            useImgUpload,
            configReportXhr
        } = options;

        this.disabledPerformance = disabledPerformance || false;
        this.disabledBehavior = disabledBehavior || false;
        this.disabledError = disabledError || false;
        this.disabledCustom = disabledCustom || false;

        this.disabledXhr = disabledXhr || false;
        this.disabledFetch = disabledFetch || false;
        this.disabledFirstMeaningPaint = disabledFirstMeaningPaint || false;
        this.disabledConsoleError = disabledConsoleError || false;
        this.disabledJsError = disabledJsError || false;
        this.disabledPromiseError = disabledPromiseError || false;
        this.disabledResourceError = disabledResourceError || false;
        this.disabledFirstPaint = disabledFirstPaint || false;
        this.disabledFirstContentfulPaint = disabledFirstContentfulPaint || false;
        this.disabledLargestContentfulPaint = disabledLargestContentfulPaint || false;
        this.disabledFirstInputDelay = disabledFirstInputDelay || false;
        this.disabledCumulativeLayoutShift = disabledCumulativeLayoutShift || false;
        this.disabledNavigation = disabledNavigation || false;
        this.disabledResource = disabledResource || false;
        this.useImgUpload = useImgUpload || false;
        if (configReportXhr && isFunction(configReportXhr)) {
            this.configReportXhr = configReportXhr;
        }
    }
}
