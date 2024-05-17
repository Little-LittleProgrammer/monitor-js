import { formatString, getFunctionName, getPageUrl } from '../src/tools';

describe('utils/tools.ts', () => {
    it('get_page_url测试', () => {
        expect(getPageUrl()).toBe('http://localhost/');
    });
    it('get_function_name测试', () => {
        function test1() {
            console.log('');
        }
        expect(getFunctionName(test1)).toBe('test1');
        expect(getFunctionName(test1)).toBe('test1');
        expect(getFunctionName({})).toBe('<anonymous>');
        expect(getFunctionName(null)).toBe('<anonymous>');
    });
    it('format_string测试', () => {
        const _a = 'aa-bb-cc-dd';
        expect(formatString(_a)).toBe('AaBbCcDd');
    });
});
