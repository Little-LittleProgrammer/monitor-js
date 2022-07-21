import { BrowserErrorTypes } from '@qmonitor/enums';
import { BasePluginType, ReportErrorData, ViewModel } from '@qmonitor/types';
import { BaseClient } from '@qmonitor/core';
import { get_big_version, get_error_uid, get_page_url, isString, parse_stack_frames } from '@qmonitor/utils';
import { vue2_vm_handler, vue3_vm_handler } from './utils';

const vuePlugin: BasePluginType<BrowserErrorTypes, BaseClient> = {
    name: BrowserErrorTypes.VE,
    monitor(notify): void {
        const vue = this.options.vue;
        console.log(vue);
        if (vue && vue.Vue && vue.Vue.config) {
            const {Vue} = vue;
            const originErrorHandle = Vue.config.errorHandler;
            Vue.config.errorHandler = (err: Error, vm: ViewModel, info: string):void => {
                const _report: ReportErrorData = {
                    type: 'error',
                    subType: BrowserErrorTypes.VE,
                    pageURL: get_page_url(),
                    extraData: {
                        type: err.name,
                        errorUid: get_error_uid(`${BrowserErrorTypes.VE}-${err.message}-${info}`),
                        msg: err.stack || err.message,
                        stackTrace: {
                            frames: parse_stack_frames(err)
                        },
                        meta: {
                            info
                        }
                    }
                };
                notify(BrowserErrorTypes.VE, { _report, vm });
                return originErrorHandle?.(err, vm, info);
            };
        }
    },
    transform({ _report: collectedData, vm }: { _report: ReportErrorData; vm: ViewModel }) {
        const vue = this.options.vue;
        if (vue && vue.Vue && vue.Vue.config) {
            const {Vue} = vue;
            if (isString(Vue?.version)) {
                switch (get_big_version(Vue.version)) {
                    case 2:
                        collectedData.extraData.meta = {
                            ...collectedData.extraData.meta,
                            ...vue2_vm_handler(vm) // 报错的Vue组件名
                        };
                        return collectedData;
                    case 3:
                        collectedData.extraData.meta = {
                            ...collectedData.extraData.meta,
                            ...vue3_vm_handler(vm) // 报错的Vue组件名
                        };
                        return collectedData;
                    default:
                        return collectedData;
                }
            }
        }
    },
    consumer(data: ReportErrorData) {
        this.report.send(data, true);
    }
};

export default vuePlugin;
