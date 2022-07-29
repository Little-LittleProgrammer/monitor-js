import { BaseReport } from '@qmonitor/core';
import { ReportBaseInfo } from '@qmonitor/types';
import { isFunction, safe_stringify, _global } from '@qmonitor/utils';
import { BrowserOptionsType } from './types';
import { get_network_info, is_support_send_beacon } from './utils';

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
        xhr.send(safe_stringify(data));
    }
    imgRequest(data: ReportBaseInfo | ReportBaseInfo[], url: string): void {
        let _img = new Image();
        const _spliceStr = url.indexOf('?') === -1 ? '?' : '&';
        _img.src = `${url}${_spliceStr}data=${encodeURIComponent(safe_stringify(data))}`;
        _img = null;
    }
    // beacon上报
    beaconPost(data: ReportBaseInfo | ReportBaseInfo[], url: string): void {
        _global.navigator.sendBeacon.call(window.navigator, url, safe_stringify(data));
    }
    report(data: ReportBaseInfo | ReportBaseInfo[], url: string) {
        let _fn = null;
        if (this.useImgUpload) {
            _fn = this.imgRequest;
        } else {
            _fn = is_support_send_beacon() ? this.beaconPost : this.post;
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
    getReportData(data: ReportBaseInfo): ReportBaseInfo {
        return {
            ...data,
            networkInfo: get_network_info()
        };
    }
    bindOptions(options: BrowserOptionsType): void {
        this.useImgUpload = options.useImgUpload || false;
        if (options.configReportXhr && isFunction(options.configReportXhr)) {
            this.configReportXhr = options.configReportXhr;
        }
    }
}

