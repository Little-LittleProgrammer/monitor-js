import { BasePluginType } from '@qmonitor/types';
import { BrowserClient } from './browser-client';
import { BrowserOptionsType } from './types';
import { consoleErrorPlugin,
    jsErrorPlugin,
    promiseErrorPlugin,
    xhrPlugin,
    fetchPlugin,
    clsPlugin,
    fidPlugin,
    fmpPlugin,
    fpPlugin,
    lcpPlugin,
    resourcePlugin,
    navigationPlugin,
    resourceErrorPlugin,
    clickPlugin,
    hashRoutePlugin,
    pvPlugin,
    historyRoutePlugin
} from './plugins';
import { on_beforeunload, sampling, _global } from '@qmonitor/utils';
import { MonitorTypes } from '@qmonitor/enums';

function create_browser_instance(options:BrowserOptionsType = {}, plugins: BasePluginType[] = []) {
    const _browserClient = new BrowserClient(options);
    const _sample = _browserClient.getOptions().sample;
    let _browserPlugin:BasePluginType<MonitorTypes, BrowserClient>[] = [
        consoleErrorPlugin,
        jsErrorPlugin,
        resourceErrorPlugin,
        promiseErrorPlugin,
        xhrPlugin,
        fetchPlugin,
        clickPlugin,
        hashRoutePlugin,
        pvPlugin,
        historyRoutePlugin
    ];
    if (sampling(_sample)) { // 抽样上报
        _browserPlugin = [
            ..._browserPlugin,
            clsPlugin,
            fidPlugin,
            fmpPlugin,
            fpPlugin,
            lcpPlugin,
            resourcePlugin,
            navigationPlugin
        ];
        const _callback = () => {
            const _data = _browserClient.report.queue.get_cache();
            if (_data && _data.length > 0) {
                let _reportData = _browserClient.report.addBaseInfo(_data);
                _reportData = _browserClient.report.addOtherInfo(_reportData);
                _browserClient.report.post(_reportData, _browserClient.report.url);
                _browserClient.report.queue.clear_cache();
            }
        };
        on_beforeunload(_global, _callback); // 当页面关闭前，将剩余所有数据进行上报
    }
    _browserClient.use([..._browserPlugin, ...plugins]);
    return _browserClient;
}

function create_browser_raw_instance(options:BrowserOptionsType = {}, plugins: Partial< Record<'imme' | 'sample', BasePluginType[]>>) {
    const _browserClient = new BrowserClient(options);
    const _sample = _browserClient.getOptions().sample;
    const immePlugin:BasePluginType<MonitorTypes, BrowserClient>[] = plugins.imme || [];
    let samplePlugin:BasePluginType<MonitorTypes, BrowserClient>[] = [];
    if (sampling(_sample) && plugins.sample?.length) { // 抽样上报
        samplePlugin = plugins.sample || [];
        const _callback = () => {
            const _data = _browserClient.report.queue.get_cache();
            if (_data && _data.length > 0) {
                let _reportData = _browserClient.report.addBaseInfo(_data);
                _reportData = _browserClient.report.addOtherInfo(_reportData);
                _browserClient.report.post(_reportData, _browserClient.report.url);
                _browserClient.report.queue.clear_cache();
            }
        };
        on_beforeunload(_global, _callback); // 当页面关闭前，将剩余所有数据进行上报
    }
    _browserClient.use([...immePlugin, ...samplePlugin]);
    return _browserClient;
}

const init = create_browser_instance;
const rawInit = create_browser_raw_instance;
export {init, BrowserClient, rawInit};
const errorPlugin = [
    consoleErrorPlugin,
    jsErrorPlugin,
    promiseErrorPlugin,
    xhrPlugin,
    fetchPlugin,
    resourceErrorPlugin
];
const perfrormancePlugin = [ clsPlugin,
    fidPlugin,
    fmpPlugin,
    fpPlugin,
    lcpPlugin,
    resourcePlugin,
    navigationPlugin ];
const behaviorPlugin = [
    clickPlugin,
    hashRoutePlugin,
    pvPlugin,
    historyRoutePlugin
];
export {
    consoleErrorPlugin,
    jsErrorPlugin,
    promiseErrorPlugin,
    xhrPlugin,
    fetchPlugin,
    clsPlugin,
    fidPlugin,
    fmpPlugin,
    fpPlugin,
    lcpPlugin,
    resourcePlugin,
    navigationPlugin,
    resourceErrorPlugin,
    clickPlugin,
    hashRoutePlugin,
    pvPlugin,
    historyRoutePlugin,
    errorPlugin,
    perfrormancePlugin,
    behaviorPlugin
};
