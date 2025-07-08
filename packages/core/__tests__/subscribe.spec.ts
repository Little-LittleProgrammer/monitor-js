import { BrowserErrorTypes, MonitorTypes } from '@qmonitor/enums';
import { Subscribe } from '../src/subscribe';

describe('core/subscribe.ts', () => {
    it('should watch and notify work', () => {
        const _mockData = {
            msg: '测试subscribe'
        };
        const watchCallback = jest.fn((data) => {
            expect(data).toBe(_mockData);
        });
        const watchCallbackTwo = jest.fn((data) => {
            expect(data).toBe(_mockData);
        });
        const _subscribe = new Subscribe<MonitorTypes>();
        const _targetEvent = BrowserErrorTypes.CE;
        _subscribe.watch(_targetEvent, watchCallback);
        _subscribe.watch(_targetEvent, watchCallbackTwo);
        _subscribe.notify(_targetEvent, _mockData);
        expect(watchCallback.mock.calls.length).toBe(1); // 判断函数被调用了几次
        // first args
        expect(watchCallback.mock.calls[0][0]).toBe(_mockData);
        expect(watchCallbackTwo.mock.calls.length).toBe(1);
        expect(watchCallbackTwo.mock.calls[0][0]).toBe(_mockData);
        // can notify multiple times
        _subscribe.notify(_targetEvent, _mockData);
        expect(watchCallback.mock.calls.length).toBe(2);
        expect(watchCallbackTwo.mock.calls.length).toBe(2);
    });
});
