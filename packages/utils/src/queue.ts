import { deep_copy } from './tools';
export class Queue {
    private stack: any[];
    constructor() {
        this.stack = [];
    }
    get_cache() {
        return deep_copy(this.stack);
    }
    add_cache(data: any) {
        this.stack.push(data);
    }
    clear_cache() {
        this.stack = [];
    }
}
