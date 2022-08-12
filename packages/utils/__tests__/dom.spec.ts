import {html_element_to_string} from '../src/dom';
describe('dom.ts', () => {
    it('html_element_to_string分析正确', () => {
        const $element = document.createElement('div');
        $element.innerText = '测试';
        $element.className = 'test';
        $element.id = 'app';
        const _res = html_element_to_string($element);
        expect(_res).toBe('<div id="app" class="test">测试</div>');
    });
    it('html_element_to_string遇到body', () => {
        const $element = document.createElement('body');
        $element.innerText = '测试';
        $element.className = 'test';
        $element.id = 'app';
        const _res = html_element_to_string($element);
        expect(_res).toBe(null);
    });
});
