import { BrowserClient } from '@qmonitor/browser';
import { BrowserBehaviorTypes, BrowserEventTypes, MonitorClassTypes } from '@qmonitor/enums';
import { BasePluginType, RouteChangeCollectType } from '@qmonitor/types';
import { get_page_url, isExistProperty, on, _global } from '@qmonitor/utils';
import { ReportBehaviorData } from '../../types';

const hashRoutePlugin: BasePluginType<BrowserBehaviorTypes, BrowserClient> = {
    name: BrowserBehaviorTypes.HASHROUTE,
    type: MonitorClassTypes.behavior,
    monitor(notify) {
        if (!isExistProperty(_global, 'onpopstate')) {
            on(_global, BrowserEventTypes.HASHCHANGE, function(e: HashChangeEvent) {
                const { oldURL: from, newURL: to } = e;
                notify(BrowserBehaviorTypes.HASHROUTE, { from, to });
            });
        }
    },
    transform(collectedData: RouteChangeCollectType) {
        return route_transform(collectedData, BrowserBehaviorTypes.HASHROUTE);
    },
    consumer(transformedData: ReportBehaviorData) {
        route_transformed_consumer.call(this, transformedData);
    }
};

export function route_transform(collectedData: RouteChangeCollectType, type: BrowserBehaviorTypes) {
    const { from, to } = collectedData;
    const _reportData:ReportBehaviorData = {
        type: MonitorClassTypes.behavior,
        subType: type,
        pageURL: get_page_url(),
        extraData: {
            from,
            to
        }
    };
    return _reportData;
}

export function route_transformed_consumer(this: BrowserClient, transformedData: ReportBehaviorData) {
    if (transformedData.extraData.from === transformedData.extraData.to) return;
    this.report.send(transformedData);
}

export default hashRoutePlugin;
