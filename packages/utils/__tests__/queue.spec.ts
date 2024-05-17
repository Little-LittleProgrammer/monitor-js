import { Queue } from '../src/queue';

describe('queue.ts', () => {
    it('queue正确执行', () => {
        const _queue = new Queue<string>();
        expect(_queue.getCache().length).toBe(0);
        _queue.addCache('测试数据1');
        _queue.addCache('测试数据2');
        expect(_queue.getCache().length).toBe(2);
        _queue.clearCache();
        expect(_queue.getCache().length).toBe(0);
    });
});
