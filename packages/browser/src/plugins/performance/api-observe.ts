import { BrowserClient } from '../../browser-client';
import { BasePluginType, HttpMethod, IBeforeAppAjaxSendConfig } from '@qmonitor/types';
import { BrowserPerformanceTypes, MonitorClassTypes } from '@qmonitor/enums';
import { get_page_url, get_timestamp, off, on, _global } from '@qmonitor/utils';
import { ReportPerformanceData } from '../../types';

const fetchPlugin: BasePluginType<BrowserPerformanceTypes, BrowserClient> = {
    name: BrowserPerformanceTypes.FETCH,
    type: MonitorClassTypes.performance,
    monitor(notify) {
        monitor_fetch.call(this, notify);
    },
    transform(reportData:ReportPerformanceData) {
        return reportData;
    },
    consumer(reportData:ReportPerformanceData) {
        this.report.send(reportData);
    }
};
const originalFetch = _global.fetch;

function monitor_fetch(this:BrowserClient, notify: (eventName: BrowserPerformanceTypes, data: any) => void) {
    const { options } = this;
    if (!('fetch' in _global)) return;
    _global.fetch = (url: string, config: Partial<Request> = {}):Promise<Response> => {
        const startTime = get_timestamp();
        const method = ((config && config.method) || 'GET').toUpperCase();
        const _reportData: ReportPerformanceData = {
            type: 'performance',
            subType: BrowserPerformanceTypes.FETCH,
            pageURL: get_page_url(),
            extraData: {
                startTime,
                url,
                method,
                data: config.body
            }
        };
        const headers = new Headers(config.headers || {});
        Object.assign(headers, {
            setRequestHeader: headers.set
        });
        options.beforeAppAjaxSend && options.beforeAppAjaxSend({ url, method: (method as HttpMethod)}, headers as Headers & IBeforeAppAjaxSendConfig);
        return originalFetch(url, config).then(res => {
            const _data = res.clone();
            const _endTime = get_timestamp();
            _reportData.extraData = {
                ..._reportData.extraData,
                endTime: _endTime,
                duration: _endTime - _reportData.extraData.startTime,
                status: _data.status,
                success: _data.ok
            };
            _data.text().then(() => {
                notify(BrowserPerformanceTypes.FETCH, _reportData);
            });
            return res;
        }).catch((err) => {
            const _endTime = get_timestamp();
            _reportData.extraData = {
                ..._reportData.extraData,
                endTime: _endTime,
                duration: _endTime - _reportData.extraData.startTime,
                status: 0,
                success: false
            };
            notify(BrowserPerformanceTypes.FETCH, _reportData);
            throw err;
        });
    };
}

const xhrPlugin: BasePluginType<BrowserPerformanceTypes, BrowserClient> = {
    name: BrowserPerformanceTypes.XHR,
    type: MonitorClassTypes.performance,
    monitor(notify) {
        monitor_xhr.call(this, notify);
    },
    transform(reportData:ReportPerformanceData) {
        return reportData;
    },
    consumer(reportData:ReportPerformanceData) {
        this.report.send(reportData);
    }
};

function monitor_xhr(this:BrowserClient, notify: (eventName: BrowserPerformanceTypes, data: any) => void) {
    const { options } = this;
    if (!('XMLHttpRequest' in _global)) {
        return;
    }
    const _xhr = XMLHttpRequest.prototype;
    const _open = _xhr.open;
    const _send = _xhr.send;
    _xhr.open = function new_open(...args: any[]) {
        this.url = args[1]?.split('?')?.[0];
        this.method = args[0];
        _open.apply(this, args);
    };
    _xhr.send = function new_send(...args: any[]) {
        this.startTime = get_timestamp();

        options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method: this.method, url: this.url }, this);
        const onLoadend = () => {
            this.endTime = get_timestamp();
            this.duration = this.endTime - this.startTime;

            const { status, duration, startTime, endTime, url, method } = this;

            const _reportData: ReportPerformanceData = {
                type: 'performance',
                subType: BrowserPerformanceTypes.XHR,
                extraData: {
                    status,
                    duration,
                    startTime,
                    endTime,
                    url,
                    method: (method || 'GET').toUpperCase(),
                    success: status >= 200 && status < 300
                },
                pageURL: get_page_url()
            };
            notify(BrowserPerformanceTypes.XHR, _reportData);
            off(this, 'loadend', onLoadend, true);
        };
        on(this, 'loadend', onLoadend, true);
        _send.apply(this, args);
    };
}

export {
    fetchPlugin, xhrPlugin
};
