import { BrowserBreadcrumbTypes, BrowserErrorTypes, BrowserEventTypes, MonitorClassTypes, SeverityLevel } from '@qmonitor/enums';
import { BasePluginType, ReportErrorData } from '@qmonitor/types';
import { get_error_uid, get_page_url, get_timestamp, on, parse_stack_frames, _global } from '@qmonitor/utils';
import { BrowserClient } from '../../browser-client';

export interface ResourceErrorTarget {
    src?: string
    href?: string
    localName?: string
    outerHTML?: string
    tagName?: string
  }

const promiseErrorPlugin: BasePluginType<BrowserErrorTypes, BrowserClient> = {
    name: BrowserErrorTypes.PE,
    type: MonitorClassTypes.error,
    monitor(notify) {
        on(_global, BrowserEventTypes.UNHANDLEDREJECTION, (e: PromiseRejectionEvent) => {
            notify(BrowserErrorTypes.PE, e);
        });
    },
    transform(errorEvent: PromiseRejectionEvent) {
        const _msg = errorEvent.reason.stack || errorEvent.reason.message || errorEvent.reason;
        const _type = errorEvent.reason.name || 'UnKnown';
        const _reportData: ReportErrorData = {
            type: 'error',
            subType: BrowserErrorTypes.PE,
            pageURL: get_page_url(),
            time: get_timestamp(),
            extraData: {
                type: _type,
                errorUid: get_error_uid(`${BrowserErrorTypes.PE}-${_msg}`),
                msg: _msg,
                meta: undefined,
                stackTrace: {
                    frames: parse_stack_frames(errorEvent.reason)
                }
            }
        };
        return _reportData;
    },
    consumer(reportData: ReportErrorData) {
        this.report.breadcrumb.push({
            type: BrowserBreadcrumbTypes.UNHANDLEDREJECTION,
            data: reportData.extraData,
            level: SeverityLevel.Error,
            time: reportData.time
        });
        this.report.send(reportData, true);
    }
};

export default promiseErrorPlugin;
