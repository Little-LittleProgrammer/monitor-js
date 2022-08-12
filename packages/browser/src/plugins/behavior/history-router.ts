import { BrowserClient } from '@qmonitor/browser';
import { BrowserBehaviorTypes, MonitorClassTypes } from '@qmonitor/enums';
import { BasePluginType, RouteChangeCollectType } from '@qmonitor/types';
import { get_page_url, _global } from '@qmonitor/utils';
import { ReportBehaviorData } from '../../types';
import { is_supports_history } from '../../utils';
import { route_transform, route_transformed_consumer } from './hash-route';

const historyRoutePlugin: BasePluginType<BrowserBehaviorTypes, BrowserClient> = {
    name: BrowserBehaviorTypes.HISTORYROUTE,
    type: MonitorClassTypes.behavior,
    monitor(notify) {
        let lastHref: string;
        if (!is_supports_history()) return;
        const _oldOnpopstate = _global.onpopstate;
        _global.onpopstate = function(this: WindowEventHandlers, ...args: any[]) {
            const to = get_page_url();
            const from = lastHref;
            lastHref = to;
            notify(BrowserBehaviorTypes.HISTORYROUTE, {
                from,
                to
            });
            _oldOnpopstate && _oldOnpopstate.apply(this, args);
        };
        function historyReplaceFn(originalHistoryFn) {
            return function(this: History, ...args: any[]): void {
                const url = args.length > 2 ? args[2] : undefined;
                if (url) {
                    const from = lastHref;
                    const to = String(url);
                    lastHref = to;
                    notify(BrowserBehaviorTypes.HISTORYROUTE, {
                        from,
                        to
                    });
                }
                return originalHistoryFn.apply(this, args);
            };
        }
        // 以下两个事件是人为调用，但是不触发onpopstate
        _global.history.pushState = historyReplaceFn(_global.history.pushState);
        _global.history.replaceState = historyReplaceFn(_global.history.replaceState);
    },
    transform(collectedData: RouteChangeCollectType) {
        return route_transform(collectedData, BrowserBehaviorTypes.HISTORYROUTE);
    },
    consumer(transformedData: ReportBehaviorData) {
        route_transformed_consumer.call(this, transformedData);
    }
};

export default historyRoutePlugin;
