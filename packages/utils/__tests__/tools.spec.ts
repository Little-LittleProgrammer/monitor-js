import { format_string, get_function_name, get_page_url } from '../src/tools';

describe('utils/tools.ts', () => {
    it('get_page_url测试', () => {
        expect(get_page_url()).toBe('http://localhost/');
    });
    it('get_function_name测试', () => {
        function test1() {
            console.log('');
        }
        expect(get_function_name(test1)).toBe('test1');
        expect(get_function_name(test1)).toBe('test1');
        expect(get_function_name({})).toBe('<anonymous>');
        expect(get_function_name(null)).toBe('<anonymous>');
    });
    it('format_string测试', () => {
        const _a = 'aa-bb-cc-dd';
        expect(format_string(_a)).toBe('AaBbCcDd');
    });
});
