import { get_global, is_support_performance_observer } from '../src/global';

describe('util/global.ts', () => {
    it('get_global功能测试', () => {
        const _window = get_global();
        expect(_window).toBe(window);
    });
    it('is_support_performance_observer功能测试', () => {
        const _flag = is_support_performance_observer();
        expect(_flag).toBeFalsy();
    });
});
