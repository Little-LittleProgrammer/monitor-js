import { BrowserErrorTypes } from '@qmonitor/enums';
import { BasePluginType, ReportErrorData } from '@qmonitor/types';
import { get_error_uid, get_page_url, on, parse_stack_frames, _global } from '@qmonitor/utils';
import { BrowserClient } from '../../browser-client';

export interface ResourceErrorTarget {
    src?: string
    href?: string
    localName?: string
    outerHTML?: string
    tagName?: string
  }

const jsErrorPlugin: BasePluginType<BrowserErrorTypes, BrowserClient> = {
    name: BrowserErrorTypes.JE,
    monitor(notify) {
        on(_global, 'error', (e: ErrorEvent) => {
            // 阻止抛出控制台错误
            e.preventDefault();
            notify(BrowserErrorTypes.JE, e);
        }, true);
    },
    transform(errorEvent: ErrorEvent) {
        const _target = errorEvent.target as ResourceErrorTarget;
        if (_target.localName) {
            return get_resource_report_data(_target);
        }
        return get_js_report_data(errorEvent);
    },
    consumer(reportData: ReportErrorData) {
        this.report.send(reportData, true);
    }
};

function get_resource_report_data(target: ResourceErrorTarget):ReportErrorData {
    const _url = target.src || target.href;
    const _reportData: ReportErrorData = {
        type: 'error',
        subType: BrowserErrorTypes.RE,
        pageURL: get_page_url(),
        extraData: {
            type: BrowserErrorTypes.RE,
            errorUid: get_error_uid(`${BrowserErrorTypes.RE}-${target.src}-${target.tagName}`),
            msg: `资源地址` + _url,
            meta: {
                url: _url,
                html: target.outerHTML,
                type: target.tagName
            },
            stackTrace: undefined
        }
    };
    return _reportData;
}

function get_js_report_data(errorEvent: ErrorEvent):ReportErrorData {
    const _reportData: ReportErrorData = {
        type: 'error',
        subType: BrowserErrorTypes.JE,
        pageURL: get_page_url(),
        extraData: {
            type: (errorEvent.error && errorEvent.error.name) || 'UnKnown',
            errorUid: get_error_uid(`${BrowserErrorTypes.JE}-${errorEvent.message}-${errorEvent.filename}`),
            msg: (errorEvent as any).stack || errorEvent.message,
            meta: {
                // file 错误所处的文件地址
                file: errorEvent.filename,
                // col 错误列号
                col: errorEvent.colno,
                // row 错误行号
                row: errorEvent.lineno
            },
            stackTrace: {
                frames: parse_stack_frames(errorEvent.error)
            }
        }
    };
    return _reportData;
}

export default jsErrorPlugin;
