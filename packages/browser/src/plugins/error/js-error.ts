import { BrowserBreadcrumbTypes, BrowserErrorTypes, BrowserEventTypes, MonitorClassTypes, SeverityLevel } from '@qmonitor/enums';
import { BasePluginType, ReportErrorData } from '@qmonitor/types';
import { getErrorUid, getPageUrl, getTimestamp, on, parseStackFrames, _global, deepCopy } from '@qmonitor/utils';
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
    type: MonitorClassTypes.error,
    monitor(notify) {
        on(_global, BrowserEventTypes.ERROR, (e: ErrorEvent) => {
            const _target = e.target as ResourceErrorTarget;
            if (_target.localName) { // 代表是资源错误
                return;
            }
            // 阻止抛出控制台错误
            e.preventDefault();
            notify(BrowserErrorTypes.JE, e);
        }, true);
    },
    transform(errorEvent: ErrorEvent) {
        return get_js_report_data(errorEvent);
    },
    consumer(reportData: ReportErrorData) {
        this.report.breadcrumb.push({
            type: BrowserBreadcrumbTypes.CODE_ERROR,
            data: deepCopy(reportData.mainData),
            level: SeverityLevel.Error,
            time: reportData.time
        });
        this.report.send(reportData, true);
    }
};

const resourceErrorPlugin: BasePluginType<BrowserErrorTypes, BrowserClient, MonitorClassTypes> = {
    name: BrowserErrorTypes.RE,
    type: MonitorClassTypes.error,
    monitor(notify) {
        on(_global, BrowserEventTypes.ERROR, (e: ErrorEvent) => {
            const _target = e.target as ResourceErrorTarget;
            if (!_target.localName) { // 如果是js错误返回
                return;
            }
            // 阻止抛出控制台错误
            e.preventDefault();
            notify(BrowserErrorTypes.RE, e);
        }, true);
    },
    transform(errorEvent: ErrorEvent) {
        const _target = errorEvent.target as ResourceErrorTarget;
        return get_resource_report_data(_target);
    },
    consumer(reportData: ReportErrorData) {
        this.report.breadcrumb.push({
            type: BrowserBreadcrumbTypes.RESOURCE,
            data: reportData.mainData,
            level: SeverityLevel.Error,
            time: reportData.time
        });
        this.report.send(reportData, true);
    }
};

function get_resource_report_data(target: ResourceErrorTarget):ReportErrorData {
    const _url = target.src || target.href;
    const _reportData: ReportErrorData = {
        type: MonitorClassTypes.error,
        subType: BrowserErrorTypes.RE,
        pageURL: getPageUrl(),
        time: getTimestamp(),
        mainData: {
            type: BrowserErrorTypes.RE,
            errorUid: getErrorUid(`${BrowserErrorTypes.RE}-${target.src}-${target.tagName}`),
            msg: `资源地址: ` + _url,
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
        type: MonitorClassTypes.error,
        subType: BrowserErrorTypes.JE,
        pageURL: getPageUrl(),
        time: getTimestamp(),
        mainData: {
            type: (errorEvent.error && errorEvent.error.name) || 'UnKnown',
            errorUid: getErrorUid(`${BrowserErrorTypes.JE}-${errorEvent.message}-${errorEvent.filename}`),
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
                frames: parseStackFrames(errorEvent.error)
            }
        }
    };
    return _reportData;
}

export {jsErrorPlugin, resourceErrorPlugin};
