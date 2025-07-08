import { ReportData } from '@qmonitor/types';
import { deepCopy } from './tools';
export class Queue<T = ReportData> {
    private stack: T[];
    constructor() {
        this.stack = [];
    }
    getCache() {
        return deepCopy(this.stack);
    }
    addCache(data: T) {
        this.stack.push(data);
    }
    clearCache() {
        this.stack = [];
    }
}
