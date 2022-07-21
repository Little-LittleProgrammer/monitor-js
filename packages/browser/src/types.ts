import { BrowserPerformanceTypes } from '@qmonitor/enums';
import { BaseOptionsType, ReportData, ReportErrorData as ErrorData } from '@qmonitor/types';

// web 性能数据
export interface ReportPerformanceData extends ReportData {
    type: 'performance'; // 信息类型
    subType: BrowserPerformanceTypes// 信息副类型
    pageURL: string; // 上报页面
    extraData: Record<string, any>
}

export type ReportErrorData = ErrorData

export interface BrowserOptionsHooksType {
    /**
     * 钩子函数，配置发送到服务端的xhr
     * 可以对当前xhr实例做一些配置：xhr.setRequestHeader()、xhr.withCredentials
     *
     * @param {XMLHttpRequest} xhr XMLHttpRequest的实例
     * @param {*} reportData 上报的数据
     * @memberof BrowserOptionsHooksType
     */
    configReportXhr?(xhr: XMLHttpRequest, reportData: any): void
}

// 禁止类型
export interface BrowserDisabledOptionsType {
    disabledConsoleError?: boolean; // 是否禁止监控 控制台错误
    disabledJsError?: boolean; // 是否禁止监控 JsError
    disabledPromiseError?: boolean; // 是否禁止监控  PromiseError
    disabledResourceError?: boolean; // 是否禁止监控  资源加载错误
    disabledFirstPaint?: boolean; // 是否禁止监控 首次绘制
    disabledFirstContentfulPaint?: boolean; // 是否禁止监控 首次有效绘制
    disabledLargestContentfulPaint?: boolean; // 是否禁止监控 最大内容绘制
    disabledFirstInputDelay?: boolean; // 是否禁止监控  首次输入延迟
    disabledCumulativeLayoutShift?: boolean; // 是否禁止监控 绘画偏移分数
    disabledNavigation?: boolean; // 是否禁止监控 页面关键时间点
    disabledResource?: boolean; // 是否禁止监控 资源文件
    disabledFetch?: boolean; // 是否禁止监控 api
    disabledXhr?: boolean; // 是否禁止监控 api
    disabledFirstMeaningPaint? : boolean; // 是否禁止监控 首次有效绘制
}

export type BrowserOptionsType = BaseOptionsType & BrowserOptionsHooksType & BrowserDisabledOptionsType
