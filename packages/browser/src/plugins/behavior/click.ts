import { BrowserClient } from '@qmonitor/browser';
import { BrowserBehaviorTypes, BrowserBreadcrumbTypes, BrowserEventTypes, MonitorClassTypes, SeverityLevel } from '@qmonitor/enums';
import { BasePluginType } from '@qmonitor/types';
import { get_page_url, get_timestamp, html_element_to_string, on, throttle_event, _global } from '@qmonitor/utils';
import { ReportBehaviorData } from '../../types';

export interface DomCollectedType {
    // maybe will add doubleClick or other in the future
    category: 'click'
    data: Document,
    e: Event
  }

const clickPlugin: BasePluginType<BrowserBehaviorTypes, BrowserClient> = {
    name: BrowserBehaviorTypes.CLICK,
    type: MonitorClassTypes.behavior,
    monitor(notify) {
        if (!('document' in _global)) return;
        // 电脑端click
        on(_global.document, BrowserEventTypes.CLICK, function(e: Event) {
            const _this = this;
            throttle_event(notify, {
                args: [BrowserBehaviorTypes.CLICK, {
                    category: 'click',
                    data: _this,
                    e
                }]
            });
        }, true);
        // 移动端touch
        on(_global.document, BrowserEventTypes.TOUCHSTART, function(e: Event) {
            const _this = this;
            throttle_event(notify, {
                args: [BrowserBehaviorTypes.CLICK, {
                    category: 'click',
                    data: _this,
                    e
                }]
            });
        }, true);
    },
    transform(collectedData: DomCollectedType) {
        const { data, e } = collectedData;
        const _htmlString = html_element_to_string(data.activeElement as HTMLElement);
        if (_htmlString) { // 如果是body 则不上报
            const _reportData: ReportBehaviorData = {
                type: MonitorClassTypes.behavior,
                subType: BrowserBehaviorTypes.CLICK,
                pageURL: get_page_url(),
                time: get_timestamp(),
                mainData: {
                    startTime: e.timeStamp,
                    district: {
                    },
                    html: _htmlString
                }
            };
            const _area = (e.target as any).getBoundingClientRect();
            if (_area) {
                _reportData.mainData.district = {
                    top: _area.top,
                    left: _area.left
                };
            }
            return _reportData;
        }
        return null;
    },
    consumer(reportData: ReportBehaviorData) {
        if (reportData) {
            this.report.breadcrumb.push({
                type: BrowserBreadcrumbTypes.CLICK,
                data: reportData.mainData,
                level: SeverityLevel.Info,
                time: reportData.time
            });
            this.report.send(reportData);
        }
    }
};

export default clickPlugin;
