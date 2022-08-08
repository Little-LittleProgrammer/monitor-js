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
    resourceErrorPlugin} from './plugins';
import { on_beforeunload, sampling, _global } from '@qmonitor/utils';
import { EventTypes } from '@qmonitor/enums';

function create_browser_instance(options:BrowserOptionsType = {}, plugins: BasePluginType[] = []) {
    const _browserClient = new BrowserClient(options);
    const _sample = _browserClient.getOptions().sample;
    let _browserPlugin:BasePluginType<EventTypes, BrowserClient>[] = [
        consoleErrorPlugin,
        jsErrorPlugin,
        resourceErrorPlugin,
        promiseErrorPlugin
    ];
    if (sampling(_sample)) { // 抽样上报
        _browserPlugin = [
            ..._browserPlugin,
            xhrPlugin,
            fetchPlugin,
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
                _browserClient.report.post(_data, _browserClient.report.url);
                _browserClient.report.queue.clear_cache();
            }
        };
        on_beforeunload(_global, _callback); // 当页面关闭前，将剩余所有数据进行上报
    }
    _browserClient.use([..._browserPlugin, ...plugins]);
    return _browserClient;
}

const init = create_browser_instance;
export {init, BrowserClient};
