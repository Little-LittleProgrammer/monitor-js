import { BrowserClient } from '@qmonitor/browser';
import { BrowserBehaviorTypes, EventClassTypes } from '@qmonitor/enums';
import { BasePluginType } from '@qmonitor/types';
import { get_page_url, html_element_to_string, on, throttle_event, _global } from '@qmonitor/utils';
import { ReportBehaviorData } from '../../types';

const clickPlugin: BasePluginType<BrowserBehaviorTypes, BrowserClient> = {
    name: BrowserBehaviorTypes.click,
    type: EventClassTypes.behavior,
    monitor(notify) {
        if (!('document' in _global)) return;
        // 电脑端click
        on(_global.document, 'click', function(e: Event) {
            throttle_event(notify, {
                args: [BrowserBehaviorTypes.click, e]
            });
        }, true);
        // 移动端touch
        on(_global.document, 'touchstart', function(e: Event) {
            throttle_event(notify, {
                args: [BrowserBehaviorTypes.click, e]
            });
        }, true);
    },
    transform(e: Event) {
        const _htmlString = html_element_to_string(e.target as HTMLElement);
        const _area = (e.target as any)?.getBoundingClientRect();
        const _reportData: ReportBehaviorData = {
            type: 'behavior',
            subType: BrowserBehaviorTypes.click,
            pageURL: get_page_url(),
            extraData: {
                startTime: e.timeStamp,
                district: {
                    top: _area?.top,
                    left: _area?.left
                },
                html: _htmlString
            }
        };
        return _reportData;
    },
    consumer(reportData: ReportBehaviorData) {
        this.report.send(reportData);
    }
};

export default clickPlugin;
