import { BaseOptions } from '@qmonitor/core';
import { isFunction } from '@qmonitor/utils';
import { BrowserOptionsType } from './types';

export class BrowserOptions extends BaseOptions<BrowserOptionsType> {
    // 是否禁止监控 ConsoleError
    disabledConsoleError: boolean;
    // 是否禁止监控 JsError
    disabledJsError: boolean;
    // 是否禁止监控  PromiseError
    disabledPromiseError: boolean;
    // 是否禁止监控  PromiseError
    disabledResourceError: boolean;
    // 是否禁止监控  PromiseError
    disabledFirstPaint: boolean;
    // 是否禁止监控  PromiseError
    disabledFirstContentfulPaint: boolean;
    // 是否禁止监控  PromiseError
    disabledLargestContentfulPaint: boolean;
    // 是否禁止监控  PromiseError
    disabledFirstInputDelay: boolean;
    // 是否禁止监控  PromiseError
    disabledCumulativeLayoutShift: boolean;
    disabledNavigation: boolean;
    disabledResource: boolean;
    disabledXhr: boolean;
    disabledFetch: boolean;
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
            // 是否禁止监控 ConsoleError
            disabledConsoleError,
            // 是否禁止监控 JsError
            disabledJsError,
            // 是否禁止监控  PromiseError
            disabledPromiseError,
            // 是否禁止监控  PromiseError
            disabledResourceError,
            // 是否禁止监控  PromiseError
            disabledFirstPaint,
            // 是否禁止监控  PromiseError
            disabledFirstContentfulPaint,
            // 是否禁止监控  PromiseError
            disabledLargestContentfulPaint,
            // 是否禁止监控  PromiseError
            disabledFirstInputDelay,
            // 是否禁止监控  PromiseError
            disabledCumulativeLayoutShift,
            disabledNavigation,
            disabledResource,
            disabledXhr,
            disabledFetch,
            disabledFirstMeaningPaint,
            useImgUpload,
            configReportXhr
        } = options;
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
