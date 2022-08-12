import { Queue } from '../src/queue';

describe('queue.ts', () => {
    it('queue正确执行', () => {
        const _queue = new Queue<string>();
        expect(_queue.get_cache().length).toBe(0);
        _queue.add_cache('测试数据1');
        _queue.add_cache('测试数据2');
        expect(_queue.get_cache().length).toBe(2);
        _queue.clear_cache();
        expect(_queue.get_cache().length).toBe(0);
    });
});
