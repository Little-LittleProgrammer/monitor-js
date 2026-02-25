import { getFunctionName, nativeTryCatch } from '@qmonitor/utils';

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
    on(eventName: T, callBack: (data: any) => any) {
        const _fns = this.cache.get(eventName);
        if (_fns) {
            this.cache.set(eventName, _fns.concat(callBack));
            return;
        }
        this.cache.set(eventName, [callBack]);
    }
    // 消息发布
    emit<D>(eventName: T, data: D) {
        const _fns = this.cache.get(eventName);
        if (!eventName || !_fns) return;
        _fns.forEach((fn) => {
            nativeTryCatch(
                () => { fn(data); },
                (e: Error) => {
                    console.error(
                        `Subscribe.emit: 监听事件的回调函数发生错误\n
                        eventName:${eventName}\n
                        Name: ${getFunctionName(fn)}\n
                        Error: ${e}`
                    );
                });
        });
    }
}
