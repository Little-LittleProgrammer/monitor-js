import {BrowserBehaviorTypes, BrowserErrorTypes, BrowserPerformanceTypes } from './browser';
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
