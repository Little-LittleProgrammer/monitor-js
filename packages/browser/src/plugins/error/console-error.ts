import { BrowserBreadcrumbTypes, BrowserErrorTypes, MonitorClassTypes, SeverityLevel } from '@qmonitor/enums';
import { BasePluginType, ReportErrorData } from '@qmonitor/types';
import { getErrorUid, getPageUrl, getTimestamp, _global } from '@qmonitor/utils';
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
            type: MonitorClassTypes.error,
            subType: BrowserErrorTypes.CE,
            pageURL: getPageUrl(),
            time: getTimestamp(),
            mainData: {
                type: '',
                errorUid: getErrorUid(`console-error-${args[0]}`),
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
