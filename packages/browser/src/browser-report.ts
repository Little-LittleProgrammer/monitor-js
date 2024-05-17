import { BaseReport } from '@qmonitor/core';
import { ReportBaseInfo } from '@qmonitor/types';
import { isFunction, safeStringify, _global } from '@qmonitor/utils';
import { BrowserOptionsType } from './types';
import { getNetworkInfo, isSupportSendBeacon } from './utils';

export class BrowserReport extends BaseReport<BrowserOptionsType> {
    configReportXhr: unknown = null;
    useImgUpload = false;
    constructor(options:BrowserOptionsType) {
        super();
        super.bindOptions(options);
        this.bindOptions(options);
    }
    // xhr上报
    post(data: ReportBaseInfo | ReportBaseInfo[], url: string): void {
        const xhr = new XMLHttpRequest();
        xhr.open('post', url);
        xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        xhr.withCredentials = true;
        if (this.configReportXhr && isFunction(this.configReportXhr)) {
            this.configReportXhr(xhr, data);
        }
        xhr.send(safeStringify(data));
    }
    imgRequest(data: ReportBaseInfo | ReportBaseInfo[], url: string): void {
        let _img = new Image();
        const _spliceStr = url.indexOf('?') === -1 ? '?' : '&';
        _img.src = `${url}${_spliceStr}data=${encodeURIComponent(safeStringify(data))}`;
        _img = null;
    }
    // beacon上报
    beaconPost(data: ReportBaseInfo | ReportBaseInfo[], url: string): void {
        _global.navigator.sendBeacon.call(window.navigator, url, safeStringify(data));
    }
    report(data: ReportBaseInfo | ReportBaseInfo[], url: string) {
        let _fn = null;
        if (this.useImgUpload) {
            _fn = this.imgRequest;
        } else {
            _fn = isSupportSendBeacon() ? this.beaconPost : this.post;
        }
        if (_global.requestIdleCallback) { // 不阻止进程
            _global.requestIdleCallback(async() => {
                await _fn(data, url);
            });
        } else {
            setTimeout(async() => {
                await _fn(data, url);
            });
        }
    }
    addOtherInfo(data: ReportBaseInfo): ReportBaseInfo {
        return {
            ...data,
            networkInfo: getNetworkInfo()
        };
    }
    bindOptions(options: BrowserOptionsType): void {
        this.useImgUpload = options.useImgUpload || false;
        if (options.configReportXhr && isFunction(options.configReportXhr)) {
            this.configReportXhr = options.configReportXhr;
        }
    }
}

