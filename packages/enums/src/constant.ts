import {BrowserErrorTypes, BrowserPerformanceTypes } from './browser';
/**
 * 所有重写事件类型整合
 * 以后扩展微信什么的
 */

export type EventTypes = BrowserErrorTypes | BrowserPerformanceTypes

export const enum EventClassTypes {
    performance= 'performance',
    error='error',
    behavior='behavior',
    custom='custom'
}
