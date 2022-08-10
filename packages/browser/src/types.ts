import { BrowserBehaviorTypes, BrowserErrorTypes, BrowserPerformanceTypes } from '@qmonitor/enums';
import { BaseOptionsType, ReportPerformanceData as PerformanceData, ReportErrorData as ErrorData, ReportBehaviorData as BehaviorData } from '@qmonitor/types';

// web 性能数据
export type ReportPerformanceData = PerformanceData<BrowserPerformanceTypes>
// web 错误数据
export type ReportErrorData = ErrorData<BrowserErrorTypes>
// web 用户行为
export type ReportBehaviorData = BehaviorData<BrowserBehaviorTypes>

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
    // 按类型批量禁止
    disabledPerformance?: boolean; // 禁止所有performance监控
    disabledBehavior?: boolean; // 禁止所有Behavior监控
    disabledError?: boolean; // 禁止所有error监控

    // 单独禁止
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
    useImgUpload?:boolean // 是否使用图片上报
}

export type BrowserOptionsType = BaseOptionsType & BrowserOptionsHooksType & BrowserDisabledOptionsType
