import { BrowserClient } from '@qmonitor/browser';
import { BrowserBehaviorTypes, MonitorClassTypes } from '@qmonitor/enums';
import { BasePluginType, ReportBehaviorData } from '@qmonitor/types';
import { getPageUrl, _global } from '@qmonitor/utils';

const pvPlugin: BasePluginType<BrowserBehaviorTypes, BrowserClient> = {
    name: BrowserBehaviorTypes.PV,
    type: MonitorClassTypes.behavior,
    monitor(notify) {
        notify(BrowserBehaviorTypes.PV, '');
    },
    transform() {
        const _reportData:ReportBehaviorData = {
            type: MonitorClassTypes.behavior,
            subType: BrowserBehaviorTypes.PV,
            pageURL: getPageUrl(),
            mainData: {
            }
        };
        if ('document' in _global) {
            _reportData.mainData.referrer = document.referrer;
        }
        return _reportData;
    },
    consumer(reportData: ReportBehaviorData) {
        this.report.send(reportData);
    }
};

export default pvPlugin;
