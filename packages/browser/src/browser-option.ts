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
            useImgUpload,
            configReportXhr
        } = options;

        this.disabledPerformance = disabledPerformance || false;
        this.disabledBehavior = disabledBehavior || false;
        this.disabledError = disabledError || false;

        this.useImgUpload = useImgUpload || false;
        if (configReportXhr && isFunction(configReportXhr)) {
            this.configReportXhr = configReportXhr;
        }
    }
}
