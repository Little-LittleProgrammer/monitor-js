import { BasePluginType } from '@qmonitor/types';
import { BrowserClient } from '../../browser-client';
import { BrowserEventTypes, BrowserPerformanceTypes, MonitorClassTypes } from '@qmonitor/enums';
import { ReportPerformanceData } from '../../types';
import { get_page_url, _supportPerformance } from '@qmonitor/utils';

const fidPlugin: BasePluginType<BrowserPerformanceTypes, BrowserClient> = {
    name: BrowserPerformanceTypes.FID,
    type: MonitorClassTypes.performance,
    monitor(notify) {
        if (!_supportPerformance) return;
        function entry_handler(list: PerformanceObserverEntryList) {
            if (_observer) {
                _observer.disconnect();
            }
            for (const entry of list.getEntries()) {
                const _reportData:ReportPerformanceData = {
                    type: 'performance',
                    subType: BrowserPerformanceTypes.FID,
                    pageURL: get_page_url(),
                    mainData: {
                        ...entry.toJSON()
                    }
                };
                notify(BrowserPerformanceTypes.FID, _reportData);
            }
        }
        const _observer = new PerformanceObserver(entry_handler);
        _observer.observe({ type: BrowserEventTypes.FI, buffered: true });
    },
    transform(reportData:ReportPerformanceData) {
        return reportData;
    },
    consumer(reportData:ReportPerformanceData) {
        this.report.send(reportData);
    }
};

export default fidPlugin;
