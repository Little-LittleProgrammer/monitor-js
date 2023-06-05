import { BasePluginType } from '@qmonitor/types';
import { BrowserClient } from '../../browser-client';
import { BrowserEventTypes, BrowserPerformanceTypes, MonitorClassTypes } from '@qmonitor/enums';
import { ReportPerformanceData } from '../../types';
import { get_page_url, _supportPerformance } from '@qmonitor/utils';

let _lcpFlag = false; // lcp性能监测是否完成, 用于 首屏渲染时间

export function is_lcp_done() {
    return _lcpFlag;
}

const lcpPlugin: BasePluginType<BrowserPerformanceTypes, BrowserClient> = {
    name: BrowserPerformanceTypes.LCP,
    type: MonitorClassTypes.performance,
    monitor(notify) {
        if (!_supportPerformance) {
            _lcpFlag = true;
            return;
        }
        function entry_handler(list:PerformanceObserverEntryList) {
            _lcpFlag = true;
            if (_observer) {
                _observer.disconnect();
            }
            for (const entry of list.getEntries()) {
                const _reportData:ReportPerformanceData = {
                    type: 'performance',
                    subType: BrowserPerformanceTypes.LCP,
                    pageURL: get_page_url(),
                    mainData: {
                        ...entry.toJSON()
                    }
                };
                notify(BrowserPerformanceTypes.LCP, _reportData);
            }
        }
        const _observer = new PerformanceObserver(entry_handler);
        _observer.observe({ type: BrowserEventTypes.LCP, buffered: true });
    },
    transform(reportData:ReportPerformanceData) {
        return reportData;
    },
    consumer(reportData:ReportPerformanceData) {
        this.report.send(reportData);
    }
};

export default lcpPlugin;
