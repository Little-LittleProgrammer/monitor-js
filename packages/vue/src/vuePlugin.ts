import { BrowserErrorTypes, MonitorClassTypes } from '@qmonitor/enums';
import { BasePluginType, ReportErrorData, ViewModel } from '@qmonitor/types';
import { BaseClient } from '@qmonitor/core';
import { getBigVersion, getErrorUid, getPageUrl, isString, parseStackFrames } from '@qmonitor/utils';
import { vue2_vm_handler, vue3_vm_handler } from './utils';

const vuePlugin: BasePluginType<BrowserErrorTypes, BaseClient, MonitorClassTypes> = {
    name: BrowserErrorTypes.VE,
    type: MonitorClassTypes.error,
    monitor(notify): void {
        const vue = this.options.vue;
        if (vue && vue.config) {
            const originErrorHandle = vue.config.errorHandler;
            vue.config.errorHandler = (err: Error, vm: ViewModel, info: string):void => {
                const _report: ReportErrorData = {
                    type: MonitorClassTypes.error,
                    subType: BrowserErrorTypes.VE,
                    pageURL: getPageUrl(),
                    mainData: {
                        type: err.name,
                        errorUid: getErrorUid(`${BrowserErrorTypes.VE}-${err.message}-${info}`),
                        msg: err.stack || err.message,
                        stackTrace: {
                            frames: parseStackFrames(err)
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
        if (vue && vue.config) {
            if (isString(vue?.version)) {
                switch (getBigVersion(vue.version)) {
                    case 2:
                        collectedData.mainData.meta = {
                            ...collectedData.mainData.meta,
                            ...vue2_vm_handler(vm) // 报错的Vue组件名
                        };
                        return collectedData;
                    case 3:
                        collectedData.mainData.meta = {
                            ...collectedData.mainData.meta,
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
