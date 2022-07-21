import { get_function_name, native_try_catch } from '@qmonitor/utils';

type MonitorCallback = (data: any) => void
/**
 * 发布订阅类
 *
 * @export
 * @class Subscribe
 * @template T 事件枚举
 */
export class Subscribe<T> {
    cache: Map<T, MonitorCallback[]>;
    constructor() {
        this.cache = new Map();
    }
    // 消息订阅
    watch(eventName: T, callBack: (data: any) => any) {
        const _fns = this.cache.get(eventName);
        if (_fns) {
            this.cache.set(eventName, _fns.concat(callBack));
            return;
        }
        this.cache.set(eventName, [callBack]);
    }
    // 消息发布
    notify<D>(eventName: T, data: D) {
        const _fns = this.cache.get(eventName);
        if (!eventName || !_fns) return;
        _fns.forEach((fn) => {
            native_try_catch(
                () => { fn(data); },
                (e: Error) => {
                    console.error(
                        `Subscribe.notify: 监听事件的回调函数发生错误\n
                        eventName:${eventName}\n
                        Name: ${get_function_name(fn)}\n
                        Error: ${e}`
                    );
                });
        });
    }
}
