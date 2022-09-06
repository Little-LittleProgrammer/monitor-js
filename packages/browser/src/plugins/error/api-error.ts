import { BrowserClient } from '../../browser-client';
import { BasePluginType, HttpMethod, IBeforeAppAjaxSendConfig, ReportApiErrorData } from '@qmonitor/types';
import { BrowserBreadcrumbTypes, BrowserErrorTypes, globalVar, HttpCode, HttpTypes, MonitorClassTypes, SeverityLevel } from '@qmonitor/enums';
import { from_http_status, get_error_uid, get_page_url, get_timestamp, isObject, isString, off, on, SpanStatus, _global } from '@qmonitor/utils';

const fetchPlugin: BasePluginType<BrowserErrorTypes, BrowserClient> = {
    name: BrowserErrorTypes.FETCH,
    type: MonitorClassTypes.error,
    monitor(notify) {
        monitor_fetch.call(this, notify);
    },
    transform(reportData:ReportApiErrorData) {
        return http_transformed_data(reportData);
    },
    consumer(reportData:ReportApiErrorData) {
        http_consumer_data.call(this, reportData);
    }
};
const originalFetch = _global.fetch;

function monitor_fetch(this:BrowserClient, notify: (eventName: BrowserErrorTypes, data: any) => void) {
    const { options } = this;
    if (!('fetch' in _global)) return;
    _global.fetch = (url: string, config: Partial<Request> = {}):Promise<Response> => {
        const startTime = get_timestamp();
        const method = ((config && config.method) || 'GET').toUpperCase();
        const _reportData: ReportApiErrorData = {
            type: 'error',
            subType: BrowserErrorTypes.FETCH as unknown as HttpTypes.FETCH,
            pageURL: get_page_url(),
            time: startTime,
            extraData: {
                errorUid: get_error_uid(`${BrowserErrorTypes.FETCH}-${url.split('?')[0]}`),
                request: {
                    method,
                    url,
                    data: config && config.body
                },
                response: {}
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
                duration: _endTime - startTime,
                response: {
                    status: _data.status
                }
            };
            _data.text().then((data) => {
                _reportData.extraData.response.data = data;
                notify(BrowserErrorTypes.FETCH, _reportData);
            });
            return res;
        }).catch((err) => {
            const _endTime = get_timestamp();
            _reportData.extraData = {
                ..._reportData.extraData,
                duration: _endTime - startTime,
                response: {
                    status: 0
                }
            };
            notify(BrowserErrorTypes.FETCH, _reportData);
            throw err;
        });
    };
}

const xhrPlugin: BasePluginType<BrowserErrorTypes, BrowserClient> = {
    name: BrowserErrorTypes.XHR,
    type: MonitorClassTypes.error,
    monitor(notify) {
        monitor_xhr.call(this, notify);
    },
    transform(reportData:ReportApiErrorData) {
        return http_transformed_data(reportData);
    },
    consumer(reportData:ReportApiErrorData) {
        http_consumer_data.call(this, reportData);
    }
};

function monitor_xhr(this:BrowserClient, notify: (eventName: BrowserErrorTypes, data: any) => void) {
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
        this.startTime = get_timestamp();
        this.httpCollect = {
            type: 'error',
            subType: BrowserErrorTypes.XHR as unknown as HttpTypes.XHR,
            pageURL: get_page_url(),
            time: this.startTime,
            extraData: {
                request: {
                    method: isString(args[0]) ? args[0].toUpperCase() : args[0],
                    url: args[1]
                },
                response: {}
            }
        } as ReportApiErrorData;
        _open.apply(this, args);
    };
    _xhr.send = function new_send(...args: any[]) {
        options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method: this.method, url: this.url }, this);
        const onLoadend = () => {
            this.endTime = get_timestamp();
            this.duration = this.endTime - this.startTime;

            const { status, duration, response } = this;
            this.httpCollect.extraData.response = {
                status,
                data: isObject(response) ? JSON.stringify(response) : response
            };
            this.httpCollect.extraData.duration = duration;
            notify(BrowserErrorTypes.XHR, this.httpCollect);
            off(this, 'loadend', onLoadend, true);
        };
        on(this, 'loadend', onLoadend, true);
        _send.apply(this, args);
    };
}

function http_transformed_data(httpCollectedData: ReportApiErrorData): ReportApiErrorData {
    let message = '';
    const {
        request: { url },
        response: { status },
        duration
    } = httpCollectedData.extraData;
    if (status === 0) {
        message = duration <= globalVar.crossOriginThreshold ? 'http请求失败，失败原因：跨域限制或域名不存在' : 'http请求失败，失败原因：超时';
    } else {
        message = from_http_status(status);
    }
    message = message === SpanStatus.Ok ? message : `${message}: ${url}`;
    httpCollectedData.extraData.msg = message;
    return httpCollectedData;
}

function http_consumer_data(this:BrowserClient, httpCollectedData: ReportApiErrorData) {
    const type = httpCollectedData.subType === HttpTypes.FETCH ? BrowserBreadcrumbTypes.FETCH : BrowserBreadcrumbTypes.XHR;
    const {
        extraData: {response: { status }},
        time
    } = httpCollectedData;
    const isError = status === 0 || status === HttpCode.BAD_REQUEST || status > HttpCode.UNAUTHORIZED;
    this.report.breadcrumb.push({
        type,
        data: httpCollectedData.extraData,
        level: SeverityLevel.Info,
        time
    });
    if (isError) {
        this.report.breadcrumb.push({
            type,
            data: httpCollectedData.extraData,
            level: SeverityLevel.Error,
            time
        });
        const {extraData: {request: {url}}} = httpCollectedData;
        httpCollectedData.extraData.errorUid = get_error_uid(`${BrowserErrorTypes.XHR}-${url.split('?')[0]}`);
        this.report.send(httpCollectedData, true);
    }
}

export {
    fetchPlugin, xhrPlugin
};
