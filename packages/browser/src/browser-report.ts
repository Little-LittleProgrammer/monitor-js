import { BaseReport } from '@qmonitor/core';
import { ReportBaseInfo } from '@qmonitor/types';
import { isFunction, safe_stringify, _global } from '@qmonitor/utils';
import { BrowserOptionsType } from './types';
import { get_network_info, is_support_send_beacon } from './utils';

export class BrowserReport extends BaseReport<BrowserOptionsType> {
    configReportXhr: unknown;
    timer = null;
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
        if (typeof this.configReportXhr === 'function') {
            this.configReportXhr(xhr, data);
        }
        xhr.send(safe_stringify(data));
    }
    // beacon上报
    beaconPost(data: ReportBaseInfo | ReportBaseInfo[], url: string): void {
        _global.navigator.sendBeacon.call(window.navigator, url, safe_stringify(data));
    }
    report(data: ReportBaseInfo | ReportBaseInfo[], url: string) {
        const _fn = is_support_send_beacon() ? this.beaconPost : this.post;
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
    sendToServer(data: ReportBaseInfo, url: string, isImmediate: boolean): void {
        if (isImmediate) {
            this.report(data, url);
            return;
        }
        this.queue.add_cache(data);
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            const _data = this.queue.get_cache();
            if (_data.length >= this.cacheNum) {
                this.report(_data, url);
                this.queue.clear_cache();
            }
        }, 3000);
        return;
    }
    getReportData(data: ReportBaseInfo): ReportBaseInfo {
        return {
            ...data,
            networkInfo: get_network_info()
        };
    }
    bindOptions(options: BrowserOptionsType): void {
        if (options.configReportXhr && isFunction(options.configReportXhr)) {
            this.configReportXhr = options.configReportXhr;
        }
    }
}

