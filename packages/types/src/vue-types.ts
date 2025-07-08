// vue 部分属性
export interface VueInstance {
    // fix in Vue3 typescript's declaration file error
    [key: string]: any
    config?: VueConfiguration
    // mixin(hooks: { [key: string]: () => void }): void
    version: string
}
export interface VueConfiguration {
    // for Vue2.x
    silent?: boolean

    errorHandler?(err: Error, vm: ViewModel | any, info: string): void
    warnHandler?(msg: string, vm: ViewModel | any, trace: string): void
    [key: string]: any
}
export interface ViewModel {
    [key: string]: any
    $root?: Record<string, unknown>
    $options?: {
        [key: string]: any
        name?: string
        // vue2.6
        propsData?: Record<any, any>
        _componentTag?: string
        __file?: string
        props?: Record<any, any>
    }
    $props?: Record<string, unknown>
}

// VueRouter interface

export type RawLocation = string | Location;

export type NavigationGuard<V extends VueInstance = VueInstance> = (
    to: Route,
    from: Route,
    next: (to?: RawLocation | false | ((vm: V) => any) | void) => void
  ) => any

export interface VueRouter {
    needCalculateRenderTime ?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    beforeEach (guard: NavigationGuard): Function;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    beforeResolve (guard: NavigationGuard): Function;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    afterEach (hook: (to: Route, from: Route) => any): Function;
}

export interface Route {
    path: string;
    name?: string;
    hash: string;
    query: any;
    params: any;
    fullPath: string;
    matched: any;
    redirectedFrom?: string;
    meta?: any;
  }
