import {BrowserBehaviorTypes, BrowserBreadcrumbTypes, BrowserErrorTypes, BrowserPerformanceTypes } from './browser';
import { WxBreadcrumbTypes } from './wx';
/**
 * 所有重写事件类型整合
 * 以后扩展微信什么的
 */

export type MonitorTypes = BrowserErrorTypes | BrowserPerformanceTypes | BrowserBehaviorTypes

export const enum MonitorClassTypes {
    performance= 'performance',
    error='error',
    behavior='behavior',
    custom='custom'
}

export const enum HttpTypes {
    XHR = 'xhr',
    FETCH = 'fetch'
}

export const enum HttpCode {
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    INTERNAL_EXCEPTION = 500
}

/** 等级程度枚举 */
export enum SeverityLevel {
    Else = 'else',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
    Debug = 'debug',
    /** 上报的错误等级 */
    Low = 'low',
    Normal = 'normal',
    High = 'high',
    Critical = 'critical'
}

export const globalVar = {
    isLogAddBreadcrumb: true,
    crossOriginThreshold: 3000
};

export const enum BaseBreadcrumbTypes {
    VUE = 'Vue',
    REACT = 'React'
  }

/**
 * 用户行为栈事件类型
 */
export type BreadcrumbTypes = BrowserBreadcrumbTypes | WxBreadcrumbTypes | BaseBreadcrumbTypes

