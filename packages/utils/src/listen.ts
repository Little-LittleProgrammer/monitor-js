// 用到所有事件的名称
type TotalEventName = keyof GlobalEventHandlersEventMap | keyof XMLHttpRequestEventTargetEventMap | keyof WindowEventMap | 'visibilitychange'

/**
 * 绑定事件
 * @param target window | wx
 * @param eventName 事件名称
 * @param callback 回调方法
 * @param options 是否冒泡
 */
export function on(
    target: {addEventListener: Function},
    eventName:TotalEventName,
    callback: Function,
    options: boolean | unknown = false
):void {
    target.addEventListener(eventName, callback, options);
}

/**
 * 移除事件
 * @param target window | wx
 * @param eventName 事件名称
 * @param callback 回调方法
 * @param options 是否冒泡
 */
export function off(
    target: {removeEventListener: Function},
    eventName:TotalEventName,
    callback: Function,
    options: boolean | unknown = false
):void {
    target.removeEventListener(eventName, callback, options);
}

/**
 * 页面进入后台
 * @param {*} callback 回调方法
 * @param {*} once 是否只执行1次
 */
export function onHidden(target: {addEventListener: Function, removeEventListener: Function}, callback:Function, once = false):void {
    const hidden = (e: Event) => {
        if (e.type === 'pagehide' || document.visibilityState === 'hidden') {
            callback(e);
            if (once) {
                off(target, 'visibilitychange', hidden, true);
                off(target, 'pagehide', hidden, true);
            }
        }
    };
    on(target, 'visibilitychange', hidden, true);
    on(target, 'pagehide', hidden, true);
}

/**
 * 监听页面加载
 * @param {*} callback 执行的方法
 */
export function onLoad(target: {addEventListener: Function, removeEventListener: Function}, callback:Function) {
    if ((target as unknown as typeof Window) == Window && document.readyState === 'complete') {
        callback();
    } else {
        const onLoad = () => {
            callback();
            off(target, 'load', onLoad, true);
        };
        on(target, 'load', onLoad, true);
    }
}

// 页面关闭前
export function onBeforeunload(target: {addEventListener: Function, removeEventListener: Function}, callback: Function) {
    target.addEventListener('beforeunload', callback, true);
}
