import { BaseOptionsType, BreadcrumbData } from '@qmonitor/types';
import { getTimestamp, isFunction, isNumber } from '@qmonitor/utils';

// 用户行为栈数据, 用于定位错误发生的操作
export class Breadcrumb< Options extends BaseOptionsType = BaseOptionsType> {
    private maxBreadcrumbs = 10;
    private beforePushBreadcrumb: unknown = null;
    private stack: BreadcrumbData[] = [];
    constructor(options:Options) {
        this.bindOptions(options);
    }
    /**
     * 添加用户行为栈
     *
     * @param {BreadcrumbData} data
     * @memberof Breadcrumb
     */
    push(data:BreadcrumbData) {
        if (isFunction(this.beforePushBreadcrumb)) {
            let result: BreadcrumbData = null;
            const beforePushBreadcrumb = this.beforePushBreadcrumb;
            result = beforePushBreadcrumb.call(this, data);
            if (!result) return this.stack;
            return this.immediatePush(result);
        }
        return this.immediatePush(data);
    }
    private immediatePush(data: BreadcrumbData): BreadcrumbData[] {
        data.time || (data.time = getTimestamp());
        if (this.stack.length >= this.maxBreadcrumbs) {
            this.shift();
        }
        this.stack.push(data);
        // make sure xhr fetch is behind button click
        this.stack.sort((a, b) => a.time - b.time);
        return this.stack;
    }
    private shift(): boolean {
        return this.stack.shift() !== undefined;
    }
    clear(): void {
        this.stack = [];
    }

    getStack(): BreadcrumbData[] {
        return this.stack;
    }
    bindOptions(options: Options) {
        const { maxBreadcrumbs, beforePushBreadcrumb } = options;
        if (maxBreadcrumbs && isNumber(maxBreadcrumbs)) {
            this.maxBreadcrumbs = maxBreadcrumbs;
        }
        if (beforePushBreadcrumb) {
            this.beforePushBreadcrumb = beforePushBreadcrumb;
        }
    }
}
