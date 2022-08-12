import { ReportData } from '@qmonitor/types';
import { deep_copy } from './tools';
export class Queue<T = ReportData> {
    private stack: T[];
    constructor() {
        this.stack = [];
    }
    get_cache() {
        return deep_copy(this.stack);
    }
    add_cache(data: T) {
        this.stack.push(data);
    }
    clear_cache() {
        this.stack = [];
    }
}
