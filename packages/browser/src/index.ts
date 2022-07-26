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

function create_browser_instance(options:BrowserOptionsType = {}, plugins: BasePluginType[] = []) {
    const _browserClient = new BrowserClient(options);
    const _sample = _browserClient.getOptions().sample;
    if (sampling(_sample)) {
        const _browserPlugin = [
            consoleErrorPlugin,
            jsErrorPlugin,
            resourceErrorPlugin,
            promiseErrorPlugin,
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
        _browserClient.use([..._browserPlugin, ...plugins]);
        const _callback = () => {
            const _data = _browserClient.report.queue.get_cache();
            if (_data.length > 0) {
                _browserClient.report.post(_data, _browserClient.report.url);
                _browserClient.report.queue.clear_cache();
            }
        };
        on_beforeunload(_global, _callback); // 当页面关闭前，将剩余所有数据进行上报
        return _browserClient;
    }
    return;
}

const init = create_browser_instance;
export {init, BrowserClient};
