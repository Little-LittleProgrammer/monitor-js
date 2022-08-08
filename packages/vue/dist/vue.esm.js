/* @qmonitor/vue version: 2.2.5 
 author: Evan Wu */
import { get_page_url, get_error_uid, parse_stack_frames, isString, get_big_version } from '@qmonitor/utils';

function vue2_vm_handler(vm) {
    let componentName = '';
    if (vm.$root === vm) {
        componentName = 'root';
    }
    else {
        const name = vm._isVue ? (vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag) : vm.name;
        componentName =
            (name ? 'component <' + name + '>' : 'anonymous component') +
                (vm._isVue && vm.$options && vm.$options.__file ? ' at ' + (vm.$options && vm.$options.__file) : '');
    }
    return {
        componentName
    };
}
function vue3_vm_handler(vm) {
    let componentName = '';
    if (vm.$root === vm) {
        componentName = 'root';
    }
    else {
        const name = vm.$options && vm.$options.name;
        componentName = name ? 'component <' + name + '>' : 'anonymous component';
    }
    return {
        componentName
    };
}

const vuePlugin = {
    name: "vue-error",
    type: "error",
    monitor(notify) {
        const vue = this.options.vue;
        if (vue && vue.Vue && vue.Vue.config) {
            const { Vue } = vue;
            const originErrorHandle = Vue.config.errorHandler;
            Vue.config.errorHandler = (err, vm, info) => {
                const _report = {
                    type: 'error',
                    subType: "vue-error",
                    pageURL: get_page_url(),
                    extraData: {
                        type: err.name,
                        errorUid: get_error_uid(`${"vue-error"}-${err.message}-${info}`),
                        msg: err.stack || err.message,
                        stackTrace: {
                            frames: parse_stack_frames(err)
                        },
                        meta: {
                            info
                        }
                    }
                };
                notify("vue-error", { _report, vm });
                return originErrorHandle === null || originErrorHandle === void 0 ? void 0 : originErrorHandle(err, vm, info);
            };
        }
    },
    transform({ _report: collectedData, vm }) {
        const vue = this.options.vue;
        if (vue && vue.Vue && vue.Vue.config) {
            const { Vue } = vue;
            if (isString(Vue === null || Vue === void 0 ? void 0 : Vue.version)) {
                switch (get_big_version(Vue.version)) {
                    case 2:
                        collectedData.extraData.meta = Object.assign(Object.assign({}, collectedData.extraData.meta), vue2_vm_handler(vm));
                        return collectedData;
                    case 3:
                        collectedData.extraData.meta = Object.assign(Object.assign({}, collectedData.extraData.meta), vue3_vm_handler(vm));
                        return collectedData;
                    default:
                        return collectedData;
                }
            }
        }
    },
    consumer(data) {
        this.report.send(data, true);
    }
};

export { vuePlugin };
/* join us */
