import { getGlobal, isSupportPerformanceObserver } from '../src/global';

describe('util/global.ts', () => {
    it('get_global功能测试', () => {
        const _window = getGlobal();
        expect(_window).toBe(window);
    });
    it('is_support_performance_observer功能测试', () => {
        const _flag = isSupportPerformanceObserver();
        expect(_flag).toBeFalsy();
    });
});
