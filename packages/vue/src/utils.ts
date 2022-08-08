import { ViewModel } from '@qmonitor/types';

export function vue2_vm_handler(vm: ViewModel) {
    let componentName = '';
    if (vm.$root === vm) {
        componentName = 'root';
    } else {
        const name = vm._isVue ? (vm.$options && vm.$options.name) || (vm.$options && vm.$options._componentTag) : vm.name;
        componentName =
      (name ? 'component <' + name + '>' : 'anonymous component') +
      (vm._isVue && vm.$options && vm.$options.__file ? ' at ' + (vm.$options && vm.$options.__file) : '');
    }
    return {
        componentName
    };
}
export function vue3_vm_handler(vm: ViewModel) {
    let componentName = '';
    if (vm.$root === vm) {
        componentName = 'root';
    } else {
        const name = vm.$options && vm.$options.name;
        componentName = name ? 'component <' + name + '>' : 'anonymous component';
    }
    return {
        componentName
    };
}
