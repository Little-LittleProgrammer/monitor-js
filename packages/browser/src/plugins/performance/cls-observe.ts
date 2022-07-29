import { BrowserPerformanceTypes, EventClassTypes } from '@qmonitor/enums';
import { BasePluginType } from '@qmonitor/types';
import { deep_copy, get_page_url, is_support_performance_observer, on_hidden, _global } from '@qmonitor/utils';
import { BrowserClient } from '../../browser-client';
import { ReportPerformanceData } from '../../types';

const clsPlugin: BasePluginType<BrowserPerformanceTypes, BrowserClient> = {
    name: BrowserPerformanceTypes.CLS,
    type: EventClassTypes.performance,
    monitor(notify) {
        if (!is_support_performance_observer()) return;
        let _sessionValue = 0;
        let _sessionEntries = [];
        const _reportData: ReportPerformanceData = {
            type: 'performance',
            subType: BrowserPerformanceTypes.CLS,
            pageURL: get_page_url(),
            extraData: {
                value: 0
            }
        };
        function entry_handle(list: PerformanceObserverEntryList) {
            // cls 不disconnect 是因为页面中的cls会更新
            for (const entry of list.getEntries()) {
                // 只记录最近用户没有输入行为的ls(layout shifts)
                const _entry = entry as PerformanceEntry & Record<'hadRecentInput' | 'value', any>;
                if (!_entry.hadRecentInput) {
                    const _firstSessionEntry = _sessionEntries[0];
                    const _lastSessionEntry = _sessionEntries[_sessionEntries.length - 1];
                    /*
                        如果该会话窗口与 前一个会话窗口的时间间隔小于1秒，
                        且与会话中的第一个会话窗口的时间间隔小于5秒，
                        则表示这些会话窗口为此会话窗口的偏移过程。否则，浏览器会计算为新的窗口
                        详细看 https://web.dev/evolving-cls/
                    */
                    if (_sessionValue &&
                            entry.startTime - _lastSessionEntry.startTime < 1000 &&
                            entry.startTime - _firstSessionEntry.startTime < 5000) {
                        _sessionValue += _entry.value;
                        _sessionEntries.push(format_cls_entry(entry));
                    } else {
                        _sessionValue = _entry.value;
                        _sessionEntries = [format_cls_entry(entry)];
                    }
                    // 如果当前会话值大于当前CLS值，则更新, 找出最大的cls
                    if (_sessionValue > _reportData.extraData.value) {
                        _reportData.extraData = {
                            entry: _entry,
                            value: _sessionValue,
                            entries: _sessionEntries
                        };
                    }
                }
            }
            notify(BrowserPerformanceTypes.CLS, deep_copy(_reportData));
        }
        const _observe = new PerformanceObserver(entry_handle);
        _observe.observe({ type: 'layout-shift', buffered: true });

        if (_observe) {
            on_hidden(_global, () => {
                _observe.takeRecords().map(entry_handle as any);
            });
        }
    },
    transform(reportData:ReportPerformanceData) {
        return reportData;
    },
    consumer(reportData:ReportPerformanceData) {
        this.report.send(reportData);
    }
};

function format_cls_entry(entry) {
    const _result = entry.toJSON();
    delete _result.duration;
    delete _result.sources;

    return _result;
}

export default clsPlugin;
