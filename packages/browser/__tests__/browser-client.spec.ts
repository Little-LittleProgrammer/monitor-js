import { BrowserClient } from '../src/browser-client';
import { urlConfig } from './config';

describe('browserClient.ts', () => {
    const browserInstance = new BrowserClient({
        url: urlConfig,
        disabledFetch: true
    });
    it('browserClient should work', () => {
        // todo
        expect(browserInstance.report.url).toBe(urlConfig); // 校验report是否绑定
        expect(browserInstance.options.disabledFetch).toBe(true); // 校验options是否绑定
    });
});
