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
import { onBeforeunload, sampling, _global } from '@qmonitor/utils';
import { MonitorTypes } from '@qmonitor/enums';

function createBrowserInstance(options:BrowserOptionsType = {}, plugins: BasePluginType[] = []) {
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
            const _data = _browserClient.report.queue.getCache();
            if (_data && _data.length > 0) {
                let _reportData = _browserClient.report.addBaseInfo(_data);
                _reportData = _browserClient.report.addOtherInfo(_reportData);
                _browserClient.report.post(_reportData, _browserClient.report.url);
                _browserClient.report.queue.clearCache();
            }
        };
        onBeforeunload(_global, _callback); // 当页面关闭前，将剩余所有数据进行上报
    }
    _browserClient.use([..._browserPlugin, ...plugins]);
    return _browserClient;
}

function createBrowserRawInstance(options:BrowserOptionsType = {}, plugins: Partial< Record<'imme' | 'sample', BasePluginType[]>>) {
    const _browserClient = new BrowserClient(options);
    const _sample = _browserClient.getOptions().sample;
    const immePlugin:BasePluginType<MonitorTypes, BrowserClient>[] = plugins.imme || [];
    let samplePlugin:BasePluginType<MonitorTypes, BrowserClient>[] = [];
    if (sampling(_sample) && plugins.sample?.length) { // 抽样上报
        samplePlugin = plugins.sample || [];
        const _callback = () => {
            const _data = _browserClient.report.queue.getCache();
            if (_data && _data.length > 0) {
                let _reportData = _browserClient.report.addBaseInfo(_data);
                _reportData = _browserClient.report.addOtherInfo(_reportData);
                _browserClient.report.post(_reportData, _browserClient.report.url);
                _browserClient.report.queue.clearCache();
            }
        };
        onBeforeunload(_global, _callback); // 当页面关闭前，将剩余所有数据进行上报
    }
    _browserClient.use([...immePlugin, ...samplePlugin]);
    return _browserClient;
}

const init = createBrowserInstance;
const rawInit = createBrowserRawInstance;
export {init, BrowserClient, rawInit};
const errorPlugins = [
    consoleErrorPlugin,
    jsErrorPlugin,
    promiseErrorPlugin,
    xhrPlugin,
    fetchPlugin,
    resourceErrorPlugin
];
const perfrormancePlugins = [ clsPlugin,
    fidPlugin,
    fmpPlugin,
    fpPlugin,
    lcpPlugin,
    resourcePlugin,
    navigationPlugin ];
const behaviorPlugins = [
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
    errorPlugins,
    perfrormancePlugins,
    behaviorPlugins
};
