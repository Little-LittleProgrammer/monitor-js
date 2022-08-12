import { BrowserClient } from '@qmonitor/browser';
import { BrowserBehaviorTypes, MonitorClassTypes } from '@qmonitor/enums';
import { BasePluginType, ReportBehaviorData } from '@qmonitor/types';
import { get_page_url, _global } from '@qmonitor/utils';

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
            pageURL: get_page_url(),
            extraData: {
            }
        };
        if ('document' in _global) {
            _reportData.extraData.referrer = document.referrer;
        }
        return _reportData;
    },
    consumer(reportData: ReportBehaviorData) {
        this.report.send(reportData);
    }
};

export default pvPlugin;
