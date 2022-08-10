import { BaseOptionsType, BaseClientType, BasePluginType, ReportData } from '@qmonitor/types';
import { MonitorClassTypes, MonitorTypes, SDK_NAME, SDK_VERSION } from '@qmonitor/enums';
import { BaseReport } from './base-report';
import { Subscribe } from './subscribe';
import { get_page_url, get_timestamp } from '@qmonitor/utils';

/**
 * * 抽象客户端，已实现插件和钩子函数的定义
 * 如果目前的钩子函数满足不了业务，需要在use中额外添加钩子，并在各个端实现
 *
 * @export
 * @abstract
 * @class BaseClient
 * @implements { BaseClientType }
 * @template Options
 * @template Event
 */
export abstract class BaseClient<
    Options extends BaseOptionsType = BaseOptionsType,
    Event extends MonitorTypes = MonitorTypes
> implements BaseClientType {
    SDK_NAME: string = SDK_NAME;
    SDK_VERSION: string = SDK_VERSION;
    options: BaseOptionsType;
    abstract report: BaseReport
    constructor(options: Options) {
        this.options = options;
    }
    /**
     * 引用插件
     *
     * @param {BasePluginType<E>[]} plugins
     * @memberof BaseClient
    */
    use(plugins: BasePluginType<Event>[]) {
        // 新建发布订阅实例
        const subscribe = new Subscribe<Event>();
        plugins.forEach((item) => {
            if (!this.isPluginsEnable(item.type)) return;
            if (!this.isPluginEnable(item.name)) return;
            // 调用插件中的monitor并将发布函数传入 item.monitor(subscribe.notify)
            item.monitor.call(this, subscribe.notify.bind(subscribe));
            const wrapperTransform = (...args: any[]) => {
                // 先执行transform
                const res = item.transform?.apply(this, args);
                // 拿到transform返回的数据并传入
                item.consumer?.call(this, res);
                // 如果需要新增hook，可在这里添加逻辑
            };
            // 订阅插件中的名字，并传入回调函数
            subscribe.watch(item.name, wrapperTransform);
        });
    }
    getOptions() {
        return this.options;
    }
    /**
     * 判断当前插件是否启用，每个端的可选字段不同，需要子类实现
     *
     * @abstract
     * @param {MonitorTypes} name
     * @return {*}  {boolean}
     * @memberof BaseClient
    */
    abstract isPluginEnable(name: MonitorTypes): boolean
    /**
     * 判断此类插件是否启用,例如性能监控类, 错误收集类
     *
     * @abstract
     * @param {MonitorTypes} name
     * @return {*}  {boolean}
     * @memberof BaseClient
    */
    abstract isPluginsEnable(name: MonitorClassTypes): boolean
    /**
     * 手动上报方法, 可应用于自定义埋点事件
     * @param data
     */
    log(data: Partial<ReportData>, isImmediate = false): void {
        const _data = {...data};
        if (!_data.pageURL) {
            _data.pageURL = get_page_url();
        }
        if (!_data.type) {
            _data.type = MonitorClassTypes.custom;
        }
        this.report.send(data as ReportData, isImmediate);
    }
}
