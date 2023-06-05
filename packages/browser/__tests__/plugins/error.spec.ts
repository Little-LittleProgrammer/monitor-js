import { BrowserClient } from '../../src/browser-client';
import { urlConfig } from '../config';
import {jsErrorPlugin, resourceErrorPlugin} from '../../src/plugins/error/js-error';
import { get_error_uid, parse_stack_frames } from '@qmonitor/utils';

describe('js-error', () => {
    const browserInstance = new BrowserClient({
        url: urlConfig
    });
    jsErrorPlugin.monitor = jest.fn(jsErrorPlugin.monitor);
    jsErrorPlugin.transform = jest.fn(jsErrorPlugin.transform);
    jsErrorPlugin.consumer = jest.fn(jsErrorPlugin.consumer);
    browserInstance.use([jsErrorPlugin]);
    it("errorPlugin's func should be called by browserClient", () => {
        expect((jsErrorPlugin.monitor as jest.Mock).mock.calls.length).toBe(1);
    });
    it('mock code error data to test jsErrorPlugin.transform and jsErrorPlugin.consumer', (done) => {
        const message = 'Uncaught TypeError: a.split is not a function';
        const name = 'TypeError';
        const error = new Error(message);
        error.name = name;
        error.stack = `TypeError: a.split is not a function\n
    at codeError (http://localhost:8084/JS/index.html:27:11)\n
    at HTMLButtonElement.onclick (http://localhost:8084/JS/index.html:13:48)`;
        const mockCodeErrorData = {
            type: 'error',
            subType: 'js-error',
            pageURL: 'http://localhost/',
            mainData: {
                type: 'TypeError',
                errorUid: get_error_uid(`js-error-${undefined}-${undefined}`),
                msg: undefined,
                meta: {
                    // file 错误所处的文件地址
                    file: undefined,
                    // col 错误列号
                    col: undefined,
                    // row 错误行号
                    row: undefined
                },
                stackTrace: {
                    frames: parse_stack_frames(error)
                }
            }
        };
        const transformedData = jsErrorPlugin.transform.call(browserInstance, {error});
        expect(transformedData.mainData.errorUid).toBe(mockCodeErrorData.mainData.errorUid); // 上报数据对比
        done();
        // jsErrorPlugin.consumer.call(browserInstance, transformedData);
    });
    it('mock resource load error data to test errorPlugin.transform and errorPlugin.consumer', (done) => {
        const src = 'https://files.catbox.moe/g1xhnsssh.jpg';
        const mockResourceErrorData = {
            target: {
                src
            } as unknown as HTMLElement
        };
        const transformedData = resourceErrorPlugin.transform.call(browserInstance, mockResourceErrorData);
        expect(transformedData.mainData.msg).toBe(`资源地址: ${src}`); // 上报数据对比
        done();
        // resourceErrorPlugin.consumer.call(browserInstance, transformedData);
    });
});
