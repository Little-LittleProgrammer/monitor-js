/// <reference types="wechat-miniprogram" />

export declare function decode(data: string): string;

export declare function deep_copy<T>(target: T): T;

export declare const defaultFunctionName = "<anonymous>";

export declare function encode(data: string): string;

export declare function first_str_to_uppercase(str: string): string;

export declare function format_string(str: string): string;

export declare function get_big_version(version: string): number;

export declare function get_error_uid(input: string): string;

export declare function get_function_name(fn: unknown): string;

export declare function get_global<T>(): T;

export declare function get_page_url(): string;

export declare function get_unique_id(len: number, radix?: number): string;

export declare function get_uuid(): string;

export declare const _global: Window & WechatMiniprogram.Wx;

export declare function hash_code(str: string): number;

export declare function html_element_to_string(target: HTMLElement): string;

export declare function is(val: unknown, type: string): boolean;

export declare function is_support_performance_observer(): boolean;

export declare function isArray(val: any): val is Array<any>;

export declare function isBoolean(val: unknown): val is boolean;

export declare const isClient: boolean;

export declare function isDate(val: unknown): val is Date;

export declare function isDef<T = unknown>(val?: T): val is T;

export declare function isElement(val: unknown): val is Element;

export declare function isEmpty<T = unknown>(val: T): val is T;

export declare function isFunction(val: unknown): val is Function;

export declare function isMap(val: unknown): val is Map<any, any>;

export declare function isNull(val: unknown): val is null;

export declare function isNullAndUnDef(val: unknown): val is null | undefined;

export declare function isNullOrUnDef(val: unknown): val is null | undefined;

export declare function isNumber(val: unknown): val is number;

export declare function isObject(val: any): val is Record<any, any>;

export declare function isPromise<T = any>(val: unknown): val is Promise<T>;

export declare function isRegExp(val: unknown): val is RegExp;

export declare const isServer: boolean;

export declare function isString(val: unknown): val is string;

export declare function isUnDef<T = unknown>(val?: T): val is T;

export declare function isWindow(val: any): val is Window;

export declare const isWx: boolean;

export declare function native_try_catch(fn: () => void, errorFn?: (err: any) => void): void;

export declare function off(target: {
    removeEventListener: Function;
}, eventName: TotalEventName, callback: Function, options?: boolean | unknown): void;

export declare function on(target: {
    addEventListener: Function;
}, eventName: TotalEventName, callback: Function, options?: boolean | unknown): void;

export declare function on_beforeunload(target: {
    addEventListener: Function;
    removeEventListener: Function;
}, callback: Function): void;

export declare function on_hidden(target: {
    addEventListener: Function;
    removeEventListener: Function;
}, callback: Function, once?: boolean): void;

export declare function on_load(target: {
    addEventListener: Function;
    removeEventListener: Function;
}, callback: Function): void;

export declare function parse_stack_frames(error: Error): any[];

export declare function parse_stack_line(line: string): {
    filename?: undefined;
    functionName?: undefined;
    lineno?: undefined;
    colno?: undefined;
} | {
    filename: string;
    functionName: string;
    lineno: number;
    colno: number;
};

export declare class Queue {
    private stack;
    constructor();
    get_cache(): any[];
    add_cache(data: any): void;
    clear_cache(): void;
}

export declare function safe_stringify(obj: object): string;

export declare function sampling(sample: number): boolean;

export declare const _supportPerformance: boolean;

export declare function throttle_event(fn: any, data: any): Promise<unknown>;

declare type TotalEventName = keyof GlobalEventHandlersEventMap | keyof XMLHttpRequestEventTargetEventMap | keyof WindowEventMap | 'visibilitychange';

export { }
