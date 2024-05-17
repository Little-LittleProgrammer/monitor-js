import { BasePluginType } from '@qmonitor/types';
import { BrowserClient } from '../../browser-client';
import { BrowserEventTypes, BrowserPerformanceTypes, MonitorClassTypes } from '@qmonitor/enums';
import { ReportPerformanceData } from '../../types';
import { getPageUrl, onLoad, _global, _supportPerformance } from '@qmonitor/utils';

interface SourceEntryType {
    responseEnd: number
    fetchStart: number
    domInteractive: number
    domContentLoadedEventEnd: number
    loadEventStart: number
    loadEventEnd: number
    responseStart: number
    domainLookupEnd: number
    domainLookupStart: number
    connectEnd: number
    connectStart: number
    secureConnectionStart: number
    requestStart: number
    initiatorType: string
    name: string
    transferSize: number
    nextHopProtocol: string
    encodedBodySize: number
    decodedBodySize: number
    redirectEnd: number
    redirectStart: number
    duration: number
    domComplete: number
}

const resourcePlugin: BasePluginType<BrowserPerformanceTypes, BrowserClient> = {
    name: BrowserPerformanceTypes.RF,
    type: MonitorClassTypes.performance,
    monitor(notify) {
        if (!_supportPerformance) return;
        onLoad(_global, () => observe_event.call(this, BrowserEventTypes.RF, notify));
    },
    transform(entry: SourceEntryType) {
        const _reportData: ReportPerformanceData = {
            type: MonitorClassTypes.performance,
            subType: BrowserPerformanceTypes.RF,
            mainData: {},
            pageURL: ''
        };
        _reportData.mainData = {
            name: entry.name.split('/')[entry.name.split('/').length - 1], // 资源名称
            sourceType: entry.initiatorType, // 资源类型
            ttfb: entry.responseStart, // 首字节时间
            transferSize: entry.transferSize, // 资源大小
            protocol: entry.nextHopProtocol, // 请求协议
            encodedBodySize: entry.encodedBodySize, // 资源解压前响应内容大小
            decodedBodySize: entry.decodedBodySize, // 资源解压后的大小
            resourceRatio: (entry.decodedBodySize / entry.encodedBodySize) || 1, // 资源压缩比
            isCache: is_cahce(entry), // 是否命中缓存
            startTime: performance.now(),
            // 关键时间段
            redirect: (entry.redirectEnd - entry.redirectStart), // 重定向耗时
            dns: (entry.domainLookupEnd - entry.domainLookupStart), // DNS 耗时
            tcp: (entry.connectEnd - entry.connectStart), // 建立 tcp 连接耗时
            request: (entry.responseStart - entry.requestStart), // 请求耗时
            response: (entry.responseEnd - entry.responseStart), // 响应耗时
            duration: entry.duration // 资源加载耗时
        };
        return _reportData;
    },
    consumer(reportData:ReportPerformanceData) {
        this.report.send(reportData);
    }
};

const navigationPlugin: BasePluginType<BrowserPerformanceTypes, BrowserClient> = {
    name: BrowserPerformanceTypes.NT,
    type: MonitorClassTypes.performance,
    monitor(notify) {
        if (!_supportPerformance) return;
        onLoad(_global, () => observe_event.call(this, BrowserEventTypes.NT, notify));
    },
    transform(entry: SourceEntryType) {
        const _reportData: ReportPerformanceData = {
            type: MonitorClassTypes.performance,
            subType: BrowserPerformanceTypes.NT,
            mainData: {},
            pageURL: ''
        };
        _reportData.pageURL = getPageUrl();
        /**
         *  DNS查询耗时 ： domainLookupEnd - domainLookupStart
            TCP链接耗时 ： connectEnd - connectStart
            SSL安全连接耗时:  connectEnd - secureConnectionStart
            request请求耗时 ： responseEnd - responseStart
            解析dom树耗时 ：  domComplete - domInteractive
            首次渲染时间/白屏时间 ：responseStart - startTime
            domready时间 ：domContentLoadedEventEnd - startTime
            onload时间(总下载时间) ：duration
         */
        _reportData.mainData = {
            tti: entry.domComplete - entry.fetchStart, // 首次可交互时间
            domReady: entry.domContentLoadedEventEnd - entry.fetchStart, // HTML加载完成时间
            load: entry.loadEventEnd - entry.fetchStart, // 页面完全加载时间
            firstByte: entry.responseStart - entry.domainLookupStart, // 首包时间
            // 关键时间段
            dns: entry.domainLookupEnd - entry.domainLookupStart, // DNS查询耗时
            tcp: entry.connectEnd - entry.connectStart, // TCP连接耗时
            ssl: entry.secureConnectionStart ? entry.connectEnd - entry.secureConnectionStart : 0, // SSL安全连接耗时
            ttfb: entry.responseStart - entry.requestStart, // 请求响应耗时
            trans: entry.responseEnd - entry.responseStart, // 内容传输耗时
            domParse: entry.domInteractive - entry.responseEnd, // DOM解析耗时
            res: entry.loadEventStart - entry.domContentLoadedEventEnd // 资源加载耗时
        };
        return _reportData;
    },
    consumer(reportData:ReportPerformanceData) {
        this.report.send(reportData);
    }
};

let _hasAlreadyCollected = false;
function observe_event(this:BrowserClient, entryType:BrowserPerformanceTypes, notify:(eventName: BrowserPerformanceTypes, data: any) => void) {
    function entry_handler(list:PerformanceObserverEntryList){
        for (const entry of list.getEntries()) {
            const _entry = entry as PerformanceEntry & Record<'nextHopProtocol' | 'initiatorType', any>;
            if (entryType === 'navigation') { // navigation只会存在一条
                if (_hasAlreadyCollected) return;
                if (_observe) {
                    _observe.disconnect();
                }
                _hasAlreadyCollected = true;
            }
            // nextHopProtocol 属性为空，说明资源解析错误或者跨域
            // beacon 用于上报数据，所以不统计。xhr fetch 单独统计
            if ((!_entry.nextHopProtocol && entryType !== 'navigation') || filter(_entry.initiatorType)) {
                return;
            }
            notify(entryType, _entry);
        }
    }
    const _observe = new PerformanceObserver(entry_handler);
    _observe.observe({ type: entryType, buffered: true });
}

// 不统计以下类型的资源
// fetch\beacon 表示请求
// xmlhttprequest 表示响应
const preventType = ['fetch', 'xmlhttprequest', 'beacon'];
const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
if (isSafari) {
    // safari 会把接口请求当成 other
    preventType.push('other');
}

function filter(type) {
    return preventType.includes(type);
}

function is_cahce(entry) {
    // 直接从缓存读取或 304
    return entry.transferSize === 0 || (entry.transferSize !== 0 && entry.encodedBodySize === 0);
}

export {
    navigationPlugin,
    resourcePlugin
};
