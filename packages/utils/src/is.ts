const toString = Object.prototype.toString;

export function is(val: unknown, type: string) {
    return toString.call(val) === `[object ${type}]`;
}

export function isDef<T = unknown>(val?: T): val is T {
    return typeof val !== 'undefined';
}

export function isUnDef<T = unknown>(val?: T): val is T {
    return !isDef(val);
}

export function isObject(val: any): val is Record<any, any> {
    return val !== null && is(val, 'Object');
}

export function isEmpty<T = unknown>(val: T): val is T {
    if (isArray(val) || isString(val)) {
        return val.length === 0;
    }

    if (val instanceof Map || val instanceof Set) {
        return val.size === 0;
    }

    if (isObject(val)) {
        return Object.keys(val).length === 0;
    }

    return false;
}

export function isDate(val: unknown): val is Date {
    return is(val, 'Date');
}

export function isNull(val: unknown): val is null {
    return val === null;
}

export function isNullAndUnDef(val: unknown): val is null | undefined {
    return isUnDef(val) && isNull(val);
}

export function isNullOrUnDef(val: unknown): val is null | undefined {
    return isUnDef(val) || isNull(val);
}

export function isNumber(val: unknown): val is number {
    return is(val, 'Number');
}

export function isPromise<T = any>(val: unknown): val is Promise<T> {
    return is(val, 'Promise') && isObject(val) && isFunction(val.then) && isFunction(val.catch);
}

export function isString(val: unknown): val is string {
    return is(val, 'String');
}

export function isFunction(val: unknown): val is Function {
    return typeof val === 'function';
}

export function isBoolean(val: unknown): val is boolean {
    return is(val, 'Boolean');
}

export function isRegExp(val: unknown): val is RegExp {
    return is(val, 'RegExp');
}

export function isArray(val: any): val is Array<any> {
    return val && Array.isArray(val);
}

export function isElement(val: unknown): val is Element {
    return isObject(val) && !!val.tagName;
}

export function isMap(val: unknown): val is Map<any, any> {
    return is(val, 'Map');
}

export function isSet(val: unknown): val is Set<any> {
    return is(val, 'Set');
}

export function isSymbol(val: unknown): val is symbol {
    return is(val, 'Symbol');
}

// 是否是基本数据类型
export function isBase(val: unknown): boolean {
    // 可遍历的引用类型
    let _flag = !(isMap(val) || isSet(val) || isArray(val) || isObject(val));
    // 不可遍历的引用类型
    _flag = _flag && !(isSymbol(val) || isRegExp(val) || isFunction(val));

    return _flag;
}

export function isWindow(){
    return typeof window !== 'undefined';
}
export function isExistProperty(obj: Record<string, any>, key: string | number | symbol): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

export function isServer() {
    return typeof process !== 'undefined';
}

export function isWx() {
    return isObject(typeof wx !== 'undefined' ? wx : 0) && isFunction(typeof App !== 'undefined' ? App : 0);
}
export function isClient() {
    return !isServer();
}

