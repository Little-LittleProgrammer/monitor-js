import { BrowserClient } from '../src/browser-client';
import { urlConfig } from './config';

describe('browserClient.ts', () => {
    const browserInstance = new BrowserClient({
        url: urlConfig
    });
    it('browserClient should work', () => {
        // todo
        expect(browserInstance.report.url).toBe(urlConfig); // 校验report是否绑定
    });
});
