import { off, on } from '../src/listen';

describe('listen.ts', () => {
    it('on方法', () => {
        const div = document.createElement('div');
        let flag = false;
        on(div, 'click', () => {
            flag = true;
        });
        div.click();
        expect(flag).toBeTruthy();
    });
    it('off方法', () => {
        const div = document.createElement('div');
        let flag = false;
        const _event = () => {
            flag = true;
        };
        on(div, 'click', _event);
        off(div, 'click', _event);
        div.click();
        expect(flag).toBeFalsy();
    });
});
