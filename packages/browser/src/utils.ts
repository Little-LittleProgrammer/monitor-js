import { _global } from '@qmonitor/utils';

// 获取浏览器是否支持sendBeacon(同步请求不阻塞浏览器进程)
export function is_support_send_beacon():boolean {
    return !!(_global.navigator && window.navigator.sendBeacon);
}

export function get_network_info() {
    if (window.navigator.connection) {
        const _info = window.navigator.connection as any;
        return {
            effectiveType: _info.effectiveType, // 网络类型
            downlink: _info.downlink, // 下行速度
            rtt: _info.rtt, // 发送数据到接受数据的往返时间
            saveData: _info.saveData // 是否打开数据保护模式
        };
    }
    return null;
}
