import { isWx } from './is';
import { createLocalStorage, createWxStorage } from './storage';
import { deep_copy } from './tools';
export class Queue {
    private storage:any;
    constructor() {
        if (isWx) {
            this.storage = createWxStorage({
                hasEncrypt: true
            });
        } else {
            this.storage = createLocalStorage({
                hasEncrypt: true
            });
        }
    }
    get_cache() {
        return deep_copy(this.storage.get('qMonitorCache'));
    }
    add_cache(data: any) {
        const _data = this.storage.get('qMonitorCache') || [];
        _data.push(data);
        this.storage.set('qMonitorCache', _data);
    }
    clear_cache() {
        this.storage.remove('qMonitorCache');
    }
}
