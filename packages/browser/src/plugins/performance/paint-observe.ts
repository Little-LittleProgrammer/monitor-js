import { BasePluginType } from '@qmonitor/types';
import { BrowserClient } from '../../browser-client';
import { BrowserEventTypes, BrowserPerformanceTypes, MonitorClassTypes } from '@qmonitor/enums';
import { ReportPerformanceData } from '../../types';
import { get_page_url, _supportPerformance } from '@qmonitor/utils';

const fpPlugin: BasePluginType<BrowserPerformanceTypes, BrowserClient> = {
    name: BrowserPerformanceTypes.FP,
    type: MonitorClassTypes.performance,
    monitor(notify) {
        if (!_supportPerformance) return;
        function entry_handler(list: PerformanceObserverEntryList) {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    _observer.disconnect();
                }
                const _reportData = {
                    type: MonitorClassTypes.performance,
                    subType: entry.name,
                    pageURL: get_page_url(),
                    mainData: {
                        ...entry.toJSON()
                    }
                };
                notify(BrowserPerformanceTypes.FP, _reportData);
            }
        }
        const _observer = new PerformanceObserver(entry_handler);
        _observer.observe({ type: BrowserEventTypes.PAINT, buffered: true });
    },
    transform(reportData:ReportPerformanceData) {
        return reportData;
    },
    consumer(reportData:ReportPerformanceData) {
        this.report.send(reportData);
    }
};

export default fpPlugin;
