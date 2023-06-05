import { BrowserBreadcrumbTypes, BrowserErrorTypes, MonitorClassTypes, SeverityLevel } from '@qmonitor/enums';
import { BasePluginType, ReportErrorData } from '@qmonitor/types';
import { get_error_uid, get_page_url, get_timestamp, _global } from '@qmonitor/utils';
import { BrowserClient } from '../../browser-client';

const consoleErrorPlugin: BasePluginType<BrowserErrorTypes, BrowserClient> = {
    name: BrowserErrorTypes.CE,
    type: MonitorClassTypes.error,
    monitor(notify) {
        (_global as unknown as Window & typeof globalThis).console.error = (...args: any[]) => {
            notify(BrowserErrorTypes.CE, args);
        };
    },
    transform(args: any[]) {
        const _reportData:ReportErrorData = {
            type: 'error',
            subType: BrowserErrorTypes.CE,
            pageURL: get_page_url(),
            time: get_timestamp(),
            mainData: {
                type: '',
                errorUid: get_error_uid(`console-error-${args[0]}`),
                msg: args.join(';'),
                meta: undefined,
                stackTrace: undefined
            }
        };
        return _reportData;
    },
    consumer(reportData: ReportErrorData) {
        this.report.breadcrumb.push({
            type: BrowserBreadcrumbTypes.CONSOLE,
            data: reportData.mainData,
            level: SeverityLevel.Error,
            time: reportData.time
        });
        this.report.send(reportData, true);
    }
};

export default consoleErrorPlugin;
