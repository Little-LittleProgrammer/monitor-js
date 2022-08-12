
import { BrowserEventTypes } from '@qmonitor/enums';
import { on, _global } from '@qmonitor/utils';
import { BrowserClient } from '../../src/index';
import hashRoutePlugin from '../../src/plugins/behavior/hash-route';
describe('hashRoutePlugin', () => {
    const browserInstance = new BrowserClient({
        url: 'http://test.com/upload'
    });
    hashRoutePlugin.monitor = jest.fn(hashRoutePlugin.monitor);
    hashRoutePlugin.transform = jest.fn(hashRoutePlugin.transform);
    hashRoutePlugin.consumer = jest.fn(hashRoutePlugin.consumer);
    delete _global.onpopstate;
    browserInstance.use([hashRoutePlugin]);
    it("hashRoutePlugin's 应该在 browserInstance 执行", (done) => {
        const to = '#/three';
        location.hash = to;
        on(_global, BrowserEventTypes.HASHCHANGE, function() {
            expect((hashRoutePlugin.monitor as jest.Mock).mock.calls.length).toBe(1);
            expect((hashRoutePlugin.transform as jest.Mock).mock.calls.length).toBe(1);
            expect((hashRoutePlugin.consumer as jest.Mock).mock.calls.length).toBe(1);
            const queue = browserInstance.report.queue.get_cache();
            expect(queue[0].type).toBe('behavior');
            expect(queue[0].extraData.to).toContain(to);
            done();
        });
    });
});

