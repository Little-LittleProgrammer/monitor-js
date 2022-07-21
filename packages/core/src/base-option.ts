import { BaseOptionsType, VueInstance, VueRouter } from '@qmonitor/types';
import { isFunction } from '@qmonitor/utils';

export class BaseOptions<Options extends BaseOptionsType = BaseOptionsType> {
    beforeAppAjaxSend = null;
    vue: {Vue?: VueInstance, router?: VueRouter} = null;
    sample = 100;
    constructor() {
    }
    bindOptions(options:Options) {
        if (options.sample) this.sample = options.sample;
        if (options.vue && Object.keys(options.vue).length > 0) {
            this.vue = options.vue;
        }
        if (options.beforeAppAjaxSend && isFunction(options.beforeAppAjaxSend)) {
            this.beforeAppAjaxSend = options.beforeAppAjaxSend;
        }
    }
}
